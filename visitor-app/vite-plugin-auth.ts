/**
 * Vite 插件 — 文件级用户认证 API
 *
 * 拦截 /api/user/* 请求，直接读写 public/data/users.json 文件。
 * 账号持久化在磁盘上，重启不丢失，无需后端数据库。
 *
 * 安全增强：
 *   - 登录失败 5 次 / 5 分钟 → 锁定 30 秒
 *   - Token 含过期时间戳（7 天）
 */

import type { Plugin, ViteDevServer } from 'vite'
import fs from 'fs'
import path from 'path'

let USERS_FILE = ''

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

interface UsersDB {
  [username: string]: StoredUser
}

// ═══════════════════════ 登录尝试追踪 ═══════════════════════

interface AttemptRecord {
  failures: number
  firstFailureAt: number
  lockedUntil: number
}

const loginAttempts = new Map<string, AttemptRecord>()
const MAX_FAILURES = 5
const LOCK_DURATION_MS = 30_000
const ATTEMPT_WINDOW_MS = 5 * 60_000
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

function cleanStaleAttempts(): void {
  const now = Date.now()
  for (const [key, record] of loginAttempts) {
    if (record.lockedUntil < now && now - record.firstFailureAt > ATTEMPT_WINDOW_MS) {
      loginAttempts.delete(key)
    }
  }
}

function recordLoginFailure(identifier: string): { locked: boolean; retryAfter: number } {
  cleanStaleAttempts()
  const key = identifier.toLowerCase()
  const now = Date.now()
  const existing = loginAttempts.get(key)

  if (!existing || now - existing.firstFailureAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.set(key, { failures: 1, firstFailureAt: now, lockedUntil: 0 })
    return { locked: false, retryAfter: 0 }
  }

  existing.failures++
  if (existing.failures >= MAX_FAILURES) {
    existing.lockedUntil = now + LOCK_DURATION_MS
    return { locked: true, retryAfter: Math.ceil(LOCK_DURATION_MS / 1000) }
  }
  return { locked: false, retryAfter: 0 }
}

function isLocked(identifier: string): boolean {
  const key = identifier.toLowerCase()
  const record = loginAttempts.get(key)
  if (!record) return false
  if (record.lockedUntil > Date.now()) return true
  if (record.lockedUntil > 0) loginAttempts.delete(key)
  return false
}

function remainingLockSeconds(identifier: string): number {
  const key = identifier.toLowerCase()
  const record = loginAttempts.get(key)
  if (!record || record.lockedUntil <= Date.now()) return 0
  return Math.ceil((record.lockedUntil - Date.now()) / 1000)
}

function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier.toLowerCase())
}

// ═══════════════════════ 校验 ═══════════════════════

function validateUsernameFormat(username: string): string | null {
  if (!username || username.trim().length < 2) return '用户名至少需要 2 个字符'
  if (username.trim().length > 20) return '用户名最多 20 个字符'
  if (username !== username.trim()) return '用户名首尾不能有空格'
  return null
}

function validatePasswordFormat(password: string): string | null {
  if (!password || password.length < 4) return '密码至少需要 4 个字符'
  return null
}

// ═══════════════════════ 用户文件操作 ═══════════════════════

function readUsers(): UsersDB {
  try {
    if (!fs.existsSync(USERS_FILE)) return {}
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw) as UsersDB
  } catch {
    return {}
  }
}

function writeUsers(users: UsersDB): void {
  const dir = path.dirname(USERS_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

function makeToken(): string {
  const now = Date.now()
  const expiry = now + TOKEN_TTL_MS
  return 'tk-' + now.toString(36) + '-' + expiry.toString(36) + '-' + Math.random().toString(36).slice(2, 10)
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

// ═══════════════════════ 插件 ═══════════════════════

export function authPlugin(): Plugin {
  return {
    name: 'vite-auth-plugin',
    configureServer(server: ViteDevServer) {
      USERS_FILE = path.resolve(server.config.root, 'public/data/users.json')

      server.middlewares.use(async (req: any, res: any, next: () => void) => {
        // 拦截 /api/user/* 和 /mock-api/api/user/*（兼容 USE_MOCK=true 的情况）
        const urlStr = req.url || ''
        const isUserApi = urlStr.startsWith('/api/user/') || urlStr.startsWith('/mock-api/api/user/')
        if (!isUserApi) return next()

        // 规范化路径：/mock-api/api/user/* → /api/user/*
        let pathname = urlStr.split('?')[0]
        const mockPrefix = '/mock-api'
        if (pathname.startsWith(mockPrefix)) {
          pathname = pathname.slice(mockPrefix.length)
        }
        console.log(`[auth] ${req.method} ${pathname}`)

        try {
          // ═══════════ POST /api/user/login ═══════════
          if (pathname === '/api/user/login' && req.method === 'POST') {
            const { username, password } = await parseBody(req)
            const identifier = username || ''
            const key = identifier.toLowerCase()

            if (isLocked(identifier)) {
              const sec = remainingLockSeconds(identifier)
              return jsonResponse(res, 429, { error: `登录尝试过于频繁，请 ${sec} 秒后再试`, retryAfter: sec })
            }

            const users = readUsers()
            const user = users[key]

            if (!user) {
              const result = recordLoginFailure(identifier)
              if (result.locked) {
                return jsonResponse(res, 429, { error: `登录尝试过于频繁，请 ${result.retryAfter} 秒后再试`, retryAfter: result.retryAfter })
              }
              return jsonResponse(res, 401, { error: '账号不存在，请先注册' })
            }

            if (user.password !== password) {
              const result = recordLoginFailure(identifier)
              if (result.locked) {
                return jsonResponse(res, 429, { error: `登录尝试过于频繁，请 ${result.retryAfter} 秒后再试`, retryAfter: result.retryAfter })
              }
              return jsonResponse(res, 401, { error: '密码错误，请重试' })
            }

            if (user.status === 'disabled') {
              return jsonResponse(res, 403, { error: '该账号已被管理员禁用，请联系景区工作人员' })
            }

            resetLoginAttempts(identifier)
            user.lastLoginAt = new Date().toISOString()
            writeUsers(users)

            console.log(`[auth] ✅ 登录成功: "${user.username}"`)
            return jsonResponse(res, 200, { token: makeToken(), user })
          }

          // ═══════════ POST /api/user/register ═══════════
          if (pathname === '/api/user/register' && req.method === 'POST') {
            const { username, password } = await parseBody(req)

            const usernameErr = validateUsernameFormat(username || '')
            if (usernameErr) return jsonResponse(res, 400, { error: usernameErr })

            const passwordErr = validatePasswordFormat(password || '')
            if (passwordErr) return jsonResponse(res, 400, { error: passwordErr })

            const users = readUsers()
            const key = username.trim().toLowerCase()

            if (users[key]) {
              return jsonResponse(res, 409, { error: '该用户名已被注册，请换一个' })
            }

            const user: StoredUser = {
              username: username.trim(),
              password,
              displayName: username.trim(),
              createdAt: new Date().toISOString(),
              status: 'active',
              lastLoginAt: null,
              totalChats: 0,
              totalMessages: 0,
            }
            users[key] = user
            writeUsers(users)

            console.log(`[auth] ✅ 新用户注册: ${user.username}`)
            return jsonResponse(res, 200, { token: makeToken(), user })
          }

          // ═══════════ POST /api/user/recover ═══════════
          if (pathname === '/api/user/recover' && req.method === 'POST') {
            const { username } = await parseBody(req)
            const users = readUsers()
            const key = (username || '').toLowerCase()
            const user = users[key]

            if (!user) {
              return jsonResponse(res, 404, { error: '该账号不存在' })
            }

            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
            let newPwd = ''
            for (let i = 0; i < 8; i++) {
              newPwd += chars.charAt(Math.floor(Math.random() * chars.length))
            }

            user.password = newPwd
            writeUsers(users)

            console.log(`[auth] 🔑 密码重置: ${user.username}`)
            return jsonResponse(res, 200, { newPassword: newPwd })
          }

          // ═══════════ PUT /api/user/display-name ═══════════
          if (pathname === '/api/user/display-name' && req.method === 'PUT') {
            const { displayName, username } = await parseBody(req)

            if (!username) return jsonResponse(res, 401, { error: '未登录' })
            if (!displayName || displayName.trim().length < 1) return jsonResponse(res, 400, { error: '昵称不能为空' })
            if (displayName.trim().length > 20) return jsonResponse(res, 400, { error: '昵称最多 20 个字符' })

            const users = readUsers()
            const key = username.toLowerCase()
            const user = users[key]

            if (!user) return jsonResponse(res, 404, { error: '用户不存在' })

            user.displayName = displayName.trim()
            writeUsers(users)

            console.log(`[auth] ✏️ 昵称修改: ${user.username} → "${user.displayName}"`)
            return jsonResponse(res, 200, { user })
          }

          // ═══════════ PUT /api/user/password ═══════════
          if (pathname === '/api/user/password' && req.method === 'PUT') {
            const { username, oldPassword, newPassword } = await parseBody(req)

            if (!username) return jsonResponse(res, 401, { error: '未登录' })
            if (!oldPassword || !newPassword) return jsonResponse(res, 400, { error: '请填写旧密码和新密码' })

            const passwordErr = validatePasswordFormat(newPassword)
            if (passwordErr) return jsonResponse(res, 400, { error: passwordErr })

            const users = readUsers()
            const key = username.toLowerCase()
            const user = users[key]

            if (!user) return jsonResponse(res, 404, { error: '用户不存在' })
            if (user.password !== oldPassword) return jsonResponse(res, 403, { error: '旧密码不正确' })

            user.password = newPassword
            writeUsers(users)

            console.log(`[auth] 🔒 密码修改: ${user.username}`)
            return jsonResponse(res, 200, { ok: true })
          }

          // ═══════════ GET /api/user/profile ═══════════
          if (pathname === '/api/user/profile' && req.method === 'GET') {
            return jsonResponse(res, 200, { ok: true })
          }

          // ═══════════ GET /api/user/status ═══════════
          if (pathname === '/api/user/status' && req.method === 'GET') {
            const username = req.headers['x-username'] || ''
            if (!username) return jsonResponse(res, 401, { error: '未登录' })
            const users = readUsers()
            const key = username.toLowerCase()
            const user = users[key]
            if (!user) return jsonResponse(res, 404, { error: '用户不存在' })
            return jsonResponse(res, 200, {
              username: user.username,
              status: user.status,
              displayName: user.displayName,
              totalChats: user.totalChats,
              totalMessages: user.totalMessages,
            })
          }

          // ═══════════ GET /api/user/lockout-status ═══════════
          if (pathname === '/api/user/lockout-status' && req.method === 'GET') {
            const queryUrl = new URL(req.url, 'http://localhost')
            const identifier = queryUrl.searchParams.get('username') || ''
            return jsonResponse(res, 200, {
              locked: isLocked(identifier),
              retryAfter: remainingLockSeconds(identifier),
            })
          }

          return next()
        } catch (e: any) {
          console.error('[auth] 错误:', e.message)
          return jsonResponse(res, 500, { error: '服务器内部错误' })
        }
      })
    },
  }
}
