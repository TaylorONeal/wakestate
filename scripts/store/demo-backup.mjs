// Synthetic data only. Import into a disposable test installation, never a real journal.
export function createDemoBackup(endDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) throw new Error('Use YYYY-MM-DD');
  const end = new Date(`${endDate}T12:00:00Z`);
  if (Number.isNaN(end.valueOf()) || end.toISOString().slice(0, 10) !== endDate) throw new Error('Invalid date');
  const checkIns = [];
  const sleepEntries = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date(end.valueOf() - day * 86400000).toISOString().slice(0, 10);
    const score = [2, 3, 2, 4, 3, 2, 3][day];
    checkIns.push({
      id: `demo-checkin-${day}`, createdAt: `${date}T10:00:00Z`, localDate: date, localTime: '10:00',
      wakeDomains: { cataplexy: 1, microsleeps: 2, cognitive: score, effort: 2, sleepPressure: score, motor: 1, sensory: 1, thermo: 1, emotional: 1 },
      narcolepsyDomains: { sleepPressure: score, microsleeps: 2, sleepInertia: 2, cognitive: score, effort: 2 },
      overlappingDomains: { anxiety: 1, mood: 2, digestive: 1, thermo: 1, motor: 1, emotional: 1, sensory: 1 },
      tags: [], note: 'Sample entry for app demonstration.',
    });
    sleepEntries.push({ id: `demo-sleep-${day}`, date, createdAt: `${date}T08:00:00Z`, updatedAt: `${date}T08:00:00Z`, totalSleepMinutes: [450, 420, 465, 390, 435, 480, 450][day], wakeupsCategory: '1-2' });
  }
  return { version: 2, exportedAt: `${endDate}T12:00:00Z`, checkIns, sleepEntries, events: [], medications: {}, medicationConfig: null, medicationAdministrations: [], settings: { showContextByDefault: false, theme: 'midnight' } };
}
