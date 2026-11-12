# WakeState agent workflow

Read in order: this file, SOUL.md and USER.md if present, docs/INDEX.md, then docs/NATIVE-TESTING.md and the newest evidence/reusable lessons in docs/LAUNCH.md for native/store tasks. Read the relevant implementation before changing behavior.

For device acceptance or delivery work, use your tool's native app testing or store readiness skill if it has one. If none is available, follow `docs/NATIVE-TESTING.md` and say so.

| Trigger | Read and do |
| --- | --- |
| Android or launch-readiness work | Read `docs/LAUNCH.md` and the latest `docs/release/` packet. Check current source, CI and artifacts before repeating historical status. Keep compilation, signing, device QA and store approval separate. |
| Code/dependency/native change | Run `npm run validate`; use unsigned Android CI for relevant changes. Inspect failures before merge. Preserve local journal storage and the free model. |
| Screenshot, icon or store artwork work | Read `docs/store/ANDROID-SCREENSHOTS.md`. Use synthetic data on a disposable installation; inspect real captures and record platform/commit. Never label browser renders as Android screenshots. |
| Medication list, drug names or approval status | Follow `docs/MEDICATION-REFERENCE.md` (rules plus the refresh prompt). Never change medication ids. Run it before every store release. |
| Health data, import/export, privacy or any new network feature | Read `docs/SECURITY.md` and relevant storage tests. Preserve local records; test real import/export paths. Any new backend must be separately reviewable and never claimed as verified from source edits alone. The app currently has no backend. |
| Store submission | Recheck signed bundle, declarations, public support/privacy, real device QA and listing assets. Obtain applicable release authorization; do not equate business verification with app approval. |

## Release rules

- **A browser build is not native acceptance.** Web builds, CI compiles, simulator runs and browser screenshots are not device, signing, privacy or store acceptance. Keep Android, iOS and web evidence separate. Compiled, signed, uploaded, installed from the store, device-observed, submitted, in review and live are separate states; don't collapse them into "done".
- **No secrets or private documents in the repo.** No signing keys, credentials, API tokens, account or business-verification identifiers, identity documents or real health records.
- **Evidence is a row.** Date, commit or artifact hash, device and OS, case, status, evidence reference, next action. Keep mutable results in `docs/LAUNCH.md`, never in this file. Run a smoke test per new binary or platform and expand by what changed; a docs-only change needs docs validation only. Record a blocker once, with what would unblock it.
- **Irreversible store actions need the maintainer's explicit approval for that action.** Submission, signing-key creation, agreements and Create/Save/Publish/Submit in a store console. A passing checklist or green CI is not approval.

WakeState-specific: it's free, private and non-diagnostic. No generic billing suite, no health telemetry or real health records in QA, and no backend at all currently. iOS preparation does not imply submission.

## Platform independence

No hosted app-builder tooling, hosting, icons, env vars or assets (no builder plugins in `package.json` or lockfiles, no builder config files or asset dumps, no template favicon or placeholder images). CI enforces this with `scripts/check-platform-independence.sh`; run it before pushing.

## Android dev app ID (sideloaded builds)

Never sideload a build that uses the Play app ID `com.wakestate.app`. Google Play re-signs every release with its own key, so a copy installed over USB, adb or from a CI/Codemagic APK under the Play ID has a different signature, and Play can't update it until it is uninstalled.

- Debug builds always install as `com.wakestate.app.dev`, named "WakeState Dev", beside the Play copy. Set in `android/app/build.gradle` (`buildTypes.debug.applicationIdSuffix`); the launcher label comes from the `appLabel` manifest placeholder.
- A release-variant QA APK that will be sideloaded must be built with `ANDROID_DEV_ID=1` (or `-PandroidDevId=1`), which gives it the same `.dev` ID.
- Play AABs are built without `ANDROID_DEV_ID` and keep `com.wakestate.app`. Test Play behaviour (updates, billing, install referrer) only from a Play install (internal testing track), never from a sideload.
- The activity class keeps the real namespace: launch with `adb shell am start -n com.wakestate.app.dev/com.wakestate.app.MainActivity`. Check what is on a device with `adb shell pm list packages -i | grep com.wakestate.app` (`installer=com.android.vending` is Play, `null` is a sideload).
- If an old sideload under `com.wakestate.app` is on a device, uninstall it once and reinstall from Play.

