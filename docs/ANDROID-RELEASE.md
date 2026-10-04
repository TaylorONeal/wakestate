# Android release

How to build, sign and gate a WakeState release for Google Play. Package `com.wakestate.app`, publisher Purafield Studio LLC.

Background and history: [LAUNCH.md](LAUNCH.md), [Android packet 2026-09-15](release/ANDROID-2026-09-15.md) (historical), [Android screenshots](store/ANDROID-SCREENSHOTS.md).

## 1. Signing setup (once per machine)

Release bundles are signed with the publisher upload key (PR #11). Gradle reads it from `android/keystore.properties`, which is gitignored. Never commit it or the keystore file, and never sign a release with the debug key.

Create `android/keystore.properties`:

```properties
storeFile=/absolute/path/to/wakestate-upload.jks
storePassword=...
keyAlias=...
keyPassword=...
```

`storeFile` is resolved relative to `android/app/` unless it is an absolute path. If the file is missing, `bundleRelease` still builds but the AAB is unsigned and Play will reject it.

## 2. Version

Set in `android/app/build.gradle`: `versionCode 1`, `versionName "1.0.0"` for the first upload. Raise `versionCode` by 1 for every upload to Play, including internal testing.

## 3. Build

Node 22+, Java 21, Android SDK 36.

```sh
npm ci
npm run validate          # typecheck, tests, lint, web build
npm run android:build     # native web build, cap sync, assembleDebug bundleRelease lintDebug testDebugUnitTest
```

Or, after `npm run build:native && npx cap sync android`:

```sh
cd android && ./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`.

## 4. Verify the signer

```sh
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

Expect `jar verified.` and the upload certificate (not `CN=Android Debug`). Record the SHA-256 of the AAB and the certificate fingerprint with the release notes.

## 5. Release gates

All must pass before the bundle goes to a Play track.

- [ ] **targetSdk 36.** `targetSdkVersion = 36` in `android/variables.gradle`. Confirm in the built bundle (for example `bundletool dump manifest --bundle app-release.aab | grep targetSdk`).
- [ ] **16 KB page size.** List native libraries in the AAB: `unzip -l app-release.aab | grep '\.so$'`. If none, the check passes. If any appear, each must have 16 KB aligned LOAD segments (check with `llvm-objdump -p` or Google's `check_elf_alignment.sh`), and the Play Console App bundle explorer must not show a 16 KB warning.
- [ ] **Merged manifest matches the privacy text.** Open `android/app/build/intermediates/merged_manifests/release/` (or Android Studio's Merged Manifest tab) and confirm there is **no `android.permission.INTERNET`** and no other user-facing permission. The only expected entry is AndroidX's app-scoped `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. If a plugin adds INTERNET or anything else, stop: the privacy policy and Data safety answers would be wrong.
- [ ] **No donation links in the native build.** About and Settings must not show "Buy me a coffee" on device.
- [ ] **Device QA** on a physical Android device (disposable install, never over a real journal without a backup):
  1. Fresh install; onboarding fits with large text; TalkBack labels make sense.
  2. Save a check-in, event, sleep entry and medication; force close; reopen; data is there. Repeat in airplane mode.
  3. Back button closes forms and dialogs before leaving the app.
  4. Export each category and share to another app; cancel the share sheet cleanly.
  5. Import a backup into a fresh install and compare records.
  6. Delete data; restart; confirm it is gone and preferences remain.
  7. Feedback link opens an email draft to the support address.
  8. Launcher icon, themed icon and splash look right; layout at small width and landscape.
- [ ] **Native screenshots** captured from this release candidate on a real device, with build and device recorded. Follow [store/ANDROID-SCREENSHOTS.md](store/ANDROID-SCREENSHOTS.md). Web captures do not count.
- [ ] **Data safety form:** no data collected, no data shared. Confirm the final merged manifest, bundled SDKs, actual network behavior, export/share flow and external email/browser behavior together. No INTERNET permission alone is not sufficient proof of the complete Data safety answer.
- [ ] **Health apps declaration** completed in Play Console. Journaling of sleep, symptoms and medications; no diagnosis or treatment; no Health Connect. Keep the "not a medical device" disclaimer in app and listing.
- [ ] **Privacy policy URL:** https://www.purafieldstudio.com/privacy#wakestate. Check it loads and matches the app.
- [ ] **Support contact:** purafieldstudio@gmail.com (`src/lib/support.ts`, `public/privacy.html`).
- [ ] Upload to the internal testing track first. Production needs explicit approval.

A passing build, a valid signature or an approved screenshot is not store approval. Track each gate with evidence.
