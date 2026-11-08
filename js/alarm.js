const CHECK_EVERY_MILLISECONDS = 30 * 1000;
const SNOOZE_MILLISECONDS = 10 * 60 * 1000;

let firedAlarmList = [];
let waitingAlarmList = [];
let snoozedAlarmList = [];
let currentAlarm = null;

function getCurrentTimeText() {
  const now = new Date();
  return addLeadingZero(now.getHours()) + ":" + addLeadingZero(now.getMinutes());
}

function makeAlarmKey(medicine, timeText) {
  return getTodayText() + "|" + medicine.id + "|" + timeText;
}

function checkOneMedicine(medicine, nowText) {
  for (let i = 0; i < medicine.doseTimes.length; i++) {
    const timeText = medicine.doseTimes[i];
    const alarmKey = makeAlarmKey(medicine, timeText);
    if (timeText === nowText && !firedAlarmList.includes(alarmKey)) {
      firedAlarmList.push(alarmKey);
      waitingAlarmList.push({
        medicineName: medicine.medicineName,
        personName: medicine.personName,
        tabletsPerDose: medicine.tabletsPerDose
      });
    }
  }
}

function moveDueSnoozedAlarms() {
  const stillSnoozedList = [];
  for (let i = 0; i < snoozedAlarmList.length; i++) {
    const snoozedItem = snoozedAlarmList[i];
    if (Date.now() >= snoozedItem.showAt) {
      waitingAlarmList.push(snoozedItem.alarm);
    } else {
      stillSnoozedList.push(snoozedItem);
    }
  }
  snoozedAlarmList = stillSnoozedList;
}

function playBeep() {
  try {
    const audioContext = new AudioContext();
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator();
      oscillator.frequency.value = 880;
      oscillator.connect(audioContext.destination);
      oscillator.start(audioContext.currentTime + i * 0.7);
      oscillator.stop(audioContext.currentTime + i * 0.7 + 0.4);
    }
  } catch (error) {
    console.log("Could not play the beep: " + error);
  }
}

function showBrowserNotification(alarm) {
  if (!("Notification" in window)) { return; }
  if (Notification.permission !== "granted") { return; }
  try {
    new Notification("Time to take: " + alarm.medicineName, {
      body: alarm.tabletsPerDose + " tablet(s) for " + alarm.personName
    });
  } catch (error) {
    console.log("Could not show the notification: " + error);
  }
}

function showNextAlarm() {
  if (currentAlarm !== null) { return; }
  if (waitingAlarmList.length === 0) { return; }
  currentAlarm = waitingAlarmList.shift();
  document.getElementById("alarmText").textContent = "Time to take: " + currentAlarm.medicineName + ", " + currentAlarm.tabletsPerDose + " tablet(s)";
  document.getElementById("alarmPerson").textContent = "For: " + currentAlarm.personName;
  document.getElementById("alarmPopup").style.display = "flex";
  playBeep();
  showBrowserNotification(currentAlarm);
}

function checkAlarms() {
  const nowText = getCurrentTimeText();
  for (let i = 0; i < medicineList.length; i++) {
    checkOneMedicine(medicineList[i], nowText);
  }
  moveDueSnoozedAlarms();
  showNextAlarm();
}

function handleTakenClick() {
  document.getElementById("alarmPopup").style.display = "none";
  currentAlarm = null;
  showNextAlarm();
}

function handleSnoozeClick() {
  snoozedAlarmList.push({ alarm: currentAlarm, showAt: Date.now() + SNOOZE_MILLISECONDS });
  handleTakenClick();
}

function startAlarmChecker() {
  document.getElementById("alarmTakenButton").onclick = handleTakenClick;
  document.getElementById("alarmSnoozeButton").onclick = handleSnoozeClick;
  setInterval(checkAlarms, CHECK_EVERY_MILLISECONDS);
  checkAlarms();
}
