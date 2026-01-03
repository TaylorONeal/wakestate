import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { saveMedicationConfig } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { MEDICATION_SECTIONS } from '@/components/MedicationsScreen';
import type { MedicationRegimen, UserMedicationConfig } from '@/types';

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
    // Create regimen with smart defaults - users can customize later in detailed page
    const regimen: MedicationRegimen[] = Array.from(selectedMeds).map(medId => {
      const med = ALL_MEDICATIONS.find(m => m.id === medId)!;
      return {
        medicationId: medId,
        brandName: med.brandName,
        genericName: med.genericName,
        defaultDose: med.doseOptions?.[0] || '',
        defaultFrequency: '1x/day',
        defaultTimings: ['morning'],
        frequencyCount: 1,
      };
    });

    const userConfig: UserMedicationConfig = {
      isConfigured: true,
      regimen,
      lastUpdated: new Date().toISOString(),
    };

    await saveMedicationConfig(userConfig);
    
    toast({
      title: 'Medications saved',
      description: 'Tap "Taken" on your home screen to log doses.',
    });
    
    onComplete();
  };

  const handleSkip = async () => {
    // Mark as configured but with empty regimen
    const userConfig: UserMedicationConfig = {
      isConfigured: true,
      regimen: [],
      lastUpdated: new Date().toISOString(),
    };
    await saveMedicationConfig(userConfig);
    onComplete();
  };

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
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
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

      {/* Single-step medication selection */}
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
                  onClick={() => toggleMedication(med.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
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
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleSave}
          className="w-full"
          size="lg"
          disabled={selectedMeds.size === 0}
        >
          <Check className="w-4 h-4 mr-2" />
          Done ({selectedMeds.size} selected)
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="w-full text-muted-foreground"
        >
          Skip for now
        </Button>
      </div>
    </motion.div>
  );
}