// ============= Narcolepsy-Related Symptom Domains =============
export interface NarcolepsyDomains {
  sleepPressure: number;      // Excessive Daytime Sleepiness / Sleep Pressure
  microsleeps: number;        // Microsleeps / Automatic Behavior
  sleepInertia: number;       // Sleep Inertia / Unrefreshing Naps
  cognitive: number;          // Cognitive Fog
  effort: number;             // Effort Aversion
}

// ============= Other / Overlapping Symptom Domains =============
export interface OverlappingDomains {
  anxiety: number;            // Anxiety / Nervous System Activation
  mood: number;               // Mood Tone (Low / Flat / Heavy)
  digestive: number;          // Digestive Load
  thermo: number;             // Thermoregulatory Instability
  motor: number;              // Motor Control Degradation (non-emotional)
  emotional: number;          // Emotional Reactivity / Freeze
  sensory: number;            // Sensory Overload (always last)
}

// Legacy interfaces for backward compatibility
export interface WakeDomains {
  cataplexy: number;
  microsleeps: number;
  cognitive: number;
  effort: number;
  sleepPressure: number;
  motor: number;
  sensory: number;
  thermo: number;
  emotional: number;
}

export interface ContextDomains {
  anxiety: number;
  mood: number;
  digestive: number;
}

export interface CheckIn {
  id: string;
  createdAt: string;
  localDate: string;
  localTime: string;
  // New structure
  narcolepsyDomains?: NarcolepsyDomains;
  overlappingDomains?: OverlappingDomains;
  // Legacy structure (backward compat)
  wakeDomains: WakeDomains;
  contextDomains?: ContextDomains;
  tags: string[];
  note?: string;
}

// ============= Event Types =============
export type SeverityTag = 'mild' | 'moderate' | 'severe';
export type RefreshedLevel = 'yes' | 'somewhat' | 'no';
export type SleepInertiaDuration = '<5m' | '5-15m' | '15-30m' | '30m+';

export interface CataplextyEvent {
  id: string;
  type: 'cataplexy';
  createdAt: string;
  localDate: string;
  localTime: string;
  severity: SeverityTag;
  emotionTriggers: string[];
  activityContext: string[];
  note?: string;
}

export interface NapEvent {
  id: string;
  type: 'nap';
  createdAt: string;
  localDate: string;
  localTime: string;
  startTime: string;
  endTime: string;
  planned: boolean;
  refreshed: RefreshedLevel;
  sleepInertiaDuration?: SleepInertiaDuration;
  note?: string;
}

// Union type for structured events
export type StructuredEvent = CataplextyEvent | NapEvent;

// Legacy event types for backward compatibility
export const EVENT_TYPES = [
  { id: 'major-cataplexy', label: 'Major Cataplexy', category: 'cataplexy' },
  { id: 'partial-cataplexy', label: 'Partial Cataplexy (Face/Jaw)', category: 'cataplexy' },
  { id: 'knee-buckling', label: 'Knee Buckling', category: 'cataplexy' },
  { id: 'head-drop', label: 'Head Drop', category: 'cataplexy' },
  { id: 'sleep-attack', label: 'Sleep Attack', category: 'sleep' },
  { id: 'unplanned-nap', label: 'Unplanned Nap', category: 'sleep' },
  { id: 'planned-nap', label: 'Planned Nap', category: 'sleep' },
  { id: 'fragmented-night', label: 'Fragmented Night Sleep', category: 'sleep' },
  { id: 'sleep-paralysis', label: 'Sleep Paralysis', category: 'parasomnia' },
  { id: 'hypnagogic-hallucination', label: 'Hypnagogic Hallucination', category: 'parasomnia' },
  { id: 'hypnopompic-hallucination', label: 'Hypnopompic Hallucination', category: 'parasomnia' },
  { id: 'vivid-dream', label: 'Vivid/Lucid Dream', category: 'parasomnia' },
  { id: 'nightmare', label: 'Nightmare', category: 'parasomnia' },
  { id: 'automatic-behavior', label: 'Automatic Behavior Episode', category: 'cognitive' },
  { id: 'memory-gap', label: 'Memory Gap', category: 'cognitive' },
  { id: 'brain-fog-severe', label: 'Severe Brain Fog', category: 'cognitive' },
  { id: 'word-finding', label: 'Word Finding Difficulty', category: 'cognitive' },
  { id: 'medication-taken', label: 'Medication Taken', category: 'treatment' },
  { id: 'medication-missed', label: 'Medication Missed', category: 'treatment' },
  { id: 'stimulant-dose', label: 'Stimulant Dose', category: 'treatment' },
  { id: 'caffeine-use', label: 'Caffeine Use', category: 'treatment' },
  { id: 'emotional-trigger', label: 'Emotional Trigger', category: 'trigger' },
  { id: 'stress-episode', label: 'Stress Episode', category: 'trigger' },
  { id: 'exercise-session', label: 'Exercise Session', category: 'activity' },
  { id: 'driving-incident', label: 'Driving Near-Miss/Concern', category: 'safety' },
] as const;

export type EventType = typeof EVENT_TYPES[number]['id'];
export type EventCategory = typeof EVENT_TYPES[number]['category'];

export interface TrackingEvent {
  id: string;
  type: EventType | 'cataplexy' | 'nap';
  createdAt: string;
  localDate: string;
  localTime: string;
  severityTag?: SeverityTag;
  contextTags: string[];
  note?: string;
  // Extended fields for structured events
  startTime?: string;
  endTime?: string;
  planned?: boolean;
  refreshed?: RefreshedLevel;
  sleepInertiaDuration?: SleepInertiaDuration;
  emotionTriggers?: string[];
  activityContext?: string[];
}

export interface AppSettings {
  showContextByDefault: boolean;
  theme: 'midnight' | 'charcoal' | 'deep-ocean';
}

// ============= Medication Types =============
export type MedicationFrequency = '1x/day' | '2x/day' | '3x/day' | '4x/day' | 'PRN' | 'other';
export type MedicationTiming = 'morning' | 'midday' | 'afternoon' | 'evening' | 'bedtime';

export interface MedicationEntry {
  id: string;
  dose?: string;
  doseOther?: string; // When "Other" is selected
  frequency?: MedicationFrequency;
  frequencyOther?: string; // When "other" is selected
  timings?: MedicationTiming[];
  notes?: string;
  isTrialParticipant?: boolean; // For clinical trial medications
  lastUpdated: string;
}

export interface UserMedications {
  [medicationId: string]: MedicationEntry;
}

// Medication Regimen - user's configured medications for quick logging
export interface MedicationRegimen {
  medicationId: string;
  brandName: string;
  genericName: string;
  defaultDose: string;
  defaultFrequency: MedicationFrequency;
  defaultTimings: MedicationTiming[];
  frequencyCount: number; // How many times per day (1-4)
}

// Medication Administration - individual "taken" events
export interface MedicationAdministration {
  id: string;
  medicationId: string;
  brandName: string;
  timestamp: string;
  localDate: string;
  localTime: string;
  doseSelected: string;
  adminNumberForDay?: number; // e.g., 1 of 2
}

export interface UserMedicationConfig {
  isConfigured: boolean;
  regimen: MedicationRegimen[];
  lastUpdated: string;
}

export interface DomainConfig {
  label: string;
  color: string;
  anchors: { 1: string; 3: string; 5: string };
  description?: string;
}

// ============= Narcolepsy-Related Domain Config =============
export const NARCOLEPSY_DOMAIN_CONFIG: Record<keyof NarcolepsyDomains, DomainConfig> = {
  sleepPressure: {
    label: 'Excessive Daytime Sleepiness',
    color: 'domain-sleep-pressure',
    anchors: { 1: 'Alert', 3: 'Heavy', 5: 'Crushing' },
    description: 'The overwhelming urge to sleep. May feel like a weight pressing down, making it hard to stay awake.',
  },
  microsleeps: {
    label: 'Microsleeps / Automatic Behavior',
    color: 'domain-microsleeps',
    anchors: { 1: 'Present', 3: 'Drifting', 5: 'Losing time' },
    description: 'Brief lapses into sleep lasting seconds. You may continue activities on autopilot with no memory of them.',
  },
  sleepInertia: {
    label: 'Sleep Inertia / Unrefreshing Naps',
    color: 'domain-cognitive',
    anchors: { 1: 'Refreshed', 3: 'Groggy', 5: 'Worse after sleep' },
    description: 'Difficulty waking up or feeling worse after sleep. Naps may not feel restorative.',
  },
  cognitive: {
    label: 'Cognitive Fog',
    color: 'domain-effort',
    anchors: { 1: 'Sharp', 3: 'Foggy', 5: 'Very clouded' },
    description: 'Difficulty with concentration, processing speed, and mental clarity. Often called "brain fog."',
  },
  effort: {
    label: 'Effort Aversion',
    color: 'domain-motor',
    anchors: { 1: 'Motivated', 3: 'Reluctant', 5: "Can't initiate" },
    description: 'Difficulty starting or sustaining tasks, even ones you want to do. Different from laziness or lack of motivation.',
  },
};

// ============= Other / Overlapping Domain Config =============
export const OVERLAPPING_DOMAIN_CONFIG: Record<keyof OverlappingDomains, DomainConfig> = {
  anxiety: {
    label: 'Anxiety / Nervous System Activation',
    color: 'domain-anxiety',
    anchors: { 1: 'Calm', 3: 'Activated', 5: 'Highly anxious' },
    description: 'General nervous system arousal, worry, or anxiety unrelated to sleep symptoms.',
  },
  mood: {
    label: 'Mood Tone (Low / Flat / Heavy)',
    color: 'domain-mood',
    anchors: { 1: 'Bright', 3: 'Flat', 5: 'Very low' },
    description: 'Overall mood state that may affect or be affected by sleep symptoms.',
  },
  digestive: {
    label: 'Digestive Load',
    color: 'domain-digestive',
    anchors: { 1: 'Light', 3: 'Processing', 5: 'Heavy burden' },
    description: 'How much your digestive system is affecting your energy and alertness.',
  },
  thermo: {
    label: 'Thermoregulatory Instability',
    color: 'domain-thermo',
    anchors: { 1: 'Stable', 3: 'Fluctuating', 5: 'Extreme' },
    description: 'Difficulty regulating body temperature. May experience sudden hot flashes, chills, or sweating.',
  },
  motor: {
    label: 'Motor Control Degradation',
    color: 'domain-cataplexy',
    anchors: { 1: 'Coordinated', 3: 'Clumsy', 5: 'Impaired' },
    description: 'Reduced coordination and fine motor control unrelated to emotional triggers (non-cataplexy).',
  },
  emotional: {
    label: 'Emotional Reactivity / Freeze',
    color: 'domain-emotional',
    anchors: { 1: 'Balanced', 3: 'Reactive', 5: 'Volatile/frozen' },
    description: 'Heightened emotional responses or emotional numbness. May laugh/cry easily or feel emotionally flat.',
  },
  sensory: {
    label: 'Sensory Overload',
    color: 'domain-sensory',
    anchors: { 1: 'Comfortable', 3: 'Sensitive', 5: 'Overwhelmed' },
    description: 'Heightened sensitivity to light, sound, touch, or other stimuli. Environments feel too intense.',
  },
};

// Legacy configs for backward compatibility
export const WAKE_DOMAIN_CONFIG: Record<keyof WakeDomains, DomainConfig> = {
  sleepPressure: {
    label: 'Sleep Pressure',
    color: 'domain-sleep-pressure',
    anchors: { 1: 'Rested', 3: 'Heavy', 5: 'Crushing' },
    description: 'The overwhelming urge to sleep. May feel like a weight pressing down, making it hard to stay awake.',
  },
  microsleeps: {
    label: 'Microsleeps / Automatic Mode',
    color: 'domain-microsleeps',
    anchors: { 1: 'Alert', 3: 'Drifting', 5: 'Losing time' },
    description: 'Brief lapses into sleep lasting seconds. You may continue activities on autopilot with no memory of them.',
  },
  cataplexy: {
    label: 'Cataplexy — Subtle',
    color: 'domain-cataplexy',
    anchors: { 1: 'None', 3: 'Slight weakness', 5: 'Noticeable' },
    description: 'Subtle muscle weakness triggered by emotions. May feel like jaw loosening, head heaviness, or slight knee buckling.',
  },
  cognitive: {
    label: 'Cognitive Fuzziness',
    color: 'domain-cognitive',
    anchors: { 1: 'Sharp', 3: 'Foggy', 5: 'Very clouded' },
    description: 'Difficulty with concentration, processing speed, and mental clarity. Often called "brain fog."',
  },
  effort: {
    label: 'Effort Aversion',
    color: 'domain-effort',
    anchors: { 1: 'Motivated', 3: 'Reluctant', 5: "Can't initiate" },
    description: 'Difficulty starting or sustaining tasks, even ones you want to do. Different from laziness or lack of motivation.',
  },
  motor: {
    label: 'Motor Control Degradation',
    color: 'domain-motor',
    anchors: { 1: 'Coordinated', 3: 'Clumsy', 5: 'Impaired' },
    description: 'Reduced coordination and fine motor control. May drop things, bump into objects, or have trouble with precise movements.',
  },
  emotional: {
    label: 'Emotional Reactivity / Freeze',
    color: 'domain-emotional',
    anchors: { 1: 'Balanced', 3: 'Reactive', 5: 'Volatile/frozen' },
    description: 'Heightened emotional responses or emotional numbness. May laugh/cry easily or feel emotionally flat.',
  },
  thermo: {
    label: 'Thermoregulatory Instability',
    color: 'domain-thermo',
    anchors: { 1: 'Stable', 3: 'Fluctuating', 5: 'Extreme' },
    description: 'Difficulty regulating body temperature. May experience sudden hot flashes, chills, or sweating unrelated to environment.',
  },
  sensory: {
    label: 'Sensory Overload',
    color: 'domain-sensory',
    anchors: { 1: 'Comfortable', 3: 'Sensitive', 5: 'Overwhelmed' },
    description: 'Heightened sensitivity to light, sound, touch, or other stimuli. Environments feel too intense.',
  },
};

export const CONTEXT_DOMAIN_CONFIG: Record<keyof ContextDomains, DomainConfig> = {
  anxiety: {
    label: 'Anxiety / Nervous System Activation',
    color: 'domain-anxiety',
    anchors: { 1: 'Calm', 3: 'Activated', 5: 'Highly anxious' },
  },
  mood: {
    label: 'Mood Tone (Low / Flat / Heavy)',
    color: 'domain-mood',
    anchors: { 1: 'Bright', 3: 'Flat', 5: 'Very low' },
  },
  digestive: {
    label: 'Digestive Load',
    color: 'domain-digestive',
    anchors: { 1: 'Light', 3: 'Processing', 5: 'Heavy burden' },
  },
};

export const TAGS = [
  'caffeine',
  'meds',
  'nap',
  'stress',
  'social exposure',
  'driving / work block',
  'meal',
] as const;

export const EMOTION_TAGS = [
  'laughter',
  'surprise',
  'frustration',
  'joy',
  'intimacy',
  'conflict',
  'embarrassment',
  'other',
] as const;

export const ACTIVITY_TAGS = [
  'talking',
  'eating',
  'walking',
  'driving',
  'exercising',
  'social setting',
  'work meeting',
  'other',
] as const;

export const SLEEP_INERTIA_DURATIONS = ['<5m', '5-15m', '15-30m', '30m+'] as const;

export type WakeDomainKey = keyof WakeDomains;
export type ContextDomainKey = keyof ContextDomains;
export type NarcolepsyDomainKey = keyof NarcolepsyDomains;
export type OverlappingDomainKey = keyof OverlappingDomains;
export type Tag = (typeof TAGS)[number];
export type EmotionTag = (typeof EMOTION_TAGS)[number];
export type ActivityTag = (typeof ACTIVITY_TAGS)[number];
