import 'fake-indexeddb/auto';
import { expect, it } from 'vitest';
import { createMedicationRegimen } from './medicationRegimen';
import { getMedicationConfig, saveMedicationConfig } from './storage';

const medication = { id: 'synthetic', brandName: 'Example', genericName: 'Example' };

it('requires an explicit dose and never invents a morning or daily schedule', async () => {
  expect(() => createMedicationRegimen(medication, ' ')).toThrow(/prescribed dose/);
  const regimen = createMedicationRegimen(medication, 'test dose');
  await saveMedicationConfig({ isConfigured: true, regimen: [regimen], lastUpdated: '2026-10-04' });
  expect((await getMedicationConfig())?.regimen[0]).toMatchObject({
    defaultDose: 'test dose', defaultFrequency: 'other', defaultTimings: [], frequencyCount: 0,
  });
});

it('preserves an existing timing and uses the user-selected frequency and dose', () => {
  const existing = { ...createMedicationRegimen(medication, 'old dose', '2x/day'), defaultTimings: ['evening' as const] };
  expect(createMedicationRegimen(medication, 'new dose', '3x/day', existing)).toMatchObject({
    defaultDose: 'new dose', defaultFrequency: '3x/day', defaultTimings: ['evening'], frequencyCount: 3,
  });
});
