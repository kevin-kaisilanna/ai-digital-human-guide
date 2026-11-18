<template>
  <div class="um-root">
    <!-- Hero 区域 -->
    <div class="um-hero">
      <div class="um-hero-left">
        <h1 class="um-hero-title">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" style="margin-right:10px;vertical-align:-4px">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          账户管理
        </h1>
        <p class="um-hero-sub">{{ activeTab === 'visitor' ? '管理所有游客账号，查看对话记录，启用或禁用账号' : '管理后台管理员账号，添加、删除、重置密码' }}</p>
      </div>
      <div class="um-hero-right" v-if="activeTab === 'visitor' && lastSyncedAt">
        <span class="um-sync-badge">上次同步：{{ formatTime(lastSyncedAt) }}</span>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="um-tabs">
      <button
        class="um-tab"
        :class="{ 'um-tab--active': activeTab === 'visitor' }"
        @click="activeTab = 'visitor'"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        游客账号
      </button>
      <button
        class="um-tab"
        :class="{ 'um-tab--active': activeTab === 'admin' }"
        @click="activeTab = 'admin'"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        管理员账号
      </button>
    </div>

    <!-- ========== 游客账号 Tab ========== -->
    <template v-if="activeTab === 'visitor'">
      <!-- 统计卡片 -->
      <section class="um-section">
        <UserStatsCards :stats="stats" />
      </section>

      <!-- 用户表格 -->
      <section class="um-section">
        <UserTable
          :users="users"
          :total="total"
          :page="page"
          :total-pages="totalPages"
          :search-query="searchQuery"
          :status-filter="statusFilter"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          :loading="loading"
          :syncing="syncing"
          @update:search-query="setSearch"
          @update:status-filter="setStatusFilter"
          @sort="setSort"
          @select="openDrawer"
          @toggle-status="handleToggleStatus"
          @go-page="goToPage"
          @sync="handleSync"
        />
      </section>

      <!-- 详情抽屉 -->
      <UserDetailDrawer
        :visible="drawerVisible"
        :selected-user="selectedUser"
        :detail-loading="detailLoading"
        :saving="saving"
        :deleting="deleting"
        @close="closeDrawer"
        @load-chats="loadUserChats"
        @toggle-status="handleToggleStatus"
        @save="handleSave"
        @delete="handleDelete"
      >
        <template #chatList>
          <UserChatList
            :sessions="userChats"
            :expanded-id="expandedId"
            :expanded-session="expandedSession"
            :loading="chatsLoading"
            :session-loading="sessionLoading"
            :username="selectedUser?.username || ''"
            @toggle-session="handleToggleSession"
            @delete-session="handleDeleteSession"
          />
        </template>
      </UserDetailDrawer>
    </template>

    <!-- ========== 管理员账号 Tab ========== -->
    <template v-if="activeTab === 'admin'">
      <!-- 统计卡片 -->
      <section class="um-section">
        <AdminStatsCards :stats="adminStats" />
      </section>

      <!-- 管理员表格 -->
      <section class="um-section">
        <AdminTable
          :admins="admins"
          :loading="adminLoading"
          @add="openAddDialog"
          @reset-pwd="openResetDialog"
          @delete="handleAdminDelete"
          @export="handleExport"
          @import="handleImport"
        />
      </section>

      <!-- 添加/重置密码对话框 -->
      <AdminFormDialog
        :visible="dialogVisible"
        :reset-mode="dialogResetMode"
        :reset-username="resetTarget.username"
        :reset-email="resetTarget.email"
        @close="closeDialog"
        @done="onAdminDone"
      />
    </template>

    <!-- Toast 提示 -->
    <div v-if="toast" class="um-toast" :class="'toast--' + toastType">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserManagement } from '@/composables/useUserManagement'
import { useAdminManagement } from '@/composables/useAdminManagement'
import type { AdminUserRecord } from '@/services/user-management-service'
import UserStatsCards from '@/components/user-management/UserStatsCards.vue'
import UserTable from '@/components/user-management/UserTable.vue'
import UserDetailDrawer from '@/components/user-management/UserDetailDrawer.vue'
import UserChatList from '@/components/user-management/UserChatList.vue'
import AdminStatsCards from '@/components/user-management/AdminStatsCards.vue'
import AdminTable from '@/components/user-management/AdminTable.vue'
import AdminFormDialog from '@/components/user-management/AdminFormDialog.vue'

// ── Tab ──
const activeTab = ref<'visitor' | 'admin'>('visitor')

// ── 游客账号 ──
const {
  users, total, page, totalPages,
  searchQuery, statusFilter, sortBy, sortOrder,
  loading, stats, statsLoading,
  drawerVisible, selectedUser, detailLoading,
  userChats, chatsLoading,
  expandedSession, sessionLoading, syncing,
  lastSyncedAt,
  setSearch, setStatusFilter, setSort, goToPage,
  openDrawer, closeDrawer, loadUserChats,
  expandSession, collapseSession,
  saveUser, removeUser, removeChatSession,
  syncUsers, loadUsers, loadStats, init,
} = useUserManagement()

// ── 管理员账号 ──
const {
  admins, loading: adminLoading, stats: adminStats,
  loadAdmins, removeAdmin, resetPassword,
  exportAccounts, importAccounts,
} = useAdminManagement()

// ── 管理员对话框状态 ──
const dialogVisible = ref(false)
const dialogResetMode = ref(false)
const resetTarget = ref({ username: '', email: '' })

// ── 本地状态 ──
const expandedId = ref<string | null>(null)
const saving = ref(false)
const deleting = ref(false)
const toast = ref('')
const toastType = ref<'success' | 'error'>('success')

// ── 生命周期 ──
let syncTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  init()
  loadAdmins()
  syncTimer = setInterval(async () => {
    try { await syncUsers() } catch { /* 静默失败 */ }
  }, 30_000)
})
onBeforeUnmount(() => { if (syncTimer) { clearInterval(syncTimer); syncTimer = null } })

// ── 游客操作方法 ──

async function handleSync() {
  try {
    const res = await syncUsers()
    showToast(`同步完成：导入 ${res.imported}，更新 ${res.skipped}`, 'success')
  } catch (e: any) {
    showToast(e.message || '同步失败', 'error')
  }
}

async function handleToggleStatus(username: string, newStatus: string) {
  try {
    await saveUser(username, { status: newStatus as 'active' | 'disabled' })
    showToast(newStatus === 'active' ? '已启用用户' : '已禁用用户', 'success')
  } catch (e: any) {
    showToast(e.message || '操作失败', 'error')
  }
}

async function handleSave(username: string, updates: Partial<AdminUserRecord>) {
  saving.value = true
  try {
    await saveUser(username, updates)
    showToast('修改已保存', 'success')
  } catch (e: any) {
    showToast(e.message || '保存失败', 'error')
  } finally {
    saving.value = false
  }
}

async function handleDelete(username: string) {
  deleting.value = true
  try {
    await removeUser(username)
    showToast('用户已删除', 'success')
  } catch (e: any) {
    showToast(e.message || '删除失败', 'error')
  } finally {
    deleting.value = false
  }
}

async function handleToggleSession(sessionId: string | null) {
  if (!sessionId) {
    expandedId.value = null
    collapseSession()
    return
  }
  if (expandedId.value === sessionId) {
    expandedId.value = null
    collapseSession()
    return
  }
  expandedId.value = sessionId
  if (selectedUser.value) {
    try {
      await expandSession(selectedUser.value.username, sessionId)
    } catch { /* ignore */ }
  }
}

async function handleDeleteSession(_username: string, sessionId: string) {
  if (!selectedUser.value) return
  try {
    await removeChatSession(selectedUser.value.username, sessionId)
    if (expandedId.value === sessionId) {
      expandedId.value = null
      collapseSession()
    }
    showToast('会话已删除', 'success')
  } catch (e: any) {
    showToast(e.message || '删除失败', 'error')
  }
}

// ── 管理员操作方法 ──

function openAddDialog() {
  dialogResetMode.value = false
  resetTarget.value = { username: '', email: '' }
  dialogVisible.value = true
}

function openResetDialog(username: string, email: string) {
  dialogResetMode.value = true
  resetTarget.value = { username, email }
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
}

async function onAdminDone() {
  await loadAdmins()
  showToast('操作成功', 'success')
}

async function handleAdminDelete(username: string) {
  try {
    const result = await removeAdmin(username)
    if (result.success) {
      showToast('管理员已删除', 'success')
    } else {
      showToast(result.message, 'error')
    }
  } catch (e: any) {
    showToast(e.message || '删除失败', 'error')
  }
}

async function handleExport() {
  try {
    await exportAccounts()
    showToast('账号已导出', 'success')
  } catch (e: any) {
    showToast(e.message || '导出失败', 'error')
  }
}

async function handleImport(file: File) {
  try {
    const result = await importAccounts(file)
    if (result.success) {
      showToast(result.message, 'success')
    } else {
      showToast(result.message, 'error')
    }
  } catch (e: any) {
    showToast(e.message || '导入失败', 'error')
  }
}

// ── 工具 ──
function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

let toastTimer: ReturnType<typeof setTimeout>
function showToast(msg: string, type: 'success' | 'error') {
  toast.value = msg
  toastType.value = type
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3000)
}
</script>

<style scoped>
.um-root {
  padding: 0 24px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Hero */
.um-hero {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 32px 0 28px;
  gap: 16px;
  flex-wrap: wrap;
}
.um-hero-title {
  margin: 0 0 6px; font-size: 24px; font-weight: 800;
  color: var(--text); letter-spacing: .02em;
}
.um-hero-sub {
  margin: 0; font-size: 13px; color: var(--text-tertiary);
  max-width: 500px; line-height: 1.5;
}
.um-hero-right { flex-shrink: 0; }
.um-sync-badge {
  display: inline-block; padding: 5px 12px; border-radius: var(--radius-sm);
  background: var(--surface); border: 1px solid var(--border-light);
  font-size: 11px; color: var(--text-tertiary);
}

/* Tabs */
.um-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-light);
}
.um-tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px;
  border: none; border-bottom: 2px solid transparent;
  background: none; cursor: pointer;
  font-size: 14px; font-weight: 500; color: var(--text-tertiary);
  font-family: inherit; transition: all var(--transition);
  margin-bottom: -1px;
}
.um-tab:hover { color: var(--text); background: var(--surface-hover); }
.um-tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}
.um-tab--active:hover { color: var(--accent); background: transparent; }

/* Sections */
.um-section { margin-bottom: 24px; }

/* Toast */
.um-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  padding: 10px 24px; border-radius: var(--radius);
  font-size: 13px; font-weight: 500; z-index: 200;
  box-shadow: var(--shadow-lg);
  animation: toast-in .25s ease-out;
  pointer-events: none;
}
.toast--success { background: var(--success); color: #fff; }
.toast--error { background: var(--danger); color: #fff; }
@keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

@media (max-width: 768px) {
  .um-root { padding: 0 14px 30px; }
  .um-hero { padding: 20px 0 18px; }
  .um-hero-title { font-size: 20px; }
  .um-tab { padding: 10px 16px; font-size: 13px; }
}
</style>
