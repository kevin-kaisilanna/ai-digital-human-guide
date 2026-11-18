/**
 * 用户持久化存储 — 用 localStorage 模拟文件级持久化
 *
 * 数据结构：
 *   users: { [username]: { username, password, phone, createdAt, ... } }
 *
 * 说明：
 *   - 用户数据保存在 localStorage 中，浏览器环境持久化
 *   - 首次运行时自动加载种子用户数据（从 /data/users.json）
 *   - 支持导入/导出 JSON，方便迁移
 *   - 包含登录尝试追踪，防止暴力破解
 */

const STORAGE_KEY = 'visitor_app_users'

export interface StoredUser {
  username: string
  password: string
  phone: string
  displayName: string
  createdAt: string
  status: 'active' | 'disabled'
  lastLoginAt: string | null
  totalChats: number
  totalMessages: number
}

// ═══════════════════════════ 登录尝试追踪 ═══════════════════════════

interface AttemptRecord {
  failures: number
  firstFailureAt: number
  lockedUntil: number
}

const ATTEMPT_STORE_KEY = 'visitor_app_login_attempts'
const MAX_FAILURES = 5
const LOCK_DURATION_MS = 30_000        // 30 秒锁定
const ATTEMPT_WINDOW_MS = 5 * 60_000   // 5 分钟内累计

function loadAttempts(): Record<string, AttemptRecord> {
  try {
    const raw = localStorage.getItem(ATTEMPT_STORE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAttempts(attempts: Record<string, AttemptRecord>): void {
  localStorage.setItem(ATTEMPT_STORE_KEY, JSON.stringify(attempts))
}

/** 清除过期记录（无锁且超过窗口期的） */
function cleanStaleAttempts(attempts: Record<string, AttemptRecord>): void {
  const now = Date.now()
  for (const key of Object.keys(attempts)) {
    const a = attempts[key]
    if (a.lockedUntil < now && now - a.firstFailureAt > ATTEMPT_WINDOW_MS) {
      delete attempts[key]
    }
  }
}

export const LoginAttemptTracker = {
  /** 记录一次登录失败 */
  recordFailure(identifier: string): void {
    const key = identifier.toLowerCase()
    const attempts = loadAttempts()
    cleanStaleAttempts(attempts)

    const now = Date.now()
    const existing = attempts[key]

    if (!existing || now - existing.firstFailureAt > ATTEMPT_WINDOW_MS) {
      // 新窗口
      attempts[key] = { failures: 1, firstFailureAt: now, lockedUntil: 0 }
    } else {
      existing.failures++
      if (existing.failures >= MAX_FAILURES) {
        existing.lockedUntil = now + LOCK_DURATION_MS
      }
    }
    saveAttempts(attempts)
  },

  /** 检查是否被锁定 */
  isLocked(identifier: string): boolean {
    const key = identifier.toLowerCase()
    const attempts = loadAttempts()
    const record = attempts[key]
    if (!record) return false
    if (record.lockedUntil > Date.now()) return true
    // 锁定已过期，清理
    if (record.lockedUntil > 0) {
      delete attempts[key]
      saveAttempts(attempts)
    }
    return false
  },

  /** 获取剩余锁定秒数 */
  remainingLockSeconds(identifier: string): number {
    const key = identifier.toLowerCase()
    const attempts = loadAttempts()
    const record = attempts[key]
    if (!record || record.lockedUntil <= Date.now()) return 0
    return Math.ceil((record.lockedUntil - Date.now()) / 1000)
  },

  /** 登录成功后清除记录 */
  resetAttempts(identifier: string): void {
    const key = identifier.toLowerCase()
    const attempts = loadAttempts()
    delete attempts[key]
    saveAttempts(attempts)
  },

  /** 获取当前失败次数 */
  getFailureCount(identifier: string): number {
    const key = identifier.toLowerCase()
    const attempts = loadAttempts()
    const record = attempts[key]
    if (!record) return 0
    const now = Date.now()
    if (now - record.firstFailureAt > ATTEMPT_WINDOW_MS) {
      delete attempts[key]
      saveAttempts(attempts)
      return 0
    }
    return record.failures
  },
}

export interface UsersDB {
  [username: string]: StoredUser
}

/**
 * 读取所有用户数据
 */
export function readUsers(): UsersDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as UsersDB
  } catch {
    return {}
  }
}

/**
 * 写入所有用户数据
 */
export function writeUsers(users: UsersDB): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

/**
 * 初始化：如果 localStorage 为空，从种子文件加载
 */
export async function initUserStorage(): Promise<void> {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (!existing) {
    try {
      const resp = await fetch('/data/users.json')
      if (resp.ok) {
        const seedUsers: UsersDB = await resp.json()
        if (seedUsers && Object.keys(seedUsers).length > 0) {
          writeUsers(seedUsers)
          console.log('[user-storage] 已从种子文件加载用户数据')
        }
      }
    } catch {
      console.log('[user-storage] 无种子数据，从空库开始')
    }
  }
}

/**
 * 检查用户名是否已存在
 */
export function userExists(username: string): boolean {
  const users = readUsers()
  return username.toLowerCase() in users
}

/**
 * 创建新用户
 */
export function createUser(username: string, password: string, phone?: string): StoredUser {
  const users = readUsers()
  const key = username.toLowerCase()

  if (key in users) {
    throw new Error('该用户名已被注册')
  }

  const user: StoredUser = {
    username,
    password,
    phone: phone || '',
    displayName: username,
    createdAt: new Date().toISOString(),
    status: 'active',
    lastLoginAt: null,
    totalChats: 0,
    totalMessages: 0,
  }

  users[key] = user
  writeUsers(users)
  return user
}

/**
 * 验证用户登录
 * @returns 用户信息，失败返回 null
 */
export function validateLogin(username: string, password: string): StoredUser | null {
  const users = readUsers()
  const key = username.toLowerCase()
  const user = users[key]

  if (!user) return null
  if (user.password !== password) return null

  return user
}

/**
 * 重置密码（找回密码）
 * @returns 新密码，失败返回 null
 */
export function resetPassword(username: string): string | null {
  const users = readUsers()
  const key = username.toLowerCase()
  const user = users[key]

  if (!user) return null

  // 生成一个随机新密码
  const newPassword = generateRandomPassword()
  user.password = newPassword
  writeUsers(users)
  return newPassword
}

/**
 * 生成随机密码
 */
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 导出所有用户数据为 JSON 字符串（用于备份/迁移）
 */
export function exportUsersJSON(): string {
  return JSON.stringify(readUsers(), null, 2)
}

/**
 * 导入用户数据（覆盖现有）
 */
export function importUsersJSON(json: string): boolean {
  try {
    const users = JSON.parse(json) as UsersDB
    writeUsers(users)
    return true
  } catch {
    return false
  }
}
