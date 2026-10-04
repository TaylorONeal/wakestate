import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMedicationConfig, saveMedicationConfig } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { MEDICATION_SECTIONS } from '@/components/MedicationsScreen';
import { createMedicationRegimen } from '@/lib/medicationRegimen';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MedicationFrequency, MedicationRegimen, UserMedicationConfig } from '@/types';

interface MedicationSetupProps {
  onComplete: () => void;
  onBack?: () => void;
}

// Flatten all medications for selection
const ALL_MEDICATIONS = MEDICATION_SECTIONS.flatMap(section => 
  section.medications.map(med => ({
    ...med,
    sectionTitle: section.title,
  }))
);

export function MedicationSetup({ onComplete, onBack }: MedicationSetupProps) {
  const { toast } = useToast();
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());

  const [previous, setPrevious] = useState<Record<string, MedicationRegimen>>({});
  const [doses, setDoses] = useState<Record<string, string>>({});
  const [frequencies, setFrequencies] = useState<Record<string, MedicationFrequency>>({});
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  useEffect(() => {
    let active = true;
    getMedicationConfig().then(config => {
      if (!active) return;
      const regimen = config?.regimen ?? [];
      setPrevious(Object.fromEntries(regimen.map(m => [m.medicationId, m])));
      setSelectedMeds(new Set(regimen.map(m => m.medicationId)));
      setDoses(Object.fromEntries(regimen.map(m => [m.medicationId, m.defaultDose])));
      setFrequencies(Object.fromEntries(regimen.map(m => [m.medicationId, m.defaultFrequency])));
    }).catch(() => { if (active) setLoadFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const savingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const persistConfig = async (regimen: MedicationRegimen[]) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const userConfig: UserMedicationConfig = {
        isConfigured: true, regimen, lastUpdated: new Date().toISOString(),
      };
      await saveMedicationConfig(userConfig);
      toast({ title: regimen.length ? "Medications saved" : "Setup skipped" });
      onComplete();
    } catch {
      toast({ title: "Setup was not saved", description: "Your selection is still here. Please try again.", variant: "destructive" });
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const toggleMedication = (medId: string) => {
    setSelectedMeds(prev => {
      const next = new Set(prev);
      if (next.has(medId)) {
        next.delete(medId);
      } else {
        next.add(medId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (loading || loadFailed) return;
    const regimen = Array.from(selectedMeds).map(medId => {
      const med = ALL_MEDICATIONS.find(m => m.id === medId);
      if (!med) throw new Error('Unknown medication. Your saved selection has not been changed.');
      return createMedicationRegimen(med, doses[medId] ?? '', frequencies[medId] ?? 'other', previous[medId]);
    });

    await persistConfig(regimen);
  };

  const handleSkip = () => onComplete();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-24"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" aria-label="Back" onClick={onBack} disabled={isSaving} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">WakeState</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Select your medications for quick logging
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Record the dose on your existing prescription. This app does not recommend doses or schedules.</p>
      {loadFailed && <p role="alert">Could not load your saved medications. Go back and try again; nothing has been changed.</p>}
      {/* Medication selection */}
      <div className="space-y-4">
        {MEDICATION_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {section.icon}
              {section.title}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {section.medications.map((med) => (
                <motion.button
                  key={med.id}
                  aria-pressed={selectedMeds.has(med.id)}
                  disabled={isSaving || loading || loadFailed}
                  onClick={() => toggleMedication(med.id)}
                  className={`group relative overflow-visible p-3 rounded-xl border-2 transition-all text-left ${
                    selectedMeds.has(med.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface-2 hover:bg-surface-3'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedMeds.has(med.id)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedMeds.has(med.id) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{med.brandName}</p>
                      <p className="text-xs text-muted-foreground truncate">{med.genericName}</p>
                    </div>
                  </div>

                  {med.mechanism && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-full mt-2 hidden group-hover:block z-50 max-w-xs rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md animate-fade-in"
                    >
                      {med.mechanism}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Array.from(selectedMeds).map(id => {
        const med = ALL_MEDICATIONS.find(item => item.id === id);
        if (!med) return <p key={id} role="alert">An existing medication is unavailable. Go back before changing your setup.</p>;
        return <section key={id} className="section-card space-y-3">
          <h3 className="font-medium">{med.brandName}</h3>
          <Label htmlFor={`dose-${id}`}>Dose on your prescription</Label>
          <Input id={`dose-${id}`} value={doses[id] ?? ''} onChange={event => setDoses(current => ({ ...current, [id]: event.target.value }))} disabled={isSaving} placeholder="Enter your prescribed dose" />
          <Label htmlFor={`frequency-${id}`}>Frequency on your prescription</Label>
          <select id={`frequency-${id}`} className="w-full rounded-md border border-input bg-background p-2" value={frequencies[id] ?? 'other'} disabled={isSaving} onChange={event => setFrequencies(current => ({ ...current, [id]: event.target.value as MedicationFrequency }))}>
            <option value="other">No daily target specified</option>
            <option value="1x/day">1x/day</option><option value="2x/day">2x/day</option><option value="3x/day">3x/day</option><option value="4x/day">4x/day</option><option value="PRN">As needed (PRN)</option>
          </select>
        </section>;
      })}
      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleSave}
          className="w-full"
          size="lg"
          disabled={isSaving || loading || loadFailed || selectedMeds.size === 0 || Array.from(selectedMeds).some(id => !doses[id]?.trim() || !ALL_MEDICATIONS.some(m => m.id === id))}
        >
          <Check className="w-4 h-4 mr-2" />
          {isSaving ? "Saving…" : `Done (${selectedMeds.size} selected)`}
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleSkip}
          disabled={isSaving}
          className="w-full text-muted-foreground"
        >
          Skip for now
        </Button>
      </div>
    </motion.div>
  );
}