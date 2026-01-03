import { format, subDays, parseISO, differenceInMinutes } from 'date-fns';
import type { CheckIn, TrackingEvent, NarcolepsyDomains, OverlappingDomains } from '@/types';
import { NARCOLEPSY_DOMAIN_CONFIG, OVERLAPPING_DOMAIN_CONFIG } from '@/types';

export type DateRangeOption = '7days' | '30days' | '90days' | 'custom';
export type ReportType = 'quick' | 'detailed' | 'personal';

export interface ReportOptions {
  dateRange: DateRangeOption;
  customStartDate?: Date;
  customEndDate?: Date;
  includeMedications: boolean;
  includeProviderQuestions: boolean;
  clinicianMode: boolean;
}

export interface ReportData {
  checkIns: CheckIn[];
  events: TrackingEvent[];
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

export function getDateRange(option: DateRangeOption, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (option) {
    case '7days':
      start = subDays(end, 7);
      break;
    case '30days':
      start = subDays(end, 30);
      break;
    case '90days':
      start = subDays(end, 90);
      break;
    case 'custom':
      start = customStart || subDays(end, 30);
      return { start, end: customEnd || end };
    default:
      start = subDays(end, 30);
  }

  return { start, end };
}

export function filterDataByDateRange(
  checkIns: CheckIn[],
  events: TrackingEvent[],
  start: Date,
  end: Date
): ReportData {
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');

  const filteredCheckIns = checkIns.filter(c => c.localDate >= startStr && c.localDate <= endStr);
  const filteredEvents = events.filter(e => e.localDate >= startStr && e.localDate <= endStr);

  return {
    checkIns: filteredCheckIns,
    events: filteredEvents,
    startDate: start,
    endDate: end,
    totalDays: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

function calculateDomainAverages(checkIns: CheckIn[]): Record<string, number> {
  if (checkIns.length === 0) return {};

  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  checkIns.forEach(c => {
    if (c.narcolepsyDomains) {
      Object.entries(c.narcolepsyDomains).forEach(([key, val]) => {
        sums[key] = (sums[key] || 0) + val;
        counts[key] = (counts[key] || 0) + 1;
      });
    }
    if (c.overlappingDomains) {
      Object.entries(c.overlappingDomains).forEach(([key, val]) => {
        sums[key] = (sums[key] || 0) + val;
        counts[key] = (counts[key] || 0) + 1;
      });
    }
  });

  const averages: Record<string, number> = {};
  Object.keys(sums).forEach(key => {
    averages[key] = Math.round((sums[key] / counts[key]) * 10) / 10;
  });

  return averages;
}

function getSeverityLabel(avg: number): string {
  if (avg <= 1.5) return 'minimal';
  if (avg <= 2.5) return 'mild';
  if (avg <= 3.5) return 'moderate';
  if (avg <= 4.5) return 'significant';
  return 'severe';
}

function countEventsByType(events: TrackingEvent[]): { naps: number; cataplexy: number; other: number } {
  let naps = 0;
  let cataplexy = 0;
  let other = 0;

  events.forEach(e => {
    if (e.type === 'nap' || e.type === 'planned-nap' || e.type === 'unplanned-nap') {
      naps++;
    } else if (e.type === 'cataplexy' || e.type.includes('cataplexy')) {
      cataplexy++;
    } else {
      other++;
    }
  });

  return { naps, cataplexy, other };
}

function calculateNapStats(events: TrackingEvent[]): { avgDuration: number; plannedRatio: number } {
  const napEvents = events.filter(e => 
    e.type === 'nap' || e.type === 'planned-nap' || e.type === 'unplanned-nap'
  );

  if (napEvents.length === 0) return { avgDuration: 0, plannedRatio: 0 };

  let totalDuration = 0;
  let durationCount = 0;
  let plannedCount = 0;

  napEvents.forEach(e => {
    if (e.startTime && e.endTime) {
      const start = parseISO(`2000-01-01T${e.startTime}`);
      const end = parseISO(`2000-01-01T${e.endTime}`);
      const duration = differenceInMinutes(end, start);
      if (duration > 0 && duration < 360) {
        totalDuration += duration;
        durationCount++;
      }
    }
    if (e.planned) plannedCount++;
  });

  return {
    avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    plannedRatio: Math.round((plannedCount / napEvents.length) * 100),
  };
}

// ============= Quick Summary Report =============
export function generateQuickSummary(data: ReportData, options: ReportOptions): string {
  const { checkIns, events, startDate, endDate, totalDays } = data;
  const averages = calculateDomainAverages(checkIns);
  const eventCounts = countEventsByType(events);
  const napStats = calculateNapStats(events);

  const dateRangeStr = `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`;

  let report = `
═══════════════════════════════════════════════════════════
                     WAKESTATE SUMMARY
═══════════════════════════════════════════════════════════

Period: ${dateRangeStr} (${totalDays} days)
Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}

───────────────────────────────────────────────────────────
                      AT A GLANCE
───────────────────────────────────────────────────────────

Check-ins recorded: ${checkIns.length}
Events logged: ${events.length}

  • Naps: ${eventCounts.naps}
  • Cataplexy episodes: ${eventCounts.cataplexy}
  • Other events: ${eventCounts.other}

───────────────────────────────────────────────────────────
                 NARCOLEPSY-RELATED SYMPTOMS
───────────────────────────────────────────────────────────
`;

  // Narcolepsy symptoms
  const narcolepsyKeys: (keyof NarcolepsyDomains)[] = ['sleepPressure', 'microsleeps', 'sleepInertia', 'cognitive', 'effort'];
  
  narcolepsyKeys.forEach(key => {
    const config = NARCOLEPSY_DOMAIN_CONFIG[key];
    const avg = averages[key];
    if (avg !== undefined) {
      const severity = getSeverityLabel(avg);
      report += `\n${config.label}\n`;
      report += `  Average: ${avg}/5 (${severity})\n`;
    }
  });

  // Key observations
  report += `
───────────────────────────────────────────────────────────
                    KEY OBSERVATIONS
───────────────────────────────────────────────────────────
`;

  // Add observations based on data
  const observations: string[] = [];

  if (checkIns.length < totalDays * 2) {
    observations.push(`Tracking frequency: ${(checkIns.length / totalDays).toFixed(1)} check-ins/day on average.`);
  }

  if (averages.sleepPressure && averages.sleepPressure >= 3) {
    observations.push(`Excessive Daytime Sleepiness was rated as ${getSeverityLabel(averages.sleepPressure)} on average during this period.`);
  }

  if (eventCounts.naps > 0) {
    const napsPerDay = (eventCounts.naps / totalDays).toFixed(1);
    observations.push(`Nap frequency: ${napsPerDay} naps/day. ${napStats.plannedRatio}% were planned.`);
    if (napStats.avgDuration > 0) {
      observations.push(`Average nap duration: ${napStats.avgDuration} minutes.`);
    }
  }

  if (eventCounts.cataplexy > 0) {
    observations.push(`${eventCounts.cataplexy} cataplexy episode(s) recorded during this period.`);
  }

  if (averages.cognitive && averages.cognitive >= 3) {
    observations.push(`Cognitive fog was frequently reported at ${getSeverityLabel(averages.cognitive)} levels.`);
  }

  if (observations.length === 0) {
    observations.push('Continue tracking to build a clearer picture of your patterns.');
  }

  observations.forEach(obs => {
    report += `• ${obs}\n`;
  });

  // Other symptoms context
  const overlappingKeys: (keyof OverlappingDomains)[] = ['anxiety', 'mood', 'digestive', 'thermo', 'motor', 'emotional', 'sensory'];
  const hasOverlapping = overlappingKeys.some(key => averages[key] !== undefined);

  if (hasOverlapping) {
    report += `
───────────────────────────────────────────────────────────
              OTHER SYMPTOMS (CONTEXT)
───────────────────────────────────────────────────────────
`;
    overlappingKeys.forEach(key => {
      const config = OVERLAPPING_DOMAIN_CONFIG[key];
      const avg = averages[key];
      if (avg !== undefined) {
        report += `${config.label}: ${avg}/5\n`;
      }
    });
  }

  if (options.includeProviderQuestions) {
    report += `
───────────────────────────────────────────────────────────
              QUESTIONS FOR YOUR PROVIDER
───────────────────────────────────────────────────────────

Based on your data, you might consider discussing:

`;
    if (averages.sleepPressure && averages.sleepPressure >= 3.5) {
      report += `• My excessive daytime sleepiness remains significant. Are there treatment adjustments to consider?\n`;
    }
    if (eventCounts.cataplexy > 3) {
      report += `• I had ${eventCounts.cataplexy} cataplexy episodes. Should we review my current management plan?\n`;
    }
    if (averages.cognitive && averages.cognitive >= 3.5) {
      report += `• Cognitive fog is impacting my daily function. What options might help?\n`;
    }
    if (eventCounts.naps > 0 && napStats.plannedRatio < 50) {
      report += `• Most of my naps are unplanned. Should we discuss a more structured nap schedule?\n`;
    }
  }

  // Disclaimer
  report += `
═══════════════════════════════════════════════════════════
                       DISCLAIMER
═══════════════════════════════════════════════════════════

This report is for informational purposes only. WakeState is
a personal tracking tool and is NOT a medical device.

This report does not provide medical advice, diagnosis, or
treatment recommendations. All data is self-reported and
should be discussed with a qualified healthcare provider.

───────────────────────────────────────────────────────────
                    Generated by WakeState
═══════════════════════════════════════════════════════════
`;

  return report;
}

// ============= Detailed Patterns Report =============
export function generateDetailedReport(data: ReportData, options: ReportOptions): string {
  const { checkIns, events, startDate, endDate, totalDays } = data;
  const averages = calculateDomainAverages(checkIns);
  const eventCounts = countEventsByType(events);
  const napStats = calculateNapStats(events);

  const dateRangeStr = `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`;

  let report = `
═══════════════════════════════════════════════════════════
              WAKESTATE DETAILED PATTERNS REPORT
═══════════════════════════════════════════════════════════

Period: ${dateRangeStr} (${totalDays} days)
Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}

───────────────────────────────────────────────────────────
                      DATA SUMMARY
───────────────────────────────────────────────────────────

Total check-ins: ${checkIns.length}
Check-ins per day: ${(checkIns.length / totalDays).toFixed(1)}
Total events: ${events.length}

Event Breakdown:
  Naps: ${eventCounts.naps}
  Cataplexy: ${eventCounts.cataplexy}
  Other: ${eventCounts.other}

───────────────────────────────────────────────────────────
           NARCOLEPSY SYMPTOM SEVERITY DISTRIBUTION
───────────────────────────────────────────────────────────
`;

  // Narcolepsy symptom distributions
  const narcolepsyKeys: (keyof NarcolepsyDomains)[] = ['sleepPressure', 'microsleeps', 'sleepInertia', 'cognitive', 'effort'];
  
  narcolepsyKeys.forEach(key => {
    const config = NARCOLEPSY_DOMAIN_CONFIG[key];
    const values = checkIns
      .filter(c => c.narcolepsyDomains && c.narcolepsyDomains[key] !== undefined)
      .map(c => c.narcolepsyDomains![key]);
    
    if (values.length > 0) {
      const distribution = [0, 0, 0, 0, 0];
      values.forEach(v => {
        distribution[v - 1]++;
      });
      
      const avg = averages[key];
      report += `\n${config.label}\n`;
      report += `  Average: ${avg?.toFixed(1) || 'N/A'}/5\n`;
      report += `  Distribution: 1★(${distribution[0]}) 2★(${distribution[1]}) 3★(${distribution[2]}) 4★(${distribution[3]}) 5★(${distribution[4]})\n`;
    }
  });

  // Daily event counts
  report += `
───────────────────────────────────────────────────────────
                  DAILY EVENT SUMMARY
───────────────────────────────────────────────────────────
`;

  // Group events by date
  const eventsByDate: Record<string, TrackingEvent[]> = {};
  events.forEach(e => {
    if (!eventsByDate[e.localDate]) {
      eventsByDate[e.localDate] = [];
    }
    eventsByDate[e.localDate].push(e);
  });

  const sortedDates = Object.keys(eventsByDate).sort().slice(-14); // Last 14 days
  
  if (sortedDates.length > 0) {
    report += `\nDate           Naps  Cataplexy  Other\n`;
    report += `─────────────────────────────────────\n`;
    
    sortedDates.forEach(date => {
      const dayEvents = eventsByDate[date];
      const dayNaps = dayEvents.filter(e => e.type === 'nap' || e.type.includes('nap')).length;
      const dayCat = dayEvents.filter(e => e.type === 'cataplexy' || e.type.includes('cataplexy')).length;
      const dayOther = dayEvents.length - dayNaps - dayCat;
      report += `${date}    ${dayNaps.toString().padStart(4)}  ${dayCat.toString().padStart(9)}  ${dayOther.toString().padStart(5)}\n`;
    });
  } else {
    report += `No events recorded in this period.\n`;
  }

  // Nap analysis
  if (eventCounts.naps > 0) {
    report += `
───────────────────────────────────────────────────────────
                     NAP ANALYSIS
───────────────────────────────────────────────────────────

Total naps: ${eventCounts.naps}
Naps per day: ${(eventCounts.naps / totalDays).toFixed(1)}
Planned naps: ${napStats.plannedRatio}%
Average duration: ${napStats.avgDuration > 0 ? `${napStats.avgDuration} minutes` : 'Not recorded'}
`;
  }

  // Cataplexy analysis
  if (eventCounts.cataplexy > 0) {
    const catEvents = events.filter(e => e.type === 'cataplexy' || e.type.includes('cataplexy'));
    const severityCounts = { mild: 0, moderate: 0, severe: 0 };
    catEvents.forEach(e => {
      if (e.severityTag) {
        severityCounts[e.severityTag]++;
      }
    });

    report += `
───────────────────────────────────────────────────────────
                   CATAPLEXY ANALYSIS
───────────────────────────────────────────────────────────

Total episodes: ${eventCounts.cataplexy}
Per week average: ${((eventCounts.cataplexy / totalDays) * 7).toFixed(1)}

Severity distribution:
  Mild: ${severityCounts.mild}
  Moderate: ${severityCounts.moderate}
  Severe: ${severityCounts.severe}
`;
  }

  // Disclaimer
  report += `
═══════════════════════════════════════════════════════════
                       DISCLAIMER
═══════════════════════════════════════════════════════════

This report is for informational purposes only. WakeState is
a personal tracking tool and is NOT a medical device.

All data is self-reported. This report does not provide
medical advice, diagnosis, or treatment recommendations.

───────────────────────────────────────────────────────────
                    Generated by WakeState
═══════════════════════════════════════════════════════════
`;

  return report;
}

// ============= Personal Insight Report =============
export function generatePersonalReport(data: ReportData, options: ReportOptions): string {
  const { checkIns, events, startDate, endDate, totalDays } = data;
  const averages = calculateDomainAverages(checkIns);
  const eventCounts = countEventsByType(events);

  const dateRangeStr = `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`;

  let report = `
═══════════════════════════════════════════════════════════
              MY WAKESTATE PERSONAL REFLECTION
═══════════════════════════════════════════════════════════

${dateRangeStr}

───────────────────────────────────────────────────────────

`;

  // Personal narrative
  report += `Over the past ${totalDays} days, you recorded ${checkIns.length} check-ins and ${events.length} events. `;
  
  if (checkIns.length >= totalDays) {
    report += `That's consistent tracking — well done!\n\n`;
  } else if (checkIns.length >= totalDays / 2) {
    report += `You're building a good habit. Keep it up!\n\n`;
  } else {
    report += `Even a few data points help you see patterns over time.\n\n`;
  }

  // What stood out
  report += `WHAT STOOD OUT\n`;
  report += `──────────────\n\n`;

  const highlights: string[] = [];

  if (averages.sleepPressure) {
    if (averages.sleepPressure >= 4) {
      highlights.push(`Your sleep pressure was frequently high (avg ${averages.sleepPressure}/5). This might be worth discussing with your care team.`);
    } else if (averages.sleepPressure <= 2) {
      highlights.push(`Your daytime sleepiness stayed relatively manageable (avg ${averages.sleepPressure}/5) during this period.`);
    }
  }

  if (eventCounts.naps > 0) {
    const napsPerDay = eventCounts.naps / totalDays;
    if (napsPerDay >= 2) {
      highlights.push(`You averaged ${napsPerDay.toFixed(1)} naps per day. Consider whether all were truly needed or if some were preventable.`);
    } else {
      highlights.push(`Your nap frequency (${napsPerDay.toFixed(1)}/day) was moderate.`);
    }
  }

  if (eventCounts.cataplexy > 0) {
    highlights.push(`You experienced ${eventCounts.cataplexy} cataplexy episode(s). Tracking triggers can help identify patterns.`);
  }

  if (averages.cognitive && averages.cognitive >= 3) {
    highlights.push(`Cognitive fog was a noticeable theme (avg ${averages.cognitive}/5). This is common but worth monitoring.`);
  }

  if (averages.mood && averages.mood >= 3.5) {
    highlights.push(`Your mood was often low (avg ${averages.mood}/5). Remember: narcolepsy and mood are connected, and both deserve attention.`);
  }

  if (highlights.length === 0) {
    highlights.push(`Your data shows relatively stable patterns. Continue tracking to notice any changes.`);
  }

  highlights.forEach(h => {
    report += `• ${h}\n\n`;
  });

  // Gentle suggestions
  report += `\nQUESTIONS TO CONSIDER\n`;
  report += `─────────────────────\n\n`;

  const questions = [
    `Were there specific times of day when symptoms felt worse?`,
    `Did any activities or contexts seem to help or hurt?`,
    `What was happening on your best days vs. your hardest days?`,
  ];

  if (eventCounts.naps > 0) {
    questions.push(`Are your naps refreshing, or do they leave you groggy?`);
  }

  questions.forEach(q => {
    report += `• ${q}\n`;
  });

  // Closing
  report += `
───────────────────────────────────────────────────────────

Remember: You're not defined by your symptoms. Tracking is
a tool for understanding — not judgment. Each day is new.

───────────────────────────────────────────────────────────
                       DISCLAIMER
───────────────────────────────────────────────────────────

This is a personal reflection tool, not medical advice.
WakeState is NOT a medical device. All data is self-reported.
Please discuss any concerns with a healthcare provider.

───────────────────────────────────────────────────────────
                    Generated by WakeState
═══════════════════════════════════════════════════════════
`;

  return report;
}

export function downloadReport(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
