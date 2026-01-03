import { get, set, del, keys } from 'idb-keyval';
import type { 
  CheckIn, 
  TrackingEvent, 
  AppSettings, 
  MedicationEntry, 
  UserMedications,
  UserMedicationConfig,
  MedicationAdministration 
} from '@/types';

const CHECKINS_KEY = 'wakestate_checkins';
const EVENTS_KEY = 'wakestate_events';
const SETTINGS_KEY = 'wakestate_settings';
const MEDICATIONS_KEY = 'wakestate_medications';
const MED_CONFIG_KEY = 'wakestate_med_config';
const MED_ADMIN_KEY = 'wakestate_med_administrations';

export const defaultSettings: AppSettings = {
  showContextByDefault: false,
  theme: 'midnight',
};

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
  const checkIns = await getCheckIns();
  checkIns.unshift(checkIn);
  await set(CHECKINS_KEY, checkIns);
}

export async function updateCheckIn(id: string, updates: Partial<CheckIn>): Promise<void> {
  const checkIns = await getCheckIns();
  const index = checkIns.findIndex(c => c.id === id);
  if (index !== -1) {
    checkIns[index] = { ...checkIns[index], ...updates };
    await set(CHECKINS_KEY, checkIns);
  }
}

export async function deleteCheckIn(id: string): Promise<void> {
  const checkIns = await getCheckIns();
  const filtered = checkIns.filter(c => c.id !== id);
  await set(CHECKINS_KEY, filtered);
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
  const events = await getEvents();
  events.unshift(event);
  await set(EVENTS_KEY, events);
}

export async function deleteEvent(id: string): Promise<void> {
  const events = await getEvents();
  const filtered = events.filter(e => e.id !== id);
  await set(EVENTS_KEY, filtered);
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
  const administrations = await getMedicationAdministrations();
  administrations.unshift(admin);
  await set(MED_ADMIN_KEY, administrations);
}

export async function removeMedicationAdministration(id: string): Promise<void> {
  const administrations = await getMedicationAdministrations();
  const filtered = administrations.filter(a => a.id !== id);
  await set(MED_ADMIN_KEY, filtered);
}

export async function getTodayAdministrations(medicationId: string): Promise<MedicationAdministration[]> {
  const administrations = await getMedicationAdministrations();
  const today = new Date().toISOString().split('T')[0];
  return administrations.filter(a => a.medicationId === medicationId && a.localDate === today);
}

// Export/Import
export async function exportAllData(): Promise<string> {
  const checkIns = await getCheckIns();
  const events = await getEvents();
  const settings = await getSettings();
  
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    checkIns,
    events,
    settings,
  }, null, 2);
}

export async function importData(jsonString: string): Promise<{ checkIns: number; events: number }> {
  const data = JSON.parse(jsonString);
  
  if (data.checkIns) {
    await set(CHECKINS_KEY, data.checkIns);
  }
  if (data.events) {
    await set(EVENTS_KEY, data.events);
  }
  if (data.settings) {
    await set(SETTINGS_KEY, data.settings);
  }
  
  return {
    checkIns: data.checkIns?.length || 0,
    events: data.events?.length || 0,
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
  
  return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
}
