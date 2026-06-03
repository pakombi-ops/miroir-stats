import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.miroirstats.app',
  appName: 'MiroirStats',
  webDir: 'public',
  server: {
    url: 'https://miroir-stats.vercel.app',
    cleartext: true
  }
}

export default config