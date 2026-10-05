# WakeState native and store testing

Durable test selection for Android and iOS. [LAUNCH.md](LAUNCH.md) owns results, reusable lessons and launch gates; [HEALTH-APP-READINESS.md](HEALTH-APP-READINESS.md) and [SECURITY.md](SECURITY.md) own health/privacy findings. Use the newest source and dated receipts; the removed feedback backend is not an active test target.

## Core smoke for each new candidate/platform

1. Verify installed `com.wakestate.app`, version/build and artifact/source. Cold launch; read local-storage and non-diagnostic onboarding; reach the journal without an account/payment.
2. Make a synthetic check-in and event; see their correct values in history. Fully close the process, relaunch and reopen matching records. Repeat a small edit/save offline.
3. Open Settings/About; confirm export remains accessible, no native donation/paywall link, and privacy/support are reachable. A support email draft is not a send and must not include journal records automatically.

## First-release baseline and triggered regression

| Case | Required observable result |
| --- | --- |
| Journal coverage | Save check-in, event, sleep and medication records, navigate away and fully restart; compare each type. Test local-day/midnight boundaries when date/time logic changes. Medication logging must not produce treatment advice. |
| Export/recovery | Export all supported categories to Files/Downloads and inspect actual content; restore synthetic backup into a disposable clean context and compare record types/values. Invalid backup or canceled chooser preserves good data. |
| Share/cancel | Deliver a synthetic export through the system sheet, inspect the receiving file, cancel another share and return safely. User-selected recipient sharing is distinct from app telemetry. |
| Deletion | Cancel deletion first; then confirm deletion of disposable synthetic records and restart. Check journal and export-cache removal; exported copies outside the app remain outside its control. Preferences remain as designed. |
| Upgrade/storage failure | Same-identity compatible-signature upgrade with synthetic data; preserve local origin and records. Test denied/unavailable storage or failed writes with recoverable feedback after affected storage/plugin changes. |
| Accessibility/navigation | VoiceOver/TalkBack labels/focus, enlarged text, keyboard avoidance and gesture insets on changed flows. Android Back dismisses forms before Today/exit; iOS dismissal restores the journal without losing edits. |
| Privacy | Reconcile release permissions, dependency inventory, observed app network behavior and public disclosures. Inspect Android backup/device-transfer exclusions; verify iOS backup separately. No health-event telemetry, analytics SDK, backend or automatic export. |
| Content | Check disclaimers, linked medication references and actual supported descriptions; keep qualified health-content review as its own gate. No diagnostic/treatment promises or fabricated clinical outcomes. |

## Platform release boundary

| Google Play | App Store preparation |
| --- | --- |
| Verify signed AAB hash/pinned upload certificate, package/version acceptance and Play-delivered build; smoke that delivered build and review prelaunch findings. Reconcile Data safety, Health apps, listing and final candidate. A saved declaration is not approval. | Verify signed archive/version and complete privacy report including SDK manifests; inspect cold launch and affected share/persistence/accessibility on iPhone and any supported iPad layout. TestFlight delivery is distinct from local simulator compilation. |
| Compiled Android no-INTERNET and backup exclusions are static facts; device privacy/recovery behavior remains separate. Native-library/page-size retest is triggered by changed payload/SDK, not by unrelated copy. | Android privacy/backup behavior cannot be transferred to iOS. No iOS submission is authorized by this plan. |

WakeState remains free, private and non-diagnostic. No billing/purchase suite is applicable to its current product; do not add one, monetization gates or health telemetry merely to complete a generic checklist. Use synthetic records only, never real health data in screenshots or public logs.

## Select the smallest useful test set

For a new binary on each release platform, first verify its identity and run the short core smoke below. Then test the changed behavior and its nearest failure/recovery path. The first store release still needs the uncompleted baseline; future releases may reuse explicitly linked, unchanged baseline evidence. A documentation-only correction needs link/content checks, not a fresh native build. A new failure or changed dependency can justify broader coverage; repeating a green suite on the same binary cannot close a device or store gate.

| Change | Additional checks |
| --- | --- |
| Storage, schema, local origin or migration | Same-signature upgrade with synthetic existing records; export/restore round trip; invalid import preserves data; write failure and retry; full process restart |
| Share/export/import plugin or permissions | Real system share and Files destination; inspect received content; cancel share/file chooser; failed destination and recovery |
| Layout, navigation, keyboard or accessibility | Changed screen at smallest supported layout and enlarged text; relevant screen-reader focus; keyboard/gesture insets; cancel and Back/dismissal |
| Native SDK, dependency, signing or packaging | Rebuild affected platform, inspect compiled identity/permissions/privacy resources and signature; install candidate and smoke; test affected plugin paths |
| Icons/splash only | Resource compilation plus actual cold launch and launcher appearance on affected supported device families; no journal/checklist regression marathon |
| Privacy, support or store copy | Match final behavior and public links to declarations; inspect changed UI/metadata; no invented policy approval |

Use `native-app-testing` before device acceptance, reviewer instructions or recovery from device-control failure, and read the reusable lessons linked below. Synthetic records only; do not uninstall or clear a real-data installation to bypass a signature mismatch. Reconnect/keyboard input is not proof that every control works. Preserve screenshots and candidate metadata; keep device serials, accounts and private records outside this repository.

## Evidence and stop rule

Record results in the existing ledger linked below, not in another tracker: timestamp, source and binary SHA-256, installed package/version/build, platform/device/OS, case, action, observed outcome, evidence reference, limitation and next action. Use **pass**, **fail**, **blocked**, or **not run**; list reused evidence and why its relevant layer is unchanged. Background/resume or browser reload does not establish native restart persistence. Compilation, signing, installation, interaction, store upload and store approval are separate outcomes.

Stop retesting a passing unchanged case unless a new change or failure invalidates it. Record a blocker once with its unblock condition and continue independent work. Do not turn a successful sideload into a Play/TestFlight delivery claim.

Reusable lessons: [LAUNCH.md](LAUNCH.md#reusable-native-testing-lessons).
