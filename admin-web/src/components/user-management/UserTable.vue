<template>
  <div class="um-table-wrap">
    <!-- 搜索和筛选栏 -->
    <div class="um-toolbar">
      <div class="um-search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          placeholder="搜索用户名或昵称…"
          class="um-search-input"
        />
      </div>
      <div class="um-filters">
        <select :value="statusFilter" @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)" class="um-select">
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="disabled">已禁用</option>
        </select>
        <button class="um-btn um-btn--sync" @click="$emit('sync')" :disabled="syncing">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: syncing }"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          {{ syncing ? '同步中…' : '同步数据' }}
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <table class="um-table">
        <thead>
          <tr>
            <th @click="$emit('sort', 'username')" class="sortable">
              用户名
              <span v-if="sortBy === 'username'" class="sort-arrow">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="$emit('sort', 'displayName')" class="sortable">
              昵称
              <span v-if="sortBy === 'displayName'" class="sort-arrow">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th>状态</th>
            <th @click="$emit('sort', 'totalChats')" class="sortable">
              聊天会话
              <span v-if="sortBy === 'totalChats'" class="sort-arrow">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="$emit('sort', 'totalMessages')" class="sortable">
              消息数
              <span v-if="sortBy === 'totalMessages'" class="sort-arrow">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="$emit('sort', 'createdAt')" class="sortable">
              注册时间
              <span v-if="sortBy === 'createdAt'" class="sort-arrow">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="actions-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0 && !loading">
            <td colspan="7" class="empty-row">暂无用户数据，请点击"同步数据"从游客端导入</td>
          </tr>
          <tr v-if="loading">
            <td colspan="7" class="empty-row">加载中…</td>
          </tr>
          <tr v-for="user in users" :key="user.username" @click="$emit('select', user.username)" class="user-row">
            <td>
              <div class="user-cell">
                <span class="user-avatar-sm">{{ user.displayName.slice(0, 1).toUpperCase() }}</span>
                <span class="user-name-text">{{ user.username }}</span>
              </div>
            </td>
            <td>{{ user.displayName }}</td>
            <td>
              <span class="status-badge" :class="'status--' + user.status">
                {{ user.status === 'active' ? '活跃' : '已禁用' }}
              </span>
            </td>
            <td>{{ user.totalChats }}</td>
            <td>{{ user.totalMessages }}</td>
            <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
            <td class="actions-col" @click.stop>
              <button class="um-btn-sm" @click="$emit('select', user.username)" title="查看详情">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button
                class="um-btn-sm"
                :class="user.status === 'active' ? 'um-btn-sm--danger' : 'um-btn-sm--success'"
                @click="$emit('toggleStatus', user.username, user.status === 'active' ? 'disabled' : 'active')"
                :title="user.status === 'active' ? '禁用' : '启用'"
              >
                <svg v-if="user.status === 'active'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="um-pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="$emit('goPage', page - 1)" class="um-page-btn">上一页</button>
      <span class="um-page-info">第 {{ page }} / {{ totalPages }} 页（共 {{ total }} 条）</span>
      <button :disabled="page >= totalPages" @click="$emit('goPage', page + 1)" class="um-page-btn">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminUserRecord } from '@/services/user-management-service'

defineProps<{
  users: AdminUserRecord[]
  total: number
  page: number
  totalPages: number
  searchQuery: string
  statusFilter: string
  sortBy: string
  sortOrder: string
  loading: boolean
  syncing: boolean
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:statusFilter': [value: string]
  sort: [field: string]
  select: [username: string]
  toggleStatus: [username: string, newStatus: string]
  goPage: [page: number]
  sync: []
}>()

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch { return iso }
}
</script>

<style scoped>
.um-table-wrap {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

/* 工具栏 */
.um-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-light);
  flex-wrap: wrap;
  gap: 10px;
}
.um-search {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 12px; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); background: var(--surface);
  flex: 1; max-width: 300px;
}
.um-search svg { opacity: .4; flex-shrink: 0; }
.um-search-input {
  border: none; background: none; outline: none;
  font-size: 13px; color: var(--text); width: 100%;
  font-family: inherit;
}
.um-search-input::placeholder { color: var(--text-tertiary); }

.um-filters { display: flex; align-items: center; gap: 8px; }
.um-select {
  padding: 7px 30px 7px 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-size: 12px; color: var(--text);
  font-family: inherit; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b7558' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}

/* 按钮 */
.um-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); background: var(--surface);
  font-size: 12px; font-weight: 500; color: var(--text-secondary);
  cursor: pointer; font-family: inherit; transition: all var(--transition);
}
.um-btn:hover { background: var(--surface-hover); color: var(--text); }
.um-btn--sync { color: var(--accent); border-color: rgba(200,160,100,.3); }
.um-btn--sync:hover { background: rgba(200,160,100,.06); }
.um-btn:disabled { opacity: .5; cursor: not-allowed; }

.um-btn-sm {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); background: var(--surface);
  color: var(--text-secondary); cursor: pointer; transition: all var(--transition);
  margin-left: 4px;
}
.um-btn-sm:hover { background: var(--surface-hover); color: var(--text); }
.um-btn-sm--danger:hover { color: var(--danger); border-color: rgba(192,80,64,.3); background: var(--danger-soft); }
.um-btn-sm--success:hover { color: var(--success); border-color: rgba(74,154,110,.3); background: var(--success-soft); }

/* 表格 */
.table-container { overflow-x: auto; }
.um-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.um-table th {
  text-align: left; padding: 10px 14px;
  color: var(--text-secondary); font-weight: 600; font-size: 11px;
  text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}
.um-table td {
  padding: 10px 14px; border-bottom: 1px solid var(--border-light);
  color: var(--text);
}
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: var(--text); }
.sort-arrow { font-size: 10px; margin-left: 2px; color: var(--accent); }

.user-row { cursor: pointer; transition: background var(--transition); }
.user-row:hover { background: var(--surface-hover); }
.user-cell { display: flex; align-items: center; gap: 8px; }
.user-avatar-sm {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(200,132,60,.2), rgba(180,130,80,.1));
  color: var(--accent-gold); display: flex; align-items: center;
  justify-content: center; font-weight: 700; font-size: 12px;
  flex-shrink: 0;
}
.user-name-text { font-weight: 500; }

.status-badge {
  display: inline-block; padding: 3px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 600; letter-spacing: .02em;
}
.status--active { background: var(--success-soft); color: var(--success); }
.status--disabled { background: var(--danger-soft); color: var(--danger); }

.date-cell { color: var(--text-tertiary); font-size: 12px; white-space: nowrap; }
.actions-col { text-align: right; white-space: nowrap; }
.empty-row { text-align: center; color: var(--muted); padding: 40px 14px !important; }

/* 分页 */
.um-pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 14px; padding: 14px 18px;
  border-top: 1px solid var(--border-light);
}
.um-page-btn {
  padding: 6px 14px; border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); background: var(--surface);
  font-size: 12px; color: var(--text-secondary); cursor: pointer;
  font-family: inherit; transition: all var(--transition);
}
.um-page-btn:hover:not(:disabled) { background: var(--surface-hover); color: var(--text); }
.um-page-btn:disabled { opacity: .35; cursor: not-allowed; }
.um-page-info { font-size: 12px; color: var(--text-tertiary); }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .um-toolbar { flex-direction: column; align-items: stretch; }
  .um-search { max-width: none; }
}
</style>
