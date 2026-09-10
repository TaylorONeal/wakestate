import { clearExportCache } from './download';
import { get, set, delMany, setMany, update } from 'idb-keyval';
import { format } from 'date-fns';
import type { 
  CheckIn, 
  TrackingEvent, 
  AppSettings, 
  MedicationEntry, 
  UserMedications,
  UserMedicationConfig,
  MedicationAdministration,
  SleepEntry
} from '@/types';
import { ImportDataSchema } from './validation';

const CHECKINS_KEY = 'wakestate_checkins';
const EVENTS_KEY = 'wakestate_events';
const SETTINGS_KEY = 'wakestate_settings';
const MEDICATIONS_KEY = 'wakestate_medications';
const MED_CONFIG_KEY = 'wakestate_med_config';
const MED_ADMIN_KEY = 'wakestate_med_administrations';
const SLEEP_ENTRIES_KEY = 'wakestate_sleep_entries';

export const defaultSettings: AppSettings = {
  showContextByDefault: false,
  theme: 'midnight',
};

// Clear all data
export async function clearAllData(): Promise<void> {
  const trackingKeys = [CHECKINS_KEY, EVENTS_KEY, MEDICATIONS_KEY, MED_CONFIG_KEY, MED_ADMIN_KEY, SLEEP_ENTRIES_KEY];
  // Remove legacy copies as well so fallback reads cannot resurrect deleted records.
  localStorage.removeItem('wakestate_checkin_draft_v2');
  for (const key of trackingKeys) localStorage.removeItem(key);
  await delMany(trackingKeys);
  await clearExportCache();
  // Keep settings - user preferences should remain
}

// Check-ins
export async function getCheckIns(): Promise<CheckIn[]> {
  try {
    const data = await get<CheckIn[]>(CHECKINS_KEY);
    return data || [];
  } catch {
    const stored = localStorage.getItem(CHECKINS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

export async function saveCheckIn(checkIn: CheckIn): Promise<void> {
  // A single read/write transaction preserves entries saved concurrently.
  await update<CheckIn[]>(CHECKINS_KEY, current => [checkIn, ...(current ?? [])]);
}

export async function updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<void> {
  await update<CheckIn[]>(CHECKINS_KEY, current => (current ?? []).map(entry =>
    entry.id === id ? { ...entry, ...updates, id } : entry
  ));
}

export async function deleteCheckIn(id: string): Promise<void> {
  await update<CheckIn[]>(CHECKINS_KEY, current => (current ?? []).filter(entry => entry.id !== id));
}

// Events
export async function getEvents(): Promise<TrackingEvent[]> {
  try {
    const data = await get<TrackingEvent[]>(EVENTS_KEY);
    return data || [];
  } catch {
    const stored = localStorage.getItem(EVENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

export async function saveEvent(event: TrackingEvent): Promise<void> {
  // A single read/write transaction preserves entries saved concurrently.
  await update<TrackingEvent[]>(EVENTS_KEY, current => [event, ...(current ?? [])]);
}

export async function deleteEvent(id: string): Promise<void> {
  await update<TrackingEvent[]>(EVENTS_KEY, current => (current ?? []).filter(entry => entry.id !== id));
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await get<AppSettings>(SETTINGS_KEY);
    return data || defaultSettings;
  } catch {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await set(SETTINGS_KEY, settings);
}

// Medications
export async function getUserMedications(): Promise<UserMedications> {
  try {
    const data = await get<UserMedications>(MEDICATIONS_KEY);
    return data || {};
  } catch {
    const stored = localStorage.getItem(MEDICATIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  }
}

export async function saveMedicationEntry(entry: MedicationEntry): Promise<void> {
  const medications = await getUserMedications();
  medications[entry.id] = entry;
  await set(MEDICATIONS_KEY, medications);
}

export async function removeMedicationEntry(medicationId: string): Promise<void> {
  const medications = await getUserMedications();
  delete medications[medicationId];
  await set(MEDICATIONS_KEY, medications);
}

// Medication Configuration (Regimen)
export async function getMedicationConfig(): Promise<UserMedicationConfig | null> {
  try {
    const data = await get<UserMedicationConfig>(MED_CONFIG_KEY);
    return data || null;
  } catch {
    const stored = localStorage.getItem(MED_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}

export async function saveMedicationConfig(config: UserMedicationConfig): Promise<void> {
  await set(MED_CONFIG_KEY, config);
}

// Medication Administrations
export async function getMedicationAdministrations(): Promise<MedicationAdministration[]> {
  try {
    const data = await get<MedicationAdministration[]>(MED_ADMIN_KEY);
    return data || [];
  } catch {
    const stored = localStorage.getItem(MED_ADMIN_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

export async function saveMedicationAdministration(admin: MedicationAdministration): Promise<void> {
  // A single read/write transaction preserves entries saved concurrently.
  await update<MedicationAdministration[]>(MED_ADMIN_KEY, current => [admin, ...(current ?? [])]);
}

export async function removeMedicationAdministration(id: string): Promise<void> {
  await update<MedicationAdministration[]>(MED_ADMIN_KEY, current => (current ?? []).filter(entry => entry.id !== id));
}

export async function getTodayAdministrations(medicationId: string): Promise<MedicationAdministration[]> {
  const administrations = await getMedicationAdministrations();
  const today = format(new Date(), 'yyyy-MM-dd');
  return administrations.filter(a => a.medicationId === medicationId && a.localDate === today);
}

// Sleep Entries
export async function getSleepEntries(): Promise<SleepEntry[]> {
  try {
    const data = await get<SleepEntry[]>(SLEEP_ENTRIES_KEY);
    return data || [];
  } catch {
    const stored = localStorage.getItem(SLEEP_ENTRIES_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

export async function getSleepEntryForDate(date: string): Promise<SleepEntry | null> {
  const entries = await getSleepEntries();
  return entries.find(e => e.date === date) || null;
}

export async function saveSleepEntry(entry: SleepEntry): Promise<void> {
  await update<SleepEntry[]>(SLEEP_ENTRIES_KEY, current => {
    const entries = current ?? [];
    return entries.some(existing => existing.date === entry.date)
      ? entries.map(existing => existing.date === entry.date ? entry : existing)
      : [entry, ...entries];
  });
}

export async function deleteSleepEntry(id: string): Promise<void> {
  await update<SleepEntry[]>(SLEEP_ENTRIES_KEY, current => (current ?? []).filter(entry => entry.id !== id));
}

// Export/Import
export async function exportAllData(): Promise<string> {
  const checkIns = await getCheckIns();
  const events = await getEvents();
  const settings = await getSettings();
  
  return JSON.stringify({
    version: 2,
    medications: await getUserMedications(),
    medicationConfig: await getMedicationConfig(),
    medicationAdministrations: await getMedicationAdministrations(),
    sleepEntries: await getSleepEntries(),
    exportedAt: new Date().toISOString(),
    checkIns,
    events,
    settings,
  }, null, 2);
}

export async function importData(jsonString: string): Promise<{ checkIns: number; events: number }> {
  if (new Blob([jsonString]).size > 10 * 1024 * 1024) throw new Error('Backup exceeds 10 MB');
  const validated = ImportDataSchema.parse(JSON.parse(jsonString));
  // Validate everything before making a single atomic IndexedDB write.
  const entries: [string, unknown][] = [];
  if (validated.checkIns) entries.push([CHECKINS_KEY, validated.checkIns]);
  if (validated.events) entries.push([EVENTS_KEY, validated.events]);
  if (validated.settings) entries.push([SETTINGS_KEY, validated.settings]);
  if (validated.medications) entries.push([MEDICATIONS_KEY, validated.medications]);
  if (validated.medicationConfig !== undefined) entries.push([MED_CONFIG_KEY, validated.medicationConfig]);
  if (validated.medicationAdministrations) entries.push([MED_ADMIN_KEY, validated.medicationAdministrations]);
  if (validated.sleepEntries) entries.push([SLEEP_ENTRIES_KEY, validated.sleepEntries]);
  if (!entries.length) throw new Error('No WakeState data found');
  await setMany(entries);

  return {
    checkIns: validated.checkIns?.length || 0,
    events: validated.events?.length || 0,
  };
}

export function exportToCSV(checkIns: CheckIn[]): string {
  const headers = [
    'id',
    'createdAt',
    'localDate',
    'localTime',
    'cataplexy',
    'microsleeps',
    'cognitive',
    'effort',
    'sleepPressure',
    'motor',
    'sensory',
    'thermo',
    'emotional',
    'anxiety',
    'mood',
    'digestive',
    'tags',
    'note',
  ];
  
  const rows = checkIns.map(c => [
    c.id,
    c.createdAt,
    c.localDate,
    c.localTime,
    c.wakeDomains.cataplexy,
    c.wakeDomains.microsleeps,
    c.wakeDomains.cognitive,
    c.wakeDomains.effort,
    c.wakeDomains.sleepPressure,
    c.wakeDomains.motor,
    c.wakeDomains.sensory,
    c.wakeDomains.thermo,
    c.wakeDomains.emotional,
    c.contextDomains?.anxiety || '',
    c.contextDomains?.mood || '',
    c.contextDomains?.digestive || '',
    c.tags.join('; '),
    c.note || '',
  ]);
  
  return [headers.join(','), ...rows.map(r => r.map(escapeCSVCell).join(','))].join('\n');
}

// Spreadsheet programs interpret leading formula characters even inside quotes.
export function escapeCSVCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
