import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, isThisWeek, subDays } from 'date-fns';
import { ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCheckIns, deleteCheckIn } from '@/lib/storage';
import { WAKE_DOMAIN_CONFIG, type CheckIn, type WakeDomainKey } from '@/types';
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

type FilterPeriod = 'today' | '7d' | '30d';

const colorMap: Record<string, string> = {
  'domain-cataplexy': 'bg-domain-cataplexy',
  'domain-microsleeps': 'bg-domain-microsleeps',
  'domain-cognitive': 'bg-domain-cognitive',
  'domain-effort': 'bg-domain-effort',
  'domain-sleep-pressure': 'bg-domain-sleep-pressure',
  'domain-motor': 'bg-domain-motor',
  'domain-sensory': 'bg-domain-sensory',
  'domain-thermo': 'bg-domain-thermo',
  'domain-emotional': 'bg-domain-emotional',
};

interface TimelineScreenProps {
  refreshTrigger: number;
}

export function TimelineScreen({ refreshTrigger }: TimelineScreenProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [filter, setFilter] = useState<FilterPeriod>('today');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadCheckIns();
  }, [refreshTrigger]);

  const loadCheckIns = async () => {
    const data = await getCheckIns();
    setCheckIns(data);
  };

  const filteredCheckIns = checkIns.filter((c) => {
    const date = parseISO(c.localDate);
    switch (filter) {
      case 'today':
        return isToday(date);
      case '7d':
        return date >= subDays(new Date(), 7);
      case '30d':
        return date >= subDays(new Date(), 30);
      default:
        return true;
    }
  });

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCheckIn(deleteId);
      await loadCheckIns();
      setDeleteId(null);
      setExpandedId(null);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        {(['today', '7d', '30d'] as const).map((period) => (
          <Button
            key={period}
            variant={filter === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(period)}
            className="flex-1"
          >
            {period === 'today' ? 'Today' : period}
          </Button>
        ))}
      </div>

      {/* Check-in List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredCheckIns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              No check-ins for this period
            </motion.div>
          ) : (
            filteredCheckIns.map((checkIn, index) => (
              <motion.div
                key={checkIn.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="section-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === checkIn.id ? null : checkIn.id)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="font-semibold">
                        {format(parseISO(`${checkIn.localDate}T${checkIn.localTime}`), 'h:mm a')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(checkIn.localDate), 'MMM d')}
                      </p>
                    </div>
                  </div>

                  {/* Mini domain bars */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {(Object.keys(checkIn.wakeDomains) as WakeDomainKey[]).slice(0, 5).map((key) => {
                        const value = checkIn.wakeDomains[key];
                        const config = WAKE_DOMAIN_CONFIG[key];
                        const bgClass = colorMap[config.color] || 'bg-primary';
                        
                        return (
                          <div
                            key={key}
                            className={`w-1.5 rounded-full ${bgClass}`}
                            style={{ 
                              height: `${8 + value * 4}px`,
                              opacity: 0.4 + value * 0.12 
                            }}
                          />
                        );
                      })}
                    </div>

                    <motion.div
                      animate={{ rotate: expandedId === checkIn.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === checkIn.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-border/50 space-y-4">
                        {/* Wake Domains */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Wake State
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(checkIn.wakeDomains) as WakeDomainKey[]).map((key) => {
                              const config = WAKE_DOMAIN_CONFIG[key];
                              const value = checkIn.wakeDomains[key];
                              const bgClass = colorMap[config.color] || 'bg-primary';
                              
                              return (
                                <div key={key} className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${bgClass}`} />
                                  <span className="text-xs text-muted-foreground truncate flex-1">
                                    {config.label.split(' —')[0]}
                                  </span>
                                  <span className="text-xs font-medium">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tags */}
                        {checkIn.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {checkIn.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-1 rounded-full bg-surface-3 text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Note */}
                        {checkIn.note && (
                          <p className="text-sm text-muted-foreground italic">
                            "{checkIn.note}"
                          </p>
                        )}

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(checkIn.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete check-in?</AlertDialogTitle>
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
