import { afterEach, describe, expect, it, vi } from 'vitest';
import { Capacitor } from '@capacitor/core';
import { showDonationLinks } from './donations';

afterEach(() => vi.restoreAllMocks());

describe('showDonationLinks', () => {
  it('shows donation links on the web build', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
    expect(showDonationLinks()).toBe(true);
  });

  it('hides donation links in native store builds', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    expect(showDonationLinks()).toBe(false);
  });
});
