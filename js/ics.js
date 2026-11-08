const LINE_END = "\r\n";

function escapeIcsText(text) {
  let safeText = "";
  for (let i = 0; i < text.length; i++) {
    const character = text.charAt(i);
    if (character === "\\") {
      safeText = safeText + "\\\\";
    } else if (character === ";" || character === ",") {
      safeText = safeText + "\\" + character;
    } else {
      safeText = safeText + character;
    }
  }
  return safeText;
}

function foldIcsLine(line) {
  let foldedText = "";
  let start = 0;
  while (start < line.length) {
    if (start > 0) { foldedText = foldedText + LINE_END + " "; }
    foldedText = foldedText + line.substring(start, start + 60);
    start = start + 60;
  }
  return foldedText;
}

function makeIcsTimestamp() {
  const isoText = new Date().toISOString();
  const compactText = isoText.split("-").join("").split(":").join("");
  return compactText.substring(0, 15) + "Z";
}

function makeIcsStart(timeText) {
  const dayText = getTodayText().split("-").join("");
  return dayText + "T" + timeText.split(":").join("") + "00";
}

function buildEventLines(medicine, timeText, stampText) {
  const title = "Take " + medicine.medicineName + " (" + medicine.tabletsPerDose + " tablet(s)) - " + medicine.personName;
  const safeTitle = escapeIcsText(title);
  const uniqueId = escapeIcsText(medicine.id) + "-" + timeText.split(":").join("") + "@medstock.local";
  return [
    "BEGIN:VEVENT", "UID:" + uniqueId, "DTSTAMP:" + stampText,
    "DTSTART:" + makeIcsStart(timeText), "DURATION:PT5M", "RRULE:FREQ=DAILY",
    "SUMMARY:" + safeTitle,
    "DESCRIPTION:MedStock reminder. This is not medical advice. Follow the doctor's prescription.",
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + safeTitle, "TRIGGER:PT0M", "END:VALARM",
    "END:VEVENT"
  ];
}

function buildIcsText() {
  const stampText = makeIcsTimestamp();
  let allLines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MedStock//Student Project//EN", "CALSCALE:GREGORIAN"];
  for (let i = 0; i < medicineList.length; i++) {
    for (let j = 0; j < medicineList[i].doseTimes.length; j++) {
      allLines = allLines.concat(buildEventLines(medicineList[i], medicineList[i].doseTimes[j], stampText));
    }
  }
  allLines.push("END:VCALENDAR");
  let fileText = "";
  for (let k = 0; k < allLines.length; k++) {
    fileText = fileText + foldIcsLine(allLines[k]) + LINE_END;
  }
  return fileText;
}

function handleDownloadIcsClick() {
  const messageElement = document.getElementById("icsMessage");
  const fileText = buildIcsText();
  if (!fileText.includes("BEGIN:VEVENT")) {
    messageElement.textContent = "There are no dose times yet. Add a medicine with dose times first.";
    return;
  }
  downloadTextFile("medstock-alarms.ics", fileText, "text/calendar;charset=utf-8");
  messageElement.textContent = "File downloaded. Now import it into your calendar (steps are in the README).";
}

function connectIcsButton() {
  document.getElementById("downloadIcsButton").onclick = handleDownloadIcsClick;
}
