function downloadTextFile(fileName, fileText, mimeType) {
  const blob = new Blob([fileText], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleDownloadBackupClick() {
  const backupText = JSON.stringify(medicineList, null, 2);
  downloadTextFile("medstock-backup-" + getTodayText() + ".json", backupText, "application/json");
  document.getElementById("backupMessage").textContent = "Backup file downloaded. Keep it somewhere safe.";
}

function isValidBackupList(loadedData) {
  if (!Array.isArray(loadedData)) { return false; }
  for (let i = 0; i < loadedData.length; i++) {
    if (!isUsableMedicine(loadedData[i])) { return false; }
  }
  return true;
}

function handleRestoreFileLoaded(event) {
  const messageElement = document.getElementById("backupMessage");
  let loadedData = null;
  try {
    loadedData = JSON.parse(event.target.result);
  } catch (error) {
    loadedData = null;
  }
  if (!isValidBackupList(loadedData)) {
    messageElement.textContent = "This file is not a valid MedStock backup. Nothing was changed.";
    return;
  }
  medicineList = loadedData;
  saveMedicineList();
  messageElement.textContent = "Backup restored: " + loadedData.length + " medicine(s). Open Medicines to see them.";
}

function handleRestoreFileChosen() {
  const input = document.getElementById("restoreInput");
  const chosenFile = input.files[0];
  if (chosenFile === undefined) { return; }
  const reader = new FileReader();
  reader.onload = handleRestoreFileLoaded;
  reader.readAsText(chosenFile);
  input.value = "";
}

function connectBackupButtons() {
  document.getElementById("downloadBackupButton").onclick = handleDownloadBackupClick;
  document.getElementById("restoreInput").addEventListener("change", handleRestoreFileChosen);
}
