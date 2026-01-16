import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ChevronDown, ChevronLeft, Save, RotateCcw, Zap, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DomainSlider } from '@/components/DomainSlider';
import { TagGroup } from '@/components/TagChip';
import { DateTimePicker } from '@/components/DateTimePicker';
import { SaveConfirmation } from '@/components/SaveConfirmation';
import { useSaveConfirmation } from '@/hooks/useSaveConfirmation';
import { saveCheckIn, deleteCheckIn, getSettings } from '@/lib/storage';
import { toast } from 'sonner';
import {
  NARCOLEPSY_DOMAIN_CONFIG,
  OVERLAPPING_DOMAIN_CONFIG,
  TAGS,
  type NarcolepsyDomains,
  type OverlappingDomains,
  type WakeDomains,
  type ContextDomains,
  type CheckIn,
  type AppSettings,
} from '@/types';
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

const defaultNarcolepsyDomains: NarcolepsyDomains = {
  sleepPressure: 1,
  microsleeps: 1,
  sleepInertia: 1,
  cognitive: 1,
  effort: 1,
};

const defaultOverlappingDomains: OverlappingDomains = {
  anxiety: 1,
  mood: 1,
  digestive: 1,
  thermo: 1,
  motor: 1,
  emotional: 1,
  sensory: 1,
};

// Convert to legacy format for backward compatibility
const toLegacyWakeDomains = (narcolepsy: NarcolepsyDomains, overlapping: OverlappingDomains): WakeDomains => ({
  sleepPressure: narcolepsy.sleepPressure,
  microsleeps: narcolepsy.microsleeps,
  cognitive: narcolepsy.cognitive,
  effort: narcolepsy.effort,
  cataplexy: 1, // No longer tracked via slider
  motor: overlapping.motor,
  sensory: overlapping.sensory,
  thermo: overlapping.thermo,
  emotional: overlapping.emotional,
});

const toLegacyContextDomains = (overlapping: OverlappingDomains): ContextDomains => ({
  anxiety: overlapping.anxiety,
  mood: overlapping.mood,
  digestive: overlapping.digestive,
});

const DRAFT_STORAGE_KEY = 'wakestate_checkin_draft_v2';

interface CheckInDraft {
  dateTime: string;
  narcolepsyDomains: NarcolepsyDomains;
  overlappingDomains: OverlappingDomains;
  activeTags: string[];
  note: string;
  overlappingExpanded: boolean;
}

interface CheckInScreenProps {
  onEventClick: () => void;
  onSave: () => void;
  onNavigateToTrends: () => void;
  onBack: () => void;
}

export function CheckInScreen({ onEventClick, onSave, onNavigateToTrends, onBack }: CheckInScreenProps) {
  const saveConfirmation = useSaveConfirmation();
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedIdRef = useRef<string | null>(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [narcolepsyDomains, setNarcolepsyDomains] = useState<NarcolepsyDomains>(defaultNarcolepsyDomains);
  const [overlappingDomains, setOverlappingDomains] = useState<OverlappingDomains>(defaultOverlappingDomains);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [overlappingExpanded, setOverlappingExpanded] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft: CheckInDraft = JSON.parse(savedDraft);
        setDateTime(new Date(draft.dateTime));
        setNarcolepsyDomains(draft.narcolepsyDomains);
        setOverlappingDomains(draft.overlappingDomains);
        setActiveTags(draft.activeTags);
        setNote(draft.note);
        setShowNote(draft.note.length > 0);
        setOverlappingExpanded(draft.overlappingExpanded);
        setDraftRestored(true);
        toast.info('Draft restored', {
          description: 'Your previous check-in was recovered',
        });
      } catch (e) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } else {
      getSettings().then((settings: AppSettings) => {
        setOverlappingExpanded(settings.showContextByDefault);
      });
    }
  }, []);

  // Auto-save draft when values change
  useEffect(() => {
    if (draftRestored || hasChanges()) {
      const draft: CheckInDraft = {
        dateTime: dateTime.toISOString(),
        narcolepsyDomains,
        overlappingDomains,
        activeTags,
        note,
        overlappingExpanded,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [dateTime, narcolepsyDomains, overlappingDomains, activeTags, note, overlappingExpanded]);

  // Check if form has unsaved changes
  const hasChanges = () => {
    const narcoChanged = Object.keys(narcolepsyDomains).some(
      (key) => narcolepsyDomains[key as keyof NarcolepsyDomains] !== 1
    );
    const overlappingChanged = overlappingExpanded && Object.keys(overlappingDomains).some(
      (key) => overlappingDomains[key as keyof OverlappingDomains] !== 1
    );
    return narcoChanged || overlappingChanged || activeTags.length > 0 || note.trim().length > 0;
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowBackDialog(true);
    } else {
      onBack();
    }
  };

  const updateNarcolepsyDomain = (key: keyof NarcolepsyDomains, value: number) => {
    setNarcolepsyDomains(prev => ({ ...prev, [key]: value }));
  };

  const updateOverlappingDomain = (key: keyof OverlappingDomains, value: number) => {
    setOverlappingDomains(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    const checkInId = uuidv4();
    const checkIn: CheckIn = {
      id: checkInId,
      createdAt: new Date().toISOString(),
      localDate: format(dateTime, 'yyyy-MM-dd'),
      localTime: format(dateTime, 'HH:mm'),
      narcolepsyDomains,
      overlappingDomains: overlappingExpanded ? overlappingDomains : undefined,
      // Legacy format for backward compatibility
      wakeDomains: toLegacyWakeDomains(narcolepsyDomains, overlappingExpanded ? overlappingDomains : defaultOverlappingDomains),
      contextDomains: overlappingExpanded ? toLegacyContextDomains(overlappingDomains) : undefined,
      tags: activeTags,
      note: note.trim() || undefined,
    };

    await saveCheckIn(checkIn);
    lastSavedIdRef.current = checkInId;

    // Trigger save animation (wake-related, always new for check-ins)
    saveConfirmation.trigger('new', 'wake');

    // Show toast with undo action
    toast.success('Check-in saved', {
      description: `Recorded at ${format(dateTime, 'h:mm a')}`,
      action: {
        label: 'Undo',
        onClick: async () => {
          // Cancel navigation if still pending
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
          }
          // Delete the saved check-in
          if (lastSavedIdRef.current) {
            await deleteCheckIn(lastSavedIdRef.current);
            lastSavedIdRef.current = null;
            toast.info('Check-in removed');
            onSave(); // Refresh data
          }
        },
      },
      duration: 5000, // 5 seconds to undo
    });

    handleReset();
    setIsSaving(false);
    onSave();

    // Delay navigation to let animation complete
    navigationTimeoutRef.current = setTimeout(() => {
      onNavigateToTrends();
    }, 1600);
  };

  const handleReset = () => {
    setDateTime(new Date());
    setNarcolepsyDomains(defaultNarcolepsyDomains);
    setOverlappingDomains(defaultOverlappingDomains);
    setActiveTags([]);
    setNote('');
    setShowNote(false);
    setShowResetDialog(false);
    setDraftRestored(false);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  // Order for overlapping domains (sensory last)
  const overlappingDomainOrder: (keyof OverlappingDomains)[] = [
    'anxiety', 'mood', 'digestive', 'thermo', 'motor', 'emotional', 'sensory'
  ];

  return (
    <div className="space-y-6 pb-24 overscroll-y-contain">
      {/* Back Button */}
      <motion.button
        onClick={handleBackClick}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-1"
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </motion.button>

      {/* Date/Time Picker */}
      <DateTimePicker date={dateTime} onChange={setDateTime} />

      {/* Narcolepsy-Related Symptoms Section */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="section-card border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Narcolepsy-Related</h2>
          </div>
          
          <div className="space-y-4">
            {(Object.keys(NARCOLEPSY_DOMAIN_CONFIG) as Array<keyof NarcolepsyDomains>).map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
              >
                <DomainSlider
                  domainKey={key}
                  config={NARCOLEPSY_DOMAIN_CONFIG[key]}
                  value={narcolepsyDomains[key]}
                  onChange={(val) => updateNarcolepsyDomain(key, val)}
                />
              </motion.div>
            ))}
          </div>

          {/* Cataplexy Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-4 border-t border-border/50"
          >
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-domain-cataplexy" />
              <p>
                <span className="text-domain-cataplexy font-medium">Cataplexy</span> is logged as an event, not a slider.{' '}
                <button 
                  onClick={onEventClick}
                  className="text-primary hover:underline font-medium"
                >
                  Log cataplexy event →
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Context Modulators Section */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setOverlappingExpanded(!overlappingExpanded)}
          className="w-full flex items-center justify-between py-2 text-left group"
        >
          <div>
            <h2 className="text-base font-medium text-muted-foreground">
              Other / Overlapping Symptoms
            </h2>
            {!overlappingExpanded && (
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Tap to expand
              </p>
            )}
          </div>
          <motion.div
            animate={{ rotate: overlappingExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {overlappingExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="section-card border-border/30 space-y-4">
                {overlappingDomainOrder.map((key) => (
                  <DomainSlider
                    key={key}
                    domainKey={key}
                    config={OVERLAPPING_DOMAIN_CONFIG[key]}
                    value={overlappingDomains[key]}
                    onChange={(val) => updateOverlappingDomain(key, val)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Tags Section */}
      <motion.section
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground">Tags (optional)</h3>
        <TagGroup
          tags={TAGS}
          activeTags={activeTags}
          onToggle={toggleTag}
        />
      </motion.section>

      {/* Note Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {!showNote ? (
          <Button
            variant="ghost"
            onClick={() => setShowNote(true)}
            className="w-full justify-start text-muted-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Add note
          </Button>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Note (optional, max 140 chars)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 140))}
              placeholder="Quick note about this moment..."
              className="input-field resize-none h-20"
              maxLength={140}
            />
            <span className="text-xs text-muted-foreground text-right block">
              {note.length}/140
            </span>
          </div>
        )}
      </motion.section>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col gap-3 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-14 text-lg font-semibold glow-primary"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Check-In'}
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onEventClick}
            className="flex-1 h-12 gap-2 border-domain-cataplexy/50 text-domain-cataplexy hover:bg-domain-cataplexy/10"
          >
            <Zap className="w-4 h-4" />
            Log Event
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setShowResetDialog(true)}
            className="flex-1 h-12 gap-2 text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </motion.div>

      {/* Back Confirmation Dialog */}
      <AlertDialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-500" />
              Unsaved changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved check-in data. Are you sure you want to go back? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { 
                localStorage.removeItem(DRAFT_STORAGE_KEY);
                setShowBackDialog(false);
                setTimeout(() => onBack(), 0);
              }}
            >
              Discard & go back
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear check-in?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all sliders and tags to their defaults.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Confirmation Animation */}
      <SaveConfirmation
        isVisible={saveConfirmation.isVisible}
        saveType={saveConfirmation.saveType}
        logType={saveConfirmation.logType}
      />
    </div>
  );
}
