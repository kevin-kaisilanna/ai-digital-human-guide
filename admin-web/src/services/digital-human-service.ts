/**
 * 数字人服务层
 *
 * 后端 API 占位（实际部署时替换为真实后端）：
 * - POST /api/digital-human/config         — 保存配置
 * - GET  /api/digital-human/config         — 获取配置
 * - POST /api/digital-human/synthesize     — TTS 合成 { text, voice } → { audioUrl }
 * - POST /api/digital-human/visemes        — 口型同步 { text } → { visemeTimeline }
 * - POST /api/digital-human/session        — 创建会话 { config } → { sessionId }
 */

import { getUseMock } from './api-client'
import { getDigitalHumanBase } from '@/config'

async function postTo(url: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${url} => ${res.status}`)
  return res.json().catch(() => ({}))
}

async function getFrom(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} => ${res.status}`)
  return res.json().catch(() => ({}))
}

export async function fetchConfig() {
  if (getUseMock()) return { voice: '温柔', emoji: '-', appearance: {}, clothing: {}, background: {} }
  const base = getDigitalHumanBase().replace(/\/$/, '')
  return getFrom(`${base}/api/digital-human/config`)
}

export async function saveConfig(cfg: any) {
  if (getUseMock()) return { ok: true }
  const base = getDigitalHumanBase().replace(/\/$/, '')
  return postTo(`${base}/api/digital-human/config`, cfg)
}

// ── 音色配置 API（使用 /api/config/voice 端点）─────────────────

export interface VoiceOption {
  per: number
  name: string
  desc: string
  cat: string
  scene: string
}

export interface CurrentVoice {
  per: number
  name: string
  description: string
  category: string
}

export interface VoiceConfigResponse {
  data: CurrentVoice
  options: VoiceOption[]
}

export interface VoiceUpdatePayload {
  per: number
  name?: string
  description?: string
  category?: string
}

/**
 * 获取当前音色配置 + 全部可选音色列表
 */
export async function fetchVoiceConfig(): Promise<VoiceConfigResponse> {
  const base = getDigitalHumanBase().replace(/\/$/, '')
  return getFrom(`${base}/api/config/voice`)
}

/**
 * 更新音色配置
 */
export async function updateVoiceConfig(payload: VoiceUpdatePayload): Promise<{ ok: boolean; data: CurrentVoice }> {
  const base = getDigitalHumanBase().replace(/\/$/, '')
  return putTo(`${base}/api/config/voice`, payload)
}

/** PUT 请求辅助（digital-human-service 之前没有 PUT） */
async function putTo(url: string, body: any) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT ${url} => ${res.status}`)
  return res.json().catch(() => ({ ok: false }))
}

export async function synthesizeSpeech(text: string, voice = '温柔') {
  if (getUseMock()) return { audioUrl: '/mock-audio/tts-sample.mp3' }
  const base = getDigitalHumanBase().replace(/\/$/, '')
  return postTo(`${base}/api/digital-human/synthesize`, { text, voice })
}

export async function generateVisemes(text: string) {
  if (getUseMock()) return { visemeTimeline: [] }
  const base = getDigitalHumanBase().replace(/\/$/, '')
  return postTo(`${base}/api/digital-human/visemes`, { text })
}

export async function createSession(config: any) {
  if (getUseMock()) return { sessionId: `mock-${Date.now()}` }
  const base = getDigitalHumanBase().replace(/\/$/, '')
  return postTo(`${base}/api/digital-human/session`, config)
}
