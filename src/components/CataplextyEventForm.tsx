import { useState } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Zap, Save, ChevronLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TagGroup } from '@/components/TagChip';
import { DateTimePicker } from '@/components/DateTimePicker';
import { useToast } from '@/hooks/use-toast';
import { saveEvent } from '@/lib/storage';
import { EMOTION_TAGS, ACTIVITY_TAGS, type TrackingEvent, type SeverityTag } from '@/types';
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

interface CataplextyEventFormProps {
  onClose: () => void;
  onBack: () => void;
  onSave: () => void;
}

export function CataplextyEventForm({ onClose, onBack, onSave }: CataplextyEventFormProps) {
  const { toast } = useToast();
  const [dateTime, setDateTime] = useState(new Date());
  const [severity, setSeverity] = useState<SeverityTag | undefined>();
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [activityTags, setActivityTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);

  const hasChanges = () => {
    return severity !== undefined || 
           emotionTags.length > 0 || 
           activityTags.length > 0 || 
           note.trim().length > 0;
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowBackDialog(true);
    } else {
      onBack();
    }
  };

  const toggleEmotionTag = (tag: string) => {
    setEmotionTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleActivityTag = (tag: string) => {
    setActivityTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!severity) {
      toast({
        title: 'Please select severity',
        description: 'Choose mild, moderate, or severe',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const event: TrackingEvent = {
      id: uuidv4(),
      type: 'cataplexy',
      createdAt: new Date().toISOString(),
      localDate: format(dateTime, 'yyyy-MM-dd'),
      localTime: format(dateTime, 'HH:mm'),
      severityTag: severity,
      emotionTriggers: emotionTags,
      activityContext: activityTags,
      contextTags: [...emotionTags, ...activityTags],
      note: note.trim() || undefined,
    };

    await saveEvent(event);
    
    toast({
      title: 'Cataplexy event logged',
      description: `${severity} episode recorded`,
    });

    setIsSaving(false);
    onSave();
    onClose();
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
          <div className="w-10 h-10 rounded-xl bg-domain-cataplexy/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-domain-cataplexy" />
          </div>
          <h1 className="text-xl font-bold">Log Cataplexy</h1>
        </div>

        {/* Date/Time */}
        <DateTimePicker date={dateTime} onChange={setDateTime} />

        {/* Severity */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            Severity <span className="text-destructive">*</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(['mild', 'moderate', 'severe'] as const).map((sev) => (
              <motion.button
                key={sev}
                onClick={() => setSeverity(severity === sev ? undefined : sev)}
                className={`py-3 px-4 rounded-xl text-sm font-medium capitalize transition-all border ${
                  severity === sev 
                    ? 'bg-domain-cataplexy/20 text-domain-cataplexy border-domain-cataplexy/50' 
                    : 'bg-surface-2 text-muted-foreground border-border/50 hover:border-border'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {sev}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Emotion Triggers */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Emotion trigger</h3>
          <TagGroup
            tags={EMOTION_TAGS}
            activeTags={emotionTags}
            onToggle={toggleEmotionTag}
            variant="emotion"
          />
        </section>

        {/* Activity Context */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Activity context</h3>
          <TagGroup
            tags={ACTIVITY_TAGS}
            activeTags={activityTags}
            onToggle={toggleActivityTag}
            variant="activity"
          />
        </section>

        {/* Note */}
        <section className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Note (optional, max 140 chars)
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 140))}
            placeholder="What happened..."
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
          disabled={isSaving || !severity}
          className="w-full h-14 text-lg font-semibold bg-domain-cataplexy hover:bg-domain-cataplexy/90"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Saving...' : 'Save Cataplexy Event'}
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
              You have unsaved event data. Are you sure you want to go back?
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
    </>
  );
}
