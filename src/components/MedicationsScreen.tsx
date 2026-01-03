import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, Pill, FlaskConical, Moon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { getUserMedications, saveMedicationEntry, removeMedicationEntry } from '@/lib/storage';
import type { MedicationEntry, UserMedications, MedicationFrequency, MedicationTiming } from '@/types';

interface MedicationsScreenProps {
  onBack: () => void;
}

interface MedicationInfo {
  id: string;
  brandName: string;
  genericName: string;
  mechanism?: string;
  description: string;
  manufacturerUrl: string;
  doseOptions?: string[];
}

interface MedicationSection {
  title: string;
  icon: React.ReactNode;
  description?: string;
  medications: MedicationInfo[];
}

const FREQUENCY_OPTIONS: { value: MedicationFrequency; label: string }[] = [
  { value: '1x/day', label: '1x/day' },
  { value: '2x/day', label: '2x/day' },
  { value: '3x/day', label: '3x/day' },
  { value: '4x/day', label: '4x/day' },
  { value: 'PRN', label: 'As needed (PRN)' },
  { value: 'other', label: 'Other' },
];

const TIMING_OPTIONS: { value: MedicationTiming; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'midday', label: 'Midday' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'bedtime', label: 'Bedtime' },
];

const MEDICATION_SECTIONS: MedicationSection[] = [
  {
    title: 'Stimulants & Wake-Promoting Medications',
    icon: <Pill className="w-5 h-5" />,
    medications: [
      {
        id: 'adderall',
        brandName: 'Adderall',
        genericName: 'amphetamine / dextroamphetamine',
        mechanism: 'Dopamine & norepinephrine releasing agent',
        description: 'Adderall is a central nervous system stimulant that increases dopamine and norepinephrine to improve focus and wakefulness.',
        manufacturerUrl: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/011522s043lbl.pdf',
        doseOptions: ['5 mg', '10 mg', '15 mg', '20 mg', '25 mg', '30 mg', 'Other'],
      },
      {
        id: 'ritalin',
        brandName: 'Ritalin',
        genericName: 'methylphenidate',
        mechanism: 'Dopamine & norepinephrine reuptake inhibitor',
        description: 'Ritalin is a stimulant that increases dopamine activity to help with focus, attention, and wakefulness.',
        manufacturerUrl: 'https://www.novartis.com/us-en/our-products',
        doseOptions: ['5 mg', '10 mg', '20 mg', 'Other'],
      },
      {
        id: 'dexedrine',
        brandName: 'Dexedrine',
        genericName: 'dextroamphetamine',
        mechanism: 'Dopamine & norepinephrine releasing agent',
        description: 'Dexedrine is a stimulant that promotes wakefulness by increasing dopamine and norepinephrine in the brain.',
        manufacturerUrl: 'https://www.amneal.com/products/',
        doseOptions: ['5 mg', '10 mg', '15 mg', 'Other'],
      },
      {
        id: 'vyvanse',
        brandName: 'Vyvanse',
        genericName: 'lisdexamfetamine',
        mechanism: 'Prodrug → dopamine & norepinephrine releasing agent',
        description: 'Vyvanse is a prodrug stimulant that converts to dextroamphetamine in the body, providing longer-lasting wakefulness.',
        manufacturerUrl: 'https://www.takeda.com/what-we-do/our-medicines/',
        doseOptions: ['20 mg', '30 mg', '40 mg', '50 mg', '60 mg', '70 mg', 'Other'],
      },
      {
        id: 'sunosi',
        brandName: 'Sunosi',
        genericName: 'solriamfetol',
        mechanism: 'Dopamine & norepinephrine reuptake inhibitor',
        description: 'Sunosi promotes wakefulness by increasing dopamine and norepinephrine (adrenaline-related signaling).',
        manufacturerUrl: 'https://www.sunosi.com',
        doseOptions: ['37.5 mg', '75 mg', '150 mg', 'Other'],
      },
      {
        id: 'provigil',
        brandName: 'Provigil',
        genericName: 'modafinil',
        mechanism: 'Dopamine reuptake inhibitor (mechanism not fully understood)',
        description: 'Provigil promotes wakefulness through mechanisms that are not fully understood, but may involve dopamine reuptake inhibition.',
        manufacturerUrl: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2015/020717s037s038lbl.pdf',
        doseOptions: ['100 mg', '200 mg', 'Other'],
      },
      {
        id: 'nuvigil',
        brandName: 'Nuvigil',
        genericName: 'armodafinil',
        mechanism: 'Dopamine reuptake inhibitor (R-enantiomer of modafinil)',
        description: 'Nuvigil is the R-enantiomer of modafinil, providing similar wake-promoting effects with a slightly different duration profile.',
        manufacturerUrl: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/021875s023lbl.pdf',
        doseOptions: ['150 mg', '250 mg', 'Other'],
      },
    ],
  },
  {
    title: 'Wakix (Histamine-Based Wake Regulation)',
    icon: <Sparkles className="w-5 h-5" />,
    medications: [
      {
        id: 'wakix',
        brandName: 'Wakix',
        genericName: 'pitolisant',
        mechanism: 'Histamine H3 receptor antagonist/inverse agonist',
        description: 'Wakix supports wakefulness by increasing histamine signaling in the brain through a different mechanism than stimulants.',
        manufacturerUrl: 'https://www.wakix.com',
        doseOptions: ['8.9 mg', '17.8 mg', '35.6 mg', 'Other'],
      },
    ],
  },
  {
    title: 'Nighttime / Deep Sleep Medications (Oxybates)',
    icon: <Moon className="w-5 h-5" />,
    description: 'These medications help consolidate nighttime sleep, which may improve daytime alertness.',
    medications: [
      {
        id: 'xyrem',
        brandName: 'Xyrem',
        genericName: 'sodium oxybate',
        mechanism: 'GABA-B receptor agonist',
        description: 'Xyrem promotes deep sleep consolidation by enhancing GABA-B receptor activity. Taken in split doses at night.',
        manufacturerUrl: 'https://www.xyrem.com',
        doseOptions: ['2.25 g', '3 g', '3.75 g', '4.5 g', 'Split dose', 'Other'],
      },
      {
        id: 'xywav',
        brandName: 'Xywav',
        genericName: 'calcium, magnesium, potassium, sodium oxybates',
        mechanism: 'GABA-B receptor agonist (lower sodium)',
        description: 'Xywav is a lower-sodium formulation of oxybate that promotes deep sleep consolidation while reducing sodium intake.',
        manufacturerUrl: 'https://www.xywav.com',
        doseOptions: ['2.25 g', '3 g', '3.75 g', '4.5 g', 'Split dose', 'Other'],
      },
      {
        id: 'lumryz',
        brandName: 'Lumryz',
        genericName: 'extended-release sodium oxybate',
        mechanism: 'GABA-B receptor agonist (extended-release)',
        description: 'Lumryz is an extended-release oxybate formulation taken once nightly instead of split doses.',
        manufacturerUrl: 'https://www.lumryz.com',
        doseOptions: ['4.5 g', '6 g', '7.5 g', '9 g', 'Other'],
      },
    ],
  },
  {
    title: 'Orexin-Targeting Therapies (Clinical Trials / Emerging)',
    icon: <FlaskConical className="w-5 h-5" />,
    description: 'These therapies aim to activate orexin signaling and are currently being studied in clinical trials. Availability varies.',
    medications: [
      {
        id: 'tak-861',
        brandName: 'TAK-861',
        genericName: 'orexin agonist',
        mechanism: 'Orexin-2 receptor agonist (investigational)',
        description: 'TAK-861 is an investigational orexin receptor agonist designed to restore orexin signaling in narcolepsy patients.',
        manufacturerUrl: 'https://www.takeda.com/what-we-do/research-and-development/',
      },
      {
        id: 'danavorexton',
        brandName: 'Danavorexton (TAK-925)',
        genericName: 'orexin agonist',
        mechanism: 'Orexin-2 receptor agonist (IV, investigational)',
        description: 'Danavorexton is an investigational intravenous orexin receptor agonist being studied for acute and chronic use.',
        manufacturerUrl: 'https://www.takeda.com/what-we-do/research-and-development/',
      },
      {
        id: 'alks-2680',
        brandName: 'ALKS-2680',
        genericName: 'orexin agonist',
        mechanism: 'Orexin-2 receptor agonist (oral, investigational)',
        description: 'ALKS-2680 is an oral orexin receptor agonist in clinical development for narcolepsy type 1.',
        manufacturerUrl: 'https://www.alkermes.com/research-and-development/',
      },
    ],
  },
];

function MedicationCard({
  medication,
  entry,
  isTrialMed,
  onUpdate,
  onRemove,
}: {
  medication: MedicationInfo;
  entry?: MedicationEntry;
  isTrialMed?: boolean;
  onUpdate: (data: Partial<MedicationEntry>) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(!!entry);
  const [dose, setDose] = useState(entry?.dose || '');
  const [doseOther, setDoseOther] = useState(entry?.doseOther || '');
  const [frequency, setFrequency] = useState<MedicationFrequency | ''>(entry?.frequency || '');
  const [frequencyOther, setFrequencyOther] = useState(entry?.frequencyOther || '');
  const [timings, setTimings] = useState<MedicationTiming[]>(entry?.timings || []);
  const [notes, setNotes] = useState(entry?.notes || '');
  const [isTrialParticipant, setIsTrialParticipant] = useState(entry?.isTrialParticipant || false);
  const [isTracking, setIsTracking] = useState(!!entry);

  const handleToggleTracking = (checked: boolean) => {
    setIsTracking(checked);
    if (checked) {
      onUpdate({
        dose,
        doseOther: dose === 'Other' ? doseOther : undefined,
        frequency: frequency || undefined,
        frequencyOther: frequency === 'other' ? frequencyOther : undefined,
        timings,
        notes,
        isTrialParticipant: isTrialMed ? isTrialParticipant : undefined,
      });
    } else {
      onRemove();
      setDose('');
      setDoseOther('');
      setFrequency('');
      setFrequencyOther('');
      setTimings([]);
      setNotes('');
      setIsTrialParticipant(false);
    }
  };

  const handleFieldChange = () => {
    if (isTracking) {
      onUpdate({
        dose,
        doseOther: dose === 'Other' ? doseOther : undefined,
        frequency: frequency || undefined,
        frequencyOther: frequency === 'other' ? frequencyOther : undefined,
        timings,
        notes,
        isTrialParticipant: isTrialMed ? isTrialParticipant : undefined,
      });
    }
  };

  const toggleTiming = (timing: MedicationTiming) => {
    const newTimings = timings.includes(timing)
      ? timings.filter(t => t !== timing)
      : [...timings, timing];
    setTimings(newTimings);
    if (isTracking) {
      onUpdate({
        dose,
        doseOther: dose === 'Other' ? doseOther : undefined,
        frequency: frequency || undefined,
        frequencyOther: frequency === 'other' ? frequencyOther : undefined,
        timings: newTimings,
        notes,
        isTrialParticipant: isTrialMed ? isTrialParticipant : undefined,
      });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <motion.button
          title={medication.mechanism}
          className="group relative w-full overflow-visible p-4 flex items-center justify-between bg-surface-2 rounded-lg hover:bg-surface-3 transition-colors text-left"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {medication.brandName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {medication.genericName}
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}

          {medication.mechanism && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-full mt-2 hidden group-hover:block z-50 max-w-xs rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md animate-fade-in"
            >
              {medication.mechanism}
            </span>
          )}
        </motion.button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-4 pt-2 space-y-4 bg-surface-2 rounded-b-lg -mt-2 border-t border-border/30">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {medication.description}
          </p>

          {/* Manufacturer link */}
          <a
            href={medication.manufacturerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Official manufacturer information
          </a>

          {/* Tracking toggle */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm font-medium">Track this medication</Label>
            <Switch
              checked={isTracking}
              onCheckedChange={handleToggleTracking}
            />
          </div>

          {/* Editable fields */}
          <AnimatePresence>
            {isTracking && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Dose Dropdown */}
                {medication.doseOptions && (
                  <div className="space-y-2">
                    <Label className="text-sm">Dose</Label>
                    <Select value={dose} onValueChange={(val) => { setDose(val); setTimeout(handleFieldChange, 0); }}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select dose" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        {medication.doseOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {dose === 'Other' && (
                      <Input
                        value={doseOther}
                        onChange={(e) => setDoseOther(e.target.value)}
                        onBlur={handleFieldChange}
                        placeholder="Enter custom dose"
                        className="bg-background mt-2"
                      />
                    )}
                  </div>
                )}

                {/* Frequency Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm">Frequency</Label>
                  <Select value={frequency} onValueChange={(val) => { setFrequency(val as MedicationFrequency); setTimeout(handleFieldChange, 0); }}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {frequency === 'other' && (
                    <Input
                      value={frequencyOther}
                      onChange={(e) => setFrequencyOther(e.target.value)}
                      onBlur={handleFieldChange}
                      placeholder="Enter custom frequency"
                      className="bg-background mt-2"
                    />
                  )}
                </div>

                {/* Timing Chips */}
                <div className="space-y-2">
                  <Label className="text-sm">Timing</Label>
                  <div className="flex flex-wrap gap-2">
                    {TIMING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleTiming(opt.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          timings.includes(opt.value)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trial participation (for clinical trial meds only) */}
                {isTrialMed && (
                  <div className="flex items-center justify-between py-2">
                    <Label className="text-sm">Participating in trial</Label>
                    <Switch
                      checked={isTrialParticipant}
                      onCheckedChange={(checked) => {
                        setIsTrialParticipant(checked);
                        if (isTracking) {
                          onUpdate({
                            dose,
                            doseOther: dose === 'Other' ? doseOther : undefined,
                            frequency: frequency || undefined,
                            frequencyOther: frequency === 'other' ? frequencyOther : undefined,
                            timings,
                            notes,
                            isTrialParticipant: checked,
                          });
                        }
                      }}
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor={`notes-${medication.id}`} className="text-sm">
                    Notes <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id={`notes-${medication.id}`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleFieldChange}
                    placeholder="Any additional notes"
                    className="bg-background"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MedicationsScreen({ onBack }: MedicationsScreenProps) {
  const { toast } = useToast();
  const [userMedications, setUserMedications] = useState<UserMedications>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Stimulants & Wake-Promoting Medications']));

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    const data = await getUserMedications();
    setUserMedications(data);
  };

  const handleUpdateMedication = async (medicationId: string, data: Partial<MedicationEntry>) => {
    const entry: MedicationEntry = {
      id: medicationId,
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    await saveMedicationEntry(entry);
    setUserMedications((prev) => ({
      ...prev,
      [medicationId]: entry,
    }));
  };

  const handleRemoveMedication = async (medicationId: string) => {
    await removeMedicationEntry(medicationId);
    setUserMedications((prev) => {
      const next = { ...prev };
      delete next[medicationId];
      return next;
    });
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const trackedCount = Object.keys(userMedications).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Medications</h1>
          <p className="text-sm text-muted-foreground">
            {trackedCount > 0 ? `${trackedCount} tracked` : 'Track your medications'}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground bg-surface-2 rounded-lg p-3">
        This page is for tracking only — not medical advice. Always consult your healthcare provider about medications.
      </div>

      {/* Medication Sections */}
      {MEDICATION_SECTIONS.map((section) => (
        <Collapsible
          key={section.title}
          open={expandedSections.has(section.title)}
          onOpenChange={() => toggleSection(section.title)}
        >
          <CollapsibleTrigger asChild>
            <motion.button
              className="w-full flex items-center justify-between p-4 bg-surface-2 rounded-lg hover:bg-surface-3 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className="text-primary">{section.icon}</div>
                <h2 className="font-semibold text-left">{section.title}</h2>
              </div>
              {expandedSections.has(section.title) ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-2 space-y-2">
              {section.description && (
                <p className="text-sm text-muted-foreground px-2 py-2">
                  {section.description}
                </p>
              )}
              {section.medications.map((med) => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  entry={userMedications[med.id]}
                  isTrialMed={section.title.includes('Clinical Trials')}
                  onUpdate={(data) => handleUpdateMedication(med.id, data)}
                  onRemove={() => handleRemoveMedication(med.id)}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center pt-4">
        Information links are provided for reference only.
      </p>
    </div>
  );
}

// Export medication data for use in other components
export { MEDICATION_SECTIONS };
export type { MedicationInfo };