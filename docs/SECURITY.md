# Security and privacy review

> **Update 2026-10-02:** the feedback feature, Supabase client and edge functions were removed, so SEC-01 and the feedback-related findings below no longer apply (closed by removal). The app has no backend. Findings about local storage, exports and deployment headers still apply; `vercel.json` now sets baseline headers for the web host. A tested CSP is still not configured.

## Summary

This is a source and dependency review, not a penetration test, regulatory certification, or verification of deployed services. Health records use IndexedDB plus a localStorage check-in draft. Feedback now opens a draft in the user's email app through `src/lib/support.ts`; the app has no feedback backend. There is no app-level encryption or login gate. The UI now communicates those limits. Do not advertise HIPAA compliance, end-to-end encryption, complete anonymity, or guaranteed privacy.

## Historical findings and fixes (superseded where noted above)

1. **Medium — inaccurate privacy claims / unsolicited font request.** `src/components/SettingsScreen.tsx:180`, `src/components/FeedbackScreen.tsx`, and `public/privacy.html` distinguish local journal data from feedback/network metadata. `src/main.tsx` bundles Outfit; CSS and PWA no longer contact Google Fonts. Explicit IP console logging was removed from `supabase/functions/submit-feedback/index.ts`. Provider infrastructure logs remain outside this code review.
2. **Medium — incomplete deletion.** `src/lib/storage.ts:30` previously deleted IndexedDB records but left legacy localStorage copies, allowing fallback reads to resurrect them. Deletion now removes both, the check-in draft, and native export cache; settings remain. Actual deletion is user-confirmed; no user data was deleted during implementation.
3. **Medium — incomplete backups and misleading import copy.** `src/lib/storage.ts:213` now exports sleep, medication configuration, medication administrations and legacy medication entries. V2 imports validate every category before an atomic IndexedDB write. V1 remains supported, omitted categories remain untouched, unsupported versions and empty/oversized backups are rejected. Import explicitly says replacement, not merge.
4. **Medium — spreadsheet formula injection and malformed CSV.** `src/lib/storage.ts:299` escapes embedded quotes and neutralizes formula prefixes. A note containing `=...` cannot become an active spreadsheet formula in the exported cell.
5. **Low — feedback type validation / broken challenge request.** The handler checks field types and payload length. `HumanChallenge` requests GET to match the endpoint. A stable reset callback avoids refetching the challenge on every parent form edit. Server changes require a separate deployment; no deployment or auth/RLS changes were made.
6. **Dependency hygiene.** Updated affected packages and added a reproducible npm lockfile. Audit reported zero known vulnerabilities after the updates; this is a point-in-time registry result, not proof of security.

## Remaining findings / release gates

### SEC-01 (closed by removal, 2026-10-02; formerly Medium): feedback challenge could be decoded and replayed

Status: closed by removal. This finding applied to the removed Supabase feedback backend
(`supabase/functions/get-challenge`, `supabase/functions/submit-feedback`), which was deleted on
2026-10-02 along with the Supabase client. With no backend, there is no challenge endpoint and no
submission endpoint, so the replay risk described below no longer exists in the app. Feedback now
opens a draft in the user's email app through `src/lib/support.ts`; nothing is sent automatically.

Historical evidence (pre-removal, retained for the record): `get-challenge/index.ts:71`
base64-encoded `answer:timestamp:signature`; `submit-feedback/index.ts:48` decoded it. HMAC provided
integrity, not secrecy; bots could read the answer and replay a valid token. The rate-limit map was
process-local and reset on cold start. Consequence was spam, database growth, and service cost; it did
not expose health journals.

No action remains unless a backend feedback path is reintroduced, in which case abuse prevention
(managed challenge, server-stored one-use tokens, durable rate limits) must be designed in from the
start, not retrofitted.

### SEC-02 — Medium: local journal is accessible to same-origin scripts/unlocked device

Evidence: `src/lib/storage.ts` uses IndexedDB; `CheckInScreen.tsx:74` stores a local draft. No encryption or app lock exists. XSS or access to the unlocked profile could expose records. No exploitable untrusted HTML sink was found in the reviewed app; chart CSS injection uses developer-defined config. Keep the app on a dedicated origin, minimize scripts, protect the device, and verify CSP/response headers. Adding encryption/key management is a separate design decision; the UI does not claim it exists.

### SEC-03 — Medium: production hosting protections unverified

No deployment headers were present in this repository. Verify HTTPS, `X-Content-Type-Options: nosniff`, Referrer-Policy, frame protection and a tested CSP at the actual host. Use self-only scripts, restrictive connect sources for the configured Supabase endpoint, and account for existing React inline styles. Do not infer deployed headers from source. No deployment was performed.

### SEC-04 — Medium: privacy operations and native device validation incomplete

A complete store policy needs publisher contact, feedback retention/deletion process, and accurate provider disclosures. The feedback backend was removed 2026-10-02, so there is no live feedback RLS to verify. Still open: publisher contact, feedback retention/deletion process, accurate provider disclosures, infrastructure logs, iOS device backup behavior, and native export/delete behavior on devices. Android backup exclusions and an iOS required-reason manifest are included but do not constitute certification. Exported copies and submitted feedback cannot be removed by local Clear Data.

### SEC-05 — Fixed locally: request-size enforcement during streaming

`supabase/functions/_shared/request-body.ts` counts actual bytes while reading and cancels oversized streams at 8 KiB. Invalid UTF-8, malformed JSON, null and array payloads return 400; oversized requests return 413. Tests cover multibyte text and chunked streams without Content-Length. This was fixed for the removed Supabase feedback function; with the backend removed on 2026-10-02, there is nothing to deploy, and SEC-01 is closed by removal.

## Scope limitations

No production Supabase data, credentials, auth settings, or policies were modified. Existing publishable client keys are public identifiers; service-role usage remains server-side. Browser storage resilience under OS eviction, device compromise, signed native releases, store policy review, and clinical accuracy need release QA. The app should be marketed as a personal journal, not a medical decision tool.

## Follow-up reliability improvements

Concurrent check-in, event and medication inserts now use single IndexedDB read/write transactions. A ten-way concurrent check-in test verifies records are retained. Corrupt check-in drafts are validated before restoration; unavailable draft storage warns without crashing the form. Check-in, sleep and medication save failures preserve form contents and offer a retry; no successful save is claimed before the write completes. These changes do not encrypt records or establish regulatory compliance.

The integration pass also makes edits/deletes and sleep upserts atomic, so an undo or deletion cannot overwrite a concurrently inserted journal record. Event-form save errors preserve entered values and permit retry. No server deployment, authentication-policy change, or store submission is included.

Feedback response validation and challenge expiry/retry handling are now covered locally. The interface no longer implies a selected answer has been verified; SEC-01 is closed by removal (2026-10-02): the challenge mechanism no longer exists in the app.

Android execution September 15: actual debug APK and unsigned AAB compile; manifest/package inspection confirms target 36 and no health sensor permissions. Production RLS/header/abuse protection remain unverified; exact read-only inspection and rollout acceptance checks are staged in `docs/release/ANDROID-2026-09-15.md`. No auth configuration or licenses changed.
