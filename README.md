# MedStock

MedStock helps families keep track of medicine stock. It records how many tablets are left for each medicine, reminds the person when to take them, and warns the family before a medicine runs out.

> MedStock tracks stock and reminders only. It does not give medical advice. Always follow the doctor's prescription.

## Features

- Medicine cards sorted by days left, colour-coded green, orange or red, with a filter per person
- Dose schedule with half-tablet support and stock calculated from the schedule
- Stock updates: "I bought more" and "Correct the count"
- Refill warning with a ready-made WhatsApp message to the family
- Alarm popup with a beep, browser notification, "Taken" and 10-minute snooze
- Add medicines from a photo of a strip, box or prescription (OCR)
- Optional handwriting reading with the Gemini API
- Phone alarm file (.ics) for Google Calendar and Apple Calendar
- Backup and restore as a JSON file

## Tech Used

- HTML5, CSS3, JavaScript (ES2020)
- Web Storage (localStorage)
- Tesseract.js for OCR
- Google Gemini API for handwriting recognition
- Notifications API and Web Audio API for alarms
- iCalendar (.ics) export
- WhatsApp click-to-chat links

## How It Works

- Each medicine stores the person, tablets per dose, dose times, current stock and a repeat flag.
- Days left are calculated from the stock and the daily number of tablets.
- A timer checks the dose times every 30 seconds and raises the alarm popup.
- Low-stock medicines marked as repeat show a refill warning and a WhatsApp reminder button.
- A photo is read with Tesseract.js, and the detected lines are listed so you can pick the medicine names to add.
- The .ics export creates a daily repeating event with an alarm for every dose time.

## Installation

1. Download or clone this repository.
2. Keep index.html, style.css and the js folder together.
3. Open index.html in a browser.

To host it on GitHub Pages: go to Settings → Pages, choose Deploy from a branch, select main and / (root), then save. The site will be available at https://your-username.github.io/medstock/.

To use the Gemini option, open Settings in the app and paste your own API key from Google AI Studio.