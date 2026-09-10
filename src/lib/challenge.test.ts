import { describe, expect, it } from 'vitest';
import { parseChallenge } from './challenge';

const now = 1_000_000;
const valid = { question: '2 + 3 = ?', options: [3, 4, 5, 6], token: 'test-token', expiresAt: now + 60_000 };

describe('feedback challenge validation', () => {
  it('accepts a current challenge without claiming to validate the answer', () => {
    expect(parseChallenge(valid, now)).toEqual(valid);
  });
  it('rejects missing, malformed and duplicate answer options', () => {
    for (const data of [null, {}, { ...valid, options: [1, 1, 2, 3] }, { ...valid, options: ['1', 2, 3, 4] }, { ...valid, token: '' }]) {
      expect(() => parseChallenge(data, now)).toThrow();
    }
  });
  it('rejects expired and unbounded expiry timestamps', () => {
    for (const expiresAt of [now, now - 1, now + 300_001, Infinity]) {
      expect(() => parseChallenge({ ...valid, expiresAt }, now)).toThrow();
    }
  });
});
