/**
 * TTS 引擎实现
 *
 * - BrowserEngine: 使用浏览器内置 SpeechSynthesis API（零延迟、离线可用）
 * - ServerEngine:  调用后端 synthesizeApi 获取高质量音频 + Viseme 数据
 *
 * 回退策略：优先尝试服务端引擎，失败或超时则自动回退到浏览器引擎。
 */

import type {
  ITtsEngine,
  TtsRequest,
  TtsResult,
  VoicePreset,
  VoiceProfile,
  VisemeTimeline,
} from './types'
import { generateVisemeTimeline, VOICE_SPEEDS } from './viseme'
import { synthesizeApi } from '@/assets/static/js/severConfig.js'

// ─── 预置音色配置 ───
export const VOICE_PROFILES: Record<VoicePreset, VoiceProfile> = {
  'gentle-female': {
    id: 'gentle-female',
    name: '温柔女声',
    description: '清新柔和的女声导游，适合历史文化讲解',
    speechApiKeywords: ['female', 'zh-CN', 'Tingting', 'Yaoyao'],
    rate: 0.95,
    pitch: 1.1,
  },
  'steady-male': {
    id: 'steady-male',
    name: '沉稳男声',
    description: '厚重沉稳的男声，适合庄严建筑与宗教文化讲解',
    speechApiKeywords: ['male', 'zh-CN', 'Yunxiang'],
    rate: 0.9,
    pitch: 0.95,
  },
  'lively-female': {
    id: 'lively-female',
    name: '活泼少女声',
    description: '元气活泼的女声，适合亲子游互动与趣味问答',
    speechApiKeywords: ['female', 'zh-CN', 'Xiaoxiao'],
    rate: 1.1,
    pitch: 1.2,
  },
  'warm-male': {
    id: 'warm-male',
    name: '温暖男声',
    description: '温暖亲切的男声，适合路线推荐与贴心提示',
    speechApiKeywords: ['male', 'zh-CN', 'Yunjian'],
    rate: 0.95,
    pitch: 1.0,
  },
}

// ─── 工具函数 ───

/** 选择最匹配的 SpeechSynthesisVoice */
function selectVoice(keywords: string[]): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  if (voices.length === 0) return null

  // 按关键词匹配度排序
  const scored = voices.map(v => {
    const nameLower = v.name.toLowerCase()
    const langLower = v.lang.toLowerCase()
    let score = 0
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase()
      if (nameLower.includes(kwLower)) score += 3
      if (langLower.includes(kwLower)) score += 2
    }
    // 优先 zh-CN 语音
    if (v.lang.startsWith('zh-CN')) score += 5
    else if (v.lang.startsWith('zh')) score += 3
    return { voice: v, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.score > 0 ? scored[0].voice : null
}

/** 将文本合理分段（长句拆分，避免合成器吞字） */
function splitText(text: string, maxLen: number = 120): string[] {
  const chunks: string[] = []
  let remaining = text.trim()
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining)
      break
    }
    // 优先在标点处断句
    const breakChars = ['。', '！', '？', '；', '\n', '，', ',', '.', '!', '?', ';']
    let splitAt = maxLen
    for (const ch of breakChars) {
      const pos = remaining.lastIndexOf(ch, maxLen)
      if (pos > maxLen * 0.4) {
        splitAt = pos + 1
        break
      }
    }
    chunks.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }
  return chunks.filter(Boolean)
}

// ─── 浏览器引擎 ───
export class BrowserEngine implements ITtsEngine {
  readonly name = 'browser'

  isAvailable(): boolean {
    return typeof speechSynthesis !== 'undefined' && speechSynthesis.getVoices().length > 0
  }

  async synthesize(request: TtsRequest): Promise<TtsResult> {
    const profile = VOICE_PROFILES[request.voice || 'gentle-female']
    const rate = request.rate ?? profile.rate
    const pitch = request.pitch ?? profile.pitch

    return new Promise((resolve, reject) => {
      // 确保 voices 已加载（Chrome 需要异步获取）
      const voices = speechSynthesis.getVoices()
      if (voices.length === 0) {
        // 等待 voiceschanged 事件
        const onVoicesReady = () => {
          speechSynthesis.removeEventListener('voiceschanged', onVoicesReady)
          this.doSynthesize(request.text, profile.speechApiKeywords, rate, pitch, resolve, reject)
        }
        speechSynthesis.addEventListener('voiceschanged', onVoicesReady)
        // 超时保护：500ms 后即使没等到也继续
        setTimeout(() => {
          speechSynthesis.removeEventListener('voiceschanged', onVoicesReady)
          if (voices.length === 0) {
            this.doSynthesize(request.text, profile.speechApiKeywords, rate, pitch, resolve, reject)
          }
        }, 500)
        return
      }

      this.doSynthesize(request.text, profile.speechApiKeywords, rate, pitch, resolve, reject)
    })
  }

  private doSynthesize(
    text: string,
    keywords: string[],
    rate: number,
    pitch: number,
    resolve: (v: TtsResult) => void,
    reject: (e: Error) => void
  ): void {
    const voice = selectVoice(keywords)
    const chunks = splitText(text)
    const charPerSecond = 3.5  // 中文默认语速
    const estimatedDuration = text.length / charPerSecond

    // 如果没有可用语音，直接失败
    if (!voice && speechSynthesis.getVoices().length > 0) {
      // 有 voices 但没匹配到中文的，用第一个
      const fallback = speechSynthesis.getVoices()[0]
      if (!fallback) {
        reject(new Error('浏览器没有可用的语音合成引擎'))
        return
      }
    }

    const selectedVoice = voice || speechSynthesis.getVoices()[0]
    let currentTime = 0
    let totalDuration = 0
    const visemeFrames: VisemeTimeline = []

    // 逐段合成（记录时序）
    const speakChunk = (index: number): void => {
      if (index >= chunks.length) {
        // 所有分段完成
        totalDuration = currentTime + 0.5 // 末尾静音缓冲
        const finalTimeline = request.withViseme !== false
          ? generateVisemeTimeline(text, totalDuration, charPerSecond)
          : undefined

        resolve({
          audioUrl: '', // 浏览器引擎不生成音频 URL，直接通过扬声器播放
          duration: totalDuration,
          visemeTimeline: finalTimeline,
          engine: 'browser',
        })
        return
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index])
      utterance.voice = selectedVoice
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = 1.0

      const chunkStartTime = currentTime

      // 监听边界事件用于计算时间轴
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (event.name === 'word') {
          currentTime = chunkStartTime + (event.elapsedTime / 1000)
        }
      }

      utterance.onend = () => {
        currentTime = chunkStartTime + chunks[index].length / charPerSecond
        speakChunk(index + 1)
      }

      utterance.onerror = (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') {
          // 被中断不算错误，跳过后续分段
          return
        }
        console.warn(`[TTS BrowserEngine] 分段合成警告: ${event.error}`)
        // 警告不阻塞，继续下一段
        speakChunk(index + 1)
      }

      speechSynthesis.speak(utterance)
    }

    speakChunk(0)
  }
}

// ─── 服务端引擎 ───
export class ServerEngine implements ITtsEngine {
  readonly name = 'server'

  /** 请求超时毫秒数 */
  private timeout: number

  constructor(timeout: number = 4000) {
    this.timeout = timeout
  }

  isAvailable(): boolean {
    // 服务端引擎总是尝试调用，由调用方判断是否可用
    return true
  }

  async synthesize(request: TtsRequest): Promise<TtsResult> {
    const profile = VOICE_PROFILES[request.voice || 'gentle-female']

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(synthesizeApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: request.text,
          voice: request.voice || 'gentle-female',
          rate: request.rate ?? profile.rate,
          pitch: request.pitch ?? profile.pitch,
          with_viseme: request.withViseme !== false,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`服务端 TTS 返回 ${response.status}`)
      }

      const data = await response.json()

      return {
        audioUrl: data.audio_url || data.audio_base64
          ? `data:audio/mp3;base64,${data.audio_base64}`
          : data.audio_url,
        duration: data.duration || request.text.length / 3.5,
        visemeTimeline: data.viseme_timeline || undefined,
        engine: 'server',
      }
    } catch (err) {
      clearTimeout(timeoutId)
      if ((err as Error).name === 'AbortError') {
        throw new Error('服务端 TTS 请求超时')
      }
      throw err
    }
  }
}

// ─── 引擎工厂 ───
let browserEngine: BrowserEngine | null = null
let serverEngine: ServerEngine | null = null

export function getBrowserEngine(): BrowserEngine {
  if (!browserEngine) browserEngine = new BrowserEngine()
  return browserEngine
}

export function getServerEngine(): ServerEngine {
  if (!serverEngine) serverEngine = new ServerEngine()
  return serverEngine
}

/**
 * 智能合成：优先尝试服务端引擎，失败自动回退浏览器引擎。
 * 这是游客端推荐使用的合成入口。
 */
export async function synthesizeWithFallback(request: TtsRequest): Promise<TtsResult> {
  const server = getServerEngine()

  try {
    const result = await server.synthesize(request)
    return result
  } catch (serverErr) {
    console.warn('[TTS] 服务端合成失败，回退到浏览器引擎:', serverErr)

    const browser = getBrowserEngine()
    if (!browser.isAvailable()) {
      throw new Error('TTS 不可用：服务端失败且浏览器不支持语音合成')
    }

    try {
      return await browser.synthesize(request)
    } catch (browserErr) {
      throw new Error(`TTS 完全不可用: ${browserErr}`)
    }
  }
}
