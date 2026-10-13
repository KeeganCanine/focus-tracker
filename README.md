# Focus Tracker

A simple, mobile-first, installable time-tracking web app. No build tools or dependencies required.

## Features
- Start, pause, resume, and finish a stopwatch session
- Reading, Homework, Studying, and custom activity categories
- Daily and weekly totals, 7-day and 30-day history charts
- Session history and CSV export
- Local browser storage and offline support after initial load

## Preview locally
Run `python -m http.server 8000` in this directory and visit `http://localhost:8000`.

## Deploy with GitHub Pages
1. Create a new public GitHub repository (for example `focus-tracker`).
2. Upload **the contents of this folder** to the repository root, or use `git init`, `git add .`, `git commit -m "Initial Focus Tracker"`, `git branch -M main`, `git remote add origin <your-repository-url>`, and `git push -u origin main`.
3. Go to repository **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, then save.
4. Once published, open `https://YOUR-USERNAME.github.io/focus-tracker/` on your iPhone using Safari. Tap Share → Add to Home Screen.

## Data and privacy
Data stays in localStorage on the device/browser where it is recorded. It does not sync between devices. Export your CSV periodically. Clearing browser/site data can erase sessions. Private browsing is not recommended.

## Known v1 limitations
- Running timers are not preserved if the app reloads or is closed. Finish and save before closing.
- A session is assigned to the local date on which it began, even if it crosses midnight.
- The weekly total uses the session's start date.
- No editing/deleting sessions, cloud backup, or Google Calendar integration yet.
- Service worker caching provides basic offline use after first successful visit.

## Planned additions
Google Calendar integration, cloud sync, editable history, session recovery, and goals.
