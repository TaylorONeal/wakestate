import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ChevronDown, ChevronLeft, Save, RotateCcw, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DomainSlider } from '@/components/DomainSlider';
import { TagGroup } from '@/components/TagChip';
import { DateTimePicker } from '@/components/DateTimePicker';
import { useToast } from '@/hooks/use-toast';
import { saveCheckIn, getSettings } from '@/lib/storage';
import {
  WAKE_DOMAIN_CONFIG,
  CONTEXT_DOMAIN_CONFIG,
  TAGS,
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

const defaultWakeDomains: WakeDomains = {
  cataplexy: 1,
  microsleeps: 1,
  cognitive: 1,
  effort: 1,
  sleepPressure: 1,
  motor: 1,
  sensory: 1,
  thermo: 1,
  emotional: 1,
};

const defaultContextDomains: ContextDomains = {
  anxiety: 1,
  mood: 1,
  digestive: 1,
};

const DRAFT_STORAGE_KEY = 'waketrack_checkin_draft';

interface CheckInDraft {
  dateTime: string;
  wakeDomains: WakeDomains;
  contextDomains: ContextDomains;
  activeTags: string[];
  note: string;
  contextExpanded: boolean;
}

interface CheckInScreenProps {
  onEventClick: () => void;
  onSave: () => void;
  onNavigateToTrends: () => void;
  onBack: () => void;
}

export function CheckInScreen({ onEventClick, onSave, onNavigateToTrends, onBack }: CheckInScreenProps) {
  const { toast } = useToast();
  const [dateTime, setDateTime] = useState(new Date());
  const [wakeDomains, setWakeDomains] = useState<WakeDomains>(defaultWakeDomains);
  const [contextDomains, setContextDomains] = useState<ContextDomains>(defaultContextDomains);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [contextExpanded, setContextExpanded] = useState(false);
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
        setWakeDomains(draft.wakeDomains);
        setContextDomains(draft.contextDomains);
        setActiveTags(draft.activeTags);
        setNote(draft.note);
        setShowNote(draft.note.length > 0);
        setContextExpanded(draft.contextExpanded);
        setDraftRestored(true);
        toast({
          title: 'Draft restored',
          description: 'Your previous check-in was recovered',
        });
      } catch (e) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } else {
      getSettings().then((settings: AppSettings) => {
        setContextExpanded(settings.showContextByDefault);
      });
    }
  }, []);

  // Auto-save draft when values change
  useEffect(() => {
    if (draftRestored || hasChanges()) {
      const draft: CheckInDraft = {
        dateTime: dateTime.toISOString(),
        wakeDomains,
        contextDomains,
        activeTags,
        note,
        contextExpanded,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [dateTime, wakeDomains, contextDomains, activeTags, note, contextExpanded]);

  // Check if form has unsaved changes
  const hasChanges = () => {
    const wakeChanged = Object.keys(wakeDomains).some(
      (key) => wakeDomains[key as keyof WakeDomains] !== 1
    );
    const contextChanged = contextExpanded && Object.keys(contextDomains).some(
      (key) => contextDomains[key as keyof ContextDomains] !== 1
    );
    return wakeChanged || contextChanged || activeTags.length > 0 || note.trim().length > 0;
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowBackDialog(true);
    } else {
      onBack();
    }
  };

  const updateWakeDomain = (key: keyof WakeDomains, value: number) => {
    setWakeDomains(prev => ({ ...prev, [key]: value }));
  };

  const updateContextDomain = (key: keyof ContextDomains, value: number) => {
    setContextDomains(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const checkIn: CheckIn = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      localDate: format(dateTime, 'yyyy-MM-dd'),
      localTime: format(dateTime, 'HH:mm'),
      wakeDomains,
      contextDomains: contextExpanded ? contextDomains : undefined,
      tags: activeTags,
      note: note.trim() || undefined,
    };

    await saveCheckIn(checkIn);
    
    toast({
      title: 'Check-in saved',
      description: `Recorded at ${format(dateTime, 'h:mm a')}`,
    });

    handleReset();
    setIsSaving(false);
    onSave();
    onNavigateToTrends();
  };

  const handleReset = () => {
    setDateTime(new Date());
    setWakeDomains(defaultWakeDomains);
    setContextDomains(defaultContextDomains);
    setActiveTags([]);
    setNote('');
    setShowNote(false);
    setShowResetDialog(false);
    setDraftRestored(false);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

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

      {/* Wake-State Section */}
      <motion.section
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-primary">Wake-State</h2>
        
        <div className="space-y-4">
          {(Object.keys(WAKE_DOMAIN_CONFIG) as Array<keyof WakeDomains>).map((key, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
            >
              <DomainSlider
                domainKey={key}
                config={WAKE_DOMAIN_CONFIG[key]}
                value={wakeDomains[key]}
                onChange={(val) => updateWakeDomain(key, val)}
              />
            </motion.div>
          ))}
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
          onClick={() => setContextExpanded(!contextExpanded)}
          className="w-full flex items-center justify-between py-2 text-left"
        >
          <h2 className="text-lg font-semibold text-muted-foreground">
            Context Modulators
          </h2>
          <motion.div
            animate={{ rotate: contextExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {contextExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-4"
            >
              {(Object.keys(CONTEXT_DOMAIN_CONFIG) as Array<keyof ContextDomains>).map((key) => (
                <DomainSlider
                  key={key}
                  domainKey={key}
                  config={CONTEXT_DOMAIN_CONFIG[key]}
                  value={contextDomains[key]}
                  onChange={(val) => updateContextDomain(key, val)}
                />
              ))}
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
            className="flex-1 h-12 gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
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
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
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
    </div>
  );
}
