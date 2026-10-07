# WakeState agent workflow

Read in order: this file, SOUL.md and USER.md if present, docs/INDEX.md, then docs/NATIVE-TESTING.md and the newest evidence/reusable lessons in docs/LAUNCH.md for native/store tasks. Read the relevant implementation before changing behavior.

Which shared skill to use for device acceptance or delivery work, and the authorization rule for submission, are in `NATIVE-RELEASE-POLICY.md` (linked below) — not restated here.

| Trigger | Read and do |
| --- | --- |
| Android or launch-readiness work | Read `docs/LAUNCH.md` and the latest `docs/release/` packet. Check current source, CI and artifacts before repeating historical status. Keep compilation, signing, device QA and store approval separate. |
| Code/dependency/native change | Run `npm run validate`; use unsigned Android CI for relevant changes. Inspect failures before merge. Preserve local journal storage and the free model. |
| Screenshot, icon or store artwork work | Read `docs/store/ANDROID-SCREENSHOTS.md`. Use synthetic data on a disposable installation; inspect real captures and record platform/commit. Never label browser renders as Android screenshots. |
| Health data, import/export, privacy or any new network feature | Read `docs/SECURITY.md` and relevant storage tests. Preserve local records; test real import/export paths. Any new backend must be separately reviewable and never claimed as verified from source edits alone. The app currently has no backend. |
| Store submission | Recheck signed bundle, declarations, public support/privacy, real device QA and listing assets. Obtain applicable release authorization; do not equate business verification with app approval. |

**Release acceptance, secrets, evidence discipline, and authorization boundaries follow the shared [`NATIVE-RELEASE-POLICY.md`](https://github.com/TaylorONeal/app-launch-playbook/blob/main/NATIVE-RELEASE-POLICY.md)** in `app-launch-playbook` — don't restate it here. WakeState-specific: it's free, private and non-diagnostic — no generic billing suite, health telemetry or real health records in QA, and no backend at all currently. Keep mutable results in LAUNCH.md, never here. iOS preparation does not imply submission.
