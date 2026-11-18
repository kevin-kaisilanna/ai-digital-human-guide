/**
 * 用户管理 — 组合式函数
 * 管理用户列表、统计、筛选、分页、详情抽屉等状态
 */
import { ref, reactive, computed } from 'vue'
import {
  fetchUsers,
  fetchUserStats,
  fetchUserDetail,
  updateUser,
  deleteUser,
  fetchUserChats,
  fetchChatSession,
  deleteChatSession,
  syncFromVisitorApp,
  type AdminUserRecord,
  type UserStats,
  type UserListResponse,
  type UserChatDetail,
  type ChatSessionFull,
  type ChatSessionSummary,
  type SyncResponse,
} from '@/services/user-management-service'

export function useUserManagement() {
  // ── 列表状态 ──
  const users = ref<AdminUserRecord[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const searchQuery = ref('')
  const statusFilter = ref('')
  const sortBy = ref('createdAt')
  const sortOrder = ref('desc')
  const loading = ref(false)
  const error = ref('')

  // ── 统计状态 ──
  const stats = ref<UserStats>({
    total: 0,
    active: 0,
    disabled: 0,
    totalChats: 0,
    totalMessages: 0,
  })
  const statsLoading = ref(false)

  // ── 详情抽屉状态 ──
  const drawerVisible = ref(false)
  const selectedUser = ref<AdminUserRecord | null>(null)
  const detailLoading = ref(false)

  // ── 聊天记录状态 ──
  const userChats = ref<UserChatDetail | null>(null)
  const chatsLoading = ref(false)
  const expandedSession = ref<ChatSessionFull | null>(null)
  const sessionLoading = ref(false)

  // ── 同步状态 ──
  const syncing = ref(false)
  const lastSyncedAt = ref<string | null>(null)

  // ── 分页 ──
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  // ── 操作方法 ──

  /** 加载用户列表 */
  async function loadUsers() {
    loading.value = true
    error.value = ''
    try {
      const res: UserListResponse = await fetchUsers({
        search: searchQuery.value,
        status: statusFilter.value,
        sort: sortBy.value,
        order: sortOrder.value,
        page: page.value,
        pageSize: pageSize.value,
      })
      users.value = res.users
      total.value = res.total
    } catch (e: any) {
      error.value = e.message || '加载失败'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  /** 加载统计数据 */
  async function loadStats() {
    statsLoading.value = true
    try {
      stats.value = await fetchUserStats()
    } catch {
      // 静默失败
    } finally {
      statsLoading.value = false
    }
  }

  /** 搜索（防抖由页面处理） */
  function setSearch(q: string) {
    searchQuery.value = q
    page.value = 1
    loadUsers()
  }

  /** 筛选状态 */
  function setStatusFilter(s: string) {
    statusFilter.value = s
    page.value = 1
    loadUsers()
  }

  /** 排序切换 */
  function setSort(field: string) {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'desc'
    }
    loadUsers()
  }

  /** 翻页 */
  function goToPage(p: number) {
    if (p < 1 || p > totalPages.value) return
    page.value = p
    loadUsers()
  }

  /** 打开用户详情抽屉 */
  async function openDrawer(username: string) {
    drawerVisible.value = true
    detailLoading.value = true
    try {
      selectedUser.value = await fetchUserDetail(username)
    } catch (e: any) {
      error.value = e.message
      selectedUser.value = null
    } finally {
      detailLoading.value = false
    }
  }

  /** 关闭抽屉 */
  function closeDrawer() {
    drawerVisible.value = false
    selectedUser.value = null
    userChats.value = null
    expandedSession.value = null
  }

  /** 加载用户聊天记录 */
  async function loadUserChats(username: string) {
    chatsLoading.value = true
    try {
      userChats.value = await fetchUserChats(username)
    } catch {
      userChats.value = null
    } finally {
      chatsLoading.value = false
    }
  }

  /** 展开聊天会话详情 */
  async function expandSession(username: string, sessionId: string) {
    sessionLoading.value = true
    try {
      expandedSession.value = await fetchChatSession(username, sessionId)
    } catch {
      expandedSession.value = null
    } finally {
      sessionLoading.value = false
    }
  }

  /** 折叠会话 */
  function collapseSession() {
    expandedSession.value = null
  }

  /** 更新用户（保存） */
  async function saveUser(username: string, updates: Partial<AdminUserRecord>) {
    try {
      const updated = await updateUser(username, updates)
      // 更新本地列表
      const idx = users.value.findIndex((u) => u.username === username)
      if (idx >= 0) users.value[idx] = updated
      if (selectedUser.value?.username === username) selectedUser.value = updated
      // 刷新统计
      loadStats()
      return updated
    } catch (e: any) {
      throw new Error(e.message)
    }
  }

  /** 删除用户 */
  async function removeUser(username: string) {
    try {
      await deleteUser(username)
      users.value = users.value.filter((u) => u.username !== username)
      total.value = Math.max(0, total.value - 1)
      if (selectedUser.value?.username === username) closeDrawer()
      loadStats()
    } catch (e: any) {
      throw new Error(e.message)
    }
  }

  /** 删除聊天会话 */
  async function removeChatSession(username: string, sessionId: string) {
    try {
      await deleteChatSession(username, sessionId)
      // 刷新聊天列表
      if (userChats.value) {
        userChats.value.sessions = userChats.value.sessions.filter(
          (s) => s.session_id !== sessionId
        )
        userChats.value.totalSessions = Math.max(0, userChats.value.totalSessions - 1)
      }
      if (expandedSession.value?.session_id === sessionId) {
        expandedSession.value = null
      }
      // 刷新用户详情中的统计
      if (selectedUser.value) {
        openDrawer(selectedUser.value.username)
      }
      loadStats()
    } catch (e: any) {
      throw new Error(e.message)
    }
  }

  /** 从 visitor-app 同步 */
  async function syncUsers(): Promise<SyncResponse> {
    syncing.value = true
    try {
      const res = await syncFromVisitorApp()
      lastSyncedAt.value = res.lastSyncedAt
      // 重新加载
      await Promise.all([loadUsers(), loadStats()])
      return res
    } catch (e: any) {
      throw new Error(e.message)
    } finally {
      syncing.value = false
    }
  }

  /** 初始化加载 */
  async function init() {
    await Promise.all([loadUsers(), loadStats()])
  }

  return {
    // 状态
    users,
    total,
    page,
    pageSize,
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    loading,
    error,
    stats,
    statsLoading,
    drawerVisible,
    selectedUser,
    detailLoading,
    userChats,
    chatsLoading,
    expandedSession,
    sessionLoading,
    syncing,
    lastSyncedAt,
    totalPages,
    // 方法
    loadUsers,
    loadStats,
    setSearch,
    setStatusFilter,
    setSort,
    goToPage,
    openDrawer,
    closeDrawer,
    loadUserChats,
    expandSession,
    collapseSession,
    saveUser,
    removeUser,
    removeChatSession,
    syncUsers,
    init,
  }
}
