/**
 * 对话 API 服务
 *
 * 后端接口：
 * - POST /api/chat/send      { session_id, type, content, audio_base64? }  → SSE 流
 * - GET  /api/chat/history   ?session_id=&page=&pageSize=  → { messages, total }
 * - POST /api/asr/transcribe  FormData { audio, duration }  → { text }
 */
import { getUseMock, apiGet, apiPost, apiUpload, getBaseURL } from './api-client'

export interface SendMessageParams {
  text?: string
  /** 语音消息：音频 Blob（WebM / WAV）—— 用于后端 ASR */
  audioBlob?: Blob | null
  /** 语音消息：前端已识别的文字（Web Speech API 结果） */
  preTranscribed?: string
  sessionId?: string
  duration?: number
}

/**
 * 发送消息（文本或语音）
 *
 * 语音消息三种路径：
 *   1. preTranscribed 有值 → 直接用前端 ASR 结果发文字消息（最快）
 *   2. audioBlob 有值 → base64 编码后发 voice 类型消息，后端做转写
 *   3. 都没有 → 纯文本消息
 */
export async function sendMessage(params: SendMessageParams) {
  const { text, audioBlob, preTranscribed, sessionId = 'default', duration } = params

  // Mock 模式
  if (getUseMock()) {
    await new Promise((r) => setTimeout(r, 600))
    const display = preTranscribed || text || '语音消息'
    return {
      id: Date.now(),
      reply: `（Mock）关于「${display.slice(0, 20)}…」的问题，灵山大佛高88米，是景区核心地标。`,
      audioUrl: '',
      visemes: [],
    }
  }

  // 路径 1：前端已识别 → 直接用文字发
  if (preTranscribed) {
    return apiPost('/api/chat/send', {
      session_id: sessionId,
      type: 'text',
      content: preTranscribed,
    })
  }

  // 路径 2：有音频 Blob → base64 编码后发 voice 类型
  if (audioBlob && audioBlob.size > 0) {
    const audioBase64 = await blobToBase64(audioBlob)
    return apiPost('/api/chat/send', {
      session_id: sessionId,
      type: 'voice',
      content: text || '',
      audio_base64: audioBase64,
      duration: duration || 0,
    })
  }

  // 路径 3：纯文本
  return apiPost('/api/chat/send', {
    session_id: sessionId,
    type: 'text',
    content: text || '',
  })
}

/**
 * 发送纯文本消息（兼容旧接口）
 */
export async function sendTextMessage(text: string, sessionId = 'default') {
  return sendMessage({ text, sessionId })
}

/**
 * 仅上传音频做 ASR 转写（不发送到对话）
 */
export async function transcribeAudio(audioBlob: Blob, duration = 0): Promise<string> {
  if (getUseMock()) {
    await new Promise((r) => setTimeout(r, 400))
    return '（Mock ASR 转写结果）'
  }
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('duration', String(duration))
  const data = await apiUpload('/api/asr/transcribe', formData)
  return data?.text || ''
}

export async function getChatHistory(page = 1, pageSize = 30) {
  if (getUseMock()) return { messages: [], total: 0 }
  return apiGet(`/api/chat/history?page=${page}&pageSize=${pageSize}`)
}

/** Blob → base64（去掉 data URL 前缀） */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 去掉 "data:audio/webm;base64," 前缀，只保留纯 base64
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Blob base64 编码失败'))
    reader.readAsDataURL(blob)
  })
}
