/**
 * 表单验证工具库
 *
 * 集中管理所有输入校验逻辑：
 *   - 用户名 / 密码 / 手机号 / 昵称 格式校验
 *   - 密码强度评分
 *
 * 所有函数返回 { valid, message } 而非抛异常，
 * 方便 UI 层做实时反馈。
 */

// ═══════════════════════════ 类型 ═══════════════════════════

export interface ValidationResult {
  valid: boolean
  message: string
}

/** 密码强度等级 */
export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export interface StrengthResult {
  level: PasswordStrength
  score: 0 | 1 | 2 | 3 | 4      // 0~4
  label: string                   // "弱" / "一般" / "良好" / "强"
  message: string                 // 提示文字
}

// ═══════════════════════════ 用户名 ═══════════════════════════

/**
 * 校验用户名格式
 * - 2~20 个字符
 * - 允许：字母、数字、下划线、中文
 * - 禁止纯空格或首尾空格
 */
export function validateUsername(value: string): ValidationResult {
  const trimmed = value.trim()
  if (!trimmed) {
    return { valid: false, message: '请输入用户名' }
  }
  if (trimmed !== value) {
    return { valid: false, message: '用户名首尾不能有空格' }
  }
  if (trimmed.length < 2) {
    return { valid: false, message: '用户名至少需要 2 个字符' }
  }
  if (trimmed.length > 20) {
    return { valid: false, message: '用户名最多 20 个字符' }
  }
  if (!/^[\w一-鿿]+$/.test(trimmed)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线或中文' }
  }
  return { valid: true, message: '' }
}

// ═══════════════════════════ 密码 ═══════════════════════════

/**
 * 校验密码格式 — 至少 4 个字符
 */
export function validatePassword(value: string): ValidationResult {
  if (!value) {
    return { valid: false, message: '请输入密码' }
  }
  if (value.length < 4) {
    return { valid: false, message: '密码至少需要 4 个字符' }
  }
  return { valid: true, message: '' }
}

/**
 * 获取密码强度评级
 * - empty:  未输入
 * - weak:   &lt; 4 字符 || 纯数字 || 纯字母
 * - fair:   4~7 字符，含字母+数字
 * - good:   &gt;= 8 字符，含字母+数字，含大小写
 * - strong: &gt;= 8 字符，含字母+数字+特殊字符
 */
export function getPasswordStrength(value: string): StrengthResult {
  if (!value) {
    return { level: 'empty', score: 0, label: '—', message: '' }
  }

  const len = value.length
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasDigit = /\d/.test(value)
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasSpecial = /[^a-zA-Z0-9]/.test(value)

  // 弱：&lt; 4 位 或 同一类型
  if (len < 4 || (!hasLetter && hasDigit) || (hasLetter && !hasDigit)) {
    return { level: 'weak', score: 1, label: '弱', message: '建议使用字母+数字组合' }
  }

  // 一般：4~7 位且含字母+数字
  if (len < 8) {
    return { level: 'fair', score: 2, label: '一般', message: '可以更长一些，并加入大小写字母' }
  }

  // 良好：&gt;= 8 位，字母+数字，含大小写
  if (hasUpper && hasLower && !hasSpecial) {
    return { level: 'good', score: 3, label: '良好', message: '还可以加入特殊字符增强安全性' }
  }

  // 强：&gt;= 8 位，字母+数字+特殊字符
  if (hasSpecial) {
    return { level: 'strong', score: 4, label: '强', message: '密码强度很好！' }
  }

  // 8 位但缺大小写错落 → 一般
  return { level: 'fair', score: 2, label: '一般', message: '建议混合大小写字母增强安全性' }
}

// ═══════════════════════════ 手机号 ═══════════════════════════

/**
 * 校验中国大陆手机号格式
 * 空值视为合法（手机号为可选字段）
 */
export function validatePhone(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: true, message: '' }
  }
  if (!/^1[3-9]\d{9}$/.test(value.trim())) {
    return { valid: false, message: '请输入正确的 11 位手机号' }
  }
  return { valid: true, message: '' }
}

// ═══════════════════════════ 确认密码 ═══════════════════════════

export function validateConfirmPassword(password: string, confirm: string): ValidationResult {
  if (!confirm) {
    return { valid: false, message: '请再次输入密码' }
  }
  if (password !== confirm) {
    return { valid: false, message: '两次输入的密码不一致' }
  }
  return { valid: true, message: '' }
}

// ═══════════════════════════ 昵称 ═══════════════════════════

export function validateDisplayName(value: string): ValidationResult {
  const trimmed = value.trim()
  if (!trimmed) {
    return { valid: false, message: '昵称不能为空' }
  }
  if (trimmed.length > 20) {
    return { valid: false, message: '昵称最多 20 个字符' }
  }
  return { valid: true, message: '' }
}

// ═══════════════════════════ 防抖工具 ═══════════════════════════

/**
 * 创建一个 debounce 版本的验证函数
 * 用于 watch 中实时校验输入
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as unknown as T
}
