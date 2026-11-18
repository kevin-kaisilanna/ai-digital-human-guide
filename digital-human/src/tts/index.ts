/**
 * TTS 模块统一入口
 *
 * 使用方式：
 * ```ts
 * import { useTtsStore } from '@/stores/tts'
 *
 * const tts = useTtsStore()
 * tts.init()
 * tts.speak('欢迎来到灵山胜境！')
 * ```
 *
 * 或者直接使用底层 API：
 * ```ts
 * import { synthesizeWithFallback, getAudioPlayer } from '@/tts'
 *
 * const result = await synthesizeWithFallback({ text: '你好' })
 * const player = getAudioPlayer()
 * player.enqueue({ id: '1', text: '你好', voice: 'gentle-female' })
 * ```
 */

// 类型
export type {
  VoicePreset,
  VoiceProfile,
  VisemeFrame,
  VisemeTimeline,
  TtsRequest,
  TtsResult,
  PlaybackState,
  QueueItem,
  TtsCallbacks,
  ITtsEngine,
} from './types'

// 引擎
export {
  BrowserEngine,
  ServerEngine,
  getBrowserEngine,
  getServerEngine,
  synthesizeWithFallback,
  VOICE_PROFILES,
} from './engine'

// 播放器
export { AudioPlayer, getAudioPlayer, destroyAudioPlayer } from './audio-player'

// Viseme 工具
export {
  generateVisemeTimeline,
  getVisemeAtTime,
  estimateCharViseme,
  serializeTimeline,
  VOICE_SPEEDS,
} from './viseme'
