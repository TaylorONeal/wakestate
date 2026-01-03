import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveMedicationConfig } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { MEDICATION_SECTIONS, type MedicationInfo } from '@/components/MedicationsScreen';
import type { MedicationRegimen, MedicationFrequency, MedicationTiming, UserMedicationConfig } from '@/types';

interface MedicationSetupProps {
  onComplete: () => void;
  onBack?: () => void;
}

const FREQUENCY_OPTIONS: { value: MedicationFrequency; label: string; count: number }[] = [
  { value: '1x/day', label: '1x/day', count: 1 },
  { value: '2x/day', label: '2x/day', count: 2 },
  { value: '3x/day', label: '3x/day', count: 3 },
  { value: '4x/day', label: '4x/day', count: 4 },
  { value: 'PRN', label: 'As needed', count: 0 },
];

const TIMING_OPTIONS: { value: MedicationTiming; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'midday', label: 'Midday' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'bedtime', label: 'Bedtime' },
];

// Flatten all medications for selection
const ALL_MEDICATIONS = MEDICATION_SECTIONS.flatMap(section => 
  section.medications.map(med => ({
    ...med,
    sectionTitle: section.title,
  }))
);

type Step = 'select' | 'configure';

interface SelectedMedConfig {
  medicationId: string;
  brandName: string;
  genericName: string;
  doseOptions?: string[];
  dose: string;
  frequency: MedicationFrequency;
  timings: MedicationTiming[];
}

export function MedicationSetup({ onComplete, onBack }: MedicationSetupProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('select');
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());
  const [medConfigs, setMedConfigs] = useState<SelectedMedConfig[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);

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

  const proceedToConfig = () => {
    if (selectedMeds.size === 0) {
      toast({
        title: 'Select at least one medication',
        description: 'Pick the medications you take to continue.',
      });
      return;
    }

    // Initialize configs for selected meds
    const configs: SelectedMedConfig[] = Array.from(selectedMeds).map(medId => {
      const med = ALL_MEDICATIONS.find(m => m.id === medId)!;
      return {
        medicationId: medId,
        brandName: med.brandName,
        genericName: med.genericName,
        doseOptions: med.doseOptions,
        dose: med.doseOptions?.[0] || '',
        frequency: '1x/day',
        timings: ['morning'],
      };
    });

    setMedConfigs(configs);
    setCurrentConfigIndex(0);
    setStep('configure');
  };

  const updateCurrentConfig = (updates: Partial<SelectedMedConfig>) => {
    setMedConfigs(prev => {
      const next = [...prev];
      next[currentConfigIndex] = { ...next[currentConfigIndex], ...updates };
      return next;
    });
  };

  const toggleTiming = (timing: MedicationTiming) => {
    const current = medConfigs[currentConfigIndex];
    const newTimings = current.timings.includes(timing)
      ? current.timings.filter(t => t !== timing)
      : [...current.timings, timing];
    updateCurrentConfig({ timings: newTimings });
  };

  const handleNext = () => {
    if (currentConfigIndex < medConfigs.length - 1) {
      setCurrentConfigIndex(prev => prev + 1);
    } else {
      handleSave();
    }
  };

  const handlePrevious = () => {
    if (currentConfigIndex > 0) {
      setCurrentConfigIndex(prev => prev - 1);
    } else {
      setStep('select');
    }
  };

  const handleSave = async () => {
    const regimen: MedicationRegimen[] = medConfigs.map(config => ({
      medicationId: config.medicationId,
      brandName: config.brandName,
      genericName: config.genericName,
      defaultDose: config.dose,
      defaultFrequency: config.frequency,
      defaultTimings: config.timings,
      frequencyCount: FREQUENCY_OPTIONS.find(f => f.value === config.frequency)?.count || 1,
    }));

    const userConfig: UserMedicationConfig = {
      isConfigured: true,
      regimen,
      lastUpdated: new Date().toISOString(),
    };

    await saveMedicationConfig(userConfig);
    
    toast({
      title: 'Medications configured',
      description: 'You can now quickly log when you take them.',
    });
    
    onComplete();
  };

  const currentConfig = medConfigs[currentConfigIndex];

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
        <div>
          <h1 className="text-xl font-bold">Set Your Medications</h1>
          <p className="text-sm text-muted-foreground">
            Pick what you take so logging is one tap later. You can edit anytime.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Instructions */}
            <p className="text-sm text-muted-foreground">
              Select all the medications you currently take:
            </p>

            {/* Medication Grid */}
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

            {/* Continue Button */}
            <Button
              onClick={proceedToConfig}
              className="w-full"
              size="lg"
              disabled={selectedMeds.size === 0}
            >
              Continue with {selectedMeds.size} medication{selectedMeds.size !== 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Progress */}
            <div className="flex items-center gap-2">
              {medConfigs.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    idx <= currentConfigIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Current Med Header */}
            <div className="glass rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{currentConfig?.brandName}</h2>
                  <p className="text-sm text-muted-foreground">{currentConfig?.genericName}</p>
                </div>
              </div>
            </div>

            {/* Dose Selection */}
            {currentConfig?.doseOptions && (
              <div className="space-y-2">
                <Label>Default Dose</Label>
                <Select 
                  value={currentConfig.dose} 
                  onValueChange={(val) => updateCurrentConfig({ dose: val })}
                >
                  <SelectTrigger className="bg-surface-2">
                    <SelectValue placeholder="Select dose" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    {currentConfig.doseOptions.filter(d => d !== 'Other').map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Frequency Selection */}
            <div className="space-y-2">
              <Label>How often?</Label>
              <Select 
                value={currentConfig?.frequency} 
                onValueChange={(val) => updateCurrentConfig({ frequency: val as MedicationFrequency })}
              >
                <SelectTrigger className="bg-surface-2">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timing Chips */}
            <div className="space-y-2">
              <Label>Typical times</Label>
              <div className="flex flex-wrap gap-2">
                {TIMING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleTiming(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      currentConfig?.timings.includes(opt.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {currentConfigIndex < medConfigs.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}