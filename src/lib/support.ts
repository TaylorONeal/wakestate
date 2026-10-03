// Single place for the feedback contact. feedback@purafieldstudio.com forwards to the Purafield Gmail.
export const SUPPORT_EMAIL = 'feedback@purafieldstudio.com';

export interface FeedbackDraft {
  role: string;
  section: string;
  kind: string;
  details: string;
}

export function buildFeedbackMailto(draft: FeedbackDraft): string {
  const subject = `WakeState feedback: ${draft.kind}`;
  const body = [
    `Role: ${draft.role}`,
    `App section: ${draft.section}`,
    `Type: ${draft.kind}`,
    '',
    draft.details || '(add details here)',
    '',
    'Please leave out names, medications, and other health details.',
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
