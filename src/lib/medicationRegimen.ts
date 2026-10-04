import type { MedicationFrequency, MedicationRegimen } from '@/types';

export function createMedicationRegimen(
  medication: { id: string; brandName: string; genericName: string },
  dose: string,
  frequency: MedicationFrequency = 'other',
  previous?: MedicationRegimen,
): MedicationRegimen {
  if (!dose.trim()) throw new Error(`Enter the prescribed dose for ${medication.brandName}.`);
  const counts: Partial<Record<MedicationFrequency, number>> = { '1x/day': 1, '2x/day': 2, '3x/day': 3, '4x/day': 4 };
  return {
    medicationId: medication.id, brandName: medication.brandName, genericName: medication.genericName,
    defaultDose: dose.trim(), defaultFrequency: frequency,
    defaultTimings: previous?.defaultTimings ?? [],
    frequencyCount: counts[frequency] ?? 0,
  };
}
