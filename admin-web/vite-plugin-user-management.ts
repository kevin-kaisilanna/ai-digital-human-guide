/**
 * Vite 插件 — 管理员用户管理 API
 *
 * 拦截 /api/admin/users/* 请求，直接读写 public/data/admin-users.json。
 * 支持从 visitor-app 数据文件同步用户和聊天记录。
 *
 * API:
 *   GET    /api/admin/users                          → 列出所有用户（含统计）
 *   GET    /api/admin/users/stats                    → 聚合统计
 *   GET    /api/admin/users/:username                → 单个用户详情
 *   PUT    /api/admin/users/:username                → 更新用户信息
 *   DELETE /api/admin/users/:username                → 删除用户
 *   GET    /api/admin/users/:username/chats           → 用户聊天会话列表
 *   GET    /api/admin/users/:username/chats/:sessId   → 会话详情
 *   DELETE /api/admin/users/:username/chats/:sessId   → 删除会话
 *   POST   /api/admin/sync                           → 从 visitor-app 同步
 */

import type { Plugin, ViteDevServer } from 'vite'
import fs from 'fs'
import path from 'path'

let ADMIN_USERS_FILE = ''
let ACCOUNTS_FILE = ''
let VISITOR_USERS_FILE = ''
let VISITOR_CHAT_FILE = ''

// ---- 类型 ----

interface AdminUserRecord {
  username: string
  displayName: string
  createdAt: string
  status: 'active' | 'disabled'
  lastLoginAt: string | null
  totalChats: number
  totalMessages: number
  notes: string
  disabledAt: string | null
}

interface AdminUsersDB {
  users: AdminUserRecord[]
  version: number
  lastSyncedAt: string | null
}

interface VisitorUser {
  username: string
  password: string
  displayName: string
  createdAt: string
  status?: 'active' | 'disabled'
  lastLoginAt?: string | null
  totalChats?: number
  totalMessages?: number
}

interface VisitorUsersDB {
  [username: string]: VisitorUser
}

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

function readAdminDB(): AdminUsersDB {
  try {
    if (!fs.existsSync(ADMIN_USERS_FILE)) {
      return { users: [], version: 1, lastSyncedAt: null }
    }
    const raw = fs.readFileSync(ADMIN_USERS_FILE, 'utf-8')
    return JSON.parse(raw) as AdminUsersDB
  } catch {
    return { users: [], version: 1, lastSyncedAt: null }
  }
}

function writeAdminDB(db: AdminUsersDB): void {
  const dir = path.dirname(ADMIN_USERS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(ADMIN_USERS_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

// ---- accounts.json 读写（管理员登录账号）----

interface AdminAccount {
  username: string
  passwordHash: string
  email: string
  role: string
  createdAt: string
}

interface AccountsDB {
  admins: AdminAccount[]
  version: number
}

function readAccounts(): AccountsDB {
  try {
    if (!fs.existsSync(ACCOUNTS_FILE)) return { admins: [], version: 1 }
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8')
    return JSON.parse(raw) as AccountsDB
  } catch {
    return { admins: [], version: 1 }
  }
}

function writeAccounts(db: AccountsDB): void {
  const dir = path.dirname(ACCOUNTS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(db, null, 2), 'utf-8')
}

function readVisitorUsers(): VisitorUsersDB {
  try {
    if (!fs.existsSync(VISITOR_USERS_FILE)) return {}
    const raw = fs.readFileSync(VISITOR_USERS_FILE, 'utf-8')
    return JSON.parse(raw) as VisitorUsersDB
  } catch {
    return {}
  }
}

function readVisitorChats(): ChatSession[] {
  try {
    if (!fs.existsSync(VISITOR_CHAT_FILE)) return []
    const raw = fs.readFileSync(VISITOR_CHAT_FILE, 'utf-8')
    return JSON.parse(raw) as ChatSession[]
  } catch {
    return []
  }
}

function writeVisitorUsers(users: VisitorUsersDB): void {
  const dir = path.dirname(VISITOR_USERS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(VISITOR_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

// ---- 工具 ----

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

/** 从路径中提取 username */
function extractUsername(pathname: string): string | null {
  // /api/admin/users/:username 或 /api/admin/users/:username/chats 或 /api/admin/users/:username/chats/:sessId
  const parts = pathname.replace(/^\//, '').split('/')
  // parts: ["api","admin","users",":username"] or ["api","admin","users",":username","chats"] or ["api","admin","users",":username","chats",":sessId"]
  if (parts.length >= 4 && parts[0] === 'api' && parts[1] === 'admin' && parts[2] === 'users') {
    return parts[3] || null
  }
  return null
}

function extractSessionId(pathname: string): string | null {
  const parts = pathname.replace(/^\//, '').split('/')
  // parts: ["api","admin","users",":username","chats",":sessId"]
  if (parts.length >= 6 && parts[4] === 'chats') {
    return parts[5] || null
  }
  return null
}

/** 从 visitor-app 数据重新计算用户统计 */
function recalcUserStats(username: string): { totalChats: number; totalMessages: number } {
  const chats = readVisitorChats()
  const userChats = chats.filter((s) => s.username === username)
  const totalMessages = userChats.reduce((sum, s) => sum + s.messages.length, 0)
  return { totalChats: userChats.length, totalMessages }
}

// ---- 插件 ----

export function userManagementPlugin(): Plugin {
  return {
    name: 'vite-user-management-plugin',
    configureServer(server: ViteDevServer) {
      ADMIN_USERS_FILE = path.resolve(server.config.root, 'public/data/admin-users.json')
      ACCOUNTS_FILE = path.resolve(server.config.root, 'public/data/accounts.json')
      // visitor-app 路径：相对于 admin-web 项目根目录
      const visitorRoot = path.resolve(server.config.root, '..', 'visitor-app')
      VISITOR_USERS_FILE = path.resolve(visitorRoot, 'public/data/users.json')
      VISITOR_CHAT_FILE = path.resolve(visitorRoot, 'public/data/chat-records.json')

      server.middlewares.use(async (req: any, res: any, next: () => void) => {
        const urlStr = req.url || ''
        if (!urlStr.startsWith('/api/admin/')) return next()

        const url = new URL(urlStr, 'http://localhost')
        const pathname = url.pathname
        const username = extractUsername(pathname)
        const sessionId = username ? extractSessionId(pathname) : null

        console.log(`[admin-users] ${req.method} ${pathname}`)

        try {
          // ═══════════ GET /api/admin/users/stats ═══════════
          if (pathname === '/api/admin/users/stats' && req.method === 'GET') {
            const db = readAdminDB()
            const active = db.users.filter((u) => u.status === 'active').length
            const disabled = db.users.filter((u) => u.status === 'disabled').length
            const totalChats = db.users.reduce((s, u) => s + u.totalChats, 0)
            const totalMessages = db.users.reduce((s, u) => s + u.totalMessages, 0)
            return jsonResponse(res, 200, {
              total: db.users.length,
              active,
              disabled,
              totalChats,
              totalMessages,
            })
          }

          // ═══════════ GET /api/admin/users — 列出所有用户 ═══════════
          if (pathname === '/api/admin/users' && req.method === 'GET') {
            const db = readAdminDB()
            const search = url.searchParams.get('search') || ''
            const statusFilter = url.searchParams.get('status') || ''
            const sortBy = url.searchParams.get('sort') || 'createdAt'
            const order = url.searchParams.get('order') || 'desc'

            let list = [...db.users]

            // 搜索过滤
            if (search) {
              const q = search.toLowerCase()
              list = list.filter(
                (u) =>
                  u.username.toLowerCase().includes(q) ||
                  u.displayName.toLowerCase().includes(q)
              )
            }

            // 状态过滤
            if (statusFilter === 'active') list = list.filter((u) => u.status === 'active')
            if (statusFilter === 'disabled') list = list.filter((u) => u.status === 'disabled')

            // 排序
            list.sort((a, b) => {
              let cmp = 0
              switch (sortBy) {
                case 'username':
                  cmp = a.username.localeCompare(b.username)
                  break
                case 'displayName':
                  cmp = a.displayName.localeCompare(b.displayName)
                  break
                case 'totalChats':
                  cmp = a.totalChats - b.totalChats
                  break
                case 'totalMessages':
                  cmp = a.totalMessages - b.totalMessages
                  break
                case 'createdAt':
                default:
                  cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  break
              }
              return order === 'asc' ? cmp : -cmp
            })

            // 分页
            const page = parseInt(url.searchParams.get('page') || '1')
            const pageSize = parseInt(url.searchParams.get('pageSize') || '20')
            const total = list.length
            const start = (page - 1) * pageSize
            const paged = list.slice(start, start + pageSize)

            return jsonResponse(res, 200, { users: paged, total, page, pageSize })
          }

          // ═══════════ GET /api/admin/users/:username ═══════════
          if (username && !sessionId && pathname === `/api/admin/users/${username}` && req.method === 'GET') {
            const db = readAdminDB()
            const user = db.users.find((u) => u.username === username)
            if (!user) return jsonResponse(res, 404, { error: '用户不存在' })
            return jsonResponse(res, 200, user)
          }

          // ═══════════ PUT /api/admin/users/:username ═══════════
          if (username && !sessionId && pathname === `/api/admin/users/${username}` && req.method === 'PUT') {
            const updates = await parseBody(req)
            const db = readAdminDB()
            const user = db.users.find((u) => u.username === username)
            if (!user) return jsonResponse(res, 404, { error: '用户不存在' })

            // 可更新字段
            if (updates.displayName !== undefined) user.displayName = updates.displayName
            if (updates.notes !== undefined) user.notes = updates.notes
            if (updates.status !== undefined) {
              const oldStatus = user.status
              user.status = updates.status
              if (updates.status === 'disabled' && oldStatus === 'active') {
                user.disabledAt = new Date().toISOString()
              }
              if (updates.status === 'active' && oldStatus === 'disabled') {
                user.disabledAt = null
              }
              // 同步到 visitor-app 的 users.json
              try {
                const vUsers = readVisitorUsers()
                const key = username.toLowerCase()
                if (vUsers[key]) {
                  vUsers[key].status = updates.status
                  writeVisitorUsers(vUsers)
                }
              } catch (e: any) {
                console.warn(`[admin-users] 无法同步用户状态到 visitor-app: ${e.message}`)
              }
            }

            writeAdminDB(db)

            console.log(`[admin-users] ✏️ 更新用户: ${username}`)
            return jsonResponse(res, 200, user)
          }

          // ═══════════ DELETE /api/admin/users/:username ═══════════
          if (username && !sessionId && pathname === `/api/admin/users/${username}` && req.method === 'DELETE') {
            const db = readAdminDB()
            const index = db.users.findIndex((u) => u.username === username)
            if (index === -1) return jsonResponse(res, 404, { error: '用户不存在' })

            const [removed] = db.users.splice(index, 1)
            writeAdminDB(db)

            // 同步删除 visitor-app 中的用户
            try {
              const vUsers = readVisitorUsers()
              const key = username.toLowerCase()
              if (vUsers[key]) {
                delete vUsers[key]
                writeVisitorUsers(vUsers)
              }
            } catch (e: any) {
              console.warn(`[admin-users] 无法同步删除到 visitor-app: ${e.message}`)
            }

            console.log(`[admin-users] 🗑️ 删除用户: ${username}`)
            return jsonResponse(res, 200, { deleted: username })
          }

          // ═══════════ GET /api/admin/users/:username/chats ═══════════
          if (username && pathname === `/api/admin/users/${username}/chats` && req.method === 'GET') {
            const chats = readVisitorChats()
            const userChats = chats
              .filter((s) => s.username === username)
              .map((s) => ({
                session_id: s.session_id,
                title: s.title,
                status: s.status,
                messageCount: s.messages.length,
                created_at: s.created_at,
                updated_at: s.updated_at,
              }))
            return jsonResponse(res, 200, {
              username,
              sessions: userChats,
              totalSessions: userChats.length,
              totalMessages: userChats.reduce((sum, s) => sum + s.messageCount, 0),
            })
          }

          // ═══════════ GET /api/admin/users/:username/chats/:sessId ═══════════
          if (username && sessionId && pathname === `/api/admin/users/${username}/chats/${sessionId}` && req.method === 'GET') {
            const chats = readVisitorChats()
            const session = chats.find((s) => s.session_id === sessionId && s.username === username)
            if (!session) return jsonResponse(res, 404, { error: '会话不存在' })
            return jsonResponse(res, 200, session)
          }

          // ═══════════ DELETE /api/admin/users/:username/chats/:sessId ═══════════
          if (username && sessionId && pathname === `/api/admin/users/${username}/chats/${sessionId}` && req.method === 'DELETE') {
            const chats = readVisitorChats()
            const index = chats.findIndex((s) => s.session_id === sessionId && s.username === username)
            if (index === -1) return jsonResponse(res, 404, { error: '会话不存在' })

            const [removed] = chats.splice(index, 1)
            // 写回 visitor-app 的 chat-records.json
            const dir = path.dirname(VISITOR_CHAT_FILE)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
            fs.writeFileSync(VISITOR_CHAT_FILE, JSON.stringify(chats, null, 2), 'utf-8')

            // 更新 admin 记录中的统计
            const stats = recalcUserStats(username)
            const db = readAdminDB()
            const adminUser = db.users.find((u) => u.username === username)
            if (adminUser) {
              adminUser.totalChats = stats.totalChats
              adminUser.totalMessages = stats.totalMessages
              writeAdminDB(db)
            }

            console.log(`[admin-users] 🗑️ 删除会话: ${removed.title} (用户: ${username})`)
            return jsonResponse(res, 200, { deleted: sessionId })
          }

          // ═══════════ POST /api/admin/sync ═══════════
          if (pathname === '/api/admin/sync' && req.method === 'POST') {
            const visitorUsers = readVisitorUsers()
            const visitorChats = readVisitorChats()
            const db = readAdminDB()

            let imported = 0
            let skipped = 0

            for (const key of Object.keys(visitorUsers)) {
              const vu = visitorUsers[key]
              const username = vu.username
              const existing = db.users.find((u) => u.username === username)

              // 统计该用户的聊天数据
              const userChats = visitorChats.filter((s) => s.username === username)
              const totalChats = userChats.length
              const totalMessages = userChats.reduce((sum, s) => sum + s.messages.length, 0)

              if (existing) {
                // 更新现有记录
                existing.displayName = vu.displayName || existing.displayName
                existing.status = vu.status || existing.status
                existing.lastLoginAt = vu.lastLoginAt || existing.lastLoginAt
                existing.totalChats = totalChats
                existing.totalMessages = totalMessages
                skipped++
              } else {
                // 新增记录
                const record: AdminUserRecord = {
                  username,
                  displayName: vu.displayName || username,
                  createdAt: vu.createdAt,
                  status: vu.status || 'active',
                  lastLoginAt: vu.lastLoginAt || null,
                  totalChats,
                  totalMessages,
                  notes: '',
                  disabledAt: null,
                }
                db.users.push(record)
                imported++
              }
            }

            db.version += 1
            db.lastSyncedAt = new Date().toISOString()
            writeAdminDB(db)

            console.log(`[admin-users] 🔄 同步完成: 导入 ${imported}, 更新 ${skipped}, 总计 ${visitorUsers ? Object.keys(visitorUsers).length : 0}`)
            return jsonResponse(res, 200, {
              imported,
              skipped,
              total: Object.keys(visitorUsers).length,
              lastSyncedAt: db.lastSyncedAt,
            })
          }

          // ═══════════ POST /api/admin/accounts — 写入管理员账号到 accounts.json ═══════════
          if (pathname === '/api/admin/accounts' && req.method === 'POST') {
            const body = await parseBody(req)
            console.log(`[admin-users] 📝 收到账号同步请求: admins=${body.admins?.length || 0}`)

            if (!body.admins || !Array.isArray(body.admins)) {
              return jsonResponse(res, 400, { error: '无效数据：缺少 admins 数组' })
            }

            const accounts = readAccounts()
            let added = 0
            let updated = 0

            for (const incoming of body.admins) {
              if (!incoming.username || !incoming.passwordHash) continue
              const key = incoming.username.toLowerCase()
              const existing = accounts.admins.find(a => a.username.toLowerCase() === key)
              if (existing) {
                // 更新已有账号
                existing.passwordHash = incoming.passwordHash
                existing.email = incoming.email || existing.email
                existing.role = incoming.role || existing.role
                updated++
              } else {
                // 新增账号
                accounts.admins.push({
                  username: incoming.username,
                  passwordHash: incoming.passwordHash,
                  email: incoming.email || '',
                  role: incoming.role || '管理员',
                  createdAt: incoming.createdAt || new Date().toISOString(),
                })
                added++
              }
            }

            accounts.version = (accounts.version || 1) + 1
            writeAccounts(accounts)

            console.log(`[admin-users] ✅ 账号已写入 accounts.json: 新增 ${added}, 更新 ${updated}, 共 ${accounts.admins.length} 个`)
            return jsonResponse(res, 200, { added, updated, total: accounts.admins.length })
          }

          // ═══════════ GET /api/admin/accounts — 从 accounts.json 拉取最新数据 ═══════════
          if (pathname === '/api/admin/accounts' && req.method === 'GET') {
            const accounts = readAccounts()
            return jsonResponse(res, 200, accounts)
          }

          return next()
        } catch (e: any) {
          console.error('[admin-users] 错误:', e.message)
          return jsonResponse(res, 500, { error: '服务器内部错误' })
        }
      })
    },
  }
}
