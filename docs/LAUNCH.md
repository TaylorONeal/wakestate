# iOS and Android launch preparation

## October 5: iOS placeholder branding replaced

The iOS catalog still contained the blue Capacitor template icon and splash. AppIcon now uses the existing Android-owned teal crescent at 1024×1024, opaque RGB. Splash uses the same vector at 160/320/480 pixels for 1×/2×/3×. The launch storyboard centers a fixed 160-point mark on the matching navy background, avoiding aspect-fill cropping across phone/tablet dimensions. Web/PWA artwork, Android assets, package IDs, privacy behavior and signing are unchanged.

Rebuild with Python 3 plus CairoSVG, Pillow and the system Cairo library: `python3 scripts/render-ios-branding.py`. The renderer reads paths/colors from `android/app/src/main/res/drawable/wakestate_mark.xml` and its background color, so these iOS outputs do not become a separate logo source. On Homebrew macOS, use Homebrew Python with `DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib` if Cairo discovery needs it. Rendering dependencies are authoring-only; no app runtime dependency was added.

Validation: all four output dimensions, opaque RGB encoding and asset references checked; icon/splash raster exports visually inspected; Xcode27 `actool` compiled the iOS Simulator catalog and `ibtool` compiled the launch storyboard at deployment target15.0 for iPhone/iPad. This is resource compilation, not a full app rebuild or native launch-screen acceptance. Inspect cold launch on iPhone/iPad before release; no iOS signing, upload or submission performed.

## October 5: unsigned iOS simulator compilation

Local commit 9cb7379 (PR #14 source plus documentation) builds successfully with Xcode27/SDK27 for generic iOS Simulator after native web build and Capacitor sync, with CODE_SIGNING_ALLOWED=NO. Compiled identity: com.wakestate.app, 1.0.0 (1). App-level PrivacyInfo.xcprivacy is included. Source remains unchanged. Vite reports its existing large-chunk warning.

This is compilation and resource-inclusion evidence only: no iOS UI/health-journal exercise, privacy network trace, signing, TestFlight or submission. Synthetic-data persistence/export/restore/deletion, accessibility and medication-reference review remain open. No health records or telemetry were introduced. Log: /tmp/wakestate-ios-prep-20261005.log. App: /tmp/wakestate-ios-prep-20261005/Build/Products/Debug-iphonesimulator/App.app.


## October 4, 22:56 WITA evidence reconciliation

PR #14 remains open at `5d8c9fe759b5d3305b99bbcec7c7b4a3d0e93c9d`.
[CI run 37195133892](https://github.com/TaylorONeal/wakestate/actions/runs/37195133892)
passed both unsigned-build verification and API 36 emulator capture. The capture
script installs the debug APK and captures fresh onboarding only; it does not seed
or test a health journal. GitHub lists an unexpired 97,798-byte capture artifact
for merge checkout `9521560de920d03e6a7332ddd4ecc792a355069e`.

The capture was downloaded and visually inspected: 1080×1920, readable onboarding
text and start button without visible clipping, with the local-journal and
non-diagnostic limitation present. SHA-256 matches the capture sidecar:
`51d0f11532b407a8a06051193b3f8977400acbd52c7d70448cd6c4fb099ccc64`.
Package dump reports version 1.0.0 (1), target API 36 and only the app-scoped
receiver permission. This is debug-emulator evidence, not signed-release approval.
Next: complete synthetic journal persistence/export/restore/deletion and accessibility
QA, then capture the five populated store views. No real health records, telemetry, billing or medical claims were added.
Physical-device testing, signing, medication reference review and final declarations
remain separate gates. Local disk limits do not invalidate the existing remote
emulator evidence, but it must not be relabeled as complete native acceptance.


## Update 2026-10-04: Play release hardening

- The app has no INTERNET permission (PR #10) and makes no network requests of its own. The merged manifest keeps only AndroidX's app-scoped signature receiver permission.
- Release bundles are signed with a local upload key read from the gitignored `android/keystore.properties` (PR #11). Steps live in [ANDROID-RELEASE.md](ANDROID-RELEASE.md).
- "Buy me a coffee" links now show only on the web PWA. Native builds (Android and iOS) hide them, so the store apps offer no tips or donations outside store billing.
- Feedback is an email draft (mailto) to the publisher support address in `src/lib/support.ts`. Nothing is sent by the app.
- Android versionCode 1, versionName "1.0.0".
- Current checks: 19 tests (`npx vitest run`), typecheck, lint 0 errors, production build.

Sections dated before 2026-10-02 are historical. Where they mention feedback submission, challenges, Supabase, backend tests or the INTERNET permission, the current state above wins.

## Update 2026-10-02: feedback backend removed, web hosting

The in-app feedback screen, abuse challenge, Supabase client, edge functions and migrations were removed. About has an email feedback link that stays hidden until a support contact is set in `src/lib/support.ts` (at the time empty; it is now set to the Purafield Studio support address). The app makes no network requests of its own, so WS-03 and WS-05 (feedback lifecycle and abuse protection) and SEC-01 no longer apply; they are closed by removal, not by a fix. Entries below that mention feedback, challenges, Supabase or backend acceptance tests are historical.

Consequences for release gates: the privacy page and in-app copy now say WakeState uploads nothing. Once a release build's network traffic is inspected and confirms no requests, the Apple App Privacy and Google Data safety forms can likely be answered as no data collected. Do not declare that until the final build is checked. Set the real publisher support contact in `src/lib/support.ts` and on the privacy page at store setup; the stores require a support contact and public privacy policy URL. Do not publish placeholder names or addresses. The web PWA is hosted on Vercel (see HOSTING.md). The Lovable tooling dependency was removed.

## Android execution update, 2026-09-15 (historical)

Native Android compilation now passes with installed Java 21 / SDK 36. Installable debug APK and unsigned release AAB are available with checksums in `artifacts/android/2026-09-15/`. The old missing-Java blocker below is superseded. Native lint: 0 errors / 15 warnings; all 22 regression tests and typecheck pass. No Android device is attached. Publisher account is closed per coordinating Admin verification; owned app ID/signing remain unverified. No push or store submission.

See [the Android release packet](release/ANDROID-2026-09-15.md) for artifact paths, signing evidence, prepared store fields, backend acceptance tests and exact remaining blockers. WS-06 is now compilation complete / device QA open; WS-08 Android launcher and splash vectors implemented / device visuals and store images open. WS-05 and WS-07 remain open.

## Status

Native Capacitor projects are provided in `ios/` and `android/`. This is launch preparation, not a signed release or store submission. Bundle identifier `com.wakestate.app` is provisional: confirm publisher ownership before uploading either app. Existing web users must export/import to transfer records; native storage is separate.

## Launch tracker, 2026-09-10 (historical)

Historical snapshot. WS-03, WS-05 and SEC-01 were closed by removing the feedback backend on 2026-10-02; Android signing and compilation have moved on since (see the 2026-10-04 update and ANDROID-RELEASE.md). Evidence checked at 13:43 UTC (21:43 WITA). Shared tracking points here from the canonical improvement backlog.

| ID | Work | Status / evidence | Owner and closure condition |
|---|---|---|---|
| WS-01 | Simple medical visual style and mobile layout | Complete locally; dark teal palette, bundled font, safe areas and accessible navigation | Engineering; merged preparation pass |
| WS-02 | Local record integrity and recovery | Complete locally; atomic storage, validated backups, retryable journal and medication setup saves | Engineering; regression suite and browser checks |
| WS-03 | Feedback lifecycle | Complete locally; response validation, expiry reset after selection, recoverable failed refresh, accurate pending-verification wording | Engineering; does not resolve SEC-01 server abuse protection |
| WS-04 | Reproducible validation | Complete locally; `npm run validate`, 22 tests, typecheck, web build and native sync; lint 0 errors / 8 fast-refresh warnings | Engineering; rerun after code changes |
| WS-05 | Feedback abuse protection and production security | Open; deployed headers/RLS and durable rate limits remain unverified | Engineering + backend operator; implement durable prevention, deploy and exercise failure/replay cases |
| WS-06 | Native builds and device QA | Blocked by local toolchain; prior iOS platform missing and Android Java runtime absent | Release environment; unsigned compilation, physical-device QA and TestFlight/Play internal track |
| WS-07 | Publisher, policy and signing | Awaiting release-owner facts | Publisher; confirm app ID/accounts, support contact, retention/deletion policy, signing and store disclosures |
| WS-08 | Native/store artwork and content review | Open; generated native artwork remains, store copy drafted below | Release/design; final icons/screenshots and health-content review |

No push, deployment, production data change or store submission is included. Resume release work when backend access/authorization, toolchains or publisher facts are available; no repeated reminder is needed while those conditions are unchanged.

## Build workflow

Use Node 22+, `npm ci`, then:

```sh
npm run typecheck
npm test
npm run build
npm run native:sync
npm run native:ios
npm run native:android
```

`native:sync` builds bundled native assets without a service worker and copies them to both projects. Keep the local origin stable across app updates to preserve IndexedDB. No live server URL or broad navigation allowlist is configured. Native exports use Filesystem cache plus the system share sheet. Import uses the system file chooser. Android back closes secondary screens before returning to Today.

Capacitor 8 requires Xcode 26+ and Android Studio 2025.2.1+. Use the SDK/JDK expected by the generated Gradle project. [Official setup](https://capacitorjs.com/docs/getting-started/environment-setup).

## Release gates

- Confirm app ID, developer accounts, signing team, Android keystore, version/build numbers and ownership. Do not put signing secrets in git.
- Replace generated native launcher/splash assets with final WakeState artwork and generate required store screenshots. Public PWA icons are retained.
- Publish a complete, publicly accessible privacy policy and support URL (WakeState section: https://www.purafieldstudio.com/privacy#wakestate). Identify publisher and contact. There is no feedback backend or Supabase anymore; feedback is an email the user chooses to send. The in-app notice is a factual starting point, not completed legal review.
- Complete Apple App Privacy and Google Data safety declarations using actual release behavior. The app has no INTERNET permission and sends nothing, so the expected answer is no data collected and no data shared. Confirm against the merged manifest and the final build before declaring it.
- Complete Google Health apps declaration. Retain the non-diagnostic disclaimer in the app and listing. Verify medication reference links and health-related content with an appropriate reviewer.
- Feedback abuse protection, RLS and backend checks no longer apply: the feedback backend was removed on 2026-10-02.
- Inspect the final iOS privacy report. The app manifest includes the Filesystem file-timestamp reason C617.1 and is in the resource build phase; confirm all transitive SDK declarations in the archive.
- Android disables cloud backup and device transfer through manifest and extraction rules. Verify on supported devices. iOS backup/restore behavior needs physical-device verification; the app does not claim to exclude OS backups.
- Donation links: hidden in native builds since 2026-10-04 and shown only on the web PWA. Confirm on device that About and Settings show no "Buy me a coffee" link.
- Run device QA below and submit through TestFlight / Play internal testing before production.

## Device QA (must run on iOS and Android)

1. Fresh install: onboarding fits with large text; start works; TalkBack/VoiceOver labels and focus are understandable.
2. Save check-in, event, sleep, and medication; navigate away, force close, reopen, and verify persistence. Repeat offline and across local midnight.
3. Check keyboard avoidance, landscape, notches, safe areas, 320px width, and reduced motion. Android back dismisses forms/dialogs without accidental app exit.
4. Export every category; save to Files/Downloads and share to a chosen app. Restore into a disposable fresh test install and compare every record. Cancel the share sheet and file chooser gracefully.
5. Delete test data with confirmation; restart and verify no journal or export cache remains. Preferences stay. Exported copies remain outside app control.
6. Upgrade an installed build containing test data; verify no origin changes or loss. Verify behavior under storage pressure and denied/unavailable storage.
7. Tap the About feedback link; verify it opens an email draft to the support address and the app itself sends nothing. Confirm About and Settings show no donation link.
8. Inspect final release network traffic, archive privacy report, entitlements/permissions, screenshots, and store declarations together.

## Store listing draft

**Name:** WakeState

**Subtitle:** Your sleep and wake journal

**Short description:** Track wake states, sleep, events, and medications. See your own patterns.

**Description:** WakeState is a personal journal for people living with narcolepsy and related sleep–wake conditions. Record how you feel, note naps and other events, log last night's sleep, and keep a record of medications taken. Review your entries and export reports for conversations with your care team. No account is required. Health records stay on your device unless you export them. The app has no account, no analytics and does not connect to the internet. Keep regular backups. WakeState is not a medical device and does not diagnose, treat, cure, or prevent medical conditions. Consult a qualified healthcare professional for medical decisions.

**Reviewer notes:** No login required. Start Tracking opens the local journal. Settings provides export/import, privacy information, and deletion. The app requests no Internet or other user-facing permission (the only entry in the merged manifest is AndroidX's app-scoped signature receiver permission) and makes no network requests; external links open in the system browser and feedback opens an email draft. Tracking is local. No HealthKit or Health Connect integration is requested.

## Official submission references

- [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple App Privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- [Google Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291)
- [Google Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)

## Verification from this preparation pass (historical)

- TypeScript: passed.
- Storage/security regression suite: 7/7 passed (full backup round trip, validation before writes, V1 compatibility, legacy/draft deletion, CSV escaping, local-day medication lookup, invalid backup rejection).
- ESLint: 0 errors; 13 existing hook-dependency/fast-refresh warnings remain.
- Dependency audit after updates: 0 known vulnerabilities.
- Final production PWA build, native web build, and `cap sync`: passed for iOS and Android.
- Browser: inspected 390×844 home and 320×740 settings; check-in and sleep saved, appeared in overview, and survived a page reload; no console errors observed. Native share-sheet, VoiceOver/TalkBack and physical-device checks remain unverified.
- iOS unsigned simulator build: attempted; blocked because Xcode reports the iOS 26.5 platform is not installed. Install through Xcode Settings → Components, then rerun the build/device checklist.
- Android compilation: not performed; this machine reports no Java runtime. Install/configure Android Studio's JDK/SDK first.
- Builds report a large initial JavaScript bundle warning. The continued build improvements below reduce this bundle through lazy loading; the warning remains.

## Continued build improvements (historical)

Secondary reporting, history, medication setup and feedback views now load on demand; PWA precaching and native bundling retain offline availability after installation. Screen errors show a recovery action while keeping navigation available. Save confirmation uses a small text/checkmark notification instead of animated clouds or lightning. Sleep adjustment carries across hours and is capped at 24 hours; controls have accessible names. Imports notify the home screen to refresh its counts. Delayed check-in navigation and confirmation timers are cleaned up when leaving their screens.

Regression coverage now includes concurrent saves, malformed drafts, sleep-time boundaries, invalid feedback JSON, UTF-8 byte limits and streamed request cancellation. Backend changes are local only and must be deployed and verified separately.

The continued production build reduced the initial JavaScript bundle from about 1,337 kB to 710 kB (386 kB to 220 kB gzipped). Charts and optional feedback now load separately. The initial bundle still exceeds Vite’s 500 kB advisory threshold.

Follow-up verification: 17/17 tests, TypeScript, production build and native sync passed. Lint remains at 0 errors / 13 existing warnings. A fresh browser session loaded the deferred Patterns screen without runtime errors. A simulated IndexedDB quota failure showed the check-in error message and re-enabled Save. Sleep minute rollover was checked in the browser (7:00 → 6:45 → 7:00). Signed/native device testing and deployed feedback verification remain outstanding.

## Final integration pass (historical)

Nap and cataplexy forms now recover from failed saves, prevent duplicate submissions while saving, and cancel delayed close callbacks when unmounted. Nap input rejects invalid/zero-length time ranges. Check-in edits/deletes, event deletes, medication-log undo, and sleep upserts/deletes now use atomic IndexedDB transactions; regression tests cover concurrent deletion/insertion and one sleep entry per date. The existing store-release gates above remain open; integration into main is not a store release.

Final integration verification: 19/19 tests, TypeScript, production web build, native web build and Capacitor sync for both platforms passed. ESLint reports 0 errors and 13 existing warnings; generated native artifacts are excluded from source linting. A fresh 390×844 browser session confirmed failed nap saves show an error and re-enable Save, with no browser console errors. Native compilation/device testing and the release gates above remain outstanding.

## Autonomous reliability follow-up (historical)

Medication setup keeps selections and re-enables Save/Skip after a failed write, guards duplicate submissions, and exposes selection state to assistive technology. Patterns now exits its loading state with a retry action when reads fail. Report counts fetch in parallel, ignore older requests, and avoid duplicate mount reads; a successful import is not mislabeled as failed merely because count refresh fails. Check-in draft effects now declare their dependencies.

Feedback clears stale challenge data before refresh, rejects malformed/expired responses, refreshes even after selection, ignores superseded requests and permits answer corrections. Its UI says the answer is checked when sent. This is lifecycle reliability, not a replacement for the outstanding server-side abuse controls.

Verification: 22/22 tests, TypeScript, production build and native asset sync passed. ESLint: 0 errors / 8 existing fast-refresh warnings (all five hook warnings resolved). Browser storage-failure injection confirmed medication selection retention, visible error and enabled retry. Feedback expiry after selection plus failed refresh cleared the old question/answer and displayed retry; no browser runtime errors were recorded. Native device checks remain open.
