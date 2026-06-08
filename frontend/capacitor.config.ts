import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Hipstagram',
  webDir: 'build',
  server: {
    cleartext: true
  }
};

export default config;