import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miroirstats.app',
  appName: 'MiroirStats',
  webDir: 'out',
  server: {
    url: 'https://miroir-stats-418c.vercel.app',
    cleartext: true
  },
  plugins: {
    App: {
      launchUrl: 'miroirstats://'
    }
  }
};

export default config;