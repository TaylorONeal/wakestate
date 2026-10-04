import { Capacitor } from '@capacitor/core';

export const DONATION_URL = 'https://buymeacoffee.com/tayloroneal';

/**
 * Donation links show only on the web PWA. Store builds (Android, iOS) hide
 * them so tips are never offered outside the store's own billing system.
 */
export function showDonationLinks(): boolean {
  return !Capacitor.isNativePlatform();
}
