/**
 * 用户管理 API 服务
 * 对应 admin-web Vite 插件拦截的 /api/admin/* 端点
 * 所有请求在开发时由 vite-plugin-user-management.ts 处理
 */

const BASE = '/api/admin'

// ---- 类型 ----

export interface AdminUserRecord {
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

export interface UserStats {
  total: number
  active: number
  disabled: number
  totalChats: number
  totalMessages: number
}

export interface UserListResponse {
  users: AdminUserRecord[]
  total: number
  page: number
  pageSize: number
}

export interface ChatSessionSummary {
  session_id: string
  title: string
  status: 'active' | 'archived'
  messageCount: number
  created_at: string
  updated_at: string
}

export interface UserChatDetail {
  username: string
  sessions: ChatSessionSummary[]
  totalSessions: number
  totalMessages: number
}

export interface ChatMsg {
  id: number
  role: 'user' | 'ai'
  type: 'text' | 'voice'
  content: string
  time: string
  duration?: number
  emotion?: string
  action?: string
}

export interface ChatSessionFull {
  session_id: string
  username: string
  title: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  messages: ChatMsg[]
}

export interface SyncResponse {
  imported: number
  skipped: number
  total: number
  lastSyncedAt: string
}

// ---- 内部 fetch 封装 ----

async function get(path: string): Promise<any> {
  const resp = await fetch(`${BASE}${path}`)
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: '请求失败' }))
    throw new Error(err.error || `HTTP ${resp.status}`)
  }
  return resp.json()
}

async function post(path: string, body?: any): Promise<any> {
  const resp = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: '请求失败' }))
    throw new Error(err.error || `HTTP ${resp.status}`)
  }
  return resp.json()
}

async function put(path: string, body: any): Promise<any> {
  const resp = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: '请求失败' }))
    throw new Error(err.error || `HTTP ${resp.status}`)
  }
  return resp.json()
}

async function del(path: string): Promise<any> {
  const resp = await fetch(`${BASE}${path}`, { method: 'DELETE' })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: '请求失败' }))
    throw new Error(err.error || `HTTP ${resp.status}`)
  }
  return resp.json()
}

// ---- 公开 API ----

/** 获取用户列表（分页/搜索/筛选/排序） */
export function fetchUsers(params?: {
  search?: string
  status?: string
  sort?: string
  order?: string
  page?: number
  pageSize?: number
}): Promise<UserListResponse> {
  const qs = new URLSearchParams()
  if (params?.search) qs.set('search', params.search)
  if (params?.status) qs.set('status', params.status)
  if (params?.sort) qs.set('sort', params.sort)
  if (params?.order) qs.set('order', params.order)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
  const query = qs.toString()
  return get(`/users${query ? '?' + query : ''}`)
}

/** 获取用户统计概览 */
export function fetchUserStats(): Promise<UserStats> {
  return get('/users/stats')
}

/** 获取单个用户详情 */
export function fetchUserDetail(username: string): Promise<AdminUserRecord> {
  return get(`/users/${encodeURIComponent(username)}`)
}

/** 更新用户信息 */
export function updateUser(username: string, updates: Partial<AdminUserRecord>): Promise<AdminUserRecord> {
  return put(`/users/${encodeURIComponent(username)}`, updates)
}

/** 删除用户 */
export function deleteUser(username: string): Promise<{ deleted: string }> {
  return del(`/users/${encodeURIComponent(username)}`)
}

/** 禁用用户 */
export function disableUser(username: string): Promise<AdminUserRecord> {
  return put(`/users/${encodeURIComponent(username)}`, { status: 'disabled' })
}

/** 启用用户 */
export function enableUser(username: string): Promise<AdminUserRecord> {
  return put(`/users/${encodeURIComponent(username)}`, { status: 'active' })
}

/** 获取用户聊天会话列表 */
export function fetchUserChats(username: string): Promise<UserChatDetail> {
  return get(`/users/${encodeURIComponent(username)}/chats`)
}

/** 获取单个聊天会话详情 */
export function fetchChatSession(username: string, sessionId: string): Promise<ChatSessionFull> {
  return get(`/users/${encodeURIComponent(username)}/chats/${encodeURIComponent(sessionId)}`)
}

/** 删除聊天会话 */
export function deleteChatSession(username: string, sessionId: string): Promise<{ deleted: string }> {
  return del(`/users/${encodeURIComponent(username)}/chats/${encodeURIComponent(sessionId)}`)
}

/** 从 visitor-app 同步数据 */
export function syncFromVisitorApp(): Promise<SyncResponse> {
  return post('/sync')
}
