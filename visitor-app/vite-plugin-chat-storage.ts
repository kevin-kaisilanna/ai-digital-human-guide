/**
 * Vite 插件 — 聊天记录文件级持久化
 *
 * 拦截 /api/chat-records/* 请求，直接读写 data/chat-records.json 文件。
 * 每条消息实时写入磁盘，JSON 文件即数据库。
 *
 * API:
 *   GET    /api/chat-records/sessions               → 获取全部会话列表
 *   GET    /api/chat-records/sessions/:id             → 获取单个会话
 *   POST   /api/chat-records/sessions                 → 创建新会话  { title? }
 *   DELETE /api/chat-records/sessions/:id             → 删除会话
 *   POST   /api/chat-records/sessions/:id/messages    → 追加消息     { msg }
 *   PUT    /api/chat-records/sessions/:id/messages/:msgId → 更新消息  { updates }
 *   PATCH  /api/chat-records/sessions/:id             → 归档/重命名  { status?, title? }
 */

import type { Plugin, ViteDevServer } from 'vite'
import fs from 'fs'
import path from 'path'

let CHAT_FILE = ''

// ---- 类型 ----

interface ChatMsg {
  id: number
  role: 'user' | 'ai'
  type: 'text' | 'voice'
  content: string
  time: string
  duration?: number
  emotion?: string
  action?: string
}

interface ChatSession {
  session_id: string
  username: string
  title: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  messages: ChatMsg[]
}

// ---- 文件读写 ----

function readSessions(): ChatSession[] {
  try {
    if (!fs.existsSync(CHAT_FILE)) return []
    const raw = fs.readFileSync(CHAT_FILE, 'utf-8')
    return JSON.parse(raw) as ChatSession[]
  } catch {
    return []
  }
}

function writeSessions(sessions: ChatSession[]): void {
  const dir = path.dirname(CHAT_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(CHAT_FILE, JSON.stringify(sessions, null, 2), 'utf-8')
}

// ---- 工具 ----

function genSessionId(): string {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
}

async function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: string) => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { resolve({}) }
    })
  })
}

function jsonResponse(res: any, status: number, data: any): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function extractId(pathname: string, prefix: string): string | null {
  const rest = pathname.replace(prefix, '')       //  "/sessions" or "/sessions/:id" or "/sessions/:id/messages" or "/sessions/:id/messages/:msgId"
  const parts = rest.replace(/^\//, '').split('/') // ["sessions"] or ["sessions","id"] or ["sessions","id","messages"] or ["sessions","id","messages","msgId"]
  if (parts[0] !== 'sessions') return null
  return parts[1] || null   // session_id or undefined
}

function extractMsgId(pathname: string): string | null {
  // 路径: /api/chat-records/sessions/:id/messages/:msgId
  // parts: ["api","chat-records","sessions",":id","messages",":msgId"]
  const parts = pathname.replace(/^\//, '').split('/')
  if (parts.length >= 6 && parts[4] === 'messages') {
    return parts[5] || null
  }
  return null
}

// ---- 插件 ----

export function chatStoragePlugin(): Plugin {
  return {
    name: 'vite-chat-storage-plugin',
    configureServer(server: ViteDevServer) {
      // 用 Vite 项目根目录，不受 npm run dev 启动目录影响
      CHAT_FILE = path.resolve(server.config.root, 'public/data/chat-records.json')
      server.middlewares.use(async (req: any, res: any, next: () => void) => {
        // 拦截 /api/chat-records/* 和 /mock-api/api/chat-records/*（兼容 USE_MOCK=true）
        const urlStr = req.url || ''
        const isChatApi = urlStr.startsWith('/api/chat-records/') || urlStr.startsWith('/mock-api/api/chat-records/')
        if (!isChatApi) return next()

        // 规范化路径：/mock-api/api/chat-records/* → /api/chat-records/*
        let pathname = urlStr.split('?')[0]
        const mockPrefix = '/mock-api'
        if (pathname.startsWith(mockPrefix)) {
          pathname = pathname.slice(mockPrefix.length)
        }
        const url = new URL(urlStr.replace(/^\/mock-api/, ''), 'http://localhost')
        const sessionId = extractId(pathname, '/api/chat-records')
        const msgId = sessionId ? extractMsgId(pathname) : null

        try {
          // ═══════════ GET /api/chat-records/sessions ═══════════
          if (pathname === '/api/chat-records/sessions' && req.method === 'GET') {
            const filterUsername = url.searchParams.get('username') || ''
            let list = readSessions()
            if (filterUsername) {
              list = list.filter((s) => s.username === filterUsername)
            }
            return jsonResponse(res, 200, list)
          }

          // ═══════════ GET /api/chat-records/sessions/:id ═══════════
          if (sessionId && !msgId && pathname === `/api/chat-records/sessions/${sessionId}` && req.method === 'GET') {
            const list = readSessions()
            const session = list.find((s) => s.session_id === sessionId)
            if (!session) return jsonResponse(res, 404, { error: '会话不存在' })
            return jsonResponse(res, 200, session)
          }

          // ═══════════ POST /api/chat-records/sessions ═══════════
          if (pathname === '/api/chat-records/sessions' && req.method === 'POST') {
            const { title, username } = await parseBody(req)
            const now = new Date().toISOString()
            const session: ChatSession = {
              session_id: genSessionId(),
              username: username || '',
              title: title || '新对话',
              status: 'active',
              created_at: now,
              updated_at: now,
              messages: [],
            }
            const list = readSessions()
            list.unshift(session)
            writeSessions(list)
            console.log(`[chat-storage] ✅ 新会话: ${session.session_id}`)
            return jsonResponse(res, 200, session)
          }

          // ═══════════ DELETE /api/chat-records/sessions/:id ═══════════
          if (sessionId && !msgId && pathname === `/api/chat-records/sessions/${sessionId}` && req.method === 'DELETE') {
            const list = readSessions()
            const index = list.findIndex((s) => s.session_id === sessionId)
            if (index === -1) return jsonResponse(res, 404, { error: '会话不存在' })
            const removed = list.splice(index, 1)[0]
            writeSessions(list)
            console.log(`[chat-storage] 🗑️ 删除会话: ${removed.title}  (${removed.messages.length} 条消息)`)
            return jsonResponse(res, 200, { deleted: sessionId })
          }

          // ═══════════ PATCH /api/chat-records/sessions/:id ═══════════
          if (sessionId && !msgId && pathname === `/api/chat-records/sessions/${sessionId}` && req.method === 'PATCH') {
            const { status, title } = await parseBody(req)
            const list = readSessions()
            const session = list.find((s) => s.session_id === sessionId)
            if (!session) return jsonResponse(res, 404, { error: '会话不存在' })
            if (status) session.status = status
            if (title !== undefined) session.title = title
            session.updated_at = new Date().toISOString()
            writeSessions(list)
            console.log(`[chat-storage] ✏️ 更新会话: ${sessionId}`)
            return jsonResponse(res, 200, session)
          }

          // ═══════════ POST /api/chat-records/sessions/:id/messages ═══════════
          if (sessionId && pathname === `/api/chat-records/sessions/${sessionId}/messages` && req.method === 'POST') {
            const { msg } = await parseBody(req)
            if (!msg || !msg.role) {
              return jsonResponse(res, 400, { error: '消息格式无效' })
            }
            const list = readSessions()
            const session = list.find((s) => s.session_id === sessionId)
            if (!session) return jsonResponse(res, 404, { error: '会话不存在' })

            session.messages.push(msg)
            session.updated_at = new Date().toISOString()
            // 自动标题
            if (session.title === '新对话' && msg.role === 'user') {
              session.title = msg.content.slice(0, 20) + (msg.content.length > 20 ? '…' : '')
            }
            writeSessions(list)
            return jsonResponse(res, 200, { ok: true, session })
          }

          // ═══════════ PUT /api/chat-records/sessions/:id/messages/:msgId ═══════════
          if (sessionId && msgId && pathname === `/api/chat-records/sessions/${sessionId}/messages/${msgId}` && req.method === 'PUT') {
            const { updates } = await parseBody(req)
            const list = readSessions()
            const session = list.find((s) => s.session_id === sessionId)
            if (!session) return jsonResponse(res, 404, { error: '会话不存在' })
            const msg = session.messages.find((m) => m.id === Number(msgId))
            if (!msg) return jsonResponse(res, 404, { error: '消息不存在' })
            Object.assign(msg, updates)
            session.updated_at = new Date().toISOString()
            writeSessions(list)
            return jsonResponse(res, 200, { ok: true, session })
          }

          return next()
        } catch (e: any) {
          console.error('[chat-storage] 错误:', e.message)
          return jsonResponse(res, 500, { error: '服务器内部错误' })
        }
      })
    },
  }
}
