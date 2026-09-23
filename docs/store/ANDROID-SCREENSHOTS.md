# Android screenshot preparation

This packet prepares reproducible captures; it does not contain completed Android screenshots. Use only a disposable test device or emulator with synthetic records. Do not import this fixture over a real journal: import replaces stored categories.

The unsigned Android workflow also launches the built APK on a fresh API 36 emulator and captures `00-onboarding` as an artifact for visual inspection. A successful job proves a captured native launch, not completion of the five seeded listing screenshots below. Review the image before using it; the job does not import sample records or certify device behavior.

## Existing asset review

September 23 inventory found PWA icons and native launcher/splash resources, but no completed store screenshots or feature graphic. Visual inspection of `public/pwa-512.png` shows an orange wave on a navy rounded square. The retained raster `drawable/splash.png` and `mipmap-xxxhdpi/ic_launcher.png` show Capacitor template artwork. Active native launcher/splash XML instead references the teal crescent vectors `wakestate_mark` / `wakestate_launcher`. Resolve this PWA/native brand mismatch before making a final store icon; do not assume unused template PNGs depict the active launcher. Actual native rendering still requires capture.

## Prepare

1. Build the reviewed version with `npm run android:build`, or download its successful CI artifact. Record the source commit and APK hash with the capture set. The APK is debug-signed, not a store release.
2. Install on a disposable Android device/emulator and complete onboarding. Use a portrait 1080 x 1920 configuration for consistent captures. Do not resize an existing user's device or uninstall their app to prepare artwork.
3. Generate a sample backup using the device's current local date: `node scripts/store/generate-demo.mjs YYYY-MM-DD > artifacts/demo-backup.json` (create `artifacts/` first). All records are synthetic; no medications or treatment outcomes are fabricated.
4. Transfer this backup to the test device and import through the existing Settings / Export & Reports flow. Confirm seven check-ins and seven sleep records appear. Use the matching dates if the device timezone differs from the capture host.
5. Enable Do Not Disturb on the test device, dismiss keyboards and notifications, and use English. Retain the app's actual UI and Android system chrome. Record OS, display size, font size, locale, app version and source commit in a separate capture note; do not publish device identifiers.

## Capture five screens

Get the test device serial from `adb devices`, navigate to each screen, then run:

```sh
python3 scripts/store/capture-android.py --serial DEVICE_SERIAL --shot 01-today
```

Repeat with these shot names. The helper requires WakeState in the foreground, saves the actual PNG and a provenance sidecar, checks dimension bounds, and refuses overwriting an existing capture. It does not tap, import, delete, install, change device settings, or submit anything.

| Shot | App state | Optional caption, subject to final artwork review |
| --- | --- | --- |
| `01-today` | Today with sample journal records | Your daily sleep and wake journal |
| `02-check-in` | Check-in form showing actual symptom controls, no keyboard | Record how you feel |
| `03-sleep` | Sleep entry form with sample values | Keep a record of your sleep |
| `04-patterns` | Patterns showing the sample week | Review your own patterns |
| `05-export` | Settings / Export & Reports | Prepare reports for conversations |

Avoid claims about diagnosis, treatment, clinical results, guaranteed privacy or improved health. Retain any visible sample-entry labels. Do not simulate testimonials, medical recommendations, unread messages or clinical outcomes.

## Review before upload

- Inspect every image at full size and at phone-listing size. Check text clipping, dark-theme contrast, bottom navigation, status bar, safe areas, keyboard overlap and meaningful chart labels.
- Confirm the view comes from Android, the intended app commit, and synthetic records only. A responsive browser rendering is not evidence of native appearance or device QA.
- Confirm exports are real UI screens, not fabricated reports. No screenshots of device file pickers with personal paths or share targets.
- The capture helper preserves device pixels without conversion. Check PNG encoding before upload: Play requires JPEG or 24-bit PNG without alpha; raw device PNGs may require a reviewed RGB export. Do not stretch, invent or paint over app UI.
- Separate listing artwork is still required: 512 x 512 listing icon and 1024 x 500 feature graphic. Existing launcher vectors are source artwork, not a completed store asset set. Produce these from the final brand assets and inspect raster output.
- Record approval beside each capture. Capture completion does not close offline, import/export, deletion, upgrade or accessibility device testing.

Official requirements: [Google Play preview assets](https://support.google.com/googleplay/android-developer/answer/9866151), checked September 23, 2026. General screenshot bounds are 320–3840 px, long edge at most twice the short edge. This helper checks only dimensions and PNG header, not full listing eligibility.
