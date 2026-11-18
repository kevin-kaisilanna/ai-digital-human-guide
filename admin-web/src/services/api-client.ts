/**
 * 通用 HTTP 客户端
 * - 支持 Mock 模式（读取 public/data/）和真实 API 模式
 * - 自动注入 token
 * - 统一错误处理
 */

export function getUseMock(): boolean {
  const v = typeof window !== 'undefined' ? localStorage.getItem('USE_MOCK') : null
  if (v === null) return true  // 默认使用 Mock 数据，走静态 JSON / 内置常量
  return v === 'true'
}

export function getBaseURL(): string {
  if (getUseMock()) return '/mock-api'
  const override = typeof window !== 'undefined' ? localStorage.getItem('API_BASE') : null
  if (override) return override
  return import.meta.env.VITE_API_BASE ?? 'http://localhost:8001'
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  // 如果 Pinia store 可用，注入 token
  try {
    const token = sessionStorage.getItem('auth_token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch { /* 忽略 */ }
  return headers
}

export async function apiGet(path: string) {
  const url = getBaseURL() + path
  const res = await fetch(url, { headers: getHeaders() })
  if (!res.ok) throw new Error(`GET ${url} => ${res.status}`)
  return res.json().catch(() => ({}))
}

export async function apiPost(path: string, body?: any) {
  const url = getBaseURL() + path
  const options: RequestInit = {
    method: 'POST',
    headers: getHeaders(),
  }
  if (typeof body !== 'undefined') options.body = JSON.stringify(body)
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`POST ${url} => ${res.status}`)
  return res.json().catch(() => ({}))
}

export async function apiPut(path: string, body?: any) {
  const url = getBaseURL() + path
  const options: RequestInit = {
    method: 'PUT',
    headers: getHeaders(),
  }
  if (typeof body !== 'undefined') options.body = JSON.stringify(body)
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`PUT ${url} => ${res.status}`)
  return res.json().catch(() => ({}))
}

export async function apiDelete(path: string) {
  const url = getBaseURL() + path
  const options: RequestInit = {
    method: 'DELETE',
    headers: getHeaders(),
  }
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`DELETE ${url} => ${res.status}`)
  return res.json().catch(() => ({}))
}
