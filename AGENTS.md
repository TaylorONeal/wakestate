# WakeState agent workflow

Read in order: this file, SOUL.md and USER.md if present, docs/INDEX.md, then docs/NATIVE-TESTING.md and the newest evidence/reusable lessons in docs/LAUNCH.md for native/store tasks. Read the relevant implementation before changing behavior. Use the shared `native-app-testing` skill before device acceptance, reviewer instructions or recovery from a control failure.

When available, use the shared `app-delivery-process` skill for app delivery work. Discover it by name rather than assuming a machine-specific path. If unavailable, follow the repository documents below and report the fallback. User authorization controls scope; a checklist is not submission approval.

| Trigger | Read and do |
| --- | --- |
| Android or launch-readiness work | Read `docs/LAUNCH.md` and the latest `docs/release/` packet. Check current source, CI and artifacts before repeating historical status. Keep compilation, signing, device QA and store approval separate. |
| Code/dependency/native change | Run `npm run validate`; use unsigned Android CI for relevant changes. Inspect failures before merge. Preserve local journal storage and the free model. |
| Screenshot, icon or store artwork work | Read `docs/store/ANDROID-SCREENSHOTS.md`. Use synthetic data on a disposable installation; inspect real captures and record platform/commit. Never label browser renders as Android screenshots. |
| Health data, import/export, privacy or any new network feature | Read `docs/SECURITY.md` and relevant storage tests. Preserve local records; test real import/export paths. Any new backend must be separately reviewable and never claimed as verified from source edits alone. The app currently has no backend. |
| Store submission | Recheck signed bundle, declarations, public support/privacy, real device QA and listing assets. Obtain applicable release authorization; do not equate business verification with app approval. |

Keep account identifiers, business-verification documents, secrets, private audits and real health records out of this public repository. Record private coordination in the private GTM tracker. Report actual tests, artifacts and remaining gates without marking unrun checks complete.

Use a short core smoke for each new binary/platform and the changed-layer/recovery checks in NATIVE-TESTING.md. Documentation-only work needs documentation validation, not another build. Keep mutable results in LAUNCH.md, never here. WakeState is free, private and non-diagnostic: no generic billing suite, health telemetry or real health records in QA. Current authorization controls external actions; iOS preparation does not imply submission.
