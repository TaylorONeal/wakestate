import { useState } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { format, differenceInMinutes } from 'date-fns';
import { Moon, Save, ChevronLeft, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SaveConfirmation } from '@/components/SaveConfirmation';
import { useToast } from '@/hooks/use-toast';
import { useSaveConfirmation } from '@/hooks/useSaveConfirmation';
import { saveEvent } from '@/lib/storage';
import { SLEEP_INERTIA_DURATIONS, type TrackingEvent, type RefreshedLevel, type SleepInertiaDuration } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NapEventFormProps {
  onClose: () => void;
  onBack: () => void;
  onSave: () => void;
}

export function NapEventForm({ onClose, onBack, onSave }: NapEventFormProps) {
  const { toast } = useToast();
  const saveConfirmation = useSaveConfirmation();
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [planned, setPlanned] = useState<boolean | undefined>();
  const [refreshed, setRefreshed] = useState<RefreshedLevel | undefined>();
  const [sleepInertia, setSleepInertia] = useState<SleepInertiaDuration | undefined>();
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);

  const hasChanges = () => {
    return planned !== undefined || 
           refreshed !== undefined || 
           sleepInertia !== undefined || 
           note.trim().length > 0;
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowBackDialog(true);
    } else {
      onBack();
    }
  };

  const duration = differenceInMinutes(endTime, startTime);
  const durationText = duration > 0 
    ? `${Math.floor(duration / 60)}h ${duration % 60}m` 
    : 'Set end time';

  const handleSave = async () => {
    if (planned === undefined) {
      toast({
        title: 'Please select nap type',
        description: 'Choose planned or unplanned',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const event: TrackingEvent = {
      id: uuidv4(),
      type: 'nap',
      createdAt: new Date().toISOString(),
      localDate: format(startTime, 'yyyy-MM-dd'),
      localTime: format(startTime, 'HH:mm'),
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      planned,
      refreshed,
      sleepInertiaDuration: sleepInertia,
      contextTags: [planned ? 'planned' : 'unplanned', refreshed || ''].filter(Boolean),
      note: note.trim() || undefined,
    };

    await saveEvent(event);
    
    // Trigger save animation (nap is sleep-related, always new)
    saveConfirmation.trigger('new', 'sleep');
    
    toast({
      title: 'Nap logged',
      description: `${planned ? 'Planned' : 'Unplanned'} nap recorded`,
    });

    setIsSaving(false);
    onSave();
    
    // Small delay for animation
    setTimeout(() => onClose(), 400);
  };

  const formatTimeInput = (date: Date) => format(date, 'HH:mm');

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(hours, minutes, 0, 0);
    
    if (type === 'start') {
      setStartTime(newDate);
      // Auto-adjust end time if it's before start
      if (newDate >= endTime) {
        const newEnd = new Date(newDate);
        newEnd.setMinutes(newEnd.getMinutes() + 30);
        setEndTime(newEnd);
      }
    } else {
      setEndTime(newDate);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleBackClick}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-1"
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <div className="w-10 h-10 rounded-xl bg-domain-sleep-pressure/20 flex items-center justify-center">
            <Moon className="w-5 h-5 text-domain-sleep-pressure" />
          </div>
          <h1 className="text-xl font-bold">Log Nap</h1>
        </div>

        {/* Time Selection */}
        <section className="section-card space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Duration: <strong className="text-foreground">{durationText}</strong></span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Start</label>
              <input
                type="time"
                value={formatTimeInput(startTime)}
                onChange={(e) => handleTimeChange('start', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border/50 text-foreground text-center text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">End</label>
              <input
                type="time"
                value={formatTimeInput(endTime)}
                onChange={(e) => handleTimeChange('end', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-surface-2 border border-border/50 text-foreground text-center text-lg font-medium"
              />
            </div>
          </div>
        </section>

        {/* Planned vs Unplanned */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            Type <span className="text-destructive">*</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setPlanned(true)}
              className={`py-4 px-4 rounded-xl text-sm font-medium transition-all border ${
                planned === true
                  ? 'bg-domain-sleep-pressure/20 text-domain-sleep-pressure border-domain-sleep-pressure/50'
                  : 'bg-surface-2 text-muted-foreground border-border/50 hover:border-border'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              Planned
            </motion.button>
            <motion.button
              onClick={() => setPlanned(false)}
              className={`py-4 px-4 rounded-xl text-sm font-medium transition-all border ${
                planned === false
                  ? 'bg-domain-microsleeps/20 text-domain-microsleeps border-domain-microsleeps/50'
                  : 'bg-surface-2 text-muted-foreground border-border/50 hover:border-border'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              Unplanned
            </motion.button>
          </div>
        </section>

        {/* Refreshed? */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Refreshed?</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['yes', 'somewhat', 'no'] as const).map((level) => (
              <motion.button
                key={level}
                onClick={() => setRefreshed(refreshed === level ? undefined : level)}
                className={`py-3 px-4 rounded-xl text-sm font-medium capitalize transition-all border ${
                  refreshed === level
                    ? level === 'yes' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/50'
                      : level === 'somewhat'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                      : 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-surface-2 text-muted-foreground border-border/50 hover:border-border'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {level}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Sleep Inertia Duration */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Sleep inertia duration</h3>
          <div className="grid grid-cols-4 gap-2">
            {SLEEP_INERTIA_DURATIONS.map((duration) => (
              <motion.button
                key={duration}
                onClick={() => setSleepInertia(sleepInertia === duration ? undefined : duration)}
                className={`py-3 px-2 rounded-xl text-xs font-medium transition-all border ${
                  sleepInertia === duration
                    ? 'bg-domain-cognitive/20 text-domain-cognitive border-domain-cognitive/50'
                    : 'bg-surface-2 text-muted-foreground border-border/50 hover:border-border'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {duration}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Note */}
        <section className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Note (optional, max 140 chars)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 140))}
            placeholder="How did this nap feel..."
            className="input-field resize-none h-20"
            maxLength={140}
          />
          <span className="text-xs text-muted-foreground text-right block">
            {note.length}/140
          </span>
        </section>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || planned === undefined}
          className="w-full h-14 text-lg font-semibold bg-domain-sleep-pressure hover:bg-domain-sleep-pressure/90"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Nap'}
        </Button>
      </div>

      {/* Back Confirmation Dialog */}
      <AlertDialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-500" />
              Unsaved changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved nap data. Are you sure you want to go back?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { 
                setShowBackDialog(false);
                setTimeout(() => onBack(), 0);
              }}
            >
              Discard & go back
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Confirmation Animation */}
      <SaveConfirmation
        isVisible={saveConfirmation.isVisible}
        saveType={saveConfirmation.saveType}
        logType={saveConfirmation.logType}
      />
    </>
  );
}
