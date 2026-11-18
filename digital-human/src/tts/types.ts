/**
 * TTS 模块 — 类型定义
 *
 * 职责：定义 TTS 引擎、音频播放、Viseme 口型同步所需的所有类型。
 */

// ─── 音色配置 ───
/** 预设音色 ID */
export type VoicePreset =
  | 'gentle-female'   // 温柔女声（默认）
  | 'steady-male'     // 沉稳男声
  | 'lively-female'   // 活泼少女声
  | 'warm-male'       // 温暖男声

/** 音色元信息 */
export interface VoiceProfile {
  id: VoicePreset
  name: string
  description: string
  /** Web Speech API 语音名称匹配关键词 */
  speechApiKeywords: string[]
  /** 语速倍率 (0.5–2.0) */
  rate: number
  /** 音调 (0.5–2.0) */
  pitch: number
}

// ─── Viseme 口型同步 ───
/** 单个 Viseme 关键帧 */
export interface VisemeFrame {
  /** 从音频开始计时的偏移量（秒） */
  time: number
  /** Viseme 索引 (0=silence, 1-21=口型) */
  visemeId: number
  /** 该口型持续时长（秒） */
  duration: number
}

/** Viseme 时间轴 */
export type VisemeTimeline = VisemeFrame[]

// ─── TTS 请求/响应 ───
/** TTS 合成请求 */
export interface TtsRequest {
  /** 要合成语音的文本 */
  text: string
  /** 目标音色 */
  voice?: VoicePreset
  /** 语速倍率 */
  rate?: number
  /** 音调 */
  pitch?: number
  /** 是否生成 Viseme 时间轴 */
  withViseme?: boolean
}

/** TTS 合成结果 */
export interface TtsResult {
  /** 合成后的音频数据（Blob URL 或 base64） */
  audioUrl: string
  /** 音频总时长（秒） */
  duration: number
  /** Viseme 口型时间轴（withViseme=true 时返回） */
  visemeTimeline?: VisemeTimeline
  /** 使用的引擎类型 */
  engine: 'browser' | 'server'
}

// ─── 音频播放状态 ───
/** 播放状态枚举 */
export type PlaybackState =
  | 'idle'        // 空闲
  | 'loading'     // 加载中（等待服务端合成）
  | 'playing'     // 播放中
  | 'paused'      // 已暂停
  | 'interrupted' // 被打断

/** 播放队列项 */
export interface QueueItem {
  id: string
  text: string
  voice: VoicePreset
  /** 关联的对话消息 ID（用于回调） */
  messageId?: string
}

// ─── 回调事件 ───
/** TTS 事件回调 */
export interface TtsCallbacks {
  /** 开始播放 */
  onStart?: (text: string) => void
  /** 播放进度 (0-1) */
  onProgress?: (progress: number, currentTime: number) => void
  /** Viseme 帧更新 */
  onViseme?: (visemeId: number) => void
  /** 播放结束 */
  onEnd?: () => void
  /** 播放被中断 */
  onInterrupt?: () => void
  /** 错误 */
  onError?: (error: Error) => void
}

// ─── TTS 引擎接口 ───
/** TTS 引擎抽象接口 */
export interface ITtsEngine {
  /** 合成语音 */
  synthesize(request: TtsRequest): Promise<TtsResult>
  /** 检查引擎是否可用 */
  isAvailable(): boolean
  /** 引擎名称 */
  readonly name: string
}
