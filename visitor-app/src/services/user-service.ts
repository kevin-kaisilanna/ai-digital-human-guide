/**
 * 用户 API 服务
 *
 * 认证接口（login / register / recover / display-name / password / phone）
 * 由 Vite 插件直接处理，读写 public/data/users.json 文件。
 *
 * 后端部署后只需将 API_BASE 指向真实后端即可，无需改代码。
 */

import { getUseMock, apiGet, apiPost, apiPut } from './api-client'

/**
 * 登录（用户名 + 密码）
 */
export async function login(username: string, password: string) {
  return apiPost('/api/user/login', { username, password })
}

/** 注册 */
export async function register(username: string, password: string) {
  return apiPost('/api/user/register', { username, password })
}

/** 找回密码 */
export async function recoverPassword(username: string) {
  return apiPost('/api/user/recover', { username })
}

/** 修改昵称（展示名称，非登录账号） */
export async function updateDisplayName(username: string, displayName: string) {
  return apiPut('/api/user/display-name', { username, displayName })
}

/** 修改登录密码 */
export async function changePassword(username: string, oldPassword: string, newPassword: string) {
  return apiPut('/api/user/password', { username, oldPassword, newPassword })
}

/** 更新手机号 */
export async function updatePhone(username: string, phone: string) {
  return apiPut('/api/user/phone', { username, phone })
}

/** 校验 token */
export async function validateTokenApi(token: string) {
  return apiPost('/api/user/validate-token', { token })
}

/** 查询锁定状态 */
export async function getLockoutStatus(identifier: string) {
  return apiGet('/api/user/lockout-status?username=' + encodeURIComponent(identifier))
}

/** 获取用户资料 */
export async function getProfile() {
  if (getUseMock()) {
    const raw = localStorage.getItem('current_user')
    if (raw) {
      try { return JSON.parse(raw) } catch { /* fall through */ }
    }
    return { name: '游客', id: '—', preferences: [] }
  }
  return apiGet('/api/user/profile')
}

/** 保存偏好 */
export async function savePreferences(prefs: string[]) {
  if (getUseMock()) return { ok: true }
  return apiPut('/api/user/preferences', { preferences: prefs })
}

// ═══════════════════════════════════════════════
//  重新导出验证工具（方便 UI 层统一引用）
// ═══════════════════════════════════════════════

export {
  validateUsername,
  validatePassword,
  getPasswordStrength,
  validateConfirmPassword,
  validateDisplayName,
} from './validators'
export type { ValidationResult, PasswordStrength, StrengthResult } from './validators'
