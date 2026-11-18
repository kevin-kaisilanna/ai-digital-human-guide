/**
 * 聊天记录持久化存储
 *
 * 通过 Vite 插件 (vite-plugin-chat-storage.ts) 暴露的 API
 * 直接读写 public/data/chat-records.json 文件。
 *
 * API（由 Vite 插件拦截，不走网络）:
 *   GET    /api/chat-records/sessions               → 全部会话列表
 *   GET    /api/chat-records/sessions/:id             → 单个会话
 *   POST   /api/chat-records/sessions                 → 新建会话    { title? }
 *   DELETE /api/chat-records/sessions/:id             → 删除会话
 *   POST   /api/chat-records/sessions/:id/messages    → 追加消息    { msg }
 *   PUT    /api/chat-records/sessions/:id/messages/:n → 更新消息    { updates }
 *   PATCH  /api/chat-records/sessions/:id             → 归档/重命名 { status?, title? }
 */

const BASE = '/api/chat-records'

// ---- 类型（与 chat-records.json 对齐）----

export interface ChatMsg {
  id: number
  role: 'user' | 'ai'
  type: 'text' | 'voice'
  content: string
  time: string
  duration?: number
  emotion?: string
  action?: string
}

export interface ChatSession {
  session_id: string
  title: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  messages: ChatMsg[]
}

// ---- 内部 fetch 封装 ----

async function get(path: string) {
  const res = await fetch(BASE + path)
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error((e as any).error || `${res.status}`)
  }
  return res.json()
}

async function post(path: string, body?: any) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error((e as any).error || `${res.status}`)
  }
  return res.json()
}

async function patch(path: string, body?: any) {
  const res = await fetch(BASE + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error((e as any).error || `${res.status}`)
  }
  return res.json()
}

async function del(path: string) {
  const res = await fetch(BASE + path, { method: 'DELETE' })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error((e as any).error || `${res.status}`)
  }
  return res.json()
}

// ---- 公开 API ----

let _initDone = false

/** 初始化（幂等） */
export async function initChatStorage(): Promise<void> {
  if (_initDone) return
  _initDone = true
  console.log('[chat-storage] 就绪 →', BASE)
}

/** 获取全部会话 */
export async function fetchSessions(): Promise<ChatSession[]> {
  return get('/sessions')
}

/** 获取单个会话 */
export async function fetchSession(id: string): Promise<ChatSession> {
  return get(`/sessions/${encodeURIComponent(id)}`)
}

/** 新建会话 */
export async function createSession(title?: string, username?: string): Promise<ChatSession> {
  return post('/sessions', { title, username: username || '' })
}

/** 删除会话 */
export async function deleteSession(id: string): Promise<boolean> {
  await del(`/sessions/${encodeURIComponent(id)}`)
  return true
}

/** 归档 / 重命名 */
export async function archiveSession(id: string): Promise<ChatSession>
export async function archiveSession(id: string, status: 'active' | 'archived'): Promise<ChatSession>
export async function archiveSession(id: string, status?: 'active' | 'archived'): Promise<ChatSession> {
  return patch(`/sessions/${encodeURIComponent(id)}`, { status: status || 'archived' })
}

export async function renameSession(id: string, title: string): Promise<ChatSession> {
  return patch(`/sessions/${encodeURIComponent(id)}`, { title })
}

/** 追加消息到会话 */
export async function appendMessage(sessionId: string, msg: ChatMsg): Promise<ChatSession> {
  return post(`/sessions/${encodeURIComponent(sessionId)}/messages`, { msg })
}

/** 更新会话中的某条消息（如流式回复完成后更新内容） */
export async function updateMessage(
  sessionId: string,
  msgId: number,
  updates: Partial<ChatMsg>,
): Promise<ChatSession> {
  return fetch(BASE + `/sessions/${encodeURIComponent(sessionId)}/messages/${msgId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  }).then((r) => r.json())
}
