/**
 * native-mock-server — APK 离线 mock 服务
 *
 * Capacitor APK 中没有 Vite dev server 和代理，所有 /api/* 请求
 * 都会失败。本模块拦截这些请求，用 localStorage 本地处理。
 *
 * 覆盖的 API：
 *   /api/user/login|register|recover|display-name|password|profile|preferences
 *   /api/chat-records/*
 *   /api/chat/send
 *   /api/chat/history
 */

// ═══════════════════════════════════════════════
//  用户管理（复用 user-storage.ts 的 localStorage 逻辑）
// ═══════════════════════════════════════════════

const USERS_KEY = 'visitor_app_users'
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'current_user'
const CHAT_SESSIONS_KEY = 'visitor_app_chat_sessions'

interface StoredUser {
  username: string
  password: string
  displayName: string
  createdAt: string
  status: 'active' | 'disabled'
  lastLoginAt: string | null
  totalChats: number
  totalMessages: number
}

function readUsers(): Record<string, StoredUser> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') } catch { return {} }
}
function writeUsers(u: Record<string, StoredUser>) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }

function makeToken() { return 'tk-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10) }

/** 确保种子数据存在 */
function ensureSeedUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    const seed: Record<string, StoredUser> = {
      'test': {
        username: 'test', password: '1234', displayName: '测试游客',
        createdAt: new Date().toISOString(), status: 'active',
        lastLoginAt: null, totalChats: 0, totalMessages: 0,
      },
      'admin': {
        username: 'admin', password: 'admin', displayName: '管理员',
        createdAt: new Date().toISOString(), status: 'active',
        lastLoginAt: null, totalChats: 0, totalMessages: 0,
      },
    }
    writeUsers(seed)
  }
}

// ═══════════════════════════════════════════════
// 聊天记录（localStorage 版）
// ═══════════════════════════════════════════════

interface ChatMsg {
  id: number; role: 'user' | 'ai'; type: 'text' | 'voice'
  content: string; time: string; duration?: number
  emotion?: string; action?: string
}
interface ChatSession {
  session_id: string; title: string
  status: 'active' | 'archived'
  created_at: string; updated_at: string; messages: ChatMsg[]
}

function readSessions(): ChatSession[] {
  try { return JSON.parse(localStorage.getItem(CHAT_SESSIONS_KEY) || '[]') } catch { return [] }
}
function writeSessions(s: ChatSession[]) { localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(s)) }
function now() { return new Date().toISOString() }

// ═══════════════════════════════════════════════
//  路由分发
// ═══════════════════════════════════════════════

export async function handleNativeRequest(
  method: string,
  rawPath: string,
  body: any,
): Promise<Response> {
  // 去掉 /mock-api 前缀（getBaseURL() 在原生模式返回 /mock-api）
  const path = rawPath.replace(/^\/mock-api/, '')
  ensureSeedUsers()

  try {
    // ── 用户 API ──
    if (path === '/api/user/register' && method === 'POST')
      return handleRegister(body)
    if (path === '/api/user/login' && method === 'POST')
      return handleLogin(body)
    if (path === '/api/user/recover' && method === 'POST')
      return handleRecover(body)
    if (path === '/api/user/profile' && method === 'GET')
      return handleGetProfile()
    if (path === '/api/user/display-name' && method === 'PUT')
      return handleUpdateDisplayName(body)
    if (path === '/api/user/password' && method === 'PUT')
      return handleChangePassword(body)
    if (path === '/api/user/preferences' && method === 'PUT')
      return json({ ok: true })

    // ── 聊天记录 API ──
    if (path === '/api/chat-records/sessions' && method === 'GET')
      return handleListSessions()
    if (path === '/api/chat-records/sessions' && method === 'POST')
      return handleCreateSession(body)
    if (path.match(/^\/api\/chat-records\/sessions\/[^/]+$/) && method === 'GET')
      return handleGetSession(path)
    if (path.match(/^\/api\/chat-records\/sessions\/[^/]+$/) && method === 'DELETE')
      return handleDeleteSession(path)
    if (path.match(/^\/api\/chat-records\/sessions\/[^/]+$/) && method === 'PATCH')
      return handlePatchSession(path, body)
    if (path.match(/^\/api\/chat-records\/sessions\/[^/]+\/messages$/) && method === 'POST')
      return handleAppendMessage(path, body)
    if (path.match(/^\/api\/chat-records\/sessions\/[^/]+\/messages\/\d+$/) && method === 'PUT')
      return handleUpdateMessage(path, body)

    // ── 对话 API ──
    if (path === '/api/chat/send' && method === 'POST')
      return handleChatSend(body)
    if (path.startsWith('/api/chat/history') && method === 'GET')
      return json({ messages: [], total: 0 })

    // ── ASR / 其他 — 返回空，由调用方自行降级 ──
    if (path.startsWith('/api/asr/'))
      return json({ text: '' })

    // ── 未匹配 → 尝试真实网络请求 ──
    return json({ error: `离线模式不支持: ${method} ${path}` }, 404)
  } catch (e: any) {
    return json({ error: e.message || '内部错误' }, 500)
  }
}

// ═══════════════════════════════════════════════
//  Handler 实现
// ═══════════════════════════════════════════════

function handleRegister(body: any): Response {
  const { username, password } = body || {}
  if (!username || username.trim().length < 2)
    return json({ error: '用户名至少需要 2 个字符' }, 400)
  if (!password || password.length < 4)
    return json({ error: '密码至少需要 4 个字符' }, 400)

  const users = readUsers()
  const key = username.toLowerCase().trim()
  if (users[key]) return json({ error: '该用户名已被注册，请换一个' }, 409)

  const user: StoredUser = {
    username: username.trim(), password, displayName: username.trim(),
    createdAt: now(), status: 'active', lastLoginAt: now(),
    totalChats: 0, totalMessages: 0,
  }
  users[key] = user
  writeUsers(users)

  const token = makeToken()
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return json({ token, user })
}

function handleLogin(body: any): Response {
  const { username, password } = body || {}
  const users = readUsers()
  const key = (username || '').toLowerCase().trim()
  const user = users[key]
  if (!user) return json({ error: '账号不存在，请先注册' }, 401)
  if (user.password !== password) return json({ error: '密码错误，请重试' }, 401)

  user.lastLoginAt = now()
  writeUsers(users)

  const token = makeToken()
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return json({ token, user })
}

function handleRecover(body: any): Response {
  const { username } = body || {}
  const users = readUsers()
  const key = (username || '').toLowerCase().trim()
  const user = users[key]
  if (!user) return json({ error: '该账号不存在' }, 404)

  const newPassword = Math.random().toString(36).slice(2, 10)
  user.password = newPassword
  writeUsers(users)
  return json({ newPassword })
}

function handleGetProfile(): Response {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) return json(JSON.parse(raw))
  } catch {}
  return json({ name: '游客', id: '—', preferences: [] })
}

function handleUpdateDisplayName(body: any): Response {
  const { username, displayName } = body || {}
  if (!displayName || displayName.length > 20) return json({ error: '昵称 1-20 个字符' }, 400)
  const users = readUsers()
  const key = (username || '').toLowerCase()
  if (!users[key]) return json({ error: '用户不存在' }, 404)
  users[key].displayName = displayName
  writeUsers(users)
  return json({ user: users[key] })
}

function handleChangePassword(body: any): Response {
  const { username, oldPassword, newPassword } = body || {}
  const users = readUsers()
  const key = (username || '').toLowerCase()
  if (!users[key]) return json({ error: '用户不存在' }, 404)
  if (users[key].password !== oldPassword) return json({ error: '原密码错误' }, 403)
  if (!newPassword || newPassword.length < 4) return json({ error: '新密码至少 4 个字符' }, 400)
  users[key].password = newPassword
  writeUsers(users)
  return json({ ok: true })
}

// ── 聊天会话 ──

let _nextMsgId = Date.now()
function nextId() { return ++_nextMsgId }

function handleListSessions(): Response {
  return json(readSessions())
}

function handleGetSession(path: string): Response {
  const id = decodeURIComponent(path.split('/').pop()!)
  const s = readSessions().find(s => s.session_id === id)
  return s ? json(s) : json({ error: '会话不存在' }, 404)
}

function handleCreateSession(body: any): Response {
  const sessions = readSessions()
  const s: ChatSession = {
    session_id: 's-' + Date.now(),
    title: body?.title || '',
    status: 'active',
    created_at: now(),
    updated_at: now(),
    messages: [],
  }
  sessions.unshift(s)
  writeSessions(sessions)
  return json(s)
}

function handleDeleteSession(path: string): Response {
  const id = decodeURIComponent(path.split('/').pop()!)
  writeSessions(readSessions().filter(s => s.session_id !== id))
  return json({ ok: true })
}

function handlePatchSession(path: string, body: any): Response {
  const id = decodeURIComponent(path.split('/').pop()!)
  const sessions = readSessions()
  const s = sessions.find(s => s.session_id === id)
  if (!s) return json({ error: '会话不存在' }, 404)
  if (body?.status) s.status = body.status
  if (body?.title !== undefined) s.title = body.title
  s.updated_at = now()
  writeSessions(sessions)
  return json(s)
}

function handleAppendMessage(path: string, body: any): Response {
  const parts = path.split('/')
  const id = decodeURIComponent(parts[parts.indexOf('sessions') + 1])
  const sessions = readSessions()
  const s = sessions.find(s => s.session_id === id)
  if (!s) return json({ error: '会话不存在' }, 404)
  const msg = body?.msg || body
  msg.id = msg.id || nextId()
  msg.time = msg.time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  s.messages.push(msg)
  // 首条用户消息 → 自动标题
  if (!s.title && msg.role === 'user' && msg.content) {
    s.title = msg.content.slice(0, 20)
  }
  s.updated_at = now()
  writeSessions(sessions)
  return json(s)
}

function handleUpdateMessage(path: string, body: any): Response {
  const parts = path.split('/')
  const id = decodeURIComponent(parts[parts.indexOf('sessions') + 1])
  const msgId = parseInt(parts.pop()!)
  const sessions = readSessions()
  const s = sessions.find(s => s.session_id === id)
  if (!s) return json({ error: '会话不存在' }, 404)
  const msg = s.messages.find(m => m.id === msgId)
  if (!msg) return json({ error: '消息不存在' }, 404)
  Object.assign(msg, body?.updates || body)
  s.updated_at = now()
  writeSessions(sessions)
  return json(s)
}

// ── 对话发送 ──

function handleChatSend(body: any): Response {
  const content: string = body?.content || ''
  // 本地模拟 AI 回复（匹配关键词）
  const lower = content.toLowerCase()
  let reply: string
  if (lower.includes('大佛') || lower.includes('佛像'))
    reply = '灵山大佛高88米，由青铜铸造，是世界最大的露天青铜佛像之一。🙏'
  else if (lower.includes('九龙') || lower.includes('灌浴'))
    reply = '九龙灌浴每天定时表演，模拟佛祖诞生时九龙吐水的壮观场景。建议上午10点前往观赏。'
  else if (lower.includes('梵宫'))
    reply = '梵宫是灵山胜境的另一地标，内部装饰极其华丽，被誉为"东方卢浮宫"。'
  else if (lower.includes('五印') || lower.includes('坛城'))
    reply = '五印坛城是藏传佛教风格建筑，红白相间，拍照非常出片！📸'
  else
    reply = `关于「${content.slice(0, 20)}」的问题，小云正在努力学习中。灵山胜境很大，建议预留3-4小时游览时间，可以先看大佛再去梵宫哦～`
  return json({
    id: Date.now(),
    reply,
    audioUrl: '',
    visemes: [],
  })
}

// ═══════════════════════════════════════════════
//  工具
// ═══════════════════════════════════════════════

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}