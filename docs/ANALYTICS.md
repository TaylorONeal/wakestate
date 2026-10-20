# Analytics

**What this is:** WakeState's analytics posture, stated plainly. It is short on purpose: there is nothing to document except the deliberate absence.

**Last verified: 2026-10-20** (repo HEAD `4fc7504`).

## No Analytics by Design

WakeState collects **no analytics**. This is a design decision for a health app, not a gap in the implementation. The journal data is sensitive by nature; adding telemetry would require a re-review of the entire privacy story (`docs/SECURITY.md`, `docs/HEALTH-APP-READINESS.md`), and the native testing plan explicitly forbids it ("do not add ... health telemetry merely to complete a generic checklist", `docs/NATIVE-TESTING.md`).

The absence is stated in four independent places:

| Source | Wording |
| --- | --- |
| In-app Settings copy | "No advertising or analytics SDK is included." |
| `docs/HEALTH-APP-READINESS.md` | "Current source uses local journal storage, contains no advertising or analytics SDK ..." |
| `docs/NATIVE-TESTING.md` (privacy acceptance row) | "No health-event telemetry, analytics SDK, backend or automatic export." |
| `docs/SECURITY.md` | The app has "no network requests of its own" (the Android manifest has no INTERNET permission, removed in PR #10) |

`package.json` corroborates it: there are no analytics, telemetry, crash-reporting, attribution, or push SDKs in dependencies or devDependencies (the dependency list is the React/Capacitor/storage stack only).

## What this means in practice

- **No event funnels, no session tracking, no crash reporting.** If the app fails in the field, diagnosis comes from user reports and reproduction, not telemetry.
- **User-initiated sharing is not telemetry.** Exporting a JSON backup to a chosen destination, or opening a feedback email draft, is the user's action, not app instrumentation (`docs/NATIVE-TESTING.md`: "User-selected recipient sharing is distinct from app telemetry").
- **Changing this is a product decision, not a bug fix.** Any analytics proposal must be documented, justified against the privacy story, and survive review of `docs/SECURITY.md` before implementation.
