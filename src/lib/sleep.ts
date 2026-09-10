/** Keep quarter-hour adjustments within one day, carrying across hour boundaries. */
export function adjustSleepDuration(hours: number, minutes: number, deltaMinutes: number): number {
  return Math.max(0, Math.min(1440, hours * 60 + minutes + deltaMinutes));
}
