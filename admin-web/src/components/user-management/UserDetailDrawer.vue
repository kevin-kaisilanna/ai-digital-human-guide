<template>
  <Teleport to="body">
    <div class="drawer-overlay" :class="{ visible: visible }" @click.self="$emit('close')">
      <div class="drawer-panel" :class="{ open: visible }">
        <!-- 头部 -->
        <div class="drawer-header">
          <div class="drawer-title-row">
            <span class="drawer-avatar">{{ selectedUser?.displayName?.slice(0, 2).toUpperCase() || '?' }}</span>
            <div class="drawer-title-meta">
              <h3>{{ selectedUser?.displayName || '加载中…' }}</h3>
              <span class="drawer-username">@{{ selectedUser?.username }}</span>
            </div>
            <span v-if="selectedUser" class="status-badge" :class="'status--' + selectedUser.status">
              {{ selectedUser.status === 'active' ? '活跃' : '已禁用' }}
            </span>
          </div>
          <button class="drawer-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 加载 / 空 -->
        <div v-if="detailLoading" class="drawer-body-center">加载中…</div>
        <div v-else-if="!selectedUser" class="drawer-body-center">用户不存在</div>

        <!-- Tab 切换 -->
        <template v-else>
          <div class="drawer-tabs">
            <button :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">用户详情</button>
            <button :class="{ active: activeTab === 'chats' }" @click="activeTab = 'chats'; $emit('loadChats', selectedUser.username)">聊天记录</button>
          </div>

          <!-- Tab: 用户详情 -->
          <div v-if="activeTab === 'info'" class="drawer-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">注册时间</span>
                <span class="info-value">{{ formatDate(selectedUser.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后登录</span>
                <span class="info-value">{{ selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : '从未登录' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">聊天会话数</span>
                <span class="info-value">{{ selectedUser.totalChats }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">消息总数</span>
                <span class="info-value">{{ selectedUser.totalMessages }}</span>
              </div>
            </div>

            <!-- 状态切换 -->
            <div class="info-section">
              <span class="info-label">账号状态</span>
              <label class="toggle-wrap">
                <input
                  type="checkbox"
                  :checked="selectedUser.status === 'active'"
                  @change="$emit('toggleStatus', selectedUser.username, selectedUser.status === 'active' ? 'disabled' : 'active')"
                />
                <span class="toggle-track">
                  <span class="toggle-knob"></span>
                </span>
                <span class="toggle-label">{{ selectedUser.status === 'active' ? '启用中' : '已禁用' }}</span>
              </label>
              <p v-if="selectedUser.disabledAt" class="info-hint">于 {{ formatDateTime(selectedUser.disabledAt) }} 被禁用</p>
            </div>

            <!-- 管理员备注 -->
            <div class="info-section">
              <label class="info-label">管理员备注</label>
              <textarea
                class="notes-input"
                :value="editNotes"
                @input="editNotes = ($event.target as HTMLTextAreaElement).value"
                placeholder="添加备注…"
                rows="3"
              ></textarea>
            </div>

            <!-- 操作按钮 -->
            <div class="info-actions">
              <button class="btn-save" @click="handleSave" :disabled="saving">
                {{ saving ? '保存中…' : '保存修改' }}
              </button>
              <button class="btn-delete" @click="confirmDelete" :disabled="deleting">
                {{ deleting ? '删除中…' : '删除账号' }}
              </button>
            </div>
          </div>

          <!-- Tab: 聊天记录 -->
          <div v-if="activeTab === 'chats'" class="drawer-body">
            <slot name="chatList" />
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AdminUserRecord } from '@/services/user-management-service'

const props = defineProps<{
  visible: boolean
  selectedUser: AdminUserRecord | null
  detailLoading: boolean
  saving: boolean
  deleting: boolean
}>()

const emit = defineEmits<{
  close: []
  loadChats: [username: string]
  toggleStatus: [username: string, newStatus: string]
  save: [username: string, updates: Partial<AdminUserRecord>]
  delete: [username: string]
}>()

const activeTab = ref<'info' | 'chats'>('info')
const editNotes = ref('')

watch(
  () => props.selectedUser,
  (u) => {
    activeTab.value = 'info'
    editNotes.value = u?.notes || ''
  }
)

function handleSave() {
  if (!props.selectedUser) return
  emit('save', props.selectedUser.username, { notes: editNotes.value })
}

function confirmDelete() {
  if (!props.selectedUser) return
  if (window.confirm(`确定要删除用户「${props.selectedUser.displayName}」及其所有数据吗？此操作不可撤销。`)) {
    emit('delete', props.selectedUser.username)
  }
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) } catch { return iso }
}
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}
</script>

<style scoped>
/* overlay */
.drawer-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,.25);
  opacity: 0; pointer-events: none;
  transition: opacity .3s;
}
.drawer-overlay.visible { opacity: 1; pointer-events: auto; }

/* panel */
.drawer-panel {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: 520px; max-width: 100vw;
  background: var(--bg-1);
  box-shadow: -4px 0 40px rgba(0,0,0,.12);
  display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform .35s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
.drawer-panel.open { transform: translateX(0); }

/* header */
.drawer-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 22px 24px 16px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}
.drawer-title-row { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.drawer-avatar {
  width: 44px; height: 44px; border-radius: var(--radius);
  background: linear-gradient(135deg, rgba(200,132,60,.2), rgba(180,130,80,.1));
  color: var(--accent-gold); display: flex; align-items: center;
  justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0;
}
.drawer-title-meta { min-width: 0; }
.drawer-title-meta h3 {
  margin: 0; font-size: 17px; font-weight: 700; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.drawer-username { font-size: 12px; color: var(--text-tertiary); }
.drawer-close {
  width: 32px; height: 32px; border: none; background: none;
  color: var(--text-tertiary); cursor: pointer; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition); flex-shrink: 0;
}
.drawer-close:hover { background: var(--surface-hover); color: var(--text); }

.status-badge {
  display: inline-block; padding: 3px 10px; border-radius: 10px;
  font-size: 11px; font-weight: 600; letter-spacing: .02em;
  flex-shrink: 0;
}
.status--active { background: var(--success-soft); color: var(--success); }
.status--disabled { background: var(--danger-soft); color: var(--danger); }

/* tabs */
.drawer-tabs {
  display: flex; border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}
.drawer-tabs button {
  flex: 1; padding: 12px; border: none; background: none;
  font-size: 13px; font-weight: 500; color: var(--text-secondary);
  cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent;
  transition: all var(--transition);
}
.drawer-tabs button:hover { color: var(--text); background: var(--surface-hover); }
.drawer-tabs button.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }

/* body */
.drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
.drawer-body-center { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--muted); font-size: 14px; }

/* info grid */
.info-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  margin-bottom: 20px;
}
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: .04em; font-weight: 500; }
.info-value { font-size: 14px; color: var(--text); font-weight: 600; }

/* sections */
.info-section { margin-bottom: 18px; }
.info-hint { font-size: 11px; color: var(--text-tertiary); margin-top: 6px; }

/* toggle */
.toggle-wrap { display: flex; align-items: center; gap: 10px; margin-top: 8px; cursor: pointer; }
.toggle-wrap input { display: none; }
.toggle-track {
  width: 40px; height: 22px; border-radius: 11px;
  background: var(--border); position: relative; transition: background .25s;
}
.toggle-wrap input:checked + .toggle-track { background: var(--success); }
.toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.15);
  transition: transform .25s;
}
.toggle-wrap input:checked + .toggle-track .toggle-knob { transform: translateX(18px); }
.toggle-label { font-size: 13px; color: var(--text); font-weight: 500; }

/* notes */
.notes-input {
  width: 100%; margin-top: 8px; padding: 10px 12px;
  border: 1px solid var(--border-light); border-radius: var(--radius-sm);
  background: var(--surface); font-size: 13px; color: var(--text);
  resize: vertical; font-family: inherit; outline: none; transition: border-color var(--transition);
  box-sizing: border-box;
}
.notes-input:focus { border-color: rgba(200,160,100,.4); }
.notes-input::placeholder { color: var(--text-tertiary); }

/* actions */
.info-actions { display: flex; gap: 10px; margin-top: 20px; }
.btn-save, .btn-delete {
  padding: 9px 20px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
  border: 1px solid; transition: all var(--transition);
}
.btn-save {
  background: var(--accent); color: #fff;
  border-color: var(--accent);
}
.btn-save:hover:not(:disabled) { background: var(--primary-hover); }
.btn-save:disabled { opacity: .5; cursor: not-allowed; }
.btn-delete {
  background: transparent; color: var(--danger);
  border-color: rgba(192,80,64,.25);
}
.btn-delete:hover:not(:disabled) { background: var(--danger-soft); border-color: rgba(192,80,64,.4); }
.btn-delete:disabled { opacity: .5; cursor: not-allowed; }

@media (max-width: 540px) {
  .drawer-panel { width: 100vw; }
}
</style>
