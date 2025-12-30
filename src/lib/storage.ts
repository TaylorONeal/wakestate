import { get, set, del, keys } from 'idb-keyval';
import type { CheckIn, TrackingEvent, AppSettings } from '@/types';

const CHECKINS_KEY = 'waketrack_checkins';
const EVENTS_KEY = 'waketrack_events';
const SETTINGS_KEY = 'waketrack_settings';

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
