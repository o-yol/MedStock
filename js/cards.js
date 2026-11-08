let deleteWaitingId = "";
let stockMode = "";
let stockMedicineId = "";

function createTextElement(tagName, text, className) {
  const element = document.createElement(tagName);
  element.textContent = text;
  element.className = className;
  return element;
}

function createActionButton(buttonText, action, medicineId) {
  const button = document.createElement("button");
  button.textContent = buttonText;
  button.setAttribute("data-action", action);
  button.setAttribute("data-id", medicineId);
  button.onclick = handleCardButtonClick;
  return button;
}

function buildRefillBlock(medicine) {
  const block = document.createElement("div");
  block.className = "refill-block";
  block.appendChild(createTextElement("p", "Running low. Please buy more soon.", "refill-text"));
  block.appendChild(createActionButton("Send WhatsApp reminder", "whatsapp", medicine.id));
  block.appendChild(createTextElement("p", "This opens WhatsApp with a message ready. You must press Send yourself. It is not automatic.", "small-note"));
  return block;
}

function createDeleteButton(medicine) {
  let deleteText = "Delete";
  if (deleteWaitingId === medicine.id) { deleteText = "Tap again to delete"; }
  return createActionButton(deleteText, "delete", medicine.id);
}

function buildNeedsDetailsCard(medicine) {
  const card = document.createElement("div");
  card.className = "card needs-details";
  card.appendChild(createTextElement("h3", medicine.medicineName, "card-title"));
  card.appendChild(createTextElement("p", "Needs details", "needs-label"));
  card.appendChild(createTextElement("p", "Press Edit to enter the person, dose times, tablets per dose, stock and the repeat choice. Check the name against the prescription.", "small-note"));
  const row = document.createElement("div");
  row.className = "button-row";
  row.appendChild(createActionButton("Edit", "edit", medicine.id));
  row.appendChild(createDeleteButton(medicine));
  card.appendChild(row);
  return card;
}

function buildButtonRow(medicine) {
  const row = document.createElement("div");
  row.className = "button-row";
  row.appendChild(createActionButton("I bought more", "bought", medicine.id));
  row.appendChild(createActionButton("Correct the count", "correct", medicine.id));
  row.appendChild(createActionButton("Edit", "edit", medicine.id));
  row.appendChild(createDeleteButton(medicine));
  return row;
}

function buildCard(medicine) {
  if (medicine.needsDetails === true) { return buildNeedsDetailsCard(medicine); }
  const card = document.createElement("div");
  card.className = "card " + getStatusColor(medicine);
  const stockNow = roundToOneDecimal(calculateCurrentStock(medicine));
  card.appendChild(createTextElement("h3", medicine.medicineName, "card-title"));
  card.appendChild(createTextElement("p", "For: " + medicine.personName, ""));
  card.appendChild(createTextElement("p", "Days left: " + calculateDaysLeft(medicine), "days-left"));
  card.appendChild(createTextElement("p", "Tablets left now: " + stockNow, ""));
  card.appendChild(createTextElement("p", medicine.tabletsPerDose + " tablet(s) at " + medicine.doseTimes.join(", "), ""));
  if (medicine.notes !== "") { card.appendChild(createTextElement("p", "Notes: " + medicine.notes, "")); }
  if (needsRefillWarning(medicine)) { card.appendChild(buildRefillBlock(medicine)); }
  card.appendChild(buildButtonRow(medicine));
  return card;
}

function openStockPanel(mode, medicineId) {
  stockMode = mode;
  stockMedicineId = medicineId;
  const medicine = medicineList[findMedicineIndexById(medicineId)];
  const title = document.getElementById("stockTitle");
  const label = document.getElementById("stockLabel");
  if (mode === "bought") {
    title.textContent = "I bought more: " + medicine.medicineName;
    label.textContent = "How many tablets did you buy?";
  } else {
    title.textContent = "Correct the count: " + medicine.medicineName;
    label.textContent = "How many tablets do you really have now?";
  }
  document.getElementById("stockInput").value = "";
  document.getElementById("stockError").textContent = "";
  showSection("stockSection");
}

function handleStockSaveClick() {
  const typedNumber = parseFloat(document.getElementById("stockInput").value);
  const errorElement = document.getElementById("stockError");
  if (isNaN(typedNumber) || typedNumber < 0 || (stockMode === "bought" && typedNumber === 0)) {
    errorElement.textContent = "Please type a number that is not negative (and not 0 when you bought tablets).";
    return;
  }
  const medicine = medicineList[findMedicineIndexById(stockMedicineId)];
  if (stockMode === "bought") {
    addBoughtTablets(medicine, typedNumber);
  } else {
    correctStockCount(medicine, typedNumber);
  }
  saveMedicineList();
  showDashboard();
}
