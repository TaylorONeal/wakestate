# iOS and Android launch preparation

## Status

Native Capacitor projects are provided in `ios/` and `android/`. This is launch preparation, not a signed release or store submission. Bundle identifier `com.wakestate.app` is provisional: confirm publisher ownership before uploading either app. Existing web users must export/import to transfer records; native storage is separate.

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
- Publish a complete, publicly accessible privacy policy and support URL. Identify publisher/contact, feedback retention/deletion procedure, hosting/Supabase providers, and applicable rights. The in-app notice is a factual starting point, not completed legal review.
- Complete Apple App Privacy and Google Data safety declarations using actual release behavior. Do not broadly claim “no data collected”: optional feedback may include health-related role/text and service request metadata.
- Complete Google Health apps declaration. Retain the non-diagnostic disclaimer in the app and listing. Verify medication reference links and health-related content with an appropriate reviewer.
- Resolve feedback abuse protection (see SECURITY.md), verify deployed RLS and headers, and deploy/test backend changes separately. No backend deployment was performed here.
- Inspect the final iOS privacy report. The app manifest includes the Filesystem file-timestamp reason C617.1 and is in the resource build phase; confirm all transitive SDK declarations in the archive.
- Android disables cloud backup and device transfer through manifest and extraction rules. Verify on supported devices. iOS backup/restore behavior needs physical-device verification; the app does not claim to exclude OS backups.
- Review external donation links against store rules for the chosen markets before submission. Current web links remain in About/Settings.
- Run device QA below and submit through TestFlight / Play internal testing before production.

## Device QA (must run on iOS and Android)

1. Fresh install: onboarding fits with large text; start works; TalkBack/VoiceOver labels and focus are understandable.
2. Save check-in, event, sleep, and medication; navigate away, force close, reopen, and verify persistence. Repeat offline and across local midnight.
3. Check keyboard avoidance, landscape, notches, safe areas, 320px width, and reduced motion. Android back dismisses forms/dialogs without accidental app exit.
4. Export every category; save to Files/Downloads and share to a chosen app. Restore into a disposable fresh test install and compare every record. Cancel the share sheet and file chooser gracefully.
5. Delete test data with confirmation; restart and verify no journal or export cache remains. Preferences stay. Exported copies remain outside app control.
6. Upgrade an installed build containing test data; verify no origin changes or loss. Verify behavior under storage pressure and denied/unavailable storage.
7. Open feedback online/offline; verify retry, expiry, malformed request rejection, and successful submission against a test backend. Check outgoing requests to confirm no health journal payload.
8. Inspect final release network traffic, archive privacy report, entitlements/permissions, screenshots, and store declarations together.

## Store listing draft

**Name:** WakeState

**Subtitle:** Your sleep and wake journal

**Short description:** Track wake states, sleep, events, and medications. See your own patterns.

**Description:** WakeState is a personal journal for people living with narcolepsy and related sleep–wake conditions. Record how you feel, note naps and other events, log last night's sleep, and keep a record of medications taken. Review your entries and export reports for conversations with your care team. No account is required. Health records stay in local app storage unless you export them; optional feedback is sent online. Keep regular backups. WakeState is not a medical device and does not diagnose, treat, cure, or prevent medical conditions. Consult a qualified healthcare professional for medical decisions.

**Reviewer notes:** No login required. Start Tracking opens the local journal. Settings provides export/import, privacy information, and deletion. Internet is required only for optional feedback and external links; tracking is local. No HealthKit or Health Connect integration is requested.

## Official submission references

- [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple App Privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- [Google Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291)
- [Google Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)

## Verification from this preparation pass

- TypeScript: passed.
- Storage/security regression suite: 7/7 passed (full backup round trip, validation before writes, V1 compatibility, legacy/draft deletion, CSV escaping, local-day medication lookup, invalid backup rejection).
- ESLint: 0 errors; 13 existing hook-dependency/fast-refresh warnings remain.
- Dependency audit after updates: 0 known vulnerabilities.
- Final production PWA build, native web build, and `cap sync`: passed for iOS and Android.
- Browser: inspected 390×844 home and 320×740 settings; check-in and sleep saved, appeared in overview, and survived a page reload; no console errors observed. Native share-sheet, VoiceOver/TalkBack and physical-device checks remain unverified.
- iOS unsigned simulator build: attempted; blocked because Xcode reports the iOS 26.5 platform is not installed. Install through Xcode Settings → Components, then rerun the build/device checklist.
- Android compilation: not performed; this machine reports no Java runtime. Install/configure Android Studio's JDK/SDK first.
- Builds report a large initial JavaScript bundle warning. The continued build improvements below reduce this bundle through lazy loading; the warning remains.

## Continued build improvements

Secondary reporting, history, medication setup and feedback views now load on demand; PWA precaching and native bundling retain offline availability after installation. Screen errors show a recovery action while keeping navigation available. Save confirmation uses a small text/checkmark notification instead of animated clouds or lightning. Sleep adjustment carries across hours and is capped at 24 hours; controls have accessible names. Imports notify the home screen to refresh its counts. Delayed check-in navigation and confirmation timers are cleaned up when leaving their screens.

Regression coverage now includes concurrent saves, malformed drafts, sleep-time boundaries, invalid feedback JSON, UTF-8 byte limits and streamed request cancellation. Backend changes are local only and must be deployed and verified separately.

The continued production build reduced the initial JavaScript bundle from about 1,337 kB to 710 kB (386 kB to 220 kB gzipped). Charts and optional feedback now load separately. The initial bundle still exceeds Vite’s 500 kB advisory threshold.

Follow-up verification: 17/17 tests, TypeScript, production build and native sync passed. Lint remains at 0 errors / 13 existing warnings. A fresh browser session loaded the deferred Patterns screen without runtime errors. A simulated IndexedDB quota failure showed the check-in error message and re-enabled Save. Sleep minute rollover was checked in the browser (7:00 → 6:45 → 7:00). Signed/native device testing and deployed feedback verification remain outstanding.

## Final integration pass

Nap and cataplexy forms now recover from failed saves, prevent duplicate submissions while saving, and cancel delayed close callbacks when unmounted. Nap input rejects invalid/zero-length time ranges. Check-in edits/deletes, event deletes, medication-log undo, and sleep upserts/deletes now use atomic IndexedDB transactions; regression tests cover concurrent deletion/insertion and one sleep entry per date. The existing store-release gates above remain open; integration into main is not a store release.

Final integration verification: 19/19 tests, TypeScript, production web build, native web build and Capacitor sync for both platforms passed. ESLint reports 0 errors and 13 existing warnings; generated native artifacts are excluded from source linting. A fresh 390×844 browser session confirmed failed nap saves show an error and re-enable Save, with no browser console errors. Native compilation/device testing and the release gates above remain outstanding.
