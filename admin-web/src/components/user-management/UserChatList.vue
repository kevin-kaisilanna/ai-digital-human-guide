<template>
  <div class="chat-list">
    <!-- 加载中 -->
    <div v-if="loading" class="chat-empty">加载中…</div>

    <!-- 空状态 -->
    <div v-else-if="!sessions || sessions.sessions.length === 0" class="chat-empty">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.2" style="opacity:.3;margin-bottom:8px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>该用户暂无聊天记录</span>
    </div>

    <!-- 会话列表 -->
    <template v-else>
      <div class="chat-summary-bar">
        <span>共 {{ sessions.totalSessions }} 个会话，{{ sessions.totalMessages }} 条消息</span>
      </div>

      <div
        v-for="sess in sessions.sessions"
        :key="sess.session_id"
        class="chat-session"
      >
        <div
          class="chat-session-header"
          @click="$emit('toggleSession', sess.session_id === expandedId ? null : sess.session_id)"
        >
          <div class="chat-session-info">
            <span class="chat-session-title">{{ sess.title }}</span>
            <span class="chat-session-meta">
              {{ sess.messageCount }} 条消息 · {{ formatDate(sess.created_at) }}
              <span class="chat-status-tag" :class="'chat-' + sess.status">{{ sess.status === 'active' ? '活跃' : '已归档' }}</span>
            </span>
          </div>
          <div class="chat-session-actions" @click.stop>
            <button class="chat-toggle-btn" @click="$emit('toggleSession', sess.session_id === expandedId ? null : sess.session_id)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: sess.session_id === expandedId }">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <button class="chat-del-btn" @click="handleDelete(sess.session_id)" title="删除会话">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <!-- 展开的消息列表 -->
        <div v-if="sess.session_id === expandedId" class="chat-messages">
          <div v-if="sessionLoading" class="chat-empty">加载消息中…</div>
          <template v-else-if="expandedSession">
            <div
              v-for="msg in expandedSession.messages"
              :key="msg.id"
              class="chat-msg"
              :class="'msg--' + msg.role"
            >
              <span class="msg-role">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
              <div class="msg-body">
                <div class="msg-header">
                  <span class="msg-role-label">{{ msg.role === 'user' ? '用户' : 'AI 导游' }}</span>
                  <span class="msg-time">{{ msg.time }}</span>
                  <span v-if="msg.type === 'voice'" class="msg-type-tag">🎤 语音</span>
                </div>
                <div class="msg-content">{{ msg.content }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UserChatDetail, ChatSessionFull } from '@/services/user-management-service'

defineProps<{
  sessions: UserChatDetail | null
  expandedId: string | null
  expandedSession: ChatSessionFull | null
  loading: boolean
  sessionLoading: boolean
  username: string
}>()

const emit = defineEmits<{
  toggleSession: [sessionId: string | null]
  deleteSession: [username: string, sessionId: string]
}>()

function handleDelete(sessionId: string) {
  if (window.confirm('确定要删除该聊天会话吗？')) {
    emit('deleteSession', '', sessionId)
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' +
           d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}
</script>

<style scoped>
.chat-list { display: flex; flex-direction: column; }
.chat-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 40px 20px; color: var(--text-tertiary); font-size: 13px;
}

.chat-summary-bar {
  font-size: 11px; color: var(--text-tertiary);
  padding: 8px 0 12px; border-bottom: 1px solid var(--border-light);
}

/* session card */
.chat-session {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  margin-top: 10px;
  overflow: hidden;
  transition: border-color var(--transition);
}
.chat-session:hover { border-color: rgba(200,160,100,.2); }

.chat-session-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; cursor: pointer;
  transition: background var(--transition);
}
.chat-session-header:hover { background: var(--surface-hover); }

.chat-session-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.chat-session-title {
  font-size: 13px; font-weight: 600; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.chat-session-meta {
  font-size: 11px; color: var(--text-tertiary);
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
.chat-status-tag {
  font-size: 10px; padding: 1px 6px; border-radius: 8px; font-weight: 500;
}
.chat-active { background: var(--success-soft); color: var(--success); }
.chat-archived { background: rgba(139,117,88,.1); color: var(--muted); }

.chat-session-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.chat-toggle-btn, .chat-del-btn {
  width: 28px; height: 28px; border: none; background: none;
  color: var(--text-tertiary); cursor: pointer; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  transition: all var(--transition);
}
.chat-toggle-btn:hover { background: var(--surface-hover); color: var(--text); }
.chat-del-btn:hover { background: var(--danger-soft); color: var(--danger); }
.chat-toggle-btn svg { transition: transform .2s; }
.chat-toggle-btn svg.rotated { transform: rotate(180deg); }

/* messages */
.chat-messages {
  border-top: 1px solid var(--border-light);
  padding: 10px 14px;
  background: rgba(245,239,230,.4);
  max-height: 360px; overflow-y: auto;
}
.chat-msg {
  display: flex; gap: 10px; padding: 8px 0;
  border-bottom: 1px solid rgba(180,150,120,.06);
}
.chat-msg:last-child { border-bottom: none; }
.msg-role { font-size: 16px; flex-shrink: 0; margin-top: 2px; }
.msg-body { flex: 1; min-width: 0; }
.msg-header { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.msg-role-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); }
.msg-time { font-size: 10px; color: var(--text-tertiary); }
.msg-type-tag { font-size: 10px; background: rgba(200,132,60,.1); color: var(--accent); padding: 1px 5px; border-radius: 4px; }
.msg-content {
  font-size: 13px; color: var(--text); line-height: 1.5;
  word-break: break-word; white-space: pre-wrap;
}
</style>
