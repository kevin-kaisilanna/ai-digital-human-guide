// 用户相关类型

export type UserRole = 'admin' | 'manager' | 'viewer'

export interface User {
  id: string
  username: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

/** 游客信息 */
export interface Visitor {
  id: string
  nickname: string
  preferences: string[]      // 兴趣标签
  visitedSpots: string[]
}

// ═══════════════════════════════════════════
// 用户管理系统 — 扩展类型
// ═══════════════════════════════════════════

/** 游客用户（visitor-app 存储） */
export interface VisitorUser {
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

/** 游客用户数据库（visitor-app） */
export interface VisitorUsersDB {
  [username: string]: VisitorUser
}

/** 管理员视角 — 用户管理记录（admin-web 存储） */
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

/** 管理员用户管理数据库（admin-web） */
export interface AdminUsersDB {
  users: AdminUserRecord[]
  version: number
  lastSyncedAt: string | null
}

/** 用户统计汇总 */
export interface UserStats {
  total: number
  active: number
  disabled: number
  totalChats: number
  totalMessages: number
}

/** 聊天会话摘要（管理员视图） */
export interface ChatSessionSummary {
  session_id: string
  title: string
  status: 'active' | 'archived'
  messageCount: number
  created_at: string
  updated_at: string
}

/** 用户聊天详情 */
export interface UserChatDetail {
  username: string
  sessions: ChatSessionSummary[]
  totalSessions: number
  totalMessages: number
}

/** ChatSession 扩展（带 username） */
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

export interface ChatSession {
  session_id: string
  username: string
  title: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  messages: ChatMsg[]
}

/** 同步请求 / 响应 */
export interface SyncRequest {
  visitorUsersPath?: string
  visitorChatPath?: string
}

export interface SyncResponse {
  imported: number
  skipped: number
  total: number
  lastSyncedAt: string
}
