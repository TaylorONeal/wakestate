import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, subDays, eachDayOfInterval, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { getCheckIns } from '@/lib/storage';
import { WAKE_DOMAIN_CONFIG, CONTEXT_DOMAIN_CONFIG, type CheckIn, type WakeDomainKey, type ContextDomainKey } from '@/types';

type ViewPeriod = '7d' | '30d';

const wakeColorMap: Record<WakeDomainKey, string> = {
  cataplexy: 'hsl(350, 70%, 60%)',
  microsleeps: 'hsl(25, 80%, 55%)',
  cognitive: 'hsl(45, 75%, 55%)',
  effort: 'hsl(85, 50%, 50%)',
  sleepPressure: 'hsl(175, 55%, 45%)',
  motor: 'hsl(195, 60%, 50%)',
  sensory: 'hsl(260, 55%, 60%)',
  thermo: 'hsl(320, 50%, 55%)',
  emotional: 'hsl(290, 50%, 55%)',
};

const contextColorMap: Record<ContextDomainKey, string> = {
  anxiety: 'hsl(200, 60%, 50%)',
  mood: 'hsl(230, 50%, 55%)',
  digestive: 'hsl(160, 45%, 45%)',
};

interface TrendsScreenProps {
  refreshTrigger: number;
}

export function TrendsScreen({ refreshTrigger }: TrendsScreenProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [period, setPeriod] = useState<ViewPeriod>('7d');
  const [selectedWakeDomains, setSelectedWakeDomains] = useState<WakeDomainKey[]>(['sleepPressure', 'cognitive']);
  const [selectedContextDomains, setSelectedContextDomains] = useState<ContextDomainKey[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    const data = await getCheckIns();
    setCheckIns(data);
  };

  const toggleWakeDomain = (key: WakeDomainKey) => {
    setSelectedWakeDomains(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleContextDomain = (key: ContextDomainKey) => {
    setSelectedContextDomains(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Process data for chart
  const days = period === '7d' ? 7 : 30;
  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date(),
  });

  const chartData = dateRange.map(date => {
    const dayCheckIns = checkIns.filter(c => 
      isWithinInterval(parseISO(c.localDate), {
        start: startOfDay(date),
        end: endOfDay(date),
      })
    );

    if (dayCheckIns.length === 0) {
      return { date: format(date, 'MMM d'), count: 0 };
    }

    const result: Record<string, number | string> = {
      date: format(date, 'MMM d'),
      count: dayCheckIns.length,
    };

    // Calculate averages for each selected domain
    [...selectedWakeDomains, ...selectedContextDomains].forEach(key => {
      const values = dayCheckIns
        .map(c => {
          if (key in WAKE_DOMAIN_CONFIG) {
            return c.wakeDomains[key as WakeDomainKey];
          }
          return c.contextDomains?.[key as ContextDomainKey];
        })
        .filter((v): v is number => v !== undefined);

      if (values.length > 0) {
        result[key] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      }
    });

    return result;
  });

  const hasData = checkIns.length > 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Period Toggle */}
      <div className="flex gap-2">
        {(['7d', '30d'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
            className="flex-1"
          >
            {p === '7d' ? '7 Days' : '30 Days'}
          </Button>
        ))}
      </div>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <p className="text-lg font-medium mb-2">No data yet</p>
          <p className="text-sm">Start logging check-ins to see trends</p>
        </motion.div>
      ) : (
        <>
          {/* Domain Toggles */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Wake Domains</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(WAKE_DOMAIN_CONFIG) as WakeDomainKey[]).map((key) => {
                const config = WAKE_DOMAIN_CONFIG[key];
                const isSelected = selectedWakeDomains.includes(key);
                
                return (
                  <motion.button
                    key={key}
                    onClick={() => toggleWakeDomain(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'text-background'
                        : 'bg-surface-2 text-muted-foreground border border-border/50'
                    }`}
                    style={isSelected ? { backgroundColor: wakeColorMap[key] } : undefined}
                    whileTap={{ scale: 0.95 }}
                  >
                    {config.label.split(' —')[0].split(' /')[0]}
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Context (Overlay)</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOverlay(!showOverlay)}
                className={showOverlay ? 'text-primary' : 'text-muted-foreground'}
              >
                {showOverlay ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            <AnimatePresence>
              {showOverlay && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-wrap gap-2 overflow-hidden"
                >
                  {(Object.keys(CONTEXT_DOMAIN_CONFIG) as ContextDomainKey[]).map((key) => {
                    const config = CONTEXT_DOMAIN_CONFIG[key];
                    const isSelected = selectedContextDomains.includes(key);
                    
                    return (
                      <motion.button
                        key={key}
                        onClick={() => toggleContextDomain(key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'text-background'
                            : 'bg-surface-2 text-muted-foreground border border-border/50'
                        }`}
                        style={isSelected ? { backgroundColor: contextColorMap[key] } : undefined}
                        whileTap={{ scale: 0.95 }}
                      >
                        {config.label.split(' (')[0].split(' /')[0]}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Chart */}
          <section className="section-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Daily Averages</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: 'hsl(220, 10%, 55%)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[1, 5]} 
                    tick={{ fontSize: 10, fill: 'hsl(220, 10%, 55%)' }}
                    tickLine={false}
                    axisLine={false}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 20%, 12%)',
                      border: '1px solid hsl(222, 15%, 20%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(220, 20%, 95%)' }}
                  />
                  {selectedWakeDomains.map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={wakeColorMap[key]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: wakeColorMap[key] }}
                      connectNulls
                    />
                  ))}
                  {selectedContextDomains.map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={contextColorMap[key]}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: contextColorMap[key] }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Summary Stats */}
          <section className="section-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Period Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-surface-3">
                <p className="text-2xl font-bold text-primary">{checkIns.length}</p>
                <p className="text-xs text-muted-foreground">Total check-ins</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-3">
                <p className="text-2xl font-bold">
                  {Math.round(checkIns.length / days * 10) / 10}
                </p>
                <p className="text-xs text-muted-foreground">Avg per day</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
