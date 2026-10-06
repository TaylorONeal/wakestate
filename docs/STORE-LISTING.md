# Store listing text

Canonical listing copy for both stores. Android copy and reviewer notes currently live in [LAUNCH.md, Store listing draft](LAUNCH.md#store-listing-draft) and [release/ANDROID-2026-09-15.md](release/ANDROID-2026-09-15.md); the iOS fields below were adapted from them on 2026-10-06. Everything here is a draft prepared in the repository. **Nothing has been entered in App Store Connect or submitted to Apple.** Owner authorization controls the actual submission.

Positioning that every field must preserve: WakeState is free, private and non-diagnostic. It has no account, no health telemetry, no analytics, no backend, and no data leaves the device unless the user exports or emails it. Do not add claims of diagnosis, treatment, medical advice, clinical accuracy, encryption, HIPAA compliance or automatic health tracking.

## iOS App Store fields (DRAFT, not submitted)

Character counts were measured with `len()` on the exact strings below; re-measure after any edit.

| Field | Limit | Draft | Count |
| --- | --- | --- | --- |
| App name | 30 | `WakeState` | 9/30 |
| Subtitle | 30 | `Your sleep and wake journal` | 27/30 |
| Promotional text | 170 | see below | 169/170 |
| Keywords | 100 | see below | 99/100 |
| Description | 4000 | see below | 1732/4000 |

**App name:** WakeState

**Subtitle:** Your sleep and wake journal

**Promotional text (169/170):**

> Free, private journal for narcolepsy and related sleep-wake conditions. Check-ins, naps, cataplexy events, last night's sleep and medication records stay on your device.

**Keywords (99/100, comma-separated, no spaces, no word repeated from name or subtitle):**

```
narcolepsy,cataplexy,nap,log,diary,symptom,medication,hypersomnia,sleepiness,export,offline,private
```

Deliberately excluded: `sleep`, `wake`, `journal` (already in name/subtitle, Apple indexes those fields), brand or drug names that appear in the in-app medication library (Wakix, Xyrem, Xywav, Lumryz, Sunosi), and any clinical term such as `diagnosis`, `treatment`, `therapy`, `doctor` or `medical`.

**Description (1732/4000):**

> WakeState is a free personal journal for people living with narcolepsy and related sleep-wake conditions. It helps you record how you feel, note what happened, and review your own patterns so you can describe your experience more clearly to the people who support you.
>
> WHAT YOU CAN RECORD
> • Quick check-ins: rate narcolepsy-related wake states such as daytime sleepiness, microsleeps, sleep inertia, cognitive fog and effort aversion, add optional overlapping symptoms, and leave a short note.
> • Events: log planned and unplanned naps, sleep attacks, cataplexy, sleep paralysis, hallucinations and other discrete moments with a time and duration.
> • Last night's sleep: one editable entry per day with total sleep time, wake-ups and sleep-related experiences.
> • Medications: enter the regimen you were prescribed, then tap Taken to keep a record of doses as they happen.
>
> REVIEW AND SHARE ON YOUR TERMS
> • Timeline and Patterns views show what you recorded and when.
> • Export check-ins as CSV, save a full JSON backup, or generate a plain-language report you can bring to an appointment.
> • Nothing is sent automatically. You choose when to export and where the file goes.
>
> PRIVATE BY DESIGN
> • No account, no sign-in, no subscription.
> • Your journal stays on your device unless you export it.
> • No advertising or analytics SDKs, and the app makes no network requests.
> • Clear your data at any time from Settings.
> • Keep regular backups: deleting the app removes your local records.
>
> WakeState is not a medical device and does not diagnose, treat, cure, or prevent any medical condition. It records what you choose to enter and does not interpret it as medical advice. Consult a qualified healthcare professional for medical decisions.

**Support URL:** `https://www.purafieldstudio.com/support`. Publisher support page, verified live (HTTP 200) on October 6, 2026 through Vercel. It names WakeState, carries the support email and explains that in-app feedback is a draft email that sends nothing on its own.

**Privacy Policy URL:** `https://www.purafieldstudio.com/privacy#wakestate` (documented in `docs/LAUNCH.md` release gates and `docs/release/ANDROID-2026-09-15.md`). Verified live (HTTP 200, `#wakestate` anchor present) on October 6, 2026 through Vercel; the live text matches the no-server, no-upload, on-device positioning. Confirm it still matches `public/privacy.html` before entering it. Apple also requires a privacy policy link inside the app for apps handling health data; the in-app notice at `public/privacy.html` is reachable from Settings and About.

**Marketing URL (optional):** leave blank unless a public product page exists.

**Copyright:** `2026 Purafield Studio LLC` (publisher named in `public/privacy.html`; confirm legal name with the owner).

**Version / build:** 1.0.0 (1) per the current Capacitor project; confirm against the archive actually uploaded.

### Category suggestions

- **Recommended primary:** Health & Fitness. WakeState is a personal sleep-wake and medication journal with no clinical function, which matches Apple's description of Health & Fitness (personal wellness and self-tracking).
- **Recommended secondary:** Lifestyle (or none). Lifestyle is the alternative primary if the owner prefers to de-emphasize the health framing; the app content itself is still health-adjacent, so Health & Fitness is the more honest fit.
- **Not recommended: Medical.** The Medical category signals clinical use and invites diagnostic scrutiny under Guideline 1.4.1 (apps that could provide inaccurate data or information that could cause physical harm) and the medical-app expectations under 5.1.3 (health and health research). WakeState does not diagnose, dose-calculate, recommend treatment or integrate with HealthKit, and its About screen, privacy notice and description say so. Choosing Medical would contradict that positioning and could prompt requests for regulatory documentation the product has no basis to provide.

### Age rating questionnaire (truthful answers from current content)

Answer from the shipped content, not from the disclaimer. Verify the exact question wording in App Store Connect, which changed with the 2025 rating overhaul (4+/9+/13+/16+/18+).

| Question | Answer | Why |
| --- | --- | --- |
| Cartoon or fantasy violence; realistic violence; prolonged graphic violence | None | No such content. |
| Profanity or crude humor | None | None in UI copy. |
| Mature/suggestive themes; sexual content or nudity | None | None. |
| Horror/fear themes | None | Nightmare and hallucination event types are neutral labels, not horror content. |
| **Medical/Treatment Information** | **Infrequent/Mild (not None)** | The medication screen ships a reference library of narcolepsy medications with brand/generic names, mechanism summaries, descriptions, preset prescribed-dose choices and manufacturer links (`src/components/MedicationsScreen.tsx`), including investigational orexin agonists. Generated provider reports include a "Questions for your provider" block that mentions treatment adjustments (`src/lib/reports.ts`). This is medical/treatment information by Apple's definition even though the app gives no advice. Answering None would be inaccurate. Expect this answer to raise the rating above 4+ (historically 12+; confirm the current mapping in the console). |
| Alcohol, tobacco or drug use or references | None (owner to confirm) | Prescription medication record-keeping and a "Caffeine Use" event label are not recreational drug references in Apple's usual reading. If a reviewer disagrees, Infrequent/Mild is the fallback. |
| Simulated gambling; contests | None | None. |
| Unrestricted web access | No | External links (resource sites, manufacturer pages) open in the system browser, not an in-app browser. |
| User-generated content shared with others | No | Notes are stored locally and never published or shared by the app. |
| Parental controls / kids category | No | Not a Kids Category app. |
| Loot boxes / in-app purchases / advertising | No | Free; donation links are hidden on native builds (`src/lib/donations.ts`), no IAP, no ads. |

### App Review notes (draft)

> WakeState is a free, offline personal journal for people with narcolepsy. No account, login or demo credentials are needed; tap "Start Tracking" on the welcome screen to open an empty local journal.
>
> Core journey to verify (bottom tabs are Today, Log, Timeline, Patterns, Settings): (1) Log tab: move the check-in sliders, add a note, save; (2) Today tab: log an event such as a nap or cataplexy with time and duration, enter last night's sleep (one entry per day), and set up a medication regimen, then tap Taken; (3) Timeline and Patterns show the saved entries; (4) Settings → Export & Reports: Export Check-Ins (CSV) opens the system share sheet with a locally generated file, Export All Data (JSON) produces a backup, Import Data restores one, and the report cards generate plain-text reports.
>
> All records are stored only on the device (IndexedDB inside the app's web view). The app makes no network requests, has no analytics or advertising SDK, no backend and no HealthKit integration; it requests no permissions. The only ways data leaves the device are user-initiated: the share sheet during export, and the "Email Feedback" button, which opens a draft in the user's own mail app. External resource links open in Safari.
>
> WakeState does not diagnose, treat or recommend treatment. The medication screen is a user-maintained record of doses the user was prescribed; preset dose values are entry shortcuts, not recommendations, and the screen says so. Please use synthetic data when testing.

## App Privacy (App Store) draft

**Proposed answer: "Data Not Collected"** for all data types, and **no tracking**. Derived from source inspection on 2026-10-06 at main `c1cb68b3f58b7f2da1b6f59b9fff02a0382fb636`; confirm against the final archive's merged frameworks before attesting.

What was checked:

- `grep -rnE "fetch\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket"` across `src/`, `index.html`, `capacitor.config.ts`: no matches. The app code issues no HTTP requests.
- `grep -rniE "analytics|sentry|firebase|amplitude|mixpanel|posthog|segment|crashlytics|gtag|googletagmanager"` across `src/` and `package.json`: the only hit is the Settings copy stating that no advertising or analytics SDK is included. No analytics, crash-reporting or advertising dependency is declared.
- Capacitor plugins in `package.json` and `ios/App/CapApp-SPM/Package.swift`: `@capacitor/core`, `@capacitor/app`, `@capacitor/filesystem`, `@capacitor/share` only. Filesystem writes the export to the app cache; Share hands it to the system share sheet. No network, push, location, camera, contacts or HealthKit plugin.
- `capacitor.config.ts`: no `server.url` and no remote content; the bundled web assets load from the local origin. The native build (`vite build --mode native`) excludes the PWA service worker (`vite.config.ts`).
- `src/lib/support.ts`: feedback is a `mailto:` link to the publisher; nothing is sent unless the user sends the email from their own mail app.
- `src/lib/donations.ts`: the Buy Me a Coffee link is shown only when `Capacitor.isNativePlatform()` is false, so store builds contain no external payment link.
- Storage: IndexedDB plus a localStorage check-in draft (`src/lib/storage.ts`); no account identifiers, device identifiers or server-side storage exist.
- Android parity: the source manifest has no `INTERNET` permission, `allowBackup="false"` and data-extraction rules excluding stored data; the Play Data safety draft already saved with the provider is "no data collected, no data shared" (`docs/LAUNCH.md`, provider preparation row).
- iOS privacy manifests (see below) declare `NSPrivacyTracking` false, no tracking domains and no collected data types.

Not verified in this pass and still required before attesting: runtime network capture on a real device with the final signed build, and confirmation that no later dependency adds telemetry. Apple's definition of collection covers third-party SDKs, so re-run the greps against the final lockfile.

Health-data note: user-entered sleep, symptom and medication records are health data under Apple's categories, but they are never transmitted off-device by the developer, so they are not "collected" in App Privacy terms. Platform device backups (iCloud/Finder) may include the web-view storage; that is Apple's backup behavior, not developer collection, and `public/privacy.html` already tells users not to rely on it.

## Privacy manifest status (checked 2026-10-06)

- `ios/App/App/PrivacyInfo.xcprivacy`: **present** (not created or modified in this pass). Declares `NSPrivacyTracking` false, empty tracking domains, and one accessed API category, `NSPrivacyAccessedAPICategoryFileTimestamp` with reason `C617.1` (file timestamps of files inside the app container, which covers the Filesystem plugin's export cache).
- Capacitor framework manifests: **present** in the dependency tree at `node_modules/@capacitor/ios/Capacitor/Capacitor/PrivacyInfo.xcprivacy` and `node_modules/@capacitor/ios/CapacitorCordova/CapacitorCordova/PrivacyInfo.xcprivacy` (both: no collected data types, no accessed API types, no tracking domains, tracking false). They ship inside the Capacitor and Cordova frameworks pulled by Swift Package Manager (`capacitor-swift-pm` 8.5.1), so they are bundled at archive time. `docs/LAUNCH.md` recorded the same for the October 5 simulator candidate.
- Plugin packages `@capacitor/app`, `@capacitor/filesystem` and `@capacitor/share` do not ship their own `PrivacyInfo.xcprivacy`; the app-level manifest above carries the file-timestamp reason on their behalf.
- Inclusion of a manifest is not privacy compliance. If the archive's privacy report in Xcode shows any additional required-reason API, update the app manifest before upload.

## Validation run for this preparation pass (2026-10-06)

`npm ci` then `npm run validate` on Node 22.22.0 at main `c1cb68b`: **passed**. Typecheck passed; vitest 7 files, 30 tests passed; ESLint 0 errors and the 8 existing `react-refresh/only-export-components` warnings; production web build completed with the existing >500 kB chunk-size warning. `npm ci` reported `19 vulnerabilities (1 low, 5 moderate, 13 high)` from `npm audit`; this is an advisory report on unchanged dependencies, not a validate failure, and nothing was changed to address it in this documentation-only pass.

## Items that could block or slow Apple review

1. **Support URL resolved.** `https://www.purafieldstudio.com/support` is live and names WakeState (verified October 6, 2026).
2. **Privacy Policy URL verified live** on October 6, 2026; it names the publisher and contact.
3. **Medication reference library** (mechanisms, descriptions, preset dose values, investigational drugs with efficacy-style wording such as "designed to restore orexin signaling") is the content most likely to be read as medical information under Guideline 1.4.1. `docs/HEALTH-APP-READINESS.md` already requires a separate primary-source and clinical review of this content; that gate is still open and is independent of the listing text.
4. **Provider report wording** in `src/lib/reports.ts` ("Are there treatment adjustments to consider?") is a question for the user's clinician and is framed with a non-advice disclaimer; keep it that way and do not quote it in marketing copy.
5. **Age rating** must not be answered None for Medical/Treatment Information (see above); an inaccurate rating is a common metadata rejection.
6. **Screenshots** must come from the actual iOS candidate with synthetic records only (`docs/store/ANDROID-SCREENSHOTS.md` rules apply to iOS as well); none exist yet.
7. Remaining native gates in `docs/LAUNCH.md` (iPhone and physical-device acceptance, signed archive, TestFlight) are build/QA gates, not listing gates, and are unchanged by this document.
