/**
 * TTS & Viseme 类型定义
 */

/** 单个 Viseme 关键帧 */
export interface VisemeFrame {
  time: number       // 从音频开始计时的偏移量（秒）
  visemeId: number   // Viseme 索引 (0=silence, 1-21=口型)
  duration: number   // 该口型持续时长（秒）
}

/** Viseme 时间轴 */
export type VisemeTimeline = VisemeFrame[]
