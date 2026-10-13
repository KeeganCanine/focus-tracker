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


## Version 1.1
- Task checklist: add, check off, and delete tasks. Tasks are saved on this device.
- Activity category chips turn red on hover/focus and reveal an × removal indicator. Tap to remove, then confirm. On touchscreens the × stays visible.
- Removing a category does not erase previously recorded sessions. The category in an active timer cannot be removed.
- Google Calendar integration is reserved for a later version.

To update an existing GitHub Pages site, upload the changed project files to the same repository and commit. The service worker cache version is bumped so installed apps can receive the update.


## v1.2: Time goals and alerts
- Each activity can have independent **per-session** and **daily cumulative** minute targets. Enter `0` to disable.
- The progress bars update while a timer runs, including across pauses. Completed sessions contribute to the daily total.
- When a target is reached, an in-app banner appears and an optional sound plays. Sound playback depends on browser permissions and audio restrictions.
- Alerts require the app to be open and running. **They are not iPhone lock-screen push notifications.** The app cannot guarantee delivery if Safari or the PWA is suspended or closed.
- Goal preferences and daily notification flags are saved in the existing local storage record, preserving prior categories, sessions, and checklist tasks.
- Future background push notifications require a server-side push provider, user permission, and an installed Home Screen PWA on supported iOS versions. Do not put push credentials in this public repository.

### Updating an existing installation
Upload all project files to the root of your existing GitHub repository. The service worker cache version has been increased. After GitHub Pages deploys, reopen the Home Screen app; if an older version persists, fully close and reopen it.
