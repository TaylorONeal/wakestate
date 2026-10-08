import { describe, expect, it } from 'vitest';
import { MEDICATION_SECTIONS } from './MedicationsScreen';

const ids = MEDICATION_SECTIONS.flatMap(section => section.medications.map(med => med.id));

describe('medication catalog', () => {
  it('keeps ids that existing journals may already reference', () => {
    for (const id of ['adderall', 'ritalin', 'dexedrine', 'vyvanse', 'sunosi', 'provigil', 'nuvigil', 'wakix', 'xyrem', 'xywav', 'lumryz', 'tak-861', 'danavorexton', 'alks-2680']) {
      expect(ids).toContain(id);
    }
  });

  it('has no duplicate ids', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('offers the trial switch for every orexin agonist', () => {
    const orexin = MEDICATION_SECTIONS.filter(section => section.title.startsWith('Orexin')).flatMap(section => section.medications);
    expect(orexin.length).toBeGreaterThan(0);
    for (const med of orexin) expect(med.trialTracking).toBe(true);
  });
});
