/**
 * useChat — 对话管理
 *
 * 双通道并行：
 *   ① /api/chat/send（SSE 流式）→ AI 大脑
 *   ② /api/chat-records/*（Vite 插件写盘）→ chat-records.json 持久化
 *
 * 每条用户消息 & AI 回复都实时写入磁盘文件。
 */

import { ref } from 'vue'
import { getBaseURL } from '@/services/api-client'
import {
  initChatStorage,
  fetchSessions,
  fetchSession,
  createSession,
  deleteSession as delSession,
  appendMessage,
  updateMessage,
} from '@/services/chat-storage'
import type { ChatSession, ChatMsg } from '@/services/chat-storage'
import { useUserStore } from '@/stores/user-store'

export interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  type: 'text' | 'voice'
  content: string
  time: string
  duration?: number
  emotion?: string
  action?: string
}

/** 单例状态 */
const messages = ref<ChatMessage[]>([])
const isStreaming = ref(false)
const error = ref<string | null>(null)
const currentEmotion = ref('开心')
const currentAction = ref('无')
const sessionId = ref('')
const sessions = ref<ChatSession[]>([])

let _ready = false

export function useChat() {
  const userStore = useUserStore()

  // ── 初始化：从磁盘加载已有会话 ──
  if (!_ready) {
    _ready = true
    initChatStorage().then(async () => {
      sessions.value = await fetchSessions()
      const active = sessions.value.filter((s) => s.status === 'active')
      if (active.length > 0) {
        const last = active[0]
        sessionId.value = last.session_id
        messages.value = last.messages
      } else {
        const s = await createSession(undefined, userStore.accountName)
        sessionId.value = s.session_id
        messages.value = []
        sessions.value = await fetchSessions()
      }
    })
  }
  if (!sessionId.value) {
    sessionId.value = 'visitor-' + Date.now()
  }

  // ── 工具 ──

  function timeNow(): string {
    return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  function msgToChatMsg(m: ChatMessage): ChatMsg {
    return {
      id: m.id,
      role: m.role,
      type: m.type,
      content: m.content,
      time: m.time,
      duration: m.duration,
      emotion: m.emotion,
      action: m.action,
    }
  }

  /** 确保有效 session（首次发消息时从临时 ID 转为正式 session） */
  async function ensureSession( firstContent?: string) {
    if (sessionId.value.startsWith('visitor-')) {
      const s = await createSession(firstContent?.slice(0, 20), userStore.accountName)
      sessionId.value = s.session_id
      // 回填已在内存中的消息
      for (const m of messages.value) {
        await appendMessage(sessionId.value, msgToChatMsg(m)).catch(() => {})
      }
      sessions.value = await fetchSessions()
    }
  }

  /** 使用浏览器 SpeechSynthesis 进行 TTS 语音播报 */
  function speakReply(text: string) {
    if (!text || typeof speechSynthesis === 'undefined') return
    // Strip emotion tags from text before speaking
    const clean = text.replace(/表情[：:].+?[|｜]动作[：:].+$/gm, '').trim()
    if (!clean) return

    const utterance = new SpeechSynthesisUtterance(clean)

    // 检测语言：含 CJK 字符 → 中文，否则 → 英文
    const isEnglish = !/[一-鿿　-〿＀-￯]/.test(clean)

    const voices = speechSynthesis.getVoices()

    if (isEnglish) {
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1.0
      const enVoice = voices.find(v => v.lang.startsWith('en-US'))
        || voices.find(v => v.lang.startsWith('en'))
      if (enVoice) utterance.voice = enVoice
    } else {
      utterance.lang = 'zh-CN'
      utterance.rate = 0.95
      utterance.pitch = 1.05
      const zhVoice = voices.find(v => v.lang.startsWith('zh-CN'))
        || voices.find(v => v.lang.startsWith('zh'))
      if (zhVoice) utterance.voice = zhVoice
    }

    speechSynthesis.cancel() // cancel any previous speech
    speechSynthesis.speak(utterance)
  }

  // ── 核心：发送消息 ──

  async function send(msg: Pick<ChatMessage, 'role' | 'type' | 'content' | 'duration'>) {
    const userMsg: ChatMessage = {
      id: Date.now(),
      ...msg,
      time: timeNow(),
      content: msg.content || '',
    }
    messages.value.push(userMsg)

    // ★ 写盘：用户消息
    if (!sessionId.value.startsWith('visitor-')) {
      appendMessage(sessionId.value, msgToChatMsg(userMsg)).catch((e) =>
        console.warn('[chat-storage] 写盘失败:', e.message),
      )
    }

    if (msg.role === 'ai' || !msg.content) return

    isStreaming.value = true
    error.value = null

    // 首次消息 → 创建正式 session
    await ensureSession(msg.content)

    try {
      const base = getBaseURL()
      const response = await fetch(`${base}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId.value,
          type: msg.type,
          content: msg.content,
        }),
      })

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'ai',
        type: 'text',
        content: '',
        time: timeNow(),
      }
      messages.value.push(aiMsg)
      // ★ 写盘：AI 占位
      appendMessage(sessionId.value, msgToChatMsg(aiMsg)).catch(() => {})

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'text') {
                aiMsg.content += (data.content || '').replace(
                  /表情[：:]\s*.{1,4}\s*[|｜]\s*动作[：:]\s*.{1,6}/g,
                  '',
                )
              } else if (data.type === 'emotion') {
                currentEmotion.value = data.content || '开心'
                aiMsg.emotion = data.content
              } else if (data.type === 'action') {
                currentAction.value = data.content || '无'
                aiMsg.action = data.content
              } else if (data.type === 'done') {
                // SSE complete -> trigger TTS voice output
                speakReply(aiMsg.content)
              }
            } catch { /* skip */ }
          }
        }
      }
      aiMsg.content = aiMsg.content || '(收到空回复)'

      // ★ 写盘：流式完成 → 更新 AI 消息
      updateMessage(sessionId.value, aiMsg.id, {
        content: aiMsg.content,
        emotion: aiMsg.emotion,
        action: aiMsg.action,
      }).catch(() => {})
    } catch (e: any) {
      error.value = e.message
      const fallback: ChatMessage = {
        id: Date.now() + 1,
        role: 'ai',
        type: 'text',
        content: '抱歉，小云暂时无法连接。请稍后重试。',
        time: timeNow(),
      }
      messages.value.push(fallback)
      appendMessage(sessionId.value, msgToChatMsg(fallback)).catch(() => {})
    } finally {
      isStreaming.value = false
    }
  }

  // ── 会话管理 ──

  async function loadSession(sid: string) {
    const s = await fetchSession(sid)
    sessionId.value = s.session_id
    messages.value = s.messages
  }

  function loadHistory(history: ChatMessage[]) {
    messages.value = history
  }

  function clearMessages() {
    messages.value = []
    error.value = null
  }

  async function newChat() {
    const s = await createSession(undefined, userStore.accountName)
    sessionId.value = s.session_id
    messages.value = []
    sessions.value = await fetchSessions()
  }

  async function removeChat(sid: string) {
    await delSession(sid)
    sessions.value = await fetchSessions()
    if (sid === sessionId.value) {
      const active = sessions.value.filter((s) => s.status === 'active')
      if (active.length > 0) {
        sessionId.value = active[0].session_id
        messages.value = active[0].messages
      } else {
        await newChat()
      }
    }
  }

  async function refreshSessions() {
    sessions.value = await fetchSessions()
  }

  return {
    messages, isStreaming, error, currentEmotion, currentAction,
    sessionId, sessions,
    send, loadSession, loadHistory, clearMessages,
    newChat, removeChat, refreshSessions,
  }
}
