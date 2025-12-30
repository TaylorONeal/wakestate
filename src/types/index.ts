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
  wakeDomains: WakeDomains;
  contextDomains?: ContextDomains;
  tags: string[];
  note?: string;
}

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
export type SeverityTag = 'mild' | 'moderate' | 'severe';

export interface TrackingEvent {
  id: string;
  type: EventType;
  createdAt: string;
  localDate: string;
  localTime: string;
  severityTag?: SeverityTag;
  contextTags: string[];
  note?: string;
}

export interface AppSettings {
  showContextByDefault: boolean;
  theme: 'midnight' | 'charcoal' | 'deep-ocean';
}

export interface DomainConfig {
  label: string;
  color: string;
  anchors: { 1: string; 3: string; 5: string };
}

export const WAKE_DOMAIN_CONFIG: Record<keyof WakeDomains, DomainConfig> = {
  cataplexy: {
    label: 'Cataplexy — Subtle',
    color: 'domain-cataplexy',
    anchors: { 1: 'None', 3: 'Slight weakness', 5: 'Noticeable' },
  },
  microsleeps: {
    label: 'Microsleeps / Automatic Mode',
    color: 'domain-microsleeps',
    anchors: { 1: 'Alert', 3: 'Drifting', 5: 'Losing time' },
  },
  cognitive: {
    label: 'Cognitive Fuzziness',
    color: 'domain-cognitive',
    anchors: { 1: 'Sharp', 3: 'Foggy', 5: 'Very clouded' },
  },
  effort: {
    label: 'Effort Aversion',
    color: 'domain-effort',
    anchors: { 1: 'Motivated', 3: 'Reluctant', 5: "Can't initiate" },
  },
  sleepPressure: {
    label: 'Unrefreshing Sleep Pressure',
    color: 'domain-sleep-pressure',
    anchors: { 1: 'Rested', 3: 'Heavy', 5: 'Crushing' },
  },
  motor: {
    label: 'Motor Control Degradation',
    color: 'domain-motor',
    anchors: { 1: 'Coordinated', 3: 'Clumsy', 5: 'Impaired' },
  },
  sensory: {
    label: 'Sensory Overload',
    color: 'domain-sensory',
    anchors: { 1: 'Comfortable', 3: 'Sensitive', 5: 'Overwhelmed' },
  },
  thermo: {
    label: 'Thermoregulatory Instability',
    color: 'domain-thermo',
    anchors: { 1: 'Stable', 3: 'Fluctuating', 5: 'Extreme' },
  },
  emotional: {
    label: 'Emotional Reactivity / Freeze',
    color: 'domain-emotional',
    anchors: { 1: 'Balanced', 3: 'Reactive', 5: 'Volatile/frozen' },
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

export type WakeDomainKey = keyof WakeDomains;
export type ContextDomainKey = keyof ContextDomains;
export type Tag = (typeof TAGS)[number];
export type EmotionTag = (typeof EMOTION_TAGS)[number];
export type ActivityTag = (typeof ACTIVITY_TAGS)[number];
