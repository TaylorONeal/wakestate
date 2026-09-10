import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, Check, Moon, ShieldCheck, Sun, Zap } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { MedicationsToday } from '@/components/MedicationsToday';
import { getSleepEntryForDate } from '@/lib/storage';

interface HomeScreenProps {
  onLogWakeState: () => void;
  onLogEvent: () => void;
  onLogSleep: () => void;
  onMedicationSetup: () => void;
  onPrivacy: () => void;
  checkInCount: number;
  eventCount: number;
  refreshTrigger?: number;
}

export function HomeScreen({ onLogWakeState, onLogEvent, onLogSleep, onMedicationSetup, onPrivacy, checkInCount, eventCount, refreshTrigger }: HomeScreenProps) {
  const [hasSleepLoggedToday, setHasSleepLoggedToday] = useState(false);
  useEffect(() => {
    let active = true;
    getSleepEntryForDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'))
      .then(entry => { if (active) setHasSleepLoggedToday(Boolean(entry)); })
      .catch(() => { if (active) setHasSleepLoggedToday(false); });
    return () => { active = false; };
  }, [refreshTrigger]);

  return (
    <div className="space-y-6 pb-24">
      <section className="pt-3 pb-1">
        <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">{format(new Date(), 'EEEE, MMMM d')}</p>
        <h2 className="mt-3 text-3xl font-medium tracking-tight leading-tight">A little clarity,<br />one day at a time.</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">Your sleep and wake journal. Start with how you feel.</p>
      </section>

      <button onClick={onLogWakeState} className="w-full rounded-3xl bg-primary text-primary-foreground p-6 text-left transition-colors hover:bg-primary/90 active:scale-[0.99]">
        <span className="flex justify-between items-start"><Sun className="h-7 w-7" aria-hidden="true" /><ArrowUpRight className="h-5 w-5" aria-hidden="true" /></span>
        <span className="block mt-7 text-xl font-semibold">Check in with yourself</span>
        <span className="block mt-1 text-sm opacity-80">Log your wake state · about 30 seconds</span>
      </button>

      <section aria-label="Quick entries" className="grid grid-cols-2 gap-3">
        <button onClick={onLogEvent} className="section-card text-left min-h-32 hover:bg-surface-3 transition-colors">
          <Zap className="h-5 w-5 text-primary mb-5" aria-hidden="true" />
          <span className="block font-medium">Log an event</span>
          <span className="block mt-1 text-xs text-muted-foreground">Naps, cataplexy & more</span>
        </button>
        <button onClick={onLogSleep} className="section-card text-left min-h-32 hover:bg-surface-3 transition-colors">
          <Moon className="h-5 w-5 text-primary mb-5" aria-hidden="true" />
          <span className="block font-medium">Last night’s sleep</span>
          <span className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">{hasSleepLoggedToday ? <><Check className="w-3 h-3" /> Logged · edit entry</> : 'How was your night?'}</span>
        </button>
      </section>

      <MedicationsToday onSetupClick={onMedicationSetup} refreshTrigger={refreshTrigger} />

      <section className="border-y border-border py-5 flex items-center gap-4">
        <Activity className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-medium">Your journal is taking shape</h3>
          <p className="mt-1 text-xs text-muted-foreground">{checkInCount === 0 && eventCount === 0 ? 'No entries yet. A single check-in is a good start.' : `${checkInCount} check-ins · ${eventCount} events saved in total`}</p>
        </div>
      </section>

      <button onClick={onPrivacy} className="w-full flex items-start gap-3 text-left rounded-xl p-2 hover:bg-surface-2">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <span><span className="block text-sm font-medium">Your journal stays on this device</span><span className="block text-xs text-muted-foreground mt-1 leading-relaxed">No account or automatic health-data upload.<br /><span className="underline underline-offset-4">Privacy & your data</span></span></span>
      </button>
      <p className="text-xs text-muted-foreground leading-relaxed">For personal tracking and conversations with your care team. Not for diagnosis or treatment.</p>
    </div>
  );
}
