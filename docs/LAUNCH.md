# iOS and Android launch preparation

## October 13: iOS 1.0.2 (3) built, tested and submitted to App Review

Taylor approved building 1.0.2 with the check-in fix on October 13, then the merge, upload and App Review submission later the same morning. The sections below record source preparation, the signed candidate and iPhone acceptance, and delivery, in that order. Approval and release are not recorded yet.

| ID | Result | Evidence |
| --- | --- | --- |
| WS-IOS-NEXT-02 | Reconciled. The live 1.0.1 (2) binary was built from `0acb214` (local branch `release/ios-1.0.1` at `c52829c`, same tree), uploaded October 8 04:10 PDT. Main has four commits after it: favicon (#30, web asset), agent docs (#31), the check-in fix (#32) and release docs (#33). The only behavior change not yet shipped is #32. Timeline/CSV #21, nap precision #23, medication reference #28, native branding and the export-compliance key are already in 1.0.1. | App Store Connect builds API October 13: build 2 uploaded 2026-10-08, versions 1.0.0 and 1.0.1 both Ready for Sale. |
| WS-IOS-NEXT-03 | Source frozen for the candidate: `MARKETING_VERSION` 1.0.2, `CURRENT_PROJECT_VERSION` 3 (first unused numbers). `npm run validate` passes with 42 tests. | This change. |
| Settings version label | Fixed. 1.0.1 shipped with a hard-coded "Version 1.0.0". Settings now shows the installed binary's version and build on native (`@capacitor/app` `getInfo`) and the bundle version on web, so a user or reviewer can tell which build is installed. This matters for the October 11 incident, where the recording could not identify the build. | `src/lib/appVersion.ts`, `src/lib/appVersion.test.ts` (4 cases). |
| Medication reference | Open item checked only: the manufacturer page still lists Orzeyful as coming soon, pending DEA scheduling, expected by November 2026, which matches the current description. The full list was last verified October 8 (#28) and was not re-verified today. | https://www.orzeyful.com, read October 13. |

### Signed candidate and iPhone acceptance (October 13, 09:29 to 09:45 WITA)

Source `ab0f92cf24c86560899e02e62d5eace5b72b18d6` (tree `1a9b360f9d67957ec4f8cc88c7cc435c4fbbaebc`), built in a clean detached worktree on the release Mac. App Store IPA SHA-256 `fa4347e370b62f5779e91e9b8a20356b6eec9bc6c4f6da0e40f5671431a3498d`, `com.wakestate.app` 1.0.2 (3), signed Apple Distribution, team 3S98UN76JW, profile "wakestate AppStore Dist 2026-10-07". **Not uploaded.** Later commits on this branch are documentation only.

Device: iPhone 12 mini, iOS 27.0.1, driven through Xcode Device Hub. The installed binary was a development-signed Release build of the same source (an App Store-signed IPA cannot be installed directly). Synthetic records only. Screenshots 01 to 11 are kept outside git on the release Mac.

| Case | Result | Observed |
| --- | --- | --- |
| Installed identity | New pass | Settings footer reads "Version 1.0.2 (3)". `devicectl` reports 1.0.2 / 3. |
| Restored draft, then save | New pass | Draft entered at 9:35 (scores 3 / 2), process terminated, relaunched at 9:37. "Draft restored" shown with the same values and the 9:35 time. One score changed to 4, one tap on the visible center of Save: button showed "Check-In Saved", toast "Recorded at 9:35 AM" with Undo. Timeline showed exactly one record at 9:35 with 3 / 2 / 4 / 1 / 1. The next form opened fresh at 9:38, so the draft was removed. |
| Quick repeated taps | New pass | Fresh form, three taps on Save in a row. Exactly one new record (two total). Tap spacing was automated and not measured. |
| Undo | New pass, with a finding | Save then Undo inside the toast window: "Check-in removed", Save became available again, record count unchanged. One more Save then wrote exactly one record. Finding: the form is reset after a save, so Undo removes the record but does not bring the entered scores back; saving again writes default scores. This is existing behavior, also in 1.0.1, and is not changed by this candidate. |
| Full restart | New pass | Process terminated and relaunched: the same three records, same times and values. |
| Preserving upgrade | New pass (development-signed proxy) | Installed a development build of 1.0.1 (2) from `0acb214` over the same container: three records present. Saved a fourth on 1.0.1, installed 1.0.2 (3) over it: four records present, version label 1.0.2 (3). This is not the App Store-signed 1.0.1 to 1.0.2 path; TestFlight over a store install is the only way to exercise that. |
| Native failure injection | Not run | UUID, quota and haptic failures are covered by the five `CheckInScreen.test.ts` cases, not on the device. |
| Original reported incident | Not reproduced | An ordinary save also succeeded on the 1.0.1 build on this phone. This candidate fixes three confirmed defects; it is not proof that the reporter's trigger is fixed. The incident stays open until the reporter confirms on 1.0.2 or the trigger is identified. |

### Delivery (October 13)

Taylor approved the merge, the upload and the App Review submission in chat at 10:02 WITA. Release was not part of that approval.

| Step | State | Evidence |
| --- | --- | --- |
| Source merged | Done | PR #34 squash-merged to `main` as `f1df615`. The binary was built from `ab0f92c`; the merge adds documentation only on top of that tree. |
| Privacy delta vs 1.0.1 | Checked, unchanged | No new runtime dependency (`jsdom` is test-only), no usage-description keys, no entitlement change, native diff is version numbers only, `ITSAppUsesNonExemptEncryption` false. App privacy answers were not edited. |
| Upload | Done 10:07 WITA | `altool` validate then upload of the IPA with SHA-256 `fa4347e3...a3498d`: "UPLOAD SUCCEEDED with no errors". Build 3 processed to VALID at 10:09. |
| Version record | Done | App Store version 1.0.2 created with build 3 attached, release type **Manual**, What's New: "Improved check-in saving, with clearer retry feedback and protection against duplicate entries. Settings now shows the installed version." Review notes carried over from 1.0.1 with one added sentence describing this update. |
| App Review | Submitted 10:11 WITA (02:11 UTC) | Version state Waiting for Review. 1.0.1 stays Ready for Sale until 1.0.2 is released. |
| Release | Not done | Manual release. Needs Taylor's yes after approval, or a switch to automatic release. |
| TestFlight | Not used | No tester install of build 3. The App Store-signed upgrade path is therefore still unexercised. |

Follow-up for a later release: make Undo restore the entered values, or relabel it "Remove". The October 11 incident stays open until the reporter confirms on 1.0.2 or the trigger is identified. Android is unchanged: version 1.0.0 (1) is in Play review and does not contain #32.

## October 12: next App Store release batch

Taylor requested that the check-in fix ship with the other App Store changes in the next combined WakeState release. [PR #32](https://github.com/TaylorONeal/wakestate/pull/32) is merged as `5c13500466042158271fb049bd93089144c89409`; the next iOS candidate must contain this commit. Batch remaining approved iOS fixes and listing changes into one reviewed candidate, then run the affected acceptance checks once. Do not start a separate paid build or immediate standalone submission for this fix.

| ID | Work | State / evidence | Next action / owner |
| --- | --- | --- | --- |
| WS-IOS-NEXT-01 | Recover failed check-in saves and prevent duplicate submissions | Implemented awaiting iPhone verification; #32 merged. All 38 source tests, web validation, [Android build/emulator launch](https://github.com/TaylorONeal/wakestate/actions/runs/38115449942) and [platform-independence](https://github.com/TaylorONeal/wakestate/actions/runs/38115450016) passed. | Release engineer: include #32 in the next combined candidate; run the [focused incident retest](NATIVE-TESTING.md#select-the-smallest-useful-test-set). The original reporter's trigger remains unconfirmed. |
| WS-IOS-NEXT-02 | Reconcile the remaining App Store batch | Ready to work; main also contains Timeline/CSV #21, nap precision #23, medication reference #28, native branding and export-compliance fixes. Their presence in the live 1.0.1 binary has not been mapped here. | Release engineer: compare the live/submitted build provenance with candidate main; retain existing fixes, identify only genuinely unshipped changes and include remaining approved listing updates. Do not relabel earlier fixes or screenshots as new. |
| WS-IOS-NEXT-03 | Freeze and verify one iOS candidate | Not run; source remains configured as 1.0.1 (2), so it is not yet the next version/build. | Release engineer: confirm current App Store Connect versions/builds, choose the next unused release numbers, refresh the medication reference, record source/binary hashes, then build and run core smoke plus affected save/retry/Undo/restart and preserving-upgrade checks on iPhone. Preserve bundle ID, local origin and existing journal data. |
| WS-IOS-NEXT-04 | Deliver the combined update | Prepared scope only; no new iOS archive, upload, submission or publication in this update. | Release owner: after candidate/device/privacy checks, carry this batch through the existing App Store release process and record TestFlight, submission and live states separately. |

Draft release note for the save fix: “Improved check-in saving, with clearer retry feedback and protection against duplicate entries.” Final notes must reflect the verified candidate delta. Future backup/device-migration work remains deferred as requested and is not added to this batch. Android release scheduling remains separate.

## October 11: reported App Store check-in failure, save recovery patch

**Incident remains open for native reproduction.** A user supplied an iPhone recording and reported an official-store installation. The recording returns to Today without a visible save confirmation; it does not identify the installed version/OS or show touch locations or runtime errors. The [public Apple listing](https://apps.apple.com/ca/app/wakestate/id6819921769), checked October 11, shows **1.0.1 live**. This supersedes older iOS prelaunch status below, but does not identify the reporter's installed build or its source hash.

Source baseline: `16b2b5d` on `main`. Ordinary fresh and restored-draft saves passed in mobile WebKit. Fault injection in the actual check-in form confirmed three separate defects: record preparation was outside the save catch, so a UUID exception locked Save with an unhandled rejection; optional vibration could throw after a committed write and prevent draft cleanup/count refresh; and the submit guard reopened before delayed navigation, allowing an additional entry. These are confirmed code defects, **not proof of the original device trigger**. A missing vibration API already worked; the haptic regression models a throwing implementation.

The patch puts preparation and storage in one recoverable error boundary, retains the draft and exposes a persistent inline error on failure, isolates optional haptics in the shared confirmation hook, and holds the submit guard through confirmation. Undo releases the guard. Existing record format, IndexedDB origin, UUID generation, draft timestamp and native configuration are preserved; no data migration, new telemetry or user-record deletion.

Acceptance for this patch: failed preparation/write leaves zero new records and a retryable unchanged draft; retry creates exactly one entry with original values/date; optional haptic failure cannot interrupt committed-save cleanup; repeated taps while writing/confirming do not add entries; Undo still works.

| Layer / case | Status | Evidence / next action |
| --- | --- | --- |
| Actual-form regressions | New pass | `src/components/CheckInScreen.test.ts`: 5 cases with real React rendering and synthetic IndexedDB. Original code failed the first four assertions, with unhandled UUID/haptic rejections; the patch passes. |
| Source checks | New pass | `npm run validate`: 38 tests, typecheck, lint with 8 existing warnings, production build with existing chunk-size warning; platform-independence check passes. |
| Native web payload | New pass | `npm run native:sync`: native bundle builds and copies to both iOS/Android. This is not an Xcode/Gradle compile or signed candidate. |
| Mobile WebKit compiled bundle | New pass | 390×844 touch context; ordinary restored draft plus injected UUID, quota and haptic failures; retry/confirmation, exact synthetic record values, draft removal and reload persistence. No page errors. Browser reload is not native process restart. |
| Original iPhone/store incident | Not reproduced | Preserve incident status until installed version/build, iOS version and intended failing action are established and the store-installed case is exercised on an iPhone. Do not infer native touch hit-testing from browser tests. |
| Fixed native release | Not run | Build a candidate from the reviewed commit, preserving app identity/origin; use the focused retest in `NATIVE-TESTING.md`. Record source/binary provenance and device outcome, then seek specific store-submission authorization. No new binary uploaded or published by this patch. |

Keep the submitted recording outside git: it contains user journal information. Do not advise reinstalling or clearing storage to diagnose this incident.

## October 7: signed candidate c1cb68b replaces a0322eec

- Local signed AAB built 08:13 to 08:15 WITA from current origin/main at c1cb68b; signature verified against the owned upload certificate; versionCode 1 / 1.0.0.
- AAB sha256 `1181bb75f9c0795546a8d06ed8e3bae9dfdff3754d8d5a8c42e04972aec34004`. It includes the Timeline/CSV (#21) and nap-minute (#23) fixes and supersedes a0322eec.
- Path: `~/repos/_share/bundles/release-candidates/2026-10-07/wakestate-c1cb68b/` with provenance.json beside it.
- Play Console, 07:45: the com.wakestate.app record exists as Draft under the Purafield Studio LLC org, so it is no longer provisional. No release on any track yet.
- Pixel 4 XL, 08:05: v1.0.0 code 1, installer=null (sideloaded). Next: upload to Play internal testing (owner action pending explicit approval), then Play-installed smoke and native screenshots.

## Future requirement: restore backups when switching devices or platforms

Taylor requested this on October 6, 2026 **for future work, with no testing now**. Keep this improvement outside the current launch-fix batch. Do not treat it as a new release blocker or permission to run a restore, overwrite records, implement the feature or start a build in this turn.

Current source already exposes Reports → Import Data / Import File for WakeState JSON backups (`src/components/ExportScreen.tsx`). `src/lib/storage.ts` validates before an atomic write, replaces included categories and preserves omitted categories; versioned backups include journal records, sleep, medication information and settings. This is source inspection only, not verified web-to-device or device-to-device restoration. CSV exports contain check-ins only and are not full backups.

Future scope and acceptance:

- Make **Restore from backup** easy to find, with clear instructions for exporting on the old device or web app and selecting that file on the new installation.
- Support compatible WakeState JSON backups across web/PWA, Android and iOS, including supported older backup versions. Preserve record IDs, dates/times, recorded scores, notes, sleep, medication records and settings without inventing missing values.
- Before writing, show the backup summary and exactly which existing categories would be replaced; offer a backup of current data and require explicit confirmation. Cancellation or an invalid/unsupported file must leave existing data untouched. Do not silently merge or duplicate records.
- Clearly distinguish **full JSON backup/restore** from **CSV reports**. If partial CSV import is considered later, specify supported columns and missing-data limits separately; never present a report as a complete device backup.
- Keep restore user-controlled and local, with no account requirement, automatic cloud sync or health telemetry. Retain accurate guidance about unencrypted exported files and user-chosen file storage.
- When this future work is scheduled, use a small synthetic cross-platform/version compatibility check plus full-close recovery; record exact source/export version and destination candidate. No new restore test or acceptance pass was performed for this request.

## October 6: nap input minute-precision correction

Native review observed Start10:30 / End10:32 with a displayed duration of one minute. Source reproduction confirmed the initial start retained hidden seconds, while editing the end reset seconds to zero; date-fns truncation made10:30:42.500→10:32:00 one minute. A visible one-minute interval could similarly become zero and fail save validation. Saved events already stored HH:mm only, so existing records are not shortened or migrated by this correction.

The form now initializes both endpoints at the same minute boundary. The actual form rendering regression freezes a clock with nonzero seconds and models an end-only edit; displayed one/two-minute intervals match the visible inputs. Both cases fail with the original initializer and pass with the fix. `npm run validate` passed typecheck,30 tests, lint with8 existing warnings and production build with the existing chunk-size warning. Source validation was followed by the bounded native acceptance below; no paid build or store action was performed.

**Native follow-up, October 6 at 11:03–11:06 WITA:** verified unsigned simulator ZIP SHA-256 `92462b5b86591bc0aceb1c5fb8b88ed7679e39c3d896402b9458e5cf25537551`, source `bd4dab27e5a7213daf1a809affe4e1088c26ce1b`, and installed `com.wakestate.app` 1.0.0(1) on the same iPad Pro 11-inch (M5), iPadOS 26.2, preserving the synthetic journal. End-only edit with untouched Start 11:04 and End 11:05 displayed `0h 1m`; selecting Planned and saving showed “Nap logged” and increased Today events from 1 to 2. A fresh form with untouched Start 11:05 and End 11:07 displayed `0h 2m` and saved, increasing events to 3. Both changed cases **passed**. Original check-in count and logged-sleep status remained visible. Private captures `ipad-one-minute.png`, `ipad-two-minute.png`, and `ipad-three-events.png` are in the existing October 6 `wakestate-nap-minute-precision` candidate packet; mirrored frames are QA evidence, not store assets. No backup/import/restore test, data wipe, medication acceptance, or store submission was performed. Earlier unchanged Timeline/CSV evidence is carried forward, not rerun or relabeled. Android and distribution-device acceptance remain separate.

## October 6: iPad check-in acceptance and Timeline correction

Existing unsigned simulator source `25952558954024f85defd6beef70000332ea3af4`, identity `com.wakestate.app` 1.0.0(1), was installed on iPad Pro 11-inch (M5), iPadOS26.2. Archived ZIP SHA-256 `7999e63e0df36d7703d8578b72f828d7976b3b38b0bcaa5498a8de82dc524847` was verified before installation. No new native build or distribution signing.

At 10:01–10:03 WITA, account-free onboarding visibly explained device storage, backup exports and non-diagnostic scope. The owned crescent launcher icon and journal UI rendered. An all-1 synthetic check-in with exact note “Synthetic QA only” saved with confirmation and appeared in Timeline at10:01AM October6. Device Hub Home double-click → exposed Close WakeState removed its switcher card; relaunch retained Today count1 check-in/0events. Reopening the individual Timeline entry after restart was blocked by `noWindowsAvailable`; exact post-restart values remain unverified. Private evidence is `wakestate-ios-current/ipad-checkin-timeline-20261006.png` in the existing October5 candidate packet, not a store export.

**Defect observed:** Timeline displayed legacy labels and Cataplexy1 despite the current form explaining cataplexy is event-only, and omitted Sleep Inertia. Source confirmed Timeline read compatibility `wakeDomains` instead of recorded `narcolepsyDomains`; its compatibility cataplexy value is hardcoded1. The correction prefers current recorded domains and optional overlapping scores, while keeping true legacy records readable with their original labels/values. Missing fields are not invented scores. No storage migration, record mutation, new telemetry or medical guidance is introduced. Long labels wrap instead of being truncated. CSV export uses the same recorded-schema selection: original18 headers/order remain stable, `sleepInertia` appends as column19; unrecorded current cataplexy/overlap and legacy sleep-inertia cells are blank. Blank means not recorded, not a zero score. Actual legacy cataplexy remains in its original column. JSON backups and stored records are unchanged. Modern, legacy and mixed CSV fixtures verify exact headers/rows and no record mutation.

Validation: `npm run validate` passed typecheck,28 tests (including4 mapping and3 CSV regressions), lint with8 existing warnings and production web build with existing chunk-size warning. Corrected-candidate native evidence follows. Remaining first-release cases include event/sleep/medication journeys, legacy/mixed-record native display, import/deletion/offline/privacy/accessibility, signed physical acceptance and store delivery. iOS submission remains held.

### Corrected iOS candidate acceptance, October 6, 10:22–10:25 WITA

Source `ce8c6e048ef929fe06eca16b8c0c5d692dfa5677` compiled incrementally for the same unsigned simulator target. Archived ZIP SHA-256 `24d27a71df5d13dab5dbb7807794a709f4052a7ab6d17025febcdacabff78ca7` was verified before a preserving install on the same iPad Pro 11-inch / iPadOS 26.2. No paid build, distribution signing or store action.

The existing October 6 10:01AM synthetic record survived the update. Expanded Timeline showed all five recorded scores at 1, including Sleep Inertia / Unrefreshing Naps, and the original note. No unrecorded Cataplexy or overlapping-symptom scores appeared. This closes the specific corrected modern-record display and exact existing-record recovery check; legacy/mixed behavior remains covered by source fixtures, not a native import exercise.

Export Check-Ins (CSV) opened the native share sheet with a 316-byte file. Save to Files → On My iPad completed. The actual saved CSV was read and parsed independently: one row, 19 columns, blank Cataplexy and unrecorded overlapping fields, Sleep Inertia 1, all other recorded scores 1 and the exact synthetic note preserved. File SHA-256 `117000455536bf8bb7757666f4abca6c8640846e64a11b725a95816aa9741f99`. This is actual local native export, not external sharing or backup-import acceptance.

Private evidence remains in the existing October 6 `wakestate-timeline-csv` candidate packet: `ipad-corrected-timeline.png` and `verified-native-export.csv`. No real health data was used. iPhone/physical-device coverage, remaining first-release cases above and App Store delivery remain open; iOS submission is held.

## October 5 candidate and device evidence

Current sanitized snapshot from the private launch PRD. Earlier dated receipts retain their original scope; `NATIVE-TESTING.md` is the reusable plan, this file is the results ledger.

| Layer | Verified evidence | Still open |
| --- | --- | --- |
| Android source/CI | Signed candidate source `fba61e319b49267df45fd80ce0474350ec17a3e1`, tree `687e209af60054798b08c069cd3ab8dcd451426d`, matches [CI37267268663](https://github.com/TaylorONeal/wakestate/actions/runs/37267268663), artifact11326872691. | Later main `cb7d04c` changes iOS artwork only; it is not a newly built Android candidate. |
| Signed artifact | AAB SHA-256 `a0322eecbbb880fdf75c54f3e595432708f0d9c18d307452a3f08fd4b06b1759`; release APK `72074554cc6981609a54b7ed58ada93112c641729d816669afd01d819b66111a`. Existing upload certificate matches prior owned artifact, strict verification and payload comparison pass. | Recovery custody and provider certificate/version acceptance; private artifact custody remains in existing launch PRD. |
| Static privacy | Compiled 1.0.0(1), min24/target36, nondebuggable, no INTERNET/native .so; backup disabled and cloud/device-transfer rules exclude stored data domains. | Runtime journal/network/backup behavior is not established by manifest inspection. |
| Physical installation | Release APK installed on dedicated Pixel 4 XL, Android13, after package absence check; package-manager readback confirmed. | Full journal/restart/export/restore/deletion/accessibility and Play-delivered acceptance not complete. Keyboard input does not establish reliable pointer control. |
| Physical core smoke (new bounded observation) | On the same release APK above, Pixel 4 XL / Android 13 with font scale 1.3 and bold-text adjustment 300: account-free onboarding visibly explained local journaling, export backup and non-diagnostic scope. Today/check-in were readable. One synthetic all-1 check-in with note “Synthetic QA record - not personal health data.” was saved; a focus-confirmed single Return navigated to Patterns showing Total check-ins 1. | This is one saved-entry observation, not restart persistence, export/import/event coverage, complete accessibility, runtime privacy or store acceptance. |
| iOS | Current branded main `2595255` compiled successfully for unsigned iOS Simulator; all 33 embedded web files match the native web build. Exact provenance is in the current branded candidate receipt below. PR17 artwork/resource checks remain carried-forward evidence. | Full new branded candidate cold launch, physical QA, signed archive, TestFlight and App Store acceptance. |
| Provider preparation | No-collection/no-sharing Data safety draft saved with provider confirmation; icon/feature uploaded and applied. | Artwork listing persistence is uncertain until reopen, populated native screenshots and final candidate/privacy reconciliation remain. No review submission inferred. |

Private evidence for the bounded physical check-in stays outside git: `wakestate-synthetic-checkin-saved.png` in the parent-owned October 5 Pixel QA folder. Earlier unchanged Save attempts were focus/input-transport uncertainty, not a confirmed app defect. No real health information was used. Continue with the unrun recovery/export/import/event cases in NATIVE-TESTING.md; do not repeat the unchanged saved-entry case to inflate coverage.

## Reusable native-testing lessons

- Test failures before the storage call and after a successful write, not only rejected writes. Optional feedback cannot determine whether a save completes; keep the submit guard active until confirmation/navigation finishes. An injected failure proves that code path, not the cause of an undiagnosed device report.
- Onboarding-only emulator capture proves only that screen; a populated journal, restart, recovery and privacy require their own observed cases.
- A signed installed APK is not Play delivery or runtime acceptance. Preserve source/tree/hash provenance and distinguish static no-INTERNET/backup flags from observed behavior.
- Worktrees omit ignored signing configuration by design. Check documented primary custody and public certificate against prior owned artifacts; do not put keys or device identifiers in public docs.
- Plain jarsigner can exit successfully on an unsigned AAB; use the pinned verifier. CI synthetic certificates validate the verifier, not release ownership.
- Resource compilers can accept artwork that has not been cold-launched. Branded iOS resource checks do not replace physical launch evidence.
- A saved footer can conflict with unsaved-navigation warnings. Reopen the listing and inspect persistence before calling it complete.
- Keep obsolete feedback-backend and real health data out of the current test scope. Export/share is deliberate user action; canceled share and mail drafts must not be reported as data sent.


## October 5: current branded iOS simulator candidate

Current main `25952558954024f85defd6beef70000332ea3af4` (tree `da281473847793af5b90b04ed9de5e009fb46a85`) successfully compiled after `npm run build:native`, `npx cap sync ios` and generic iOS Simulator Debug `xcodebuild` with `CODE_SIGNING_ALLOWED=NO`. This includes the merged crescent icon/launch artwork; the earlier simulator receipt below predates that artwork. Xcode27/SDK27 compiled both arm64 and x86_64 simulator slices, identity `com.wakestate.app` 1.0.0(1), minimum iOS15.0. All 33 embedded web files byte-match the current native web build. The app-level and Capacitor/Cordova privacy manifests are present; inclusion alone does not establish privacy compliance.

Candidate: `/tmp/wakestate-ios-current-20261005/Build/Products/Debug-iphonesimulator/App.app`; build log: `/tmp/wakestate-ios-current-20261005.log`; provenance: `/tmp/wakestate-ios-current-20261005/candidate-provenance.json`. Bundle content SHA-256 `a82a71dc442ad63c5051df0ac54a0858a0608dcd82afeedd76cc3a73d9fa54ac` covers sorted relative file paths, a NUL separator and each file's bytes. Executable SHA-256: `1f90b80fc33ed3d7f69877bc1c6b40cc874a12c4d55c21da4a686c85eef20750`.

Dependencies were reused from a lock-identical existing installation after `npm ls --depth=0` passed; Capacitor's generated local dependency-path changes were restored after compilation. No runtime, account, data or signing configuration changed. The binary has only the simulator linker's ad-hoc signature, no distribution team/signing or sealed resource signature. Vite retains its existing large-chunk warning.

Next: cold-launch branding and the small new-platform smoke in `NATIVE-TESTING.md`, followed by outstanding journal recovery/export/privacy acceptance. Mac screen lock prevented native UI inspection in this run. This is compile evidence only, not iPhone/iPad behavior, archive, TestFlight, App Store submission or launch. No real health data was used.

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

Consequences for release gates: the privacy page and in-app copy now say WakeState uploads nothing. Once a release build's network traffic is inspected and confirms no requests, the Apple App Privacy and Google Data safety forms can likely be answered as no data collected. Do not declare that until the final build is checked. Set the real publisher support contact in `src/lib/support.ts` and on the privacy page at store setup; the stores require a support contact and public privacy policy URL. Do not publish placeholder names or addresses. The web PWA is hosted on Vercel (see HOSTING.md). No app-builder platform tooling dependency remains.

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
- Complete Google Health apps declaration. Retain the non-diagnostic disclaimer in the app and listing. Verify medication reference links and health-related content with an appropriate reviewer. Re-run the [medication reference refresh](MEDICATION-REFERENCE.md) and log it before building a release candidate.
- Feedback abuse protection, RLS and backend checks no longer apply: the feedback backend was removed on 2026-10-02.
- Inspect the final iOS privacy report. The app manifest includes the Filesystem file-timestamp reason C617.1 and is in the resource build phase; confirm all transitive SDK declarations in the archive.
- Android disables cloud backup and device transfer through manifest and extraction rules. Verify on supported devices. iOS backup/restore behavior needs physical-device verification; the app does not claim to exclude OS backups.
- Donation links: hidden in native builds since 2026-10-04 and shown only on the web PWA. Confirm on device that About and Settings show no "Buy me a coffee" link.
- Run device QA below and submit through TestFlight / Play internal testing before production.

## Device QA (iOS and Android)

Use the consolidated [native/store testing plan](NATIVE-TESTING.md): core smoke for every new binary/platform, remaining first-release baseline, and change-triggered regression. Record case results in this launch ledger; do not mark browser or CI evidence as device acceptance.

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
