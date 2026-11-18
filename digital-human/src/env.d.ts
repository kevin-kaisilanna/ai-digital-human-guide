/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface Window {
    UnityIns: any
    RecorderIns: any
    Recorder: any
    handleUnityTransmission: (str: string) => void
    createUnityInstance: (canvas: HTMLCanvasElement, config: any, progress: (p: number) => void) => Promise<any>
  }
}

export {}
