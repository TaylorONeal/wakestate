import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Confirm ownership before the first store upload; changing this later creates a new app.
  appId: 'com.wakestate.app',
  appName: 'WakeState',
  webDir: 'dist',
  backgroundColor: '#111b1e',
  server: { androidScheme: 'https' },
  ios: { contentInset: 'automatic' },
};
export default config;
