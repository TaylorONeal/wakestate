import { describe, it, expect } from 'vitest';
import { buildFeedbackMailto, SUPPORT_EMAIL } from './support';

describe('feedback mailto', () => {
  it('builds an encoded draft addressed to support', () => {
    const url = buildFeedbackMailto({ role: 'Other', section: 'Timeline', kind: 'Bug / Something broken', details: 'a & b?' });
    expect(url.startsWith(`mailto:${SUPPORT_EMAIL}?subject=`)).toBe(true);
    expect(url).toContain(encodeURIComponent('a & b?'));
    expect(url).not.toContain(' ');
  });
  it('uses a placeholder when details are empty', () => {
    expect(buildFeedbackMailto({ role: 'r', section: 's', kind: 'k', details: '' })).toContain(encodeURIComponent('(add details here)'));
  });
});
