import { useState } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { AlertTriangle, Save, ChevronLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TagGroup } from '@/components/TagChip';
import { DateTimePicker } from '@/components/DateTimePicker';
import { useToast } from '@/hooks/use-toast';
import { saveEvent } from '@/lib/storage';
import { 
  EVENT_TYPES, 
  EMOTION_TAGS, 
  ACTIVITY_TAGS, 
  type TrackingEvent, 
  type SeverityTag,
  type EventType 
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EventFormProps {
  onClose: () => void;
  onSave: () => void;
}

// Group events by category
const eventsByCategory = EVENT_TYPES.reduce((acc, event) => {
  if (!acc[event.category]) {
    acc[event.category] = [];
  }
  acc[event.category].push(event);
  return acc;
}, {} as Record<string, typeof EVENT_TYPES[number][]>);

const categoryLabels: Record<string, string> = {
  cataplexy: '⚡ Cataplexy',
  sleep: '😴 Sleep Episodes',
  parasomnia: '🌙 Parasomnias',
  cognitive: '🧠 Cognitive',
  treatment: '💊 Treatment',
  trigger: '⚠️ Triggers',
  activity: '🏃 Activity',
  safety: '🚗 Safety',
};

export function EventForm({ onClose, onSave }: EventFormProps) {
  const { toast } = useToast();
  const [eventType, setEventType] = useState<EventType>('major-cataplexy');
  const [dateTime, setDateTime] = useState(new Date());
  const [severityTag, setSeverityTag] = useState<SeverityTag | undefined>();
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [activityTags, setActivityTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);

  // Check if form has unsaved changes
  const hasChanges = () => {
    return severityTag !== undefined || 
           emotionTags.length > 0 || 
           activityTags.length > 0 || 
           note.trim().length > 0;
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowBackDialog(true);
    } else {
      onClose();
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
    setIsSaving(true);

    const event: TrackingEvent = {
      id: uuidv4(),
      type: eventType,
      createdAt: new Date().toISOString(),
      localDate: format(dateTime, 'yyyy-MM-dd'),
      localTime: format(dateTime, 'HH:mm'),
      severityTag,
      contextTags: [...emotionTags, ...activityTags],
      note: note.trim() || undefined,
    };

    await saveEvent(event);
    
    const eventLabel = EVENT_TYPES.find(e => e.id === eventType)?.label || 'Event';
    toast({
      title: 'Event logged',
      description: `${eventLabel} recorded`,
    });

    setIsSaving(false);
    onSave();
    onClose();
  };

  const selectedEventLabel = EVENT_TYPES.find(e => e.id === eventType)?.label || 'Select event type';

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="min-h-screen p-4 max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={handleBackClick}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-1"
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h1 className="text-xl font-bold">Log Event</h1>
            </div>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>

          <div className="space-y-6">
            {/* Event Type Dropdown */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Event Type</h2>
              <Select value={eventType} onValueChange={(val) => setEventType(val as EventType)}>
                <SelectTrigger className="w-full h-14 text-left bg-card border-border">
                  <SelectValue placeholder="Select event type">
                    {selectedEventLabel}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-[60vh]">
                  {Object.entries(eventsByCategory).map(([category, events]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-2">
                        {categoryLabels[category] || category}
                      </SelectLabel>
                      {events.map((event) => (
                        <SelectItem 
                          key={event.id} 
                          value={event.id}
                          className="py-3 cursor-pointer"
                        >
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {/* Date/Time */}
            <DateTimePicker date={dateTime} onChange={setDateTime} />

            {/* Severity */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Severity (optional)</h3>
              <div className="flex gap-2">
                {(['mild', 'moderate', 'severe'] as const).map((severity) => (
                  <motion.button
                    key={severity}
                    onClick={() => setSeverityTag(severityTag === severity ? undefined : severity)}
                    className={`chip flex-1 capitalize ${
                      severityTag === severity ? 'bg-destructive/20 text-destructive border-destructive/50' : ''
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {severity}
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Emotion Triggers */}
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Emotion triggers</h3>
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
              disabled={isSaving}
              className="w-full h-14 text-lg font-semibold bg-destructive hover:bg-destructive/90"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Event'}
            </Button>
          </div>
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
              You have unsaved event data. Are you sure you want to go back? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { 
                setShowBackDialog(false);
                setTimeout(() => onClose(), 0);
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
