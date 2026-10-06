import { describe, expect, it } from 'vitest';
import { getCheckInDisplayDomains } from './checkInDisplay';
import type { CheckIn } from '@/types';

const legacy: CheckIn = {
  id: 'synthetic', createdAt: '2026-10-06T02:00:00Z', localDate: '2026-10-06', localTime: '10:00', tags: [],
  wakeDomains: { sleepPressure: 1, microsleeps: 2, cognitive: 3, effort: 4, cataplexy: 5, motor: 1, sensory: 2, thermo: 3, emotional: 4 },
};
const modern: CheckIn = {
  ...legacy,
  narcolepsyDomains: { sleepPressure: 2, microsleeps: 3, sleepInertia: 5, cognitive: 4, effort: 1 },
};

describe('recorded check-in display', () => {
  it('shows modern sleep inertia and recorded values instead of compatibility defaults', () => {
    const fields = getCheckInDisplayDomains(modern);
    expect(fields.map(({ key, value }) => [key, value])).toEqual([
      ['sleepPressure', 2], ['microsleeps', 3], ['sleepInertia', 5], ['cognitive', 4], ['effort', 1],
    ]);
    expect(fields.find(({ key }) => key === 'sleepInertia')?.label).toBe('Sleep Inertia / Unrefreshing Naps');
    expect(fields.find(({ key }) => key === 'cognitive')?.label).toBe('Cognitive Fog');
    expect(fields.some(({ key }) => key === 'cataplexy' || key === 'motor')).toBe(false);
  });
  it('includes optional overlapping scores only when actually recorded', () => {
    const fields = getCheckInDisplayDomains({ ...modern,
      overlappingDomains: { anxiety: 5, mood: 4, digestive: 3, thermo: 2, motor: 1, emotional: 4, sensory: 2 },
    });
    expect(fields).toHaveLength(12);
    expect(fields.find(({ key }) => key === 'anxiety')?.value).toBe(5);
    expect(fields.find(({ key }) => key === 'sensory')?.value).toBe(2);
    expect(fields.some(({ key }) => key === 'cataplexy')).toBe(false);
  });
  it('preserves actual legacy cataplexy and context without inventing sleep inertia', () => {
    const before = JSON.stringify(legacy);
    const fields = getCheckInDisplayDomains({ ...legacy, contextDomains: { anxiety: 4, mood: 3, digestive: 2 } });
    expect(fields.find(({ key }) => key === 'cataplexy')).toMatchObject({ label: 'Cataplexy — Subtle', value: 5 });
    expect(fields.find(({ key }) => key === 'anxiety')?.value).toBe(4);
    expect(fields.some(({ key }) => key === 'sleepInertia')).toBe(false);
    expect(JSON.stringify(legacy)).toBe(before);
  });
  it('does not turn missing or invalid recorded fields into default observations', () => {
    const partial = { ...modern, narcolepsyDomains: { sleepPressure: 3, cognitive: NaN } } as CheckIn;
    expect(getCheckInDisplayDomains(partial).map(({ key, value }) => [key, value])).toEqual([['sleepPressure', 3]]);
  });
});

// The export's original 18 columns keep their positions; new fields append.
import { exportToCSV } from './storage';
const csvHeader = 'id,createdAt,localDate,localTime,cataplexy,microsleeps,cognitive,effort,sleepPressure,motor,sensory,thermo,emotional,anxiety,mood,digestive,tags,note,sleepInertia';
const csvRow = (values: Array<string | number>) => values.map(value => `"${value}"`).join(',');
const identity = ['synthetic', '2026-10-06T02:00:00Z', '2026-10-06', '10:00'];

describe('check-in CSV recorded schema', () => {
  it('exports modern values, leaves compatibility defaults blank and appends sleep inertia', () => {
    expect(exportToCSV([modern])).toBe([
      csvHeader, csvRow([...identity, '', 3, 4, 1, 2, '', '', '', '', '', '', '', '', '', 5]),
    ].join('\n'));
  });
  it('keeps legacy columns and actual legacy values, with blank unrecorded sleep inertia', () => {
    expect(exportToCSV([legacy])).toBe([
      csvHeader, csvRow([...identity, 5, 2, 3, 4, 1, 1, 2, 3, 4, '', '', '', '', '', '']),
    ].join('\n'));
  });
  it('exports mixed schemas consistently without rewriting source records', () => {
    const current = { ...modern, overlappingDomains: { anxiety: 5, mood: 4, digestive: 3, thermo: 2, motor: 1, emotional: 4, sensory: 2 } };
    const records = [legacy, current];
    const before = JSON.stringify(records);
    expect(exportToCSV(records)).toBe([
      csvHeader,
      csvRow([...identity, 5, 2, 3, 4, 1, 1, 2, 3, 4, '', '', '', '', '', '']),
      csvRow([...identity, '', 3, 4, 1, 2, 1, 2, 2, 4, 5, 4, 3, '', '', 5]),
    ].join('\n'));
    expect(JSON.stringify(records)).toBe(before);
  });
});
