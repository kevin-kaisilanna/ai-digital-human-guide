import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.lingshan.guide',
  appName: '灵山导览',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
}

export default config