import { describe, expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { createDemoBackup } from '../../scripts/store/demo-backup.mjs';
import { ImportDataSchema } from './validation';
vi.mock('./download', () => ({ clearExportCache: vi.fn() }));
import { importData, exportAllData } from './storage';

describe('synthetic store demonstration backup', () => {
  it('survives the real import/export path with all seven daily records', async () => {
    const fixture = createDemoBackup('2026-09-23');
    expect(ImportDataSchema.parse(fixture).checkIns).toHaveLength(7);
    await importData(JSON.stringify(fixture));
    const roundTrip = JSON.parse(await exportAllData());
    expect(roundTrip.checkIns).toEqual(fixture.checkIns);
    expect(roundTrip.sleepEntries).toEqual(fixture.sleepEntries);
    expect(roundTrip.medicationAdministrations).toEqual([]);
  });
  it('rejects impossible dates instead of silently shifting sample records', () => {
    expect(() => createDemoBackup('2026-02-30')).toThrow('Invalid date');
  });
});
