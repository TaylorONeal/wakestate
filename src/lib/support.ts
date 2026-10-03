// Single place for the support contact. Update before store submission if the mailbox changes.
export const SUPPORT_EMAIL = 'support@sidecraftmedia.com';

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
