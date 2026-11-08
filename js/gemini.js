const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent";
const GEMINI_PROMPT = "List only the medicine names written in this image, one per line. If a word is unclear, write [unclear]. No extra text.";
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

function updateGeminiButton() {
  const button = document.getElementById("geminiButton");
  if (settings.geminiKey === "") {
    button.style.display = "none";
  } else {
    button.style.display = "inline-block";
  }
}

function handleGeminiButtonClick() {
  if (settings.geminiKey === "") { showScanStatus("Save your Gemini key in Settings first."); return; }
  if (photoFile === null) { showScanStatus("Please choose a photo first."); return; }
  if (photoFile.size > MAX_PHOTO_BYTES) { showScanStatus("This photo is bigger than 10 MB. Please use a smaller photo."); return; }
  if (!settings.geminiConsent) {
    document.getElementById("consentBox").style.display = "block";
    return;
  }
  startGeminiRequest();
}

function handleConsentAgreeClick() {
  settings.geminiConsent = true;
  saveSettings();
  document.getElementById("consentBox").style.display = "none";
  startGeminiRequest();
}

function handleConsentCancelClick() {
  document.getElementById("consentBox").style.display = "none";
  showScanStatus("Cancelled. Nothing was sent.");
}

function startGeminiRequest() {
  showScanStatus("Asking Gemini... please wait.");
  const reader = new FileReader();
  reader.onload = handlePhotoReadForGemini;
  reader.readAsDataURL(photoFile);
}

function buildGeminiRequestBody(base64Text, mimeType) {
  return {
    contents: [
      { parts: [ { inline_data: { mime_type: mimeType, data: base64Text } }, { text: GEMINI_PROMPT } ] }
    ]
  };
}

function explainGeminiError(statusCode) {
  if (statusCode === 400 || statusCode === 401 || statusCode === 403) { return "Gemini did not accept the key. Check that you pasted the key correctly in Settings."; }
  if (statusCode === 429) { return "The free quota is used up for now. Wait a while and try again."; }
  if (statusCode === 404) { return "Google no longer has this AI model name. Update GEMINI_MODEL at the top of gemini.js."; }
  return "Gemini had a problem (error " + statusCode + "). Please try again later.";
}

function getGeminiText(data) {
  if (!data.candidates || data.candidates.length === 0) { return ""; }
  const content = data.candidates[0].content;
  if (!content || !content.parts) { return ""; }
  let answerText = "";
  for (let i = 0; i < content.parts.length; i++) {
    if (content.parts[i].text) { answerText = answerText + content.parts[i].text + "\n"; }
  }
  return answerText;
}

async function handlePhotoReadForGemini(event) {
  const base64Text = event.target.result.split(",")[1];
  let mimeType = photoFile.type;
  if (mimeType === "") { mimeType = "image/jpeg"; }
  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": settings.geminiKey },
      body: JSON.stringify(buildGeminiRequestBody(base64Text, mimeType))
    });
    if (!response.ok) { showScanStatus(explainGeminiError(response.status)); return; }
    const answerData = await response.json();
    showGeminiAnswer(answerData);
  } catch (error) {
    showScanStatus("Could not reach Gemini. Check your internet connection and try again.");
  }
}

function showGeminiAnswer(data) {
  const answerText = getGeminiText(data);
  if (answerText.trim() === "") { showScanStatus("Gemini sent back an empty answer. Try a clearer photo."); return; }
  showLineList(putHintLinesFirst(splitTextIntoLines(answerText)));
  showScanStatus("Done. Tick the lines that are medicine names. [unclear] means Gemini could not read that word.");
}

function connectGeminiButtons() {
  document.getElementById("geminiButton").onclick = handleGeminiButtonClick;
  document.getElementById("consentAgreeButton").onclick = handleConsentAgreeClick;
  document.getElementById("consentCancelButton").onclick = handleConsentCancelClick;
}
