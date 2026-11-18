<template>
  <div class="am-table-wrap">
    <!-- 工具栏 -->
    <div class="am-toolbar">
      <div class="am-search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          v-model="searchText"
          placeholder="搜索用户名或邮箱…"
          class="am-search-input"
        />
      </div>
      <div class="am-filters">
        <button class="um-btn" @click="$emit('add')" title="添加管理员">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          添加
        </button>
        <button class="um-btn" @click="$emit('export')" title="导出账号">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          导出
        </button>
        <label class="um-btn um-btn--import" title="导入账号">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="3 10 12 15 21 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          导入
          <input type="file" accept=".json" class="am-file-input" @change="onFileChange" />
        </label>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <table class="am-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>创建时间</th>
            <th class="actions-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredAdmins.length === 0 && !loading">
            <td colspan="5" class="empty-row">暂无管理员账号</td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="empty-row">加载中…</td>
          </tr>
          <tr v-for="admin in filteredAdmins" :key="admin.username" class="admin-row">
            <td>
              <div class="admin-cell">
                <span class="admin-avatar-sm">{{ admin.username.slice(0, 1).toUpperCase() }}</span>
                <span class="admin-name-text">{{ admin.username }}</span>
              </div>
            </td>
            <td class="email-cell">{{ admin.email || '—' }}</td>
            <td>
              <span class="role-badge" :class="admin.role === '超级管理员' ? 'role--super' : 'role--normal'">
                {{ admin.role }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(admin.createdAt) }}</td>
            <td class="actions-col">
              <button class="um-btn-sm" @click="$emit('resetPwd', admin.username, admin.email)" title="重置密码">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
              </button>
              <button
                class="um-btn-sm um-btn-sm--danger"
                @click="$emit('delete', admin.username)"
                title="删除管理员"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部信息 -->
    <div class="am-footer">
      <span class="am-count">共 {{ admins.length }} 个管理员（当前显示 {{ filteredAdmins.length }} 个）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AdminAccount } from '@/composables/useAdminManagement'

const props = defineProps<{
  admins: AdminAccount[]
  loading: boolean
}>()

const searchText = ref('')

const filteredAdmins = computed(() => {
  if (!searchText.value.trim()) return props.admins
  const q = searchText.value.trim().toLowerCase()
  return props.admins.filter(
    a => a.username.toLowerCase().includes(q) || (a.email && a.email.toLowerCase().includes(q))
  )
})

const emit = defineEmits<{
  add: []
  resetPwd: [username: string, email: string]
  delete: [username: string]
  export: []
  import: [file: File]
}>()

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('import', file)
    input.value = ''
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch { return iso }
}
</script>

<style scoped>
.am-table-wrap {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* 工具栏 */
.am-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-light);
  flex-wrap: wrap;
  gap: 10px;
}
.am-search {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 12px; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); background: var(--surface);
  flex: 1; max-width: 300px;
}
.am-search svg { opacity: .4; flex-shrink: 0; }
.am-search-input {
  border: none; background: none; outline: none;
  font-size: 13px; color: var(--text); width: 100%;
  font-family: inherit;
}
.am-search-input::placeholder { color: var(--text-tertiary); }

.am-filters { display: flex; align-items: center; gap: 8px; }

/* 按钮 — 复用 UserTable 样式 */
.um-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); background: var(--surface);
  font-size: 12px; font-weight: 500; color: var(--text-secondary);
  cursor: pointer; font-family: inherit; transition: all var(--transition);
}
.um-btn:hover { background: var(--surface-hover); color: var(--text); }

.um-btn--import {
  position: relative; overflow: hidden;
}
.am-file-input {
  position: absolute; inset: 0; opacity: 0; cursor: pointer;
}

.um-btn-sm {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); background: var(--surface);
  color: var(--text-secondary); cursor: pointer; transition: all var(--transition);
  margin-left: 4px;
}
.um-btn-sm:hover { background: var(--surface-hover); color: var(--text); }
.um-btn-sm--danger:hover { color: var(--danger); border-color: rgba(192,80,64,.3); background: var(--danger-soft); }

/* 表格 */
.table-container { overflow-x: auto; }
.am-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.am-table th {
  text-align: left; padding: 10px 14px;
  color: var(--text-secondary); font-weight: 600; font-size: 11px;
  text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}
.am-table td {
  padding: 10px 14px; border-bottom: 1px solid var(--border-light);
  color: var(--text);
}

.admin-row { transition: background var(--transition); }
.admin-row:hover { background: var(--surface-hover); }
.admin-cell { display: flex; align-items: center; gap: 8px; }
.admin-avatar-sm {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(200,132,60,.2), rgba(180,130,80,.1));
  color: var(--accent-gold); display: flex; align-items: center;
  justify-content: center; font-weight: 700; font-size: 12px;
  flex-shrink: 0;
}
.admin-name-text { font-weight: 500; }

.email-cell { color: var(--text-secondary); font-size: 12px; }

.role-badge {
  display: inline-block; padding: 3px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 600; letter-spacing: .02em;
}
.role--super { background: rgba(200,160,100,.12); color: var(--accent-gold); }
.role--normal { background: var(--surface-hover); color: var(--text-secondary); }

.date-cell { color: var(--text-tertiary); font-size: 12px; white-space: nowrap; }
.actions-col { text-align: right; white-space: nowrap; }
.empty-row { text-align: center; color: var(--muted); padding: 40px 14px !important; }

/* 底部 */
.am-footer {
  display: flex; align-items: center; justify-content: center;
  padding: 12px 18px; border-top: 1px solid var(--border-light);
}
.am-count { font-size: 12px; color: var(--text-tertiary); }

@media (max-width: 768px) {
  .am-toolbar { flex-direction: column; align-items: stretch; }
  .am-search { max-width: none; }
}
</style>
