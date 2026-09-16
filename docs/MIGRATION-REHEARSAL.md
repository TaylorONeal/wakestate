# Backup and origin-migration rehearsal

## Run locally

```sh
npm ci
npx playwright install chromium
npm run migration:rehearse
```

This starts two temporary Vite servers on random loopback ports and isolated Chromium contexts. It never uses a personal browser profile. Browser requests outside those loopback origins are blocked. Only the clearly synthetic `tests/migration/fixture.json` is used. Servers/contexts close after success or failure. Output is ignored under `artifacts/migration/`: machine-readable `result.json`, downloaded complete backup and two recovery-helper files. These are synthetic, not user records. No publisher, domain, account or backend decision is needed to run it.

The script uses real application save functions to seed records independently of import, then exercises the Reports UI JSON download and file chooser on a clean destination. Every field is compared, not just counts. It checks all seven categories, Unicode/quoted/multiline notes, local-midnight timestamps, reload persistence, repeat-import idempotence, V1 partial restoration, invalid/future/oversized files, mid-transaction quota rollback, export read failure, and unchanged source data. The read-only old-origin helper is tested both with IndexedDB and legacy-only localStorage. The latter does not create a database. Browser runtime errors fail the run.

## Fixed defect and verification — 2026-09-16

Export previously called category display helpers sequentially; those helpers could silently turn failed reads into empty data. Export now reads all categories in a single IndexedDB transaction and propagates failures. It validates restorability and the 10 MB import limit before offering a file; corrupted/null stored categories are not silently replaced with empty arrays. No data is deleted or repaired implicitly. New regressions proved the old behavior failed and the fix passes. Import remains an atomic category replacement.

Current verification: 26 unit tests and the eleven-check browser rehearsal passed. Full build/native results are recorded in the launch update. This is Chromium loopback testing of current code and synthetic legacy storage, not real user migration, live old-host QA, OS-eviction recovery, Safari testing, or physical Android/iOS device QA.

## Before changing a real origin

1. Keep the old site available. Save or deliberately discard any unsaved check-in draft. JSON backups contain saved journal categories/settings; an unsaved draft, onboarding flag, auth session, feedback sent to the server and already-shared files are not transferred.
2. On the OLD origin use **Settings → Export & Reports → Export JSON**. CSV and text reports are not complete migration backups. Save the JSON somewhere private; it is unencrypted.
3. Confirm the file contains checkIns, events, settings, medications, medicationConfig, medicationAdministrations and sleepEntries. An older exporter may omit medication/sleep stores. Do not infer completeness from “export successful” or a filename.
4. If the old UI cannot export all categories, use the reviewed local `scripts/legacy-origin-backup.js` in that OLD origin's developer console. It performs only read transactions and a local download, has no network dependency, and falls back to legacy localStorage for absent keys. It fails on read errors or a file exceeding 10 MB. It does not validate/repair historical records: the destination importer validates before writing. This helper is not shipped in the application and was not run against real user data during development. Keep the source intact if it reports any error; do not repeatedly clear/reset it.
5. On the chosen NEW origin, verify the publisher URL first, open a clean profile/context, and use **Settings → Export & Reports → Import File → Select File**. Import replaces included categories; omitted V1 categories remain as they were. Export destination records before restoring into a nonempty installation. Cancel if you cannot confirm which origin/profile holds the intended data.
6. Reload/reopen the new origin, inspect each category and date boundaries, then export JSON again. Compare all saved fields (ignore only exportedAt). The rehearsal demonstrates the comparison against synthetic fixtures; do not upload real exports to an online diff service or support chat.
7. Retain the old origin and private backup until the comparison succeeds. A failed read, corrupt file or quota error is a stop condition, not permission to delete old data. A file over 10 MB needs a separately verified recovery plan; do not hand-split it and assume safety.
8. Only after successful recovery update bookmarks/PWA installation and retire the old hosting through separately authorized deployment work. Preserve native app ID/origin; native transfer additionally requires real device export/share/import QA.

The hosting/domain migration remains an external action. This preparation does not close publisher/signing/privacy/backend gates elsewhere in LAUNCH.md. No auth configuration, deployment, integration disconnection, merge or push was performed.
