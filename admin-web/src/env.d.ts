/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_AI_BASE?: string
  readonly VITE_DH_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Unity WebGL 全局实例
interface UnityInstance {
  SendMessage: (gameObject: string, method: string, value?: number | string) => void
  SetFullscreen: (fullscreen: number) => void
}

declare global {
  interface Window {
    UnityIns?: UnityInstance
    RecorderIns?: any
    handleUnityTransmission?: (str: string) => void
    Recorder?: any
    createUnityInstance?: any
  }
}
