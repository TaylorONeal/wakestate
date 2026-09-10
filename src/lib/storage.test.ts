import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import { clear, get, set } from 'idb-keyval';
import { clearAllData, escapeCSVCell, exportAllData, importData, getTodayAdministrations } from './storage';

const legacy = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => legacy.get(key) ?? null,
  removeItem: (key: string) => legacy.delete(key),
});
beforeEach(async () => { await clear(); legacy.clear(); });

it('round trips sleep and both medication stores without losing fields', async () => {
  const backup = {
    version: 2,
    checkIns: [], events: [],
    medications: { med: { id: 'med', dose: '10 mg', lastUpdated: '2026-09-10' } },
    medicationConfig: { isConfigured: true, lastUpdated: '2026-09-10', regimen: [{ medicationId: 'med', brandName: 'Example', genericName: 'Example', defaultDose: '10 mg', defaultFrequency: '1x/day', defaultTimings: ['morning'], frequencyCount: 1 }] },
    medicationAdministrations: [{ id: 'dose', medicationId: 'med', brandName: 'Example', timestamp: '2026-09-10T01:00:00Z', localDate: '2026-09-10', localTime: '09:00', doseSelected: '10 mg' }],
    sleepEntries: [{ id: 'sleep', date: '2026-09-09', createdAt: '2026-09-10', updatedAt: '2026-09-10', totalSleepMinutes: 420, hallucinations: false }],
  };
  await importData(JSON.stringify(backup));
  expect(JSON.parse(await exportAllData())).toMatchObject(backup);
});
it('rejects a corrupt backup before replacing any stored data', async () => {
  await set('wakestate_events', [{ id: 'keep' }]);
  await expect(importData(JSON.stringify({ events: [], sleepEntries: [{ totalSleepMinutes: -1 }] }))).rejects.toThrow();
  expect(await get('wakestate_events')).toEqual([{ id: 'keep' }]);
});
it('keeps omitted categories when restoring a v1 backup', async () => {
  await set('wakestate_sleep_entries', [{ id: 'keep' }]);
  await importData(JSON.stringify({ version: 1, checkIns: [], events: [] }));
  expect(await get('wakestate_sleep_entries')).toEqual([{ id: 'keep' }]);
});
it('clears tracking in both stores and keeps settings', async () => {
  const keys = ['checkins', 'events', 'medications', 'med_config', 'med_administrations', 'sleep_entries'];
  for (const name of keys) { await set(`wakestate_${name}`, ['sensitive']); legacy.set(`wakestate_${name}`, 'sensitive'); }
  legacy.set('wakestate_checkin_draft_v2', 'sensitive');
  await set('wakestate_settings', { theme: 'midnight' });
  await clearAllData();
  for (const name of keys) expect(await get(`wakestate_${name}`)).toBeUndefined();
  expect(legacy.size).toBe(0);
  expect(await get('wakestate_settings')).toEqual({ theme: 'midnight' });
});
it('escapes quotes and spreadsheet formulas', () => {
  expect(escapeCSVCell('a,"b"')).toBe('"a,""b"""');
  expect(escapeCSVCell(' =1+1')).toBe('"\' =1+1"');
  expect(escapeCSVCell('@SUM(A1)')).toBe('"\'@SUM(A1)"');
});
it('uses local calendar day for medication counts', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-10T00:30:00+08:00'));
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  await set('wakestate_med_administrations', [{ id: 'today', medicationId: 'med', localDate: date }]);
  expect(await getTodayAdministrations('med')).toHaveLength(1);
  vi.useRealTimers();
});
it('rejects empty and unsupported backups', async () => {
  await expect(importData('{}')).rejects.toThrow();
  await expect(importData('{"version":99,"events":[]}')).rejects.toThrow();
});

it('preserves simultaneous check-ins instead of overwriting one', async () => {
  const { saveCheckIn, getCheckIns } = await import('./storage');
  const domainValues = { cataplexy: 1, microsleeps: 1, cognitive: 1, effort: 1, sleepPressure: 1, motor: 1, sensory: 1, thermo: 1, emotional: 1 };
  await Promise.all(Array.from({ length: 10 }, (_, index) => saveCheckIn({
    id: String(index), createdAt: '2026-09-10T00:00:00Z', localDate: '2026-09-10', localTime: '08:00', wakeDomains: domainValues, tags: [],
  })));
  expect(new Set((await getCheckIns()).map(entry => entry.id)).size).toBe(10);
});

it('rejects a malformed check-in draft before restoring it', async () => {
  const { CheckInDraftSchema } = await import('./validation');
  expect(CheckInDraftSchema.safeParse({ dateTime: 'not-a-date', note: null }).success).toBe(false);
});

it('does not lose a new entry when another entry is deleted concurrently', async () => {
  const { saveCheckIn, deleteCheckIn, getCheckIns } = await import('./storage');
  const existing = { id: 'old', createdAt: '2026-09-10T00:00:00Z', localDate: '2026-09-10', localTime: '08:00', wakeDomains: { cataplexy: 1, microsleeps: 1, cognitive: 1, effort: 1, sleepPressure: 1, motor: 1, sensory: 1, thermo: 1, emotional: 1 }, tags: [] };
  await saveCheckIn(existing);
  await Promise.all([deleteCheckIn('old'), saveCheckIn({ ...existing, id: 'new' })]);
  expect((await getCheckIns()).map(entry => entry.id)).toEqual(['new']);
});

it('keeps one sleep entry per date during simultaneous updates', async () => {
  const { saveSleepEntry, getSleepEntries } = await import('./storage');
  await Promise.all([420, 450].map(totalSleepMinutes => saveSleepEntry({ id: String(totalSleepMinutes), date: '2026-09-09', createdAt: '2026-09-10', updatedAt: '2026-09-10', totalSleepMinutes })));
  expect(await getSleepEntries()).toHaveLength(1);
});
