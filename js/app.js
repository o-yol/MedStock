function showSection(sectionId) {
  const sectionIdList = ["dashboardSection", "formSection", "stockSection", "settingsSection", "scanSection"];
  for (let i = 0; i < sectionIdList.length; i++) {
    document.getElementById(sectionIdList[i]).style.display = "none";
  }
  document.getElementById(sectionId).style.display = "block";
  deleteWaitingId = "";
}

function showDashboard() {
  renderDashboard();
  showSection("dashboardSection");
}

function createOption(optionValue, optionText) {
  const option = document.createElement("option");
  option.value = optionValue;
  option.textContent = optionText;
  return option;
}

function updatePersonFilter() {
  const filter = document.getElementById("personFilter");
  const previousChoice = filter.value;
  const seenNameList = [];
  filter.textContent = "";
  filter.appendChild(createOption("", "All people"));
  for (let i = 0; i < medicineList.length; i++) {
    const name = medicineList[i].personName;
    if (name !== "" && !seenNameList.includes(name)) {
      seenNameList.push(name);
      filter.appendChild(createOption(name, name));
    }
  }
  filter.value = previousChoice;
  if (filter.value !== previousChoice) { filter.value = ""; }
}

function compareByDaysLeft(firstMedicine, secondMedicine) {
  return calculateDaysLeft(firstMedicine) - calculateDaysLeft(secondMedicine);
}

function getSortedList() {
  const sortedList = medicineList.slice();
  sortedList.sort(compareByDaysLeft);
  return sortedList;
}

function renderDashboard() {
  updatePersonFilter();
  const cardList = document.getElementById("cardList");
  const selectedPerson = document.getElementById("personFilter").value;
  const sortedList = getSortedList();
  let shownCount = 0;
  cardList.textContent = "";
  for (let i = 0; i < sortedList.length; i++) {
    if (selectedPerson === "" || sortedList[i].personName === selectedPerson) {
      cardList.appendChild(buildCard(sortedList[i]));
      shownCount = shownCount + 1;
    }
  }
  if (shownCount === 0) {
    document.getElementById("emptyMessage").style.display = "block";
  } else {
    document.getElementById("emptyMessage").style.display = "none";
  }
}

function handleDeleteClick(medicineId) {
  if (deleteWaitingId === medicineId) {
    deleteMedicineById(medicineId);
    deleteWaitingId = "";
  } else {
    deleteWaitingId = medicineId;
  }
  renderDashboard();
}

function handleCardButtonClick(event) {
  const action = event.target.getAttribute("data-action");
  const medicineId = event.target.getAttribute("data-id");
  document.getElementById("dashboardMessage").textContent = "";
  if (action === "edit") { openFormForEdit(medicineId); }
  if (action === "bought" || action === "correct") { openStockPanel(action, medicineId); }
  if (action === "whatsapp") { sendWhatsAppReminder(medicineId); }
  if (action === "delete") { handleDeleteClick(medicineId); }
}

function connectButtons() {
  document.getElementById("showDashboardButton").onclick = showDashboard;
  document.getElementById("showSettingsButton").onclick = openSettings;
  document.getElementById("addMedicineButton").onclick = openFormForNew;
  document.getElementById("addFromPhotoButton").onclick = openScanScreen;
  document.getElementById("saveMedicineButton").onclick = handleSaveMedicineClick;
  document.getElementById("cancelFormButton").onclick = showDashboard;
  document.getElementById("stockSaveButton").onclick = handleStockSaveClick;
  document.getElementById("stockCancelButton").onclick = showDashboard;
  document.getElementById("personFilter").addEventListener("change", renderDashboard);
}

function startApp() {
  loadMedicineList();
  loadSettings();
  connectButtons();
  connectReminderButtons();
  connectIcsButton();
  connectBackupButtons();
  connectScanButtons();
  connectGeminiButtons();
  showDashboard();
  startAlarmChecker();
}

startApp();
