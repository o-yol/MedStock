const MEDICINES_KEY = "medstock_medicines";
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

let medicineList = [];

function isUsableMedicine(item) {
  if (typeof item !== "object" || item === null) { return false; }
  if (!Array.isArray(item.doseTimes)) { return false; }
  if (typeof item.id !== "string" || typeof item.personName !== "string") { return false; }
  if (typeof item.medicineName !== "string" || typeof item.stockDate !== "string") { return false; }
  if (typeof item.notes !== "string" || typeof item.repeatMedicine !== "boolean") { return false; }
  if (typeof item.tabletsPerDose !== "number" || typeof item.stockCount !== "number") { return false; }
  if (typeof item.refillWarningDays !== "number") { return false; }
  return true;
}

function loadMedicineList() {
  medicineList = [];
  try {
    const savedList = JSON.parse(localStorage.getItem(MEDICINES_KEY));
    if (Array.isArray(savedList)) {
      for (let i = 0; i < savedList.length; i++) {
        if (isUsableMedicine(savedList[i])) { medicineList.push(savedList[i]); }
      }
    }
  } catch (error) {
    medicineList = [];
  }
}

function saveMedicineList() {
  localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicineList));
}

function addLeadingZero(number) {
  if (number < 10) { return "0" + number; }
  return String(number);
}

function getTodayText() {
  const today = new Date();
  return today.getFullYear() + "-" + addLeadingZero(today.getMonth() + 1) + "-" + addLeadingZero(today.getDate());
}

function roundToOneDecimal(number) {
  return Math.round(number * 10) / 10;
}

function createNewId() {
  return Date.now() + "-" + Math.floor(Math.random() * 100000);
}

function calculateDaysPassed(stockDateText) {
  const parts = stockDateText.split("-");
  const stockDay = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysPassed = Math.round((todayMidnight - stockDay) / MILLISECONDS_PER_DAY);
  if (isNaN(daysPassed) || daysPassed < 0) { return 0; }
  return daysPassed;
}

function calculateTabletsPerDay(medicine) {
  return medicine.tabletsPerDose * medicine.doseTimes.length;
}

function calculateCurrentStock(medicine) {
  const usedSoFar = calculateTabletsPerDay(medicine) * calculateDaysPassed(medicine.stockDate);
  let currentStock = medicine.stockCount - usedSoFar;
  if (currentStock < 0) { currentStock = 0; }
  return currentStock;
}

function calculateDaysLeft(medicine) {
  const tabletsPerDay = calculateTabletsPerDay(medicine);
  if (tabletsPerDay <= 0) { return 0; }
  return Math.floor(calculateCurrentStock(medicine) / tabletsPerDay);
}

function getStatusColor(medicine) {
  const daysLeft = calculateDaysLeft(medicine);
  if (daysLeft <= 2) { return "red"; }
  if (daysLeft <= medicine.refillWarningDays) { return "orange"; }
  return "green";
}

function needsRefillWarning(medicine) {
  if (medicine.needsDetails === true) { return false; }
  if (medicine.repeatMedicine !== true) { return false; }
  return calculateDaysLeft(medicine) <= medicine.refillWarningDays;
}

function addBoughtTablets(medicine, boughtCount) {
  medicine.stockCount = calculateCurrentStock(medicine) + boughtCount;
  medicine.stockDate = getTodayText();
}

function correctStockCount(medicine, realCount) {
  medicine.stockCount = realCount;
  medicine.stockDate = getTodayText();
}

function findMedicineIndexById(medicineId) {
  for (let i = 0; i < medicineList.length; i++) {
    if (medicineList[i].id === medicineId) { return i; }
  }
  return -1;
}

function deleteMedicineById(medicineId) {
  const index = findMedicineIndexById(medicineId);
  if (index === -1) { return; }
  medicineList.splice(index, 1);
  saveMedicineList();
}
