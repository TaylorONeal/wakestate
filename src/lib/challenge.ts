import { z } from 'zod';

const ChallengeSchema = z.object({
  question: z.string().min(1).max(100),
  options: z.array(z.number().int().min(0).max(25)).length(4)
    .refine(options => new Set(options).size === options.length),
  token: z.string().min(1).max(2048),
  expiresAt: z.number().int(),
});

export type ChallengeData = z.infer<typeof ChallengeSchema>;

// Validation only checks the response shape and expiry; answers are verified by the server.
export function parseChallenge(data: unknown, now = Date.now()): ChallengeData {
  const challenge = ChallengeSchema.parse(data);
  if (challenge.expiresAt <= now || challenge.expiresAt > now + 5 * 60 * 1000) {
    throw new Error('Invalid challenge expiry');
  }
  return challenge;
}
