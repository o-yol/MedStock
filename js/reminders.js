const SETTINGS_KEY = "medstock_settings";

let settings = { familyNumber: "", geminiKey: "", geminiConsent: false };

function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (savedSettings !== null && typeof savedSettings === "object") {
      if (typeof savedSettings.familyNumber === "string") { settings.familyNumber = savedSettings.familyNumber; }
      if (typeof savedSettings.geminiKey === "string") { settings.geminiKey = savedSettings.geminiKey; }
      if (savedSettings.geminiConsent === true) { settings.geminiConsent = true; }
    }
  } catch (error) {
    settings = { familyNumber: "", geminiKey: "", geminiConsent: false };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function openSettings() {
  document.getElementById("familyNumberInput").value = settings.familyNumber;
  document.getElementById("geminiKeyInput").value = settings.geminiKey;
  document.getElementById("settingsMessage").textContent = "";
  showNotificationStatus();
  showSection("settingsSection");
}

function cleanPhoneNumber(numberText) {
  let digitsOnly = "";
  for (let i = 0; i < numberText.length; i++) {
    if (isDigit(numberText.charAt(i))) { digitsOnly = digitsOnly + numberText.charAt(i); }
  }
  return digitsOnly;
}

function handleSaveSettingsClick() {
  settings.familyNumber = cleanPhoneNumber(document.getElementById("familyNumberInput").value);
  settings.geminiKey = document.getElementById("geminiKeyInput").value.trim();
  saveSettings();
  document.getElementById("familyNumberInput").value = settings.familyNumber;
  document.getElementById("settingsMessage").textContent = "Settings saved on this device.";
}

function showNotificationStatus() {
  const statusElement = document.getElementById("notificationStatus");
  if (!("Notification" in window)) {
    statusElement.textContent = "This browser does not support notifications.";
  } else if (Notification.permission === "granted") {
    statusElement.textContent = "Notifications are allowed.";
  } else if (Notification.permission === "denied") {
    statusElement.textContent = "Notifications are blocked. Change this in the browser's site settings.";
  } else {
    statusElement.textContent = "Notifications are not allowed yet. Press the button above.";
  }
}

function askNotificationPermission() {
  if (!("Notification" in window)) { return; }
  Notification.requestPermission(showNotificationStatus);
}

function buildWhatsAppLink(medicine) {
  const daysLeft = calculateDaysLeft(medicine);
  let dayWord = "days";
  if (daysLeft === 1) { dayWord = "day"; }
  const message = medicine.personName + "'s " + medicine.medicineName + " has " + daysLeft + " " + dayWord + " of stock left. Please buy more.";
  return "https://wa.me/" + settings.familyNumber + "?text=" + encodeURIComponent(message);
}

function sendWhatsAppReminder(medicineId) {
  const messageElement = document.getElementById("dashboardMessage");
  const index = findMedicineIndexById(medicineId);
  if (index === -1) { return; }
  if (settings.familyNumber === "") {
    messageElement.textContent = "Please save the family WhatsApp number in Settings first.";
    return;
  }
  messageElement.textContent = "WhatsApp opened in a new tab. Press Send there. Nothing is sent until you do.";
  window.open(buildWhatsAppLink(medicineList[index]), "_blank");
}

function connectReminderButtons() {
  document.getElementById("saveSettingsButton").onclick = handleSaveSettingsClick;
  document.getElementById("notificationButton").onclick = askNotificationPermission;
}
