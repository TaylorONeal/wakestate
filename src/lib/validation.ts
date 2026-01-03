import { z } from 'zod';

// Wake Domains schema
const WakeDomainsSchema = z.object({
  cataplexy: z.number().min(1).max(5),
  microsleeps: z.number().min(1).max(5),
  cognitive: z.number().min(1).max(5),
  effort: z.number().min(1).max(5),
  sleepPressure: z.number().min(1).max(5),
  motor: z.number().min(1).max(5),
  sensory: z.number().min(1).max(5),
  thermo: z.number().min(1).max(5),
  emotional: z.number().min(1).max(5),
});

// Context Domains schema
const ContextDomainsSchema = z.object({
  anxiety: z.number().min(1).max(5),
  mood: z.number().min(1).max(5),
  digestive: z.number().min(1).max(5),
}).optional();

// Narcolepsy Domains schema
const NarcolepsyDomainsSchema = z.object({
  sleepPressure: z.number().min(1).max(5),
  microsleeps: z.number().min(1).max(5),
  sleepInertia: z.number().min(1).max(5),
  cognitive: z.number().min(1).max(5),
  effort: z.number().min(1).max(5),
}).optional();

// Overlapping Domains schema
const OverlappingDomainsSchema = z.object({
  anxiety: z.number().min(1).max(5),
  mood: z.number().min(1).max(5),
  digestive: z.number().min(1).max(5),
  thermo: z.number().min(1).max(5),
  motor: z.number().min(1).max(5),
  emotional: z.number().min(1).max(5),
  sensory: z.number().min(1).max(5),
}).optional();

// Check-in schema
export const CheckInSchema = z.object({
  id: z.string().min(1).max(100),
  createdAt: z.string().min(1).max(50),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  localTime: z.string().min(1).max(20),
  wakeDomains: WakeDomainsSchema,
  contextDomains: ContextDomainsSchema,
  narcolepsyDomains: NarcolepsyDomainsSchema,
  overlappingDomains: OverlappingDomainsSchema,
  tags: z.array(z.string().max(100)).max(50),
  note: z.string().max(5000).optional(),
});

// Severity tag schema
const SeverityTagSchema = z.enum(['mild', 'moderate', 'severe']);

// Refreshed level schema
const RefreshedLevelSchema = z.enum(['yes', 'somewhat', 'no']);

// Sleep inertia duration schema
const SleepInertiaDurationSchema = z.enum(['<5m', '5-15m', '15-30m', '30m+']);

// Tracking Event schema
export const TrackingEventSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
  createdAt: z.string().min(1).max(50),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  localTime: z.string().min(1).max(20),
  severityTag: SeverityTagSchema.optional(),
  contextTags: z.array(z.string().max(100)).max(50),
  note: z.string().max(5000).optional(),
  startTime: z.string().max(20).optional(),
  endTime: z.string().max(20).optional(),
  planned: z.boolean().optional(),
  refreshed: RefreshedLevelSchema.optional(),
  sleepInertiaDuration: SleepInertiaDurationSchema.optional(),
  emotionTriggers: z.array(z.string().max(100)).max(50).optional(),
  activityContext: z.array(z.string().max(100)).max(50).optional(),
});

// App Settings schema
export const AppSettingsSchema = z.object({
  showContextByDefault: z.boolean(),
  theme: z.enum(['midnight', 'charcoal', 'deep-ocean']),
});

// Import data schema
export const ImportDataSchema = z.object({
  version: z.number().min(1).max(100).optional(),
  exportedAt: z.string().max(50).optional(),
  checkIns: z.array(CheckInSchema).max(50000).optional(),
  events: z.array(TrackingEventSchema).max(50000).optional(),
  settings: AppSettingsSchema.optional(),
});

export type ValidatedImportData = z.infer<typeof ImportDataSchema>;
