# Medication reference refresh

The Medications screen (`src/components/MedicationsScreen.tsx`, `MEDICATION_SECTIONS`) is reference text in a health app. Narcolepsy treatment changes quickly, so re-verify it before every store release and whenever a narcolepsy drug is approved, renamed or discontinued.

## Rules

- Never change or delete an existing medication `id`. Saved regimens and administrations reference it. `src/components/MedicationCatalog.test.ts` locks the legacy ids. When a trial code becomes a generic or brand name, keep the old id and change `brandName`/`genericName` (for example `tak-861` is now Orzeyful).
- Approved drugs go in an "Approved" section. Investigational drugs go in a "Clinical Trials" section. Set `trialTracking: true` on any drug where people may be in a trial or open-label extension.
- Mark discontinued programs in the description instead of deleting them, so past trial participants keep their records.
- No dosing advice. Dose pickers list every labeled strength; descriptions never present one regimen as the label when it allows several. No efficacy comparisons. Keep the non-diagnostic framing.
- Use primary sources only: FDA, the manufacturer, ClinicalTrials.gov, company investor releases or SEC filings. Treat aggregator sites as leads, not evidence. When status cannot be confirmed, use vaguer wording ("in clinical trials") instead of guessing.
- Put the review month in section descriptions ("Reference as of October 2026").

## Refresh prompt

Paste this into an agent session with this repository attached:

```
In TaylorONeal/wakestate, re-verify the medication reference in src/components/MedicationsScreen.tsx against primary sources (FDA, manufacturer, ClinicalTrials.gov, company IR) as of today. For each drug: approval status, approved population, labeled dose, controlled-substance and availability status, current name (trial codes become generic and brand names). Rules: never change or delete an existing medication id (saved regimens depend on them; MedicationCatalog.test.ts enforces this); approved drugs go in "Approved" sections, investigational ones in "Clinical Trials" with trialTracking: true; mark discontinued programs instead of deleting them; no dosing advice beyond the label; date-stamp section descriptions. Run npm run validate, then open a draft PR with a before/after table that links every source.
```

## Review log

| Date | PR | Summary |
| --- | --- | --- |
| 2026-10-08 | #28 | TAK-861 became Orzeyful (oveporexton), approved Aug 5, 2026 for adults with NT1 (0.5, 1 and 2 mg tablets, twice daily), availability pending DEA scheduling. ALKS-2680 became alixorexton (Phase 3). Added cleminorexton (ORX750). Danavorexton marked as discontinued for narcolepsy. Wakix pediatric cataplexy (Feb 2026). Vyvanse flagged as off-label. |

Next check: confirm Orzeyful DEA scheduling and US availability (expected October to November 2026) and update its description.
