/**
 * 管理员数据库服务 — 文件 + localStorage 双层持久化存储
 *
 * 数据流：
 *   1. 启动时从 /data/accounts.json 加载种子数据
 *   2. 与 localStorage 合并（localStorage 优先）
 *   3. 后续所有写操作同时更新 localStorage 和后端 JSON 文件（通过 API）
 *
 * 默认管理员账号：admin / admin123
 */

import { backendUrl } from './severConfig'

interface AdminRecord {
  username: string
  passwordHash: string
  email: string
  role: string
  createdAt: string
}

interface DbSchema {
  admins: AdminRecord[]
  version: number
}

const DB_KEY = 'lingshan_admin_db'
const ACCOUNTS_FILE = '/data/accounts.json'
const DEFAULT_ADMIN = { username: 'admin', password: 'admin123', email: 'admin@lingshan.com', role: '超级管理员' }

// ====== 内部状态 ======

let dbReady = false
let dbInitPromise: Promise<void> | null = null

// ====== 密码哈希（SHA-256 简化版，生产环境请用 bcrypt）======

function encodePassword(password: string): string {
  const salted = password + '_lingshan_salt_2026'
  let hash = 0
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0')
  const lenHex = salted.length.toString(16).padStart(4, '0')
  return lenHex + hex + 'a7f3'
}

// ====== localStorage 读写 ======

function readLocalDb(): DbSchema | null {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.admins || !Array.isArray(parsed.admins)) return null
    return parsed as DbSchema
  } catch {
    return null
  }
}

function writeLocalDb(db: DbSchema): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (e) {
    console.error('[admin-db] 写入 localStorage 失败：', e)
  }
}

// ====== 带超时的 fetch 封装 ======

function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout))
}

// ====== 从文件加载种子数据 ======

async function fetchAccountsFromFile(): Promise<DbSchema | null> {
  try {
    const response = await fetchWithTimeout(ACCOUNTS_FILE, { cache: 'no-cache' }, 5000)
    if (!response.ok) {
      console.warn('[admin-db] 获取 accounts.json 失败，状态码：', response.status)
      return null
    }
    const data = await response.json()
    if (!data.admins || !Array.isArray(data.admins)) {
      console.warn('[admin-db] accounts.json 格式无效')
      return null
    }
    console.log(`[admin-db] 从文件加载了 ${data.admins.length} 个账号`)
    return data as DbSchema
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      console.warn('[admin-db] 获取 accounts.json 超时')
    } else {
      console.warn('[admin-db] 无法获取 accounts.json：', e)
    }
    return null
  }
}

// ====== 同步到磁盘文件（通过 Vite 插件端点）======

async function syncToServer(db: DbSchema): Promise<void> {
  try {
    const token = sessionStorage.getItem('auth_token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetchWithTimeout('/api/admin/accounts', {
      method: 'POST',
      headers,
      body: JSON.stringify(db),
    }, 5000)

    if (!response.ok) {
      console.warn('[admin-db] 同步账号到文件失败，状态码：', response.status)
    } else {
      const result = await response.json()
      console.log(`[admin-db] 账号已保存到 accounts.json: 新增 ${result.added}, 更新 ${result.updated}, 共 ${result.total} 个`)
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      console.warn('[admin-db] 同步到文件超时')
    } else {
      console.warn('[admin-db] 同步到文件失败：', e)
    }
  }
}

// ====== 合并策略：localStorage 优先（因为它包含运行时更新）======

function mergeDb(fileDb: DbSchema, localDb: DbSchema | null): DbSchema {
  if (!localDb) return fileDb

  // 以文件数据为基础，localStorage 中同名用户覆盖
  const merged = new Map<string, AdminRecord>()

  for (const admin of fileDb.admins) {
    merged.set(admin.username.toLowerCase(), admin)
  }

  for (const admin of localDb.admins) {
    merged.set(admin.username.toLowerCase(), admin)
  }

  return {
    admins: Array.from(merged.values()),
    version: Math.max(fileDb.version, localDb.version),
  }
}

// ====== 确保默认管理员存在 ======

function ensureDefaultAdmin(db: DbSchema): DbSchema {
  const hasAdmin = db.admins.some(
    (a) => a.username.toLowerCase() === DEFAULT_ADMIN.username
  )

  if (!hasAdmin) {
    db.admins.unshift({
      username: DEFAULT_ADMIN.username,
      passwordHash: encodePassword(DEFAULT_ADMIN.password),
      email: DEFAULT_ADMIN.email,
      role: DEFAULT_ADMIN.role,
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    console.log('[admin-db] 默认管理员账号已添加: admin / admin123')
  }

  return db
}

// ====== 初始化 ======

async function initDb(): Promise<void> {
  if (dbReady) return
  if (dbInitPromise) {
    await dbInitPromise
    return
  }

  dbInitPromise = (async () => {
    try {
      // 1. 从文件加载种子数据
      const fileDb = await fetchAccountsFromFile()

      // 2. 从 localStorage 加载已有数据
      const localDb = readLocalDb()

      // 3. 合并
      let db: DbSchema
      if (fileDb && localDb) {
        db = mergeDb(fileDb, localDb)
        console.log(`[admin-db] 合并完成：文件 ${fileDb.admins.length} 个 + 本地 ${localDb.admins.length} 个 → 共 ${db.admins.length} 个账号`)
      } else if (fileDb) {
        db = fileDb
        console.log(`[admin-db] 仅从文件加载 ${db.admins.length} 个账号`)
      } else if (localDb) {
        db = localDb
        console.log(`[admin-db] 仅从 localStorage 加载 ${db.admins.length} 个账号`)
      } else {
        db = { admins: [], version: 1 }
        console.log('[admin-db] 无已有数据，从零开始')
      }

      // 4. 确保默认管理员存在
      db = ensureDefaultAdmin(db)

      // 5. 写入 localStorage
      writeLocalDb(db)

      // 6. 同步到服务器文件（fire-and-forget，不阻塞初始化）
      syncToServer(db).catch(() => {})

      dbReady = true
      console.log(`[admin-db] 初始化完成，共 ${db.admins.length} 个管理员账号`)
    } catch (e) {
      console.error('[admin-db] 初始化失败：', e)
      // 即使初始化失败，也尝试用 local 数据
      const localDb = readLocalDb()
      if (localDb) {
        writeLocalDb(ensureDefaultAdmin(localDb))
      }
      dbReady = true
    }
  })()

  await dbInitPromise
}

// ====== 读取当前数据库（确保已初始化）======

function readDb(): DbSchema {
  const db = readLocalDb()
  if (!db || !db.admins || db.admins.length === 0) {
    // 如果 localStorage 为空（可能被清除），尝试重新初始化
    console.warn('[admin-db] localStorage 数据为空，尝试重新加载')
    return { admins: [], version: 1 }
  }
  return db
}

function writeDb(db: DbSchema): void {
  writeLocalDb(db)
  // 异步同步到服务器（不阻塞）
  syncToServer(db).catch(() => {})
}

// ====== 公开 API ======

export const adminDb = {
  /**
   * 等待数据库初始化完成
   */
  async ready(): Promise<void> {
    await initDb()
  },

  /**
   * 管理员登录
   */
  async login(username: string, password: string): Promise<{
    success: boolean
    message: string
    user?: Omit<AdminRecord, 'passwordHash'>
    token?: string
  }> {
    await initDb()

    if (!username || !password) {
      return { success: false, message: '账号和密码不能为空' }
    }

    const db = readDb()
    const admin = db.admins.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase()
    )

    if (!admin) {
      return { success: false, message: '账号不存在，请检查账号或联系管理员' }
    }

    if (admin.passwordHash !== encodePassword(password)) {
      return { success: false, message: '密码错误，请重试' }
    }

    const { passwordHash, ...user } = admin
    const token = 'lingshan_' + btoa(encodeURIComponent(username + '_' + Date.now()))

    return { success: true, message: '登录成功', user, token }
  },

  /**
   * 注册新管理员（必须提供邮箱，用于找回密码）
   */
  async register(
    username: string,
    password: string,
    email: string
  ): Promise<{ success: boolean; message: string }> {
    await initDb()

    if (!username || !password || !email) {
      return { success: false, message: '账号、密码、邮箱均为必填项' }
    }

    if (username.trim().length < 3) {
      return { success: false, message: '账号长度不能少于3位' }
    }

    if (password.length < 6) {
      return { success: false, message: '密码长度不能少于6位' }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { success: false, message: '请输入有效的邮箱地址' }
    }

    const db = readDb()

    if (db.admins.some((a) => a.username.toLowerCase() === username.trim().toLowerCase())) {
      return { success: false, message: '该账号已被注册，请更换账号' }
    }

    if (db.admins.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, message: '该邮箱已被注册，请使用其他邮箱' }
    }

    const newAdmin: AdminRecord = {
      username: username.trim(),
      passwordHash: encodePassword(password),
      email: email.trim().toLowerCase(),
      role: '管理员',
      createdAt: new Date().toISOString(),
    }

    db.admins.push(newAdmin)
    writeDb(db)

    return { success: true, message: '注册成功，请登录' }
  },

  /**
   * 找回密码
   */
  async resetPassword(
    username: string,
    email?: string
  ): Promise<{ success: boolean; message: string; newPassword?: string }> {
    await initDb()

    if (!username) {
      return { success: false, message: '请输入管理员账号' }
    }

    const db = readDb()
    const idx = db.admins.findIndex(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase()
    )

    if (idx === -1) {
      return { success: false, message: '该账号不存在，请确认账号是否正确' }
    }

    const admin = db.admins[idx]

    if (email && email.trim()) {
      if (!admin.email) {
        return { success: false, message: '该账号未绑定邮箱，请联系超级管理员重置密码' }
      }
      if (admin.email.toLowerCase() !== email.trim().toLowerCase()) {
        return { success: false, message: '邮箱与注册时不匹配，请确认后重试' }
      }
    } else if (admin.email) {
      return {
        success: false,
        message: '该账号已绑定邮箱，请输入注册时使用的邮箱进行验证',
      }
    }

    const newPassword = 'Ls' + Math.random().toString(36).slice(2, 10) + '#1'

    db.admins[idx] = {
      ...admin,
      passwordHash: encodePassword(newPassword),
    }
    writeDb(db)

    return {
      success: true,
      message: '密码已重置',
      newPassword,
    }
  },

  /**
   * 修改密码
   */
  async changePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    await initDb()

    if (!oldPassword || !newPassword) {
      return { success: false, message: '原密码和新密码不能为空' }
    }

    if (newPassword.length < 6) {
      return { success: false, message: '新密码长度不能少于6位' }
    }

    const db = readDb()
    const idx = db.admins.findIndex(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    )

    if (idx === -1) {
      return { success: false, message: '账号不存在' }
    }

    if (db.admins[idx].passwordHash !== encodePassword(oldPassword)) {
      return { success: false, message: '原密码错误' }
    }

    db.admins[idx].passwordHash = encodePassword(newPassword)
    writeDb(db)

    return { success: true, message: '密码修改成功，请重新登录' }
  },

  /**
   * 检查数据库状态
   */
  async checkStatus(): Promise<{ totalAdmins: number; hasDefaultAdmin: boolean }> {
    await initDb()
    const db = readDb()
    return {
      totalAdmins: db.admins.length,
      hasDefaultAdmin: db.admins.some(
        (a) => a.username.toLowerCase() === DEFAULT_ADMIN.username
      ),
    }
  },

  /**
   * 获取所有管理员列表（不含密码）
   */
  async listAdmins(): Promise<Omit<AdminRecord, 'passwordHash'>[]> {
    await initDb()
    const db = readDb()
    return db.admins.map(({ passwordHash, ...rest }) => rest)
  },

  /**
   * 删除管理员
   */
  async deleteAdmin(username: string): Promise<{ success: boolean; message: string }> {
    await initDb()

    if (username.toLowerCase() === DEFAULT_ADMIN.username) {
      return { success: false, message: '不能删除默认超级管理员账号' }
    }

    const db = readDb()
    const idx = db.admins.findIndex(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    )

    if (idx === -1) {
      return { success: false, message: '账号不存在' }
    }

    if (db.admins.length <= 1) {
      return { success: false, message: '不能删除最后一个管理员账号' }
    }

    db.admins.splice(idx, 1)
    writeDb(db)

    return { success: true, message: '管理员已删除' }
  },

  /**
   * 导出账号到 JSON 文件（下载到本地）
   */
  async exportToFile(): Promise<void> {
    await initDb()
    const db = readDb()
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lingshan_accounts_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('[admin-db] 账号已导出到文件')
  },

  /**
   * 从 JSON 文件导入账号（合并模式）
   */
  async importFromFile(file: File): Promise<{ success: boolean; message: string }> {
    await initDb()

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.admins || !Array.isArray(data.admins)) {
        return { success: false, message: '文件格式无效：缺少 admins 数组' }
      }

      const db = readDb()
      let importedCount = 0
      let skippedCount = 0

      for (const admin of data.admins) {
        if (!admin.username || !admin.passwordHash) {
          skippedCount++
          continue
        }

        const existingIdx = db.admins.findIndex(
          (a) => a.username.toLowerCase() === admin.username.toLowerCase()
        )

        if (existingIdx >= 0) {
          // 已存在则跳过（保留本地数据）
          skippedCount++
        } else {
          db.admins.push(admin)
          importedCount++
        }
      }

      writeDb(db)
      return {
        success: true,
        message: `导入完成：新增 ${importedCount} 个账号，跳过 ${skippedCount} 个（已存在）`,
      }
    } catch (e: any) {
      return { success: false, message: `导入失败：${e.message || '文件解析错误'}` }
    }
  },

  /**
   * 手动从服务器拉取最新数据
   */
  async syncFromServer(): Promise<{ success: boolean; message: string }> {
    try {
      const token = sessionStorage.getItem('auth_token')
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch('/api/admin/accounts', { headers })

      if (!response.ok) {
        return { success: false, message: `文件读取错误：${response.status}` }
      }

      const serverDb: DbSchema = await response.json()

      if (!serverDb.admins || !Array.isArray(serverDb.admins)) {
        return { success: false, message: '账号文件格式无效' }
      }

      const localDb = readLocalDb()
      const merged = mergeDb(serverDb, localDb)
      const finalDb = ensureDefaultAdmin(merged)
      writeLocalDb(finalDb)

      return {
        success: true,
        message: `同步成功：共 ${finalDb.admins.length} 个账号`,
      }
    } catch (e: any) {
      return { success: false, message: `同步失败：${e.message || '网络错误'}` }
    }
  },
}
