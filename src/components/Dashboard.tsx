import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, subDays, subMonths, subYears, eachDayOfInterval, startOfDay, endOfDay, isWithinInterval, startOfWeek, endOfWeek, eachHourOfInterval, getHours } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { getEvents, getCheckIns } from '@/lib/storage';
import { Moon, Zap, TrendingUp, Clock } from 'lucide-react';
import { NARCOLEPSY_DOMAIN_CONFIG, type TrackingEvent, type CheckIn, type NarcolepsyDomainKey } from '@/types';

type ViewPeriod = 'day' | 'week' | 'month' | 'year';

interface DashboardProps {
  refreshTrigger: number;
}

export function Dashboard({ refreshTrigger }: DashboardProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [napPeriod, setNapPeriod] = useState<ViewPeriod>('week');
  const [cataplextyPeriod, setCataplextyPeriod] = useState<ViewPeriod>('week');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    const [eventsData, checkInsData] = await Promise.all([
      getEvents(),
      getCheckIns(),
    ]);
    setEvents(eventsData);
    setCheckIns(checkInsData);
  };

  const getDateRange = (period: ViewPeriod) => {
    const now = new Date();
    switch (period) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: subDays(now, 6), end: now };
      case 'month':
        return { start: subMonths(now, 1), end: now };
      case 'year':
        return { start: subYears(now, 1), end: now };
    }
  };

  // Filter events by type and period
  const getFilteredEvents = (type: 'nap' | 'cataplexy', period: ViewPeriod) => {
    const { start, end } = getDateRange(period);
    return events.filter(e => {
      // Check for legacy event types too
      const isNap = type === 'nap' && (e.type === 'nap' || e.type === 'planned-nap' || e.type === 'unplanned-nap');
      const isCataplexy = type === 'cataplexy' && (e.type === 'cataplexy' || e.type === 'major-cataplexy' || e.type === 'partial-cataplexy' || e.type === 'knee-buckling' || e.type === 'head-drop');
      
      if (!isNap && !isCataplexy) return false;
      
      const eventDate = parseISO(e.localDate);
      return isWithinInterval(eventDate, { start: startOfDay(start), end: endOfDay(end) });
    });
  };

  // Generate chart data for naps
  const napChartData = useMemo(() => {
    const { start, end } = getDateRange(napPeriod);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayEvents = getFilteredEvents('nap', napPeriod).filter(e => 
        format(parseISO(e.localDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      return {
        date: format(day, napPeriod === 'day' ? 'HH:mm' : napPeriod === 'year' ? 'MMM' : 'EEE'),
        count: dayEvents.length,
        planned: dayEvents.filter(e => e.planned === true || e.type === 'planned-nap').length,
        unplanned: dayEvents.filter(e => e.planned === false || e.type === 'unplanned-nap').length,
      };
    });
  }, [events, napPeriod]);

  // Generate chart data for cataplexy
  const cataplextyChartData = useMemo(() => {
    const { start, end } = getDateRange(cataplextyPeriod);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayEvents = getFilteredEvents('cataplexy', cataplextyPeriod).filter(e => 
        format(parseISO(e.localDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const mildCount = dayEvents.filter(e => e.severityTag === 'mild').length;
      const moderateCount = dayEvents.filter(e => e.severityTag === 'moderate').length;
      const severeCount = dayEvents.filter(e => e.severityTag === 'severe').length;
      
      return {
        date: format(day, cataplextyPeriod === 'day' ? 'HH:mm' : cataplextyPeriod === 'year' ? 'MMM' : 'EEE'),
        count: dayEvents.length,
        mild: mildCount,
        moderate: moderateCount,
        severe: severeCount,
      };
    });
  }, [events, cataplextyPeriod]);

  // Generate hour-of-day heatmap data
  const hourlyHeatmap = useMemo(() => {
    const napsByHour: number[] = new Array(24).fill(0);
    const cataplextyByHour: number[] = new Array(24).fill(0);
    
    events.forEach(e => {
      const hour = parseInt(e.localTime.split(':')[0], 10);
      
      if (e.type === 'nap' || e.type === 'planned-nap' || e.type === 'unplanned-nap') {
        napsByHour[hour]++;
      }
      if (e.type === 'cataplexy' || e.type === 'major-cataplexy' || e.type === 'partial-cataplexy') {
        cataplextyByHour[hour]++;
      }
    });
    
    return { napsByHour, cataplextyByHour };
  }, [events]);

  const napEvents = getFilteredEvents('nap', napPeriod);
  const cataplextyEvents = getFilteredEvents('cataplexy', cataplextyPeriod);

  const PeriodToggle = ({ value, onChange, color }: { value: ViewPeriod; onChange: (p: ViewPeriod) => void; color: string }) => (
    <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
      {(['day', 'week', 'month', 'year'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-2 py-1 text-xs font-medium rounded-md transition-all capitalize ${
            value === p 
              ? `bg-${color}/20 text-${color}` 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          style={value === p ? { 
            backgroundColor: color === 'domain-sleep-pressure' ? 'hsl(175, 65%, 55%, 0.2)' : 'hsl(350, 70%, 60%, 0.2)',
            color: color === 'domain-sleep-pressure' ? 'hsl(175, 65%, 55%)' : 'hsl(350, 70%, 60%)'
          } : undefined}
        >
          {p === 'day' ? 'D' : p === 'week' ? 'W' : p === 'month' ? 'M' : 'Y'}
        </button>
      ))}
    </div>
  );

  const HourlyHeatmapRow = ({ data, label, color }: { data: number[]; label: string; color: string }) => {
    const max = Math.max(...data, 1);
    return (
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="flex gap-0.5">
          {data.map((count, hour) => (
            <div
              key={hour}
              className="flex-1 h-4 rounded-sm"
              style={{
                backgroundColor: count > 0 
                  ? `${color.replace(')', `, ${0.2 + (count / max) * 0.8})`)}` 
                  : 'hsl(222, 15%, 15%)',
              }}
              title={`${hour}:00 - ${count} events`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>
    );
  };

  const hasAnyData = events.length > 0 || checkIns.length > 0;

  if (!hasAnyData) {
    return (
      <div className="space-y-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <p className="text-lg font-medium mb-2">No data yet</p>
          <p className="text-sm">Start logging check-ins and events to see your dashboard</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Naps Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-card border-domain-sleep-pressure/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-domain-sleep-pressure/20 flex items-center justify-center">
              <Moon className="w-5 h-5 text-domain-sleep-pressure" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Naps</h3>
              <p className="text-xs text-muted-foreground">{napEvents.length} this {napPeriod}</p>
            </div>
          </div>
          <PeriodToggle value={napPeriod} onChange={setNapPeriod} color="domain-sleep-pressure" />
        </div>

        {napEvents.length > 0 ? (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={napChartData} barCategoryGap="20%">
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(220, 10%, 55%)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 20%, 12%)',
                    border: '1px solid hsl(222, 15%, 20%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(220, 20%, 95%)' }}
                />
                <Bar dataKey="planned" stackId="a" fill="hsl(175, 65%, 55%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="unplanned" stackId="a" fill="hsl(25, 80%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No naps logged this {napPeriod}</p>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-domain-sleep-pressure" />
            <span className="text-muted-foreground">Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-domain-microsleeps" />
            <span className="text-muted-foreground">Unplanned</span>
          </div>
        </div>
      </motion.section>

      {/* Cataplexy Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="section-card border-domain-cataplexy/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-domain-cataplexy/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-domain-cataplexy" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Cataplexy</h3>
              <p className="text-xs text-muted-foreground">{cataplextyEvents.length} this {cataplextyPeriod}</p>
            </div>
          </div>
          <PeriodToggle value={cataplextyPeriod} onChange={setCataplextyPeriod} color="domain-cataplexy" />
        </div>

        {cataplextyEvents.length > 0 ? (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cataplextyChartData} barCategoryGap="20%">
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: 'hsl(220, 10%, 55%)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 20%, 12%)',
                    border: '1px solid hsl(222, 15%, 20%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(220, 20%, 95%)' }}
                />
                <Bar dataKey="mild" stackId="a" fill="hsl(45, 75%, 55%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="moderate" stackId="a" fill="hsl(25, 80%, 55%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="severe" stackId="a" fill="hsl(350, 70%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No cataplexy events logged this {cataplextyPeriod}</p>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'hsl(45, 75%, 55%)' }} />
            <span className="text-muted-foreground">Mild</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-domain-microsleeps" />
            <span className="text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-domain-cataplexy" />
            <span className="text-muted-foreground">Severe</span>
          </div>
        </div>
      </motion.section>

      {/* Hour-of-Day Patterns */}
      {events.length >= 5 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="section-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Time Patterns</h3>
          </div>
          
          <div className="space-y-4">
            <HourlyHeatmapRow 
              data={hourlyHeatmap.napsByHour} 
              label="Naps by hour" 
              color="hsl(175, 65%, 55%" 
            />
            <HourlyHeatmapRow 
              data={hourlyHeatmap.cataplextyByHour} 
              label="Cataplexy by hour" 
              color="hsl(350, 70%, 60%" 
            />
          </div>
        </motion.section>
      )}

      {/* Symptom Summary (Secondary) */}
      {checkIns.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="section-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-muted-foreground">Wake State Summary</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-3 text-center">
              <p className="text-2xl font-bold text-primary">{checkIns.length}</p>
              <p className="text-xs text-muted-foreground">Total check-ins</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-3 text-center">
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-muted-foreground">Total events</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            View Trends tab for detailed symptom analysis
          </p>
        </motion.section>
      )}

      {/* Local Storage Notice */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="section-card border-border/30 bg-surface-2/50"
      >
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          📱 Your data is stored locally on this device only.{' '}
          <span className="text-foreground font-medium">Export regularly</span> in Settings → Export & Reports to keep a backup.
        </p>
      </motion.section>
    </div>
  );
}
