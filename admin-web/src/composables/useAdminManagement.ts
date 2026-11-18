/**
 * 管理员账号管理 Composable
 * 封装 adminDb API，提供响应式状态供 UI 消费
 */
import { ref, computed } from 'vue'
import { adminDb } from '@/services/admin-db'

export interface AdminAccount {
  username: string
  email: string
  role: string
  createdAt: string
}

export function useAdminManagement() {
  const admins = ref<AdminAccount[]>([])
  const loading = ref(false)
  const error = ref('')

  // ── 统计 ──
  const stats = computed(() => ({
    total: admins.value.length,
    superAdminCount: admins.value.filter(a => a.role === '超级管理员').length,
    adminCount: admins.value.filter(a => a.role !== '超级管理员').length,
  }))

  // ── 数据加载 ──
  async function loadAdmins() {
    loading.value = true
    error.value = ''
    try {
      admins.value = await adminDb.listAdmins()
    } catch (e: any) {
      error.value = e.message || '加载管理员列表失败'
      admins.value = []
    } finally {
      loading.value = false
    }
  }

  // ── 新增管理员 ──
  async function addAdmin(
    username: string,
    password: string,
    email: string,
    role: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await adminDb.register(username, password, email)
    if (result.success) {
      // register 默认角色是"管理员"，如果需要自定义角色需要更新
      // adminDb 不支持自定义角色，这里直接刷新列表
      await loadAdmins()
    }
    return result
  }

  // ── 删除管理员 ──
  async function removeAdmin(username: string): Promise<{ success: boolean; message: string }> {
    const result = await adminDb.deleteAdmin(username)
    if (result.success) {
      admins.value = admins.value.filter(a => a.username !== username)
      error.value = ''
    }
    return result
  }

  // ── 重置密码 ──
  async function resetPassword(username: string, email?: string): Promise<{ success: boolean; message: string; newPassword?: string }> {
    return await adminDb.resetPassword(username, email)
  }

  // ── 修改密码 ──
  async function changePassword(
    username: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    return await adminDb.changePassword(username, oldPassword, newPassword)
  }

  // ── 导出 ──
  async function exportAccounts() {
    try {
      await adminDb.exportToFile()
    } catch (e: any) {
      throw new Error(e.message || '导出失败')
    }
  }

  // ── 导入 ──
  async function importAccounts(file: File): Promise<{ success: boolean; message: string }> {
    const result = await adminDb.importFromFile(file)
    if (result.success) {
      await loadAdmins()
    }
    return result
  }

  return {
    admins,
    loading,
    error,
    stats,
    loadAdmins,
    addAdmin,
    removeAdmin,
    resetPassword,
    changePassword,
    exportAccounts,
    importAccounts,
  }
}
