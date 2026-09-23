# WakeState agent workflow

When available, use the shared `app-delivery-process` skill for app delivery work. Discover it by name rather than assuming a machine-specific path. If unavailable, follow the repository documents below and report the fallback. User authorization controls scope; a checklist is not submission approval.

| Trigger | Read and do |
| --- | --- |
| Android or launch-readiness work | Read `docs/LAUNCH.md` and the latest `docs/release/` packet. Check current source, CI and artifacts before repeating historical status. Keep compilation, signing, device QA and store approval separate. |
| Code/dependency/native change | Run `npm run validate`; use unsigned Android CI for relevant changes. Inspect failures before merge. Preserve local journal storage and the free model. |
| Screenshot, icon or store artwork work | Read `docs/store/ANDROID-SCREENSHOTS.md`. Use synthetic data on a disposable installation; inspect real captures and record platform/commit. Never label browser renders as Android screenshots. |
| Feedback, health data, import/export or privacy change | Read `docs/SECURITY.md` and relevant storage tests. Preserve local records; test real import/export paths. Keep deployment/schema changes separately reviewable and never claim source edits prove deployed behavior. |
| Store submission | Recheck signed bundle, declarations, public support/privacy, real device QA and listing assets. Obtain applicable release authorization; do not equate business verification with app approval. |

Keep account identifiers, business-verification documents, secrets, private audits and real health records out of this public repository. Record private coordination in the private GTM tracker. Report actual tests, artifacts and remaining gates without marking unrun checks complete.
