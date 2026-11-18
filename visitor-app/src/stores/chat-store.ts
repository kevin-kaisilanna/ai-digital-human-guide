/**
 * 对话状态 (Pinia)
 * 消息列表 / 输入状态 / 流式接收中 / 错误
 * 通过 /api/chat-records/* API 持久化到 chat-records.json
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  initChatStorage,
  fetchSessions,
  createSession,
  deleteSession as delSession,
  fetchSession,
  appendMessage,
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

function toChatMsg(m: ChatMessage): ChatMsg {
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

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  const inputText = ref('')
  const error = ref<string | null>(null)
  const sessionId = ref('')
  const sessions = ref<ChatSession[]>([])

  // 初始化：从磁盘加载
  initChatStorage().then(async () => {
    sessions.value = await fetchSessions()
    const active = sessions.value.filter((s) => s.status === 'active')
    if (active.length > 0) {
      sessionId.value = active[0].session_id
      messages.value = active[0].messages
    } else {
      const userStore = useUserStore()
      const s = await createSession(undefined, userStore.accountName)
      sessionId.value = s.session_id
    }
  })

  async function addMessage(msg: ChatMessage) {
    messages.value.push(msg)
    if (sessionId.value) {
      appendMessage(sessionId.value, toChatMsg(msg)).catch((e) =>
        console.warn('[chat-store] 写盘失败:', e.message),
      )
    }
  }

  async function addMessages(msgs: ChatMessage[]) {
    messages.value.push(...msgs)
    for (const m of msgs) {
      if (sessionId.value) {
        appendMessage(sessionId.value, toChatMsg(m)).catch(() => {})
      }
    }
  }

  function setStreaming(v: boolean) { isStreaming.value = v }
  function setError(e: string | null) { error.value = e }

  function clearMessages() {
    messages.value = []
    error.value = null
  }

  async function newChat() {
    const userStore = useUserStore()
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

  async function loadSession(sid: string) {
    const s = await fetchSession(sid)
    sessionId.value = s.session_id
    messages.value = s.messages
  }

  return {
    messages, isStreaming, inputText, error, sessionId, sessions,
    addMessage, addMessages, setStreaming, setError, clearMessages,
    newChat, removeChat, loadSession,
  }
})
