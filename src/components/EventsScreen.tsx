import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEvents, deleteEvent } from '@/lib/storage';
import { type TrackingEvent } from '@/types';
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

type FilterPeriod = '7d' | '30d' | 'all';

interface EventsScreenProps {
  refreshTrigger: number;
  onAddEvent: () => void;
}

export function EventsScreen({ refreshTrigger, onAddEvent }: EventsScreenProps) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [filter, setFilter] = useState<FilterPeriod>('7d');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [refreshTrigger]);

  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    const date = parseISO(e.localDate);
    const days = filter === '7d' ? 7 : 30;
    return date >= subDays(new Date(), days);
  });

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEvent(deleteId);
      await loadEvents();
      setDeleteId(null);
    }
  };

  // Calculate frequency
  const thisWeekCount = events.filter(e => {
    const date = parseISO(e.localDate);
    return isWithinInterval(date, {
      start: subDays(new Date(), 7),
      end: new Date(),
    });
  }).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Add Event Button */}
      <Button
        onClick={onAddEvent}
        className="w-full h-12 gap-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
        variant="outline"
      >
        <Plus className="w-5 h-5" />
        Log Major Cataplexy Event
      </Button>

      {/* Stats */}
      <section className="section-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Event Frequency</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-xl bg-surface-3">
            <p className="text-2xl font-bold text-destructive">{thisWeekCount}</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-surface-3">
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <div className="flex gap-2">
        {(['7d', '30d', 'all'] as const).map((p) => (
          <Button
            key={p}
            variant={filter === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(p)}
            className="flex-1"
          >
            {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All'}
          </Button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No events recorded for this period</p>
            </motion.div>
          ) : (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="section-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold">Major Cataplexy</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(`${event.localDate}T${event.localTime}`), 'MMM d, h:mm a')}
                      </p>
                      
                      {event.severityTag && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive capitalize">
                          {event.severityTag}
                        </span>
                      )}
                      
                      {event.contextTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.contextTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-surface-3 text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {event.note && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{event.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(event.id)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
