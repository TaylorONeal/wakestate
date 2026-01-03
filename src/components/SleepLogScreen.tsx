import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Minus, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SaveConfirmation } from '@/components/SaveConfirmation';
import { toast } from 'sonner';
import { useSaveConfirmation } from '@/hooks/useSaveConfirmation';
import { v4 as uuidv4 } from 'uuid';
import { getSleepEntryForDate, saveSleepEntry } from '@/lib/storage';
import type { SleepEntry, WakeupCategory } from '@/types';
import { format, subDays } from 'date-fns';

interface SleepLogScreenProps {
  onBack: () => void;
  onSave: () => void;
}

export function SleepLogScreen({ onBack, onSave }: SleepLogScreenProps) {
  // Last night's date
  const lastNight = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const saveConfirmation = useSaveConfirmation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [existingEntry, setExistingEntry] = useState<SleepEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [hours, setHours] = useState(7);
  const [minutes, setMinutes] = useState(0);
  const [wakeupsCategory, setWakeupsCategory] = useState<WakeupCategory | ''>('');
  const [hallucinations, setHallucinations] = useState(false);
  const [hallucinationsNote, setHallucinationsNote] = useState('');
  const [vividDreams, setVividDreams] = useState(false);
  const [ahi, setAhi] = useState<string>('');
  const [optionalOpen, setOptionalOpen] = useState(false);

  useEffect(() => {
    const loadExisting = async () => {
      const entry = await getSleepEntryForDate(lastNight);
      if (entry) {
        setExistingEntry(entry);
        setIsEditing(true);
        // Populate form
        const totalHours = Math.floor(entry.totalSleepMinutes / 60);
        const totalMins = entry.totalSleepMinutes % 60;
        setHours(totalHours);
        setMinutes(totalMins);
        setWakeupsCategory(entry.wakeupsCategory || '');
        setHallucinations(entry.hallucinations || false);
        setHallucinationsNote(entry.hallucinationsNote || '');
        setVividDreams(entry.vividDreams || false);
        setAhi(entry.ahi?.toString() || '');
        // Open optional section if any optional fields have values
        if (entry.wakeupsCategory || entry.hallucinations || entry.vividDreams || entry.ahi) {
          setOptionalOpen(true);
        }
      }
      setIsLoading(false);
    };
    loadExisting();
  }, [lastNight]);

  const handleSave = async () => {
    const totalMinutes = hours * 60 + minutes;
    
    if (totalMinutes === 0) {
      toast.error('Please enter your sleep time');
      return;
    }

    const entry: SleepEntry = {
      id: existingEntry?.id || uuidv4(),
      date: lastNight,
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalSleepMinutes: totalMinutes,
      wakeupsCategory: wakeupsCategory || undefined,
      hallucinations: hallucinations || undefined,
      hallucinationsNote: hallucinations ? hallucinationsNote || undefined : undefined,
      vividDreams: vividDreams || undefined,
      ahi: ahi ? parseFloat(ahi) : undefined,
    };

    await saveSleepEntry(entry);
    
    // Trigger save animation (sleep-related, new or edit)
    saveConfirmation.trigger(isEditing ? 'edit' : 'new', 'sleep');
    
    toast.success("Last night's sleep logged.");
    onSave();
    
    // Small delay to show animation before navigating
    setTimeout(() => {
      onBack();
    }, 400);
  };

  const adjustTime = (field: 'hours' | 'minutes', delta: number) => {
    if (field === 'hours') {
      setHours(prev => Math.max(0, Math.min(24, prev + delta)));
    } else {
      setMinutes(prev => {
        const newVal = prev + delta;
        if (newVal < 0) return 45;
        if (newVal > 45) return 0;
        return newVal;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-foreground">Last Night's Sleep</h2>
        <p className="text-muted-foreground text-sm">
          A quick snapshot of how last night went. Not a sleep tracker.
        </p>
        <div className="text-xs text-muted-foreground/70 bg-surface-2 rounded-lg px-3 py-2">
          Logging for: <span className="text-foreground font-medium">{format(subDays(new Date(), 1), 'EEEE, MMMM d')}</span>
          {isEditing && <span className="text-primary ml-2">(editing)</span>}
        </div>
      </motion.div>

      {/* Total Sleep Time - Primary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold text-foreground">Total Sleep Time</Label>
        </div>
        
        <div className="flex items-center justify-center gap-6">
          {/* Hours */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => adjustTime('hours', 1)}
              className="p-3 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground tabular-nums">{hours}</div>
              <div className="text-sm text-muted-foreground">hours</div>
            </div>
            <button
              onClick={() => adjustTime('hours', -1)}
              className="p-3 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            >
              <Minus className="w-6 h-6" />
            </button>
          </div>

          <div className="text-4xl font-bold text-muted-foreground">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => adjustTime('minutes', 15)}
              className="p-3 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground tabular-nums">{minutes.toString().padStart(2, '0')}</div>
              <div className="text-sm text-muted-foreground">minutes</div>
            </div>
            <button
              onClick={() => adjustTime('minutes', -15)}
              className="p-3 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            >
              <Minus className="w-6 h-6" />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center italic">
          Rough estimate is fine.
        </p>
      </motion.div>

      {/* Optional Fields */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Collapsible open={optionalOpen} onOpenChange={setOptionalOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Optional details (narcolepsy-related)
              </span>
              {optionalOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 space-y-4 glass rounded-2xl p-4">
              {/* Nighttime Wakeups */}
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Nighttime Wakeups</Label>
                <Select value={wakeupsCategory} onValueChange={(val) => setWakeupsCategory(val as WakeupCategory)}>
                  <SelectTrigger className="bg-surface-2 border-border/50">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1-2">1–2</SelectItem>
                    <SelectItem value="3-4">3–4</SelectItem>
                    <SelectItem value="5+">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hallucinations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-foreground">Hypnagogic / Hypnopompic Hallucinations</Label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 w-56 p-2 bg-surface-2 border border-border/50 rounded-lg text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        Visual, auditory, or sensory experiences while falling asleep or waking.
                      </div>
                    </div>
                  </div>
                  <Switch checked={hallucinations} onCheckedChange={setHallucinations} />
                </div>
                {hallucinations && (
                  <Textarea
                    placeholder="Optional note (max 140 characters)"
                    value={hallucinationsNote}
                    onChange={(e) => setHallucinationsNote(e.target.value.slice(0, 140))}
                    className="bg-surface-2 border-border/50 text-sm resize-none"
                    rows={2}
                  />
                )}
              </div>

              {/* Vivid Dreams */}
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Vivid Dreams</Label>
                <Switch checked={vividDreams} onCheckedChange={setVividDreams} />
              </div>

              {/* AHI */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-foreground">AHI (if known)</Label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-52 p-2 bg-surface-2 border border-border/50 rounded-lg text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      Only if you have this from a sleep study or CPAP.
                    </div>
                  </div>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.2"
                  value={ahi}
                  onChange={(e) => setAhi(e.target.value)}
                  className="bg-surface-2 border-border/50 w-32"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={handleSave}
          className="w-full h-14 text-lg font-semibold rounded-2xl"
        >
          {isEditing ? 'Update Sleep Log' : 'Save Sleep Log'}
        </Button>
      </motion.div>

      {/* Save Confirmation Animation */}
      <SaveConfirmation
        isVisible={saveConfirmation.isVisible}
        saveType={saveConfirmation.saveType}
        logType={saveConfirmation.logType}
      />
    </div>
  );
}