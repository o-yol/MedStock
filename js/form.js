function isDigit(character) {
  return "0123456789".includes(character);
}

function isValidTime(timeText) {
  if (timeText.length !== 5) { return false; }
  if (timeText.charAt(2) !== ":") { return false; }
  const digitPlaces = [0, 1, 3, 4];
  for (let i = 0; i < digitPlaces.length; i++) {
    if (!isDigit(timeText.charAt(digitPlaces[i]))) { return false; }
  }
  const hours = Number(timeText.substring(0, 2));
  const minutes = Number(timeText.substring(3, 5));
  return hours <= 23 && minutes <= 59;
}

function parseDoseTimes(timesText) {
  const parts = timesText.split(",");
  const timeList = [];
  for (let i = 0; i < parts.length; i++) {
    const cleanPart = parts[i].trim();
    if (cleanPart !== "") { timeList.push(cleanPart); }
  }
  return timeList;
}

function validateMedicine(medicine) {
  if (medicine.personName === "") { return "Please enter the person's name."; }
  if (medicine.medicineName === "") { return "Please enter the medicine name."; }
  if (isNaN(medicine.tabletsPerDose) || medicine.tabletsPerDose <= 0) { return "Tablets per dose must be more than 0, for example 0.5 or 1."; }
  if (isNaN(medicine.stockCount) || medicine.stockCount < 0) { return "Tablets you have now must be 0 or more."; }
  if (isNaN(medicine.refillWarningDays) || medicine.refillWarningDays < 0) { return "Warning days must be 0 or more."; }
  if (medicine.doseTimes.length === 0) { return "Please enter at least one dose time, like 08:00."; }
  for (let i = 0; i < medicine.doseTimes.length; i++) {
    if (!isValidTime(medicine.doseTimes[i])) { return medicine.doseTimes[i] + " is not a valid time. Use HH:MM, like 08:00."; }
  }
  return "";
}

function getFieldValue(fieldId) {
  return document.getElementById(fieldId).value;
}

function setFieldValue(fieldId, newValue) {
  document.getElementById(fieldId).value = newValue;
}

function fillForm(medicine, titleText) {
  document.getElementById("formTitle").textContent = titleText;
  setFieldValue("editId", medicine.id);
  setFieldValue("personInput", medicine.personName);
  setFieldValue("medicineNameInput", medicine.medicineName);
  setFieldValue("tabletsPerDoseInput", medicine.tabletsPerDose);
  setFieldValue("doseTimesInput", medicine.doseTimes.join(", "));
  setFieldValue("stockCountInput", medicine.stockCount);
  setFieldValue("refillWarningInput", medicine.refillWarningDays);
  setFieldValue("notesInput", medicine.notes);
  if (medicine.repeatMedicine) { setFieldValue("repeatSelect", "yes"); } else { setFieldValue("repeatSelect", "no"); }
  document.getElementById("formError").textContent = "";
  showSection("formSection");
}

function openFormForNew() {
  const blankMedicine = {
    id: "", personName: "", medicineName: "", tabletsPerDose: 1, doseTimes: [],
    stockCount: "", repeatMedicine: true, refillWarningDays: 5, notes: ""
  };
  fillForm(blankMedicine, "Add medicine");
}

function openFormForEdit(medicineId) {
  const index = findMedicineIndexById(medicineId);
  if (index === -1) { return; }
  fillForm(medicineList[index], "Edit medicine");
  setFieldValue("stockCountInput", roundToOneDecimal(calculateCurrentStock(medicineList[index])));
}

function readFormIntoMedicine() {
  const medicine = {};
  medicine.id = getFieldValue("editId");
  medicine.personName = getFieldValue("personInput").trim();
  medicine.medicineName = getFieldValue("medicineNameInput").trim();
  medicine.tabletsPerDose = parseFloat(getFieldValue("tabletsPerDoseInput"));
  medicine.doseTimes = parseDoseTimes(getFieldValue("doseTimesInput"));
  medicine.stockCount = parseFloat(getFieldValue("stockCountInput"));
  medicine.stockDate = getTodayText();
  medicine.repeatMedicine = getFieldValue("repeatSelect") === "yes";
  medicine.refillWarningDays = parseFloat(getFieldValue("refillWarningInput"));
  medicine.notes = getFieldValue("notesInput").trim();
  return medicine;
}

function handleSaveMedicineClick() {
  const medicine = readFormIntoMedicine();
  const errorMessage = validateMedicine(medicine);
  if (errorMessage !== "") {
    document.getElementById("formError").textContent = errorMessage;
    return;
  }
  if (medicine.id === "") {
    medicine.id = createNewId();
    medicineList.push(medicine);
  } else {
    medicineList[findMedicineIndexById(medicine.id)] = medicine;
  }
  saveMedicineList();
  showDashboard();
}
