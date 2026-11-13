# Waqt24 Android app (Capacitor)

The same web app, wrapped so that **Azan and prayer notifications fire even when the app is closed**.
The Android project is generated in CI (`.github/workflows/apk.yml`), nothing generated is committed.

* Build: GitHub → Actions → "Build Android APK" → Run workflow. The APK is attached to the release `apk-latest`.
* How it works: `src/11-native.js` schedules the next 14 days of Azan / prayer notifications with
  `@capacitor/local-notifications` every time the app opens (and again whenever settings change).
  Open the app at least once every two weeks to refresh the schedule.
* Azan sounds: `azan/*.mp3` are copied into `res/raw` (hyphens become underscores) and used as notification-channel sounds.
