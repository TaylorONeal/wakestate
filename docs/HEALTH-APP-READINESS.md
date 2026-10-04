# WakeState health and privacy launch review

WakeState is a free personal sleep-wake journal. Its sleep, symptom and medication tracking are health features even though the app is offline and does not give medical advice. A disclaimer does not remove the health-declaration requirement or guarantee approval.

## Declaration mapping for owner review

| Google feature category | WakeState evidence |
| --- | --- |
| Sleep Management | User-entered sleep records and naps |
| Diseases and Conditions Management | Narcolepsy-focused symptom and cataplexy journaling |
| Medication and Treatment Management | User-entered medication configuration and doses taken |

These are the draft categories to check against the final release and current console wording. Do not select no health features. No Health Connect integration, diagnosis, dose calculation, emergency monitoring, treatment recommendation or medical-device hardware integration is present in the reviewed app. This is a product-scope assessment, not a regulatory certification. Review medication reference material separately from the journal functions.

## Copy and privacy

The full non-medical-device limitation is visible in About, the privacy notice and the store description draft. The description should also advise consulting a qualified healthcare professional. Avoid promises of improved medical outcomes, clinical accuracy, HIPAA compliance, complete anonymity or encrypted records.

Current source uses local journal storage, contains no advertising or analytics SDK, disables Android backup and device transfer, and has no INTERNET permission in its source manifest. The feedback button opens the user's email app. Exports use a user-selected destination and contain unencrypted health information; a temporary export copy remains in app cache until cleanup. The app has no own encryption or PIN lock. Keep these limitations visible and distinguish the native app from web hosting and external recipients.

Before attesting Data safety, inspect the final merged manifest, bundled SDKs, device network behavior and user-initiated export/email flows. Lack of INTERNET permission alone does not settle every sharing or collection question. Do not claim final-artifact verification from source inspection.

## Remaining release checks

- Verify the signed build opens offline and saves, restores, exports and deletes synthetic records correctly.
- Verify no native donation links, analytics requests, Health Connect permissions or unannounced remote content.
- Keep public privacy/support links accessible and publisher/contact consistent.
- Match store screenshots and text to the release; use synthetic health records only.
- Review the declaration categories and final Data safety answers before submission.

## Official references checked October 4, 2026

- [Google Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en)
- [Google Health Content and Services policy](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en)
- [Google Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469)

This review improves launch preparation; no Play attestation, regulatory status or store approval is asserted.

## Local evidence from this pass

At source commit 220b41d: all 19 tests, TypeScript and web/native builds passed; lint had zero errors and eight existing warnings. `:app:processReleaseMainManifest` passed. Its task-specific merged manifest shows package com.wakestate.app, version 1.0.0/code 1, minSdk 24, targetSdk 36, allowBackup=false, no INTERNET or Health Connect permissions, and only the app-scoped signature receiver permission. This is local manifest evidence, not a signed AAB, device network test or store approval.
