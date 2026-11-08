let photoFile = null;
let recognisedLineList = [];

function showScanStatus(messageText) {
  document.getElementById("scanStatus").textContent = messageText;
}

function openScanScreen() {
  photoFile = null;
  recognisedLineList = [];
  document.getElementById("photoInput").value = "";
  document.getElementById("photoPreview").style.display = "none";
  document.getElementById("lineList").textContent = "";
  document.getElementById("addSelectedButton").style.display = "none";
  document.getElementById("consentBox").style.display = "none";
  showScanStatus("");
  updateGeminiButton();
  showSection("scanSection");
}

function handlePhotoChosen() {
  const chosenFile = document.getElementById("photoInput").files[0];
  if (chosenFile === undefined) { return; }
  if (!chosenFile.type.includes("image")) {
    showScanStatus("That file is not a photo. Please choose a picture.");
    return;
  }
  photoFile = chosenFile;
  const preview = document.getElementById("photoPreview");
  preview.src = URL.createObjectURL(chosenFile);
  preview.style.display = "block";
  showScanStatus("Photo ready. Press \"Read text from photo\".");
}

function splitTextIntoLines(text) {
  const parts = text.split("\n");
  const lineList = [];
  for (let i = 0; i < parts.length; i++) {
    const cleanLine = parts[i].trim();
    if (cleanLine.length >= 3) { lineList.push(cleanLine); }
  }
  return lineList;
}

function putHintLinesFirst(lineList) {
  const hintList = [];
  const otherList = [];
  for (let i = 0; i < lineList.length; i++) {
    const lowerLine = lineList[i].toLowerCase();
    if (lowerLine.includes("mg") || lowerLine.includes("ml")) {
      hintList.push(lineList[i]);
    } else {
      otherList.push(lineList[i]);
    }
  }
  return hintList.concat(otherList);
}

function createLineRow(lineText, index) {
  const row = document.createElement("div");
  row.className = "line-row";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "lineBox" + index;
  const label = document.createElement("label");
  label.setAttribute("for", "lineBox" + index);
  label.textContent = lineText;
  row.appendChild(checkbox);
  row.appendChild(label);
  return row;
}

function showLineList(lineList) {
  const container = document.getElementById("lineList");
  recognisedLineList = lineList;
  container.textContent = "";
  for (let i = 0; i < lineList.length; i++) {
    container.appendChild(createLineRow(lineList[i], i));
  }
  if (lineList.length > 0) { document.getElementById("addSelectedButton").style.display = "inline-block"; }
}

async function handleReadPhotoClick() {
  if (photoFile === null) { showScanStatus("Please choose a photo first."); return; }
  if (typeof Tesseract === "undefined") {
    showScanStatus("The reading tool could not load (no internet?). You can still add medicines by hand.");
    return;
  }
  showScanStatus("Reading... please wait. The first time can take a minute.");
  try {
    const worker = await Tesseract.createWorker("eng");
    const result = await worker.recognize(photoFile);
    await worker.terminate();
    showLineList(putHintLinesFirst(splitTextIntoLines(result.data.text)));
    showScanStatus("Done. Tick the lines that are medicine names. Lines with mg or ml are shown first.");
  } catch (error) {
    showScanStatus("Could not read this photo. Try a clearer photo, or add the medicine by hand.");
  }
}

function makeNeedsDetailsMedicine(medicineName) {
  return {
    id: createNewId(), personName: "", medicineName: medicineName, tabletsPerDose: 0,
    doseTimes: [], stockCount: 0, stockDate: getTodayText(), repeatMedicine: true,
    refillWarningDays: 5, notes: "", needsDetails: true
  };
}

function handleAddSelectedClick() {
  let addedCount = 0;
  for (let i = 0; i < recognisedLineList.length; i++) {
    if (document.getElementById("lineBox" + i).checked) {
      medicineList.push(makeNeedsDetailsMedicine(recognisedLineList[i]));
      addedCount = addedCount + 1;
    }
  }
  if (addedCount === 0) { showScanStatus("Tick at least one line first."); return; }
  saveMedicineList();
  showDashboard();
  document.getElementById("dashboardMessage").textContent = "Added " + addedCount + " medicine(s). Press Edit on each one to enter the details.";
}

function connectScanButtons() {
  document.getElementById("photoInput").addEventListener("change", handlePhotoChosen);
  document.getElementById("readPhotoButton").onclick = handleReadPhotoClick;
  document.getElementById("addSelectedButton").onclick = handleAddSelectedClick;
  document.getElementById("scanBackButton").onclick = showDashboard;
}
