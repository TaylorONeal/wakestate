import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pill, Plus, Undo2, Clock, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getMedicationConfig, 
  getMedicationAdministrations, 
  saveMedicationAdministration,
  removeMedicationAdministration,
  getTodayAdministrations 
} from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import type { MedicationRegimen, MedicationAdministration, UserMedicationConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface MedicationsTodayProps {
  onSetupClick: () => void;
  refreshTrigger?: number;
}

interface MedStatus {
  med: MedicationRegimen;
  todayCount: number;
  targetCount: number;
  lastAdmin?: MedicationAdministration;
}

export function MedicationsToday({ onSetupClick, refreshTrigger }: MedicationsTodayProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<UserMedicationConfig | null>(null);
  const [medStatuses, setMedStatuses] = useState<MedStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoItem, setUndoItem] = useState<{ id: string; medId: string; timeout: NodeJS.Timeout } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const medConfig = await getMedicationConfig();
    setConfig(medConfig);

    if (medConfig?.isConfigured && medConfig.regimen.length > 0) {
      const statuses: MedStatus[] = await Promise.all(
        medConfig.regimen.map(async (med) => {
          const todayAdmins = await getTodayAdministrations(med.medicationId);
          return {
            med,
            todayCount: todayAdmins.length,
            targetCount: med.frequencyCount,
            lastAdmin: todayAdmins[0],
          };
        })
      );
      setMedStatuses(statuses);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handleTaken = async (med: MedicationRegimen) => {
    const now = new Date();
    const admin: MedicationAdministration = {
      id: uuidv4(),
      medicationId: med.medicationId,
      brandName: med.brandName,
      timestamp: now.toISOString(),
      localDate: now.toISOString().split('T')[0],
      localTime: now.toTimeString().slice(0, 5),
      doseSelected: med.defaultDose,
      adminNumberForDay: (medStatuses.find(s => s.med.medicationId === med.medicationId)?.todayCount || 0) + 1,
    };

    await saveMedicationAdministration(admin);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    toast({
      title: `${med.brandName} logged`,
      description: `${med.defaultDose} at ${admin.localTime}`,
    });

    // Set up undo
    if (undoItem) {
      clearTimeout(undoItem.timeout);
    }

    const timeout = setTimeout(() => {
      setUndoItem(null);
    }, 30000);

    setUndoItem({ id: admin.id, medId: med.medicationId, timeout });

    await loadData();
  };

  const handleUndo = async () => {
    if (!undoItem) return;

    clearTimeout(undoItem.timeout);
    await removeMedicationAdministration(undoItem.id);
    
    toast({
      title: 'Undone',
      description: 'Medication log removed.',
    });

    setUndoItem(null);
    await loadData();
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Not configured - show setup CTA
  if (!config?.isConfigured || config.regimen.length === 0) {
    return (
      <motion.button
        onClick={onSetupClick}
        className="w-full glass rounded-2xl p-5 text-left hover:bg-surface-2 transition-colors group"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Set up medications</h3>
            <p className="text-sm text-muted-foreground">One tap now, details later.</p>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Pill className="w-4 h-4 text-primary" />
          Medications Today
        </h3>
        {undoItem && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="text-primary hover:text-primary/80"
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
        )}
      </div>

      {/* Medication Cards */}
      <div className="space-y-2">
        {medStatuses.map(({ med, todayCount, targetCount, lastAdmin }) => {
          const isComplete = targetCount > 0 && todayCount >= targetCount;
          const isPRN = targetCount === 0;
          
          return (
            <motion.div
              key={med.medicationId}
              className={`rounded-xl p-3 flex items-center justify-between transition-colors ${
                isComplete ? 'bg-primary/10 border border-primary/30' : 'bg-surface-2'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Pill className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {med.brandName}
                    <span className="text-muted-foreground ml-1.5">{med.defaultDose}</span>
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {!isPRN && (
                      <span className={todayCount > 0 ? 'text-primary' : ''}>
                        {todayCount}/{targetCount}
                      </span>
                    )}
                    {isPRN && <span>As needed</span>}
                    {lastAdmin && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lastAdmin.localTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleTaken(med)}
                size="sm"
                variant={isComplete ? 'outline' : 'default'}
                className={`flex-shrink-0 ${isComplete ? 'border-primary/30' : ''}`}
              >
                <Check className="w-4 h-4 mr-1" />
                Taken
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Edit link */}
      <button
        onClick={onSetupClick}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <Edit2 className="w-3 h-3" />
        Edit medications
      </button>
    </div>
  );
}