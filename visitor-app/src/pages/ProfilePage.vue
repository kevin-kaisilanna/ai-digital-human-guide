<template>
  <div class="profile-page">
    <!-- 头像 & 昵称 -->
    <div class="profile-header">
      <img class="avatar-img" src="/images/visitor.jpg" alt="头像" />
      <h2 class="profile-name">{{ store.userName }}</h2>
      <p class="profile-id">账号: {{ store.accountName }}</p>
      <p class="profile-date" v-if="store.user?.createdAt">
        注册于 {{ formatDate(store.user.createdAt) }}
      </p>
    </div>

    <!-- 设置入口 -->
    <button class="settings-entry card" @click="$router.push('/settings')">
      <div class="se-left">
        <span class="se-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </span>
        <div class="se-text">
          <span class="se-title">账号设置</span>
          <span class="se-desc">修改昵称、密码等</span>
        </div>
      </div>
      <span class="se-arrow">&rsaquo;</span>
    </button>

    <!-- 兴趣偏好 -->
    <section class="card section-card">
      <h3 class="sc-title">兴趣偏好</h3>
      <p class="section-desc">选择您感兴趣的主题，获取个性化路线推荐。</p>
      <div class="pref-tags">
        <button v-for="p in preferences" :key="p.key" :class="{ active: p.active }" @click="p.active = !p.active" class="pref-btn">
          <span class="pref-dot"></span>
          <span class="pref-label">{{ p.label }}</span>
        </button>
      </div>
    </section>

    <!-- 对话历史 -->
    <section class="card section-card">
      <div class="sc-head">
        <h3 class="sc-title">对话历史</h3>
        <button class="sc-new-btn" @click="onCreateAndGo">+ 新建</button>
      </div>
      <div v-if="history.length" class="history-list">
        <div v-for="h in history" :key="h.id" class="history-item" @click="onOpenSession(h.id)">
          <span class="hi-dot"></span>
          <span class="hi-text">{{ h.preview }}</span>
          <span class="hi-time">{{ h.time }}</span>
          <button class="hi-del" @click.stop="onDeleteSession(h.id)" title="删除此对话">✕</button>
        </div>
      </div>
      <div v-else class="empty-block">
        <p>暂无对话记录，点击上方「新建」开始对话</p>
      </div>
    </section>

    <!-- 已归档对话 -->
    <section v-if="archivedHistory.length" class="card section-card">
      <h3 class="sc-title">已归档</h3>
      <div class="history-list">
        <div v-for="h in archivedHistory" :key="h.id" class="history-item archived">
          <span class="hi-dot"></span>
          <span class="hi-text">{{ h.preview }}</span>
          <span class="hi-time">{{ h.time }}</span>
          <button class="hi-del" @click.stop="onDeleteSession(h.id)" title="删除此对话">✕</button>
        </div>
      </div>
    </section>

    <!-- AI 服务信息 -->
    <section class="card section-card ai-info">
      <h3 class="sc-title">AI 服务信息</h3>
      <div class="ai-row">
        <span class="ai-label">AI 引擎</span>
        <span class="ai-val online">在线 v0.1</span>
      </div>
      <div class="ai-row">
        <span class="ai-label">数字人引擎</span>
        <span class="ai-val online">在线 v0.1</span>
      </div>
      <div class="ai-row">
        <span class="ai-label">TTS 语音</span>
        <span class="ai-val online">就绪</span>
      </div>
      <p class="ai-hint">后端部署后此处将显示实时服务状态与版本信息。</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user-store'
import { initChatStorage, fetchSessions, deleteSession } from '@/services/chat-storage'
import { useChat } from '@/composables/useChat'
import type { ChatSession } from '@/services/chat-storage'

const router = useRouter()
const store = useUserStore()
const { loadSession, newChat } = useChat()

const userInitials = computed(() => {
  const name = store.userName
  if (!name || name === '游客') return '?'
  if (/[一-龥]/.test(name)) return name.slice(0, 2)
  return name.slice(0, 2).toUpperCase()
})

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `今天 ${time}`
  if (diffDays === 1) return `昨天 ${time}`
  if (diffDays < 7) return `${diffDays}天前`
  return formatDate(iso)
}

const preferences = reactive([
  { key: 'history', label: '历史人文', active: true },
  { key: 'nature',  label: '自然风光', active: true },
  { key: 'family',  label: '亲子游', active: false },
  { key: 'photo',   label: '摄影打卡', active: false },
  { key: 'food',    label: '美食体验', active: true },
])

// 从 chat-records.json 加载真实的对话历史
interface HistoryItem {
  id: string
  preview: string
  time: string
  session: ChatSession
}

const history = ref<HistoryItem[]>([])
const archivedHistory = ref<HistoryItem[]>([])

async function loadHistory() {
  const all = await fetchSessions()

  history.value = all
    .filter((s) => s.status === 'active' && s.messages.length > 0)
    .map((s) => ({
      id: s.session_id,
      preview: s.title || s.messages[s.messages.length - 1]?.content?.slice(0, 30) || '空对话',
      time: formatTime(s.updated_at),
      session: s,
    }))

  archivedHistory.value = all
    .filter((s) => s.status === 'archived' && s.messages.length > 0)
    .map((s) => ({
      id: s.session_id,
      preview: s.title || s.messages[0]?.content?.slice(0, 30) || '空对话',
      time: formatTime(s.updated_at),
      session: s,
    }))
}

async function onDeleteSession(sid: string) {
  await deleteSession(sid)
  await loadHistory()
}

async function onOpenSession(sid: string) {
  await loadSession(sid)
  router.push('/')
}

async function onCreateAndGo() {
  await newChat()
  router.push('/')
}

onMounted(async () => {
  await initChatStorage()
  await loadHistory()
})
</script>

<style scoped>
.profile-page { padding: 16px; flex: 1; min-height: 0; overflow-y: auto; }

/* ── 头部 ── */
.profile-header { display: flex; flex-direction: column; align-items: center; padding: 24px 0 20px; }
.avatar-img {
  width: 68px; height: 68px; border-radius: 50%;
  object-fit: cover; margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(200,160,100,.25);
  border: 2px solid rgba(200,160,100,.2);
}
.profile-name { margin: 0; font-size: 20px; font-weight: 700; }
.profile-id { margin: 4px 0 0; font-size: 12px; color: var(--text-tertiary); }
.profile-date { margin: 2px 0 0; font-size: 11px; color: var(--text-tertiary); }

/* ── 设置入口 ── */
.settings-entry {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; margin-bottom: 14px;
  border: 1px solid var(--border-light); border-radius: var(--radius);
  background: var(--card-bg); cursor: pointer; font-family: inherit;
  box-shadow: var(--shadow-sm); transition: all var(--transition);
  width: 100%;
}
.settings-entry:hover { border-color: var(--accent); }
.settings-entry:active { transform: scale(.985); }
.se-left { display: flex; align-items: center; gap: 14px; }
.se-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--primary-soft); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.se-text { display: flex; flex-direction: column; }
.se-title { font-size: 16px; font-weight: 700; color: var(--text); }
.se-desc { font-size: 13px; color: var(--text-tertiary); margin-top: 2px; }
.se-arrow { font-size: 28px; color: var(--muted); font-weight: 300; }

/* ── 卡片 ── */
.section-card { padding: 16px; margin-bottom: 14px; }
.sc-title { margin: 0 0 6px; font-size: 15px; font-weight: 700; color: var(--text); }
.section-desc { margin: 0 0 12px; font-size: 12px; color: var(--text-tertiary); }

/* ── 偏好 ── */
.pref-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.pref-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  border-radius: var(--radius-full); cursor: pointer; transition: all var(--transition);
  border: 1px solid var(--border); background: rgba(255,255,255,.6);
  font-size: 13px; font-family: inherit; color: var(--muted);
}
.pref-btn:hover { border-color: var(--accent); }
.pref-btn.active { background: var(--primary-soft); border-color: var(--accent); color: var(--text); font-weight: 600; }
.pref-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--border);
  transition: background var(--transition);
}
.pref-btn.active .pref-dot { background: var(--accent); }

/* ── 分区标题行 ── */
.sc-head {
  display: flex; align-items: center; justify-content: space-between;
}
.sc-new-btn {
  font-size: 12px; color: var(--accent, #f59e0b); background: none;
  border: 1px solid var(--accent, #f59e0b); border-radius: 14px;
  padding: 3px 10px; cursor: pointer; font-family: inherit;
  transition: all .15s;
}
.sc-new-btn:hover { background: rgba(200,160,100,.1); }

/* ── 历史 ── */
.history-list { display: flex; flex-direction: column; }
.history-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid var(--border-light);
  cursor: pointer; transition: background .12s; border-radius: 6px;
}
.history-item:hover { background: rgba(0,0,0,.02); }
.history-item:active { background: rgba(0,0,0,.05); }
.history-item.archived { opacity: .55; }
.hi-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--accent-2);
  flex-shrink: 0; opacity: .6;
}
.hi-text { flex: 1; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hi-time { font-size: 11px; color: var(--text-tertiary); flex-shrink: 0; }
.hi-del {
  width: 22px; height: 22px; border-radius: 50%; border: none;
  background: transparent; color: var(--text-tertiary); cursor: pointer;
  font-size: 12px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .15s;
}
.hi-del:hover { background: rgba(220,38,38,.1); color: #dc2626; }

.empty-block { text-align: center; padding: 24px 0; color: var(--text-tertiary); font-size: 14px; }

/* ── AI 信息 ── */
.ai-info { background: rgba(200,160,100,.04); border-color: rgba(200,160,100,.12); }
.ai-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
.ai-label { color: var(--text-secondary); }
.ai-val.online { color: var(--success); font-weight: 600; }
.ai-hint { margin: 10px 0 0; font-size: 11px; color: var(--text-tertiary); }
</style>
