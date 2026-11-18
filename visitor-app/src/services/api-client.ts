/**
 * 通用 HTTP 客户端
 *
 * 原生模式（Capacitor APK）：
 *   - API 发往开发机/WiFi 上的真实后端（见 platform-adapter.ts）
 *   - 如果后端不可达，自动回退到本地 mock（native-mock-server）
 *
 * Web 模式（Vite dev server）：
 *   - 同源请求，Vite 代理转发到后端
 *   - Vite 插件拦截 /api/user/* 和 /api/chat-records/*
 */
import { isNative, getApiBaseUrl } from './platform-adapter'

export function getUseMock(): boolean {
  try {
    return localStorage.getItem('USE_MOCK') === 'true'
  } catch { return false }
}

export function getBaseURL(): string {
  if (getUseMock()) return '/mock-api'
  return getApiBaseUrl()
}

// ═══════════════════════════════════════════════
//  原生 fetch 拦截（Capacitor APK 离线降级）
// ═══════════════════════════════════════════════

let _nativeFetchInstalled = false

/**
 * 安装离线降级拦截器：
 * 仅当请求是 /mock-api/* 前缀时才拦截。
 * 其余请求（包括绝对 URL 到真实后端）正常通过。
 */
function installNativeFallback() {
  if (_nativeFetchInstalled) return
  if (!isNative()) return
  _nativeFetchInstalled = true

  const _fetch = window.fetch.bind(window)

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = init?.method || 'GET'

    // 只拦截 /mock-api/* 前缀的请求（显式 mock 模式）
    if (url.startsWith('/mock-api/') || url.includes('/mock-api/')) {
      try {
        const { handleNativeRequest } = await import('./native-mock-server')
        let body: any = init?.body
        if (typeof body === 'string' && body) {
          try { body = JSON.parse(body) } catch { /* keep raw */ }
        }
        return await handleNativeRequest(method, url, body)
      } catch {
        // 回退到真实 fetch
      }
    }

    // 其余请求（真实后端、静态资源等）正常通过
    return _fetch(input, init)
  }

  console.log('[api-client] 原生 fetch 降级已安装（仅拦截 /mock-api/）')
}

// 自动安装
installNativeFallback()

/** 从响应体中提取错误信息 */
async function extractError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    if (body?.error) return body.error
    if (body?.message) return body.message
  } catch { /* ignore */ }
  return `${res.status} ${res.statusText}`
}

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const t = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    if (t) h['Authorization'] = `Bearer ${t}`
    // x-username 供 Vite 插件识别当前用户
    const raw = localStorage.getItem('current_user') || sessionStorage.getItem('current_user')
    if (raw) {
      const user = JSON.parse(raw)
      if (user?.username) h['x-username'] = user.username
    }
  } catch {}
  return h
}

export async function apiGet(path: string) {
  const url = getBaseURL() + path
  const res = await fetch(url, { headers: getHeaders() })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json().catch(() => ({}))
}

export async function apiPost(path: string, body?: any) {
  const url = getBaseURL() + path
  const o: RequestInit = { method: 'POST', headers: getHeaders() }
  if (typeof body !== 'undefined') o.body = JSON.stringify(body)
  const res = await fetch(url, o)
  if (!res.ok) throw new Error(await extractError(res))
  return res.json().catch(() => ({}))
}

export async function apiPut(path: string, body?: any) {
  const url = getBaseURL() + path
  const o: RequestInit = { method: 'PUT', headers: getHeaders() }
  if (typeof body !== 'undefined') o.body = JSON.stringify(body)
  const res = await fetch(url, o)
  if (!res.ok) throw new Error(await extractError(res))
  return res.json().catch(() => ({}))
}

export async function apiDelete(path: string) {
  const url = getBaseURL() + path
  const res = await fetch(url, { method: 'DELETE', headers: getHeaders() })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json().catch(() => ({}))
}

export async function apiUpload(path: string, formData: FormData): Promise<any> {
  const url = getBaseURL() + path
  const headers: Record<string, string> = {}
  try {
    const t = localStorage.getItem('auth_token')
    if (t) headers['Authorization'] = `Bearer ${t}`
  } catch {}
  const res = await fetch(url, { method: 'POST', headers, body: formData })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json().catch(() => ({}))
}