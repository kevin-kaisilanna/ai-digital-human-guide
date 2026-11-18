/**
 * 用户状态 (Pinia)
 *
 * 职责：
 *   - 登录 / 注册 / 找回密码
 *   - Token 管理（含过期校验 + 记住我）
 *   - 会话超时（30 分钟无操作自动登出）
 *   - 昵称修改 / 密码修改 / 手机号更新
 *   - 兴趣偏好
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login as apiLogin,
  register as apiRegister,
  recoverPassword as apiRecover,
  updateDisplayName as apiUpdateDisplayName,
  changePassword as apiChangePassword,
  updatePhone as apiUpdatePhone,
  validateTokenApi,
  getLockoutStatus,
} from '@/services/user-service'
import type { StoredUser } from '@/services/user-storage'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'current_user'
const REMEMBER_KEY = 'remember_me'

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000   // 7 天
const SESSION_TIMEOUT_MS = 30 * 60 * 1000        // 30 分钟

// ═══════════════════════════ Token 工具 ═══════════════════════════

/** 从 token 中解析过期时间，token 格式: tk-{ts}-{expiry}-{random} */
function parseTokenExpiry(token: string): number | null {
  if (!token || !token.startsWith('tk-')) return null
  const parts = token.split('-')
  if (parts.length < 3) return null
  const expiry = parseInt(parts[2], 36)
  return isNaN(expiry) ? null : expiry
}

/** 检查 token 是否过期（也兼容旧格式 tk-{ts}-{random}） */
function isTokenExpired(token: string): boolean {
  const expiry = parseTokenExpiry(token)
  // 旧格式无法解析 → 视为未过期（向后兼容）
  if (expiry === null) return false
  return Date.now() > expiry
}

/** 使用 sessionStorage 还是 localStorage */
function getStore(): Storage {
  try {
    return localStorage.getItem(REMEMBER_KEY) === 'true' ? localStorage : sessionStorage
  } catch {
    return sessionStorage
  }
}

// ═══════════════════════════ 会话恢复 ═══════════════════════════

function restoreSession(): { token: string; user: StoredUser } | null {
  // 先检查 localStorage
  let token = localStorage.getItem(TOKEN_KEY)
  let raw = localStorage.getItem(USER_KEY)

  // 如果 localStorage 没有，检查 sessionStorage
  if (!token || !raw) {
    token = sessionStorage.getItem(TOKEN_KEY)
    raw = sessionStorage.getItem(USER_KEY)
  }

  if (!token || !raw) return null

  // 检查 token 过期
  if (isTokenExpired(token)) {
    clearSession()
    return null
  }

  try {
    return { token, user: JSON.parse(raw) as StoredUser }
  } catch {
    clearSession()
    return null
  }
}

function persistSession(token: string, user: StoredUser, rememberMe: boolean): void {
  const store = rememberMe ? localStorage : sessionStorage
  store.setItem(TOKEN_KEY, token)
  store.setItem(USER_KEY, JSON.stringify(user))
  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, 'true')
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(REMEMBER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

// ═══════════════════════════ Store ═══════════════════════════

export const useUserStore = defineStore('user', () => {
  const user = ref<StoredUser | null>(null)
  const token = ref<string | null>(null)
  const preferences = ref<string[]>([])
  const loginError = ref('')
  const isLoggingIn = ref(false)
  const isUpdating = ref(false)
  const lockoutSeconds = ref(0)

  // 会话超时
  const lastActivity = ref(Date.now())
  let _timeoutTimer: ReturnType<typeof setInterval> | null = null
  let _lockoutTimer: ReturnType<typeof setInterval> | null = null

  // ── 计算属性 ──
  const isLoggedIn = computed(() => !!token.value && !isTokenExpired(token.value))

  const userName = computed(() => {
    if (!user.value) return '游客'
    return user.value.displayName || user.value.username
  })

  const accountName = computed(() => user.value?.username ?? '—')

  const userPhone = computed(() => user.value?.phone || '未绑定')

  const userId = computed(() => {
    if (!user.value) return '—'
    const ts = new Date(user.value.createdAt).getTime()
    return 'T-' + ts.toString(36).toUpperCase().slice(-4)
  })

  // ── 初始化 ──
  function init() {
    const session = restoreSession()
    if (session) {
      token.value = session.token
      user.value = session.user
      startSessionTimeout()
    }
  }

  // ── 会话超时 ──
  function updateLastActivity() {
    lastActivity.value = Date.now()
  }

  function startSessionTimeout() {
    stopSessionTimeout()
    _timeoutTimer = setInterval(() => {
      if (Date.now() - lastActivity.value > SESSION_TIMEOUT_MS) {
        console.log('[user-store] 会话超时，自动登出')
        doLogout()
      }
    }, 10_000) // 每 10 秒检查
  }

  function stopSessionTimeout() {
    if (_timeoutTimer) { clearInterval(_timeoutTimer); _timeoutTimer = null }
  }

  function stopLockoutCountdown() {
    if (_lockoutTimer) { clearInterval(_lockoutTimer); _lockoutTimer = null }
    lockoutSeconds.value = 0
  }

  /** 启动锁定倒计时 */
  function startLockoutCountdown(seconds: number) {
    stopLockoutCountdown()
    lockoutSeconds.value = seconds
    _lockoutTimer = setInterval(() => {
      lockoutSeconds.value--
      if (lockoutSeconds.value <= 0) {
        stopLockoutCountdown()
      }
    }, 1000)
  }

  // ── 登录 ──
  async function doLogin(
    identifier: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<boolean> {
    loginError.value = ''
    isLoggingIn.value = true
    stopLockoutCountdown()
    try {
      const result: any = await apiLogin(identifier, password)
      token.value = result.token
      user.value = result.user
      persistSession(result.token, result.user, rememberMe)
      updateLastActivity()
      startSessionTimeout()
      return true
    } catch (e: any) {
      const msg = e?.message ?? '登录失败'

      // 解析锁定信息
      if (msg.includes('过于频繁')) {
        const match = msg.match(/(\d+)\s*秒/)
        if (match) {
          startLockoutCountdown(parseInt(match[1]))
        }
      }

      // 429 时主动查询锁定状态
      if ((e as any)?.status === 429 || msg.includes('过于频繁')) {
        try {
          const status = await getLockoutStatus(identifier)
          if (status?.locked && status?.retryAfter) {
            startLockoutCountdown(status.retryAfter)
          }
        } catch { /* ignore */ }
      }

      loginError.value = msg
      return false
    } finally {
      isLoggingIn.value = false
    }
  }

  // ── 注册 ──
  async function doRegister(username: string, password: string): Promise<boolean> {
    loginError.value = ''
    isLoggingIn.value = true
    try {
      const result: any = await apiRegister(username, password)
      token.value = result.token
      user.value = result.user
      persistSession(result.token, result.user, true) // 注册默认记住
      updateLastActivity()
      startSessionTimeout()
      return true
    } catch (e: any) {
      loginError.value = e?.message ?? '注册失败'
      return false
    } finally {
      isLoggingIn.value = false
    }
  }

  // ── 找回密码 ──
  async function doRecover(username: string): Promise<string | null> {
    loginError.value = ''
    isLoggingIn.value = true
    try {
      const result: any = await apiRecover(username)
      return result.newPassword
    } catch (e: any) {
      loginError.value = e?.message ?? '找回密码失败'
      return null
    } finally {
      isLoggingIn.value = false
    }
  }

  // ── 修改展示名称 ──
  async function doUpdateDisplayName(displayName: string): Promise<boolean> {
    if (!user.value) return false
    loginError.value = ''
    isUpdating.value = true
    try {
      const result: any = await apiUpdateDisplayName(user.value.username, displayName)
      user.value = result.user
      persistSession(token.value!, result.user, localStorage.getItem(REMEMBER_KEY) === 'true')
      return true
    } catch (e: any) {
      loginError.value = e?.message ?? '修改失败'
      return false
    } finally {
      isUpdating.value = false
    }
  }

  // ── 修改密码 ──
  async function doChangePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    if (!user.value) return false
    loginError.value = ''
    isUpdating.value = true
    try {
      await apiChangePassword(user.value.username, oldPassword, newPassword)
      user.value.password = newPassword
      persistSession(token.value!, user.value, localStorage.getItem(REMEMBER_KEY) === 'true')
      return true
    } catch (e: any) {
      loginError.value = e?.message ?? '修改失败'
      return false
    } finally {
      isUpdating.value = false
    }
  }

  // ── 更新手机号 ──
  async function doUpdatePhone(phone: string): Promise<boolean> {
    if (!user.value) return false
    loginError.value = ''
    isUpdating.value = true
    try {
      const result: any = await apiUpdatePhone(user.value.username, phone)
      user.value = result.user
      persistSession(token.value!, result.user, localStorage.getItem(REMEMBER_KEY) === 'true')
      return true
    } catch (e: any) {
      loginError.value = e?.message ?? '绑定失败'
      return false
    } finally {
      isUpdating.value = false
    }
  }

  // ── 退出 ──
  function doLogout() {
    stopSessionTimeout()
    stopLockoutCountdown()
    clearSession()
    token.value = null
    user.value = null
    preferences.value = []
    loginError.value = ''
    isLoggingIn.value = false
    isUpdating.value = false
    lockoutSeconds.value = 0
  }

  // ── 工具 ──
  function setUser(u: StoredUser | null) { user.value = u }
  function setToken(t: string | null) { token.value = t }
  function setPreferences(p: string[]) { preferences.value = p }
  function clearError() {
    loginError.value = ''
    isLoggingIn.value = false
    isUpdating.value = false
  }

  // 启动时自动恢复
  init()

  return {
    user, token, preferences, loginError, isLoggingIn, isUpdating, lockoutSeconds,
    isLoggedIn, userName, accountName, userPhone, userId,
    doLogin, doRegister, doRecover, doLogout,
    doUpdateDisplayName, doChangePassword, doUpdatePhone,
    updateLastActivity, setUser, setToken, setPreferences, clearError,
  }
})
