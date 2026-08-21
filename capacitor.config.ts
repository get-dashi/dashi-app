import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getdashi.app',
  appName: 'Dashi',
  webDir: 'out',
  server: {
    // Load live from Vercel — no static export needed
    url: 'https://app.get-dashi.com',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
};

export default config;
