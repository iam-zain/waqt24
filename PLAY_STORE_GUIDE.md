# Publishing Waqt24 on Google Play

Honest summary: Play is **not completely free**. The only unavoidable cost is the **US$25 one-time** developer registration fee (no yearly fee). Everything else below is free.

## 0. Free alternatives (no $25)
- **PWA**: users open https://iam-zain.github.io/waqt24/ and "Add to Home screen". Already works.
- **APK from GitHub**: Actions > "Build Android APK" publishes `Waqt24.apk` to the `apk-latest` release. Users install it manually (azan notifications work in the APK).
- Neither gives Play Store search or auto-updates.

## 1. Before you pay: fix these in the app (blockers)
1. **Target API 36.** Play requires new apps and updates to target Android 16 (API 36) from 31 Aug 2026. The workflow uses Capacitor 6 (targets API 34). Upgrade to **Capacitor 8** (targets 36, minSdk 24). CI needs **Node 22+** and **Java 21** (workflow now uses Node 20 / Java 17).
2. **Signed release AAB, not a debug APK.** Play only accepts an Android App Bundle for new apps. Change the workflow to `./gradlew bundleRelease` and sign it (see section 4).
3. **App size.** Bundled assets are about 178 MB (quran 86 MB, tafseer 68 MB, azan 16 MB, rest ~10 MB). The AAB base module limit is 200 MB compressed. Safest: ship only the app + essentials in the base module and put quran/tafseer in a Play Asset Delivery pack, or download them on demand (the app already supports offline saving of the Quran).
4. **Exact alarms.** The APK declares `SCHEDULE_EXACT_ALARM` and `USE_EXACT_ALARM`. Play restricts these and asks you to declare why you need them. Keep `SCHEDULE_EXACT_ALARM` (user-granted) and be ready to justify it; consider removing `USE_EXACT_ALARM` if the declaration is refused.
5. **Content rights (most important).** Play removes apps that publish other people's copyrighted work. Check, and get written permission or replace:
   - Tafseer pages = "Aasan Tarjuma Quran" (Mufti Taqi Usmani) page images.
   - Asma-ul-Husna and Asma-ul-Nabi audio were cut from downloaded recordings.
   - The Hinglish / Urdu / Hindi / English translations: confirm their licences.
   - Azan audio from Wikimedia Commons: keep the credits (already shown in the app).
   - Quran audio streamed from everyayah.com and text/API from alquran.cloud: confirm their terms allow a public app.
6. **Test on a real Android phone** (Android 14, 15 and 16): notifications at prayer time, azan sound, exact-alarm permission prompt, back button, rotation, low storage. So far the app was tested only in headless Chrome.

## 2. Accounts and cost
1. Go to https://play.google.com/console and sign up with a Google account.
2. Pay **$25** by credit/debit card (prepaid cards not accepted). Verify your identity with a government ID. The fee is not refunded if verification fails.
3. **Personal vs organization**: a personal account shows your legal name on the store page and must pass the closed test (below). An organization account (needs a registered business and a D-U-N-S number) is exempt from the closed test.

## 3. The 12-tester rule (personal accounts created after 13 Nov 2023)
- Run a **closed test with at least 12 testers opted in continuously for 14 days**, then apply for production access in Play Console.
- Realistic timeline: about 3 to 4 weeks from account creation to launch.
- How: Play Console > Testing > Closed testing > create track > upload the AAB > add testers by a Google Group email > share the opt-in link. Ask 15 to 20 friends/family/mosque contacts to join, install, and keep it installed for the full 14 days. Ask them to open it a few times.

## 4. Build and sign the release
1. Create an upload key once (keep the file and passwords safe, never commit them):
   `keytool -genkeypair -v -keystore waqt24-upload.jks -alias waqt24 -keyalg RSA -keysize 2048 -validity 10000`
2. Base64 it and add GitHub repo secrets: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
3. In the workflow: decode the keystore, set the signing config, run `./gradlew bundleRelease`, upload `app-release.aab` as an artifact.
4. When creating the app in Play Console, keep **Play App Signing** on (default).
5. Package name is `app.waqt24`; it cannot be changed after the first upload. Set `versionCode` (increase every upload) and `versionName` in the build.

## 5. Store listing checklist
- App name, short description (80 chars), full description (Hinglish + English).
- Icon 512x512 (`icons/icon-512.png` exists), **feature graphic 1024x500** (to create), at least 2 phone screenshots (4 in `screenshots/`; retake from the Android app, 16:9 or 9:16).
- **Privacy policy URL** (required because the app uses location and notifications). Host a simple page, for example `privacy.html` on GitHub Pages. State: location is used only on the device to compute prayer times and is not sent to a server; no accounts; no ads; data stays on the phone; the Quran audio/text come from named third-party services; contact email.
- Category: Lifestyle or Books & Reference. Contact email: contact.waqt24@gmail.com.

## 6. Policy forms in Play Console
- **Content rating** questionnaire (IARC): no violence, no gambling; religious content.
- **Data safety**: precise/approximate location (used on device, not shared), no personal data collected, no data shared. Declare any third-party requests honestly.
- **Ads**: none. **Target audience**: 13+ or all ages (do not pick "children" unless you accept the Families policy).
- **Permissions declarations**: notifications, exact alarm, location.
- **Donation card** in the app asks for support by email and says it is not Zakat; no in-app payments, so no Play Billing needed.

## 7. Release steps
1. Internal testing (optional, instant, up to 100 testers) to check the install.
2. Closed testing with 12+ testers for 14 days.
3. Apply for production access, answer the questions, then create the Production release, add release notes, submit for review (a few days).
4. After approval, roll out. Update by uploading a new AAB with a higher `versionCode`.

## 8. After launch
- Reply to reviews, watch Android vitals (crashes/ANRs) in Play Console.
- Each year Google raises the target API requirement (next: API 37, expected Aug 2027); budget a Capacitor upgrade every year.
