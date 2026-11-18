<template>
  <div class="home-page">
    <!-- 顶部栏：会话管理 -->
    <header class="chat-header">
      <button class="hdr-btn" @click="showDrawer = !showDrawer" title="会话列表">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <span class="hdr-title" @click="showDrawer = true">{{ currentTitle }}</span>
      <button class="hdr-btn hdr-new" @click="onNewChat" title="新建对话">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </header>

    <!-- 会话抽屉 -->
    <Transition name="drawer">
      <div v-if="showDrawer" class="drawer-overlay" @click.self="showDrawer = false">
        <div class="drawer-panel">
          <div class="drawer-head">
            <span>对话列表</span>
            <button class="drawer-new" @click="onNewChat(); showDrawer = false">+ 新建对话</button>
          </div>
          <div class="drawer-list">
            <div
              v-for="s in sessions"
              :key="s.session_id"
              :class="['drawer-item', { active: s.session_id === sessionId }]"
              @click="onSwitchSession(s.session_id); showDrawer = false"
            >
              <div class="drawer-item-main">
                <span class="drawer-item-title">{{ s.title || '新对话' }}</span>
                <span class="drawer-item-meta">{{ s.messages.length }} 条消息 · {{ fmtSessionTime(s.updated_at) }}</span>
              </div>
              <button class="drawer-item-del" @click.stop="onDeleteSession(s.session_id)" title="删除">✕</button>
            </div>
            <div v-if="sessions.length === 0" class="drawer-empty">暂无对话，点击上方按钮新建</div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 上部：数字人装饰区 -->
    <div class="dh-area">
      <DigitalHuman
        :expression="dhConfig.expression"
        :action="dhConfig.action"
        :isSpeaking="isSpeaking"
      />
    </div>

    <!-- 聊天对话区 -->
    <div class="chat-area">
      <div class="chat-messages" ref="chatMsgs" @scroll="onScroll">
        <div v-if="messages.length === 0" class="chat-empty">
          <div class="empty-logo">🏯</div>
          <p class="empty-title">您好，我是小云</p>
          <p class="empty-sub">您的 AI 数字人导游，有什么可以帮您？</p>
          <div class="quick-asks">
            <button v-for="q in quickQuestions" :key="q" class="quick-btn" @click="sendQuick(q)">{{ q }}</button>
          </div>
        </div>
        <ChatBubble
          v-for="(msg, i) in messages"
          :key="msg.id"
          :role="msg.role"
          :type="msg.type"
          :content="msg.content"
          :time="msg.time"
          :duration="msg.duration"
          :delay="i * 40"
        />
        <div v-if="isStreaming" class="streaming-indicator">
          <span class="streaming-dot"></span> AI 回复中…
        </div>
      </div>

      <!-- 输入区 -->
      <div class="chat-bottom">
        <VoiceButton
          @voiceReady="onVoiceReady"
          @recordError="onRecordError"
          @recordStart="onRecordStart"
        />
        <ChatInput placeholder="输入您的问题…" @send="sendText" />
      </div>
    </div>

    <!-- 浮动按钮：跳转到 AI 数字人交互 -->
    <button class="floating-avatar-btn" @click="goAvatar">
      <span class="fab-icon">🤖</span>
      <span>嗨，小云！</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import DigitalHuman from '@/components/digital-human/DigitalHuman.vue'
import ChatBubble from '@/components/chat/ChatBubble.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import VoiceButton from '@/components/chat/VoiceButton.vue'
import { useChat } from '@/composables/useChat'

const router = useRouter()
const {
  messages, isStreaming, currentEmotion, currentAction,
  sessionId, sessions,
  send: sendMsg, newChat, removeChat, loadSession,
} = useChat()

const chatMsgs = ref<HTMLElement | null>(null)
const isSpeaking = ref(false)
const showDrawer = ref(false)

const currentTitle = computed(() => {
  const s = sessions.value.find((s) => s.session_id === sessionId.value)
  return s?.title || '新对话'
})

const dhConfig = reactive({ bgUrl: '', expression: '开心', action: '无' })

watch(currentEmotion, (val) => { dhConfig.expression = val || '开心' })
watch(currentAction, (val) => { dhConfig.action = val || '无' })
watch(isStreaming, (val) => { isSpeaking.value = val })

const quickQuestions = [
  '灵山大佛有多高？',
  '有什么推荐的游览路线？',
  '景区开放到几点？',
  '附近有什么好吃的？',
]

function fmtSessionTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return `${Math.floor(diff / 86_400_000)} 天前`
}

function goAvatar() { router.push('/avatar') }
function sendQuick(q: string) { sendText(q) }

async function sendText(text: string) {
  await sendMsg({ role: 'user', type: 'text', content: text })
  scrollToBottom()
}

function onRecordStart() { console.log('[Voice] 录音开始') }

function onVoiceReady(result: { text: string; duration: number; source: string }) {
  // 仅推一条语音气泡，sendMsg 内部会触发 AI 请求，不再额外推文字气泡
  if (result.text) {
    sendMsg({ role: 'user', type: 'voice', content: result.text, duration: result.duration })
  } else {
    // 无识别文本时仅展示语音时长气泡，不触发 AI
    messages.value.push({
      id: Date.now(),
      role: 'user',
      type: 'voice',
      content: `🎤 语音 ${result.duration}″`,
      duration: result.duration,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })
  }
  scrollToBottom()
}

function onRecordError(errMsg: string) { console.warn('[Voice] 录音失败:', errMsg) }

function scrollToBottom() {
  nextTick(() => {
    const el = chatMsgs.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

// ── 会话管理 ──

async function onNewChat() {
  await newChat()
  showDrawer.value = false
  scrollToBottom()
}

async function onSwitchSession(sid: string) {
  if (sid === sessionId.value) return
  await loadSession(sid)
  scrollToBottom()
}

async function onDeleteSession(sid: string) {
  await removeChat(sid)
}

function onScroll() { /* 可加加载更多 */ }
</script>

<style scoped>
.home-page {
  display: flex; flex-direction: column; flex: 1; min-height: 0; position: relative;
}

/* ── 顶部栏 ── */
.chat-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: rgba(255,255,255,.85);
  backdrop-filter: blur(8px); border-bottom: 1px solid var(--border-light);
  z-index: 10; flex-shrink: 0;
}
.hdr-btn {
  width: 34px; height: 34px; border-radius: 50%; border: none;
  background: transparent; cursor: pointer; display: flex;
  align-items: center; justify-content: center; color: var(--text-secondary);
  transition: background .15s;
}
.hdr-btn:hover { background: rgba(0,0,0,.06); }
.hdr-title {
  flex: 1; font-size: 15px; font-weight: 600; text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  cursor: pointer; padding: 4px 0;
}

/* ── 抽屉 ── */
.drawer-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,.35); display: flex;
}
.drawer-panel {
  width: 300px; max-width: 82vw; height: 100%;
  background: #fff; display: flex; flex-direction: column;
  box-shadow: 2px 0 20px rgba(0,0,0,.12);
}
.drawer-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; border-bottom: 1px solid var(--border-light);
  font-size: 16px; font-weight: 700;
}
.drawer-new {
  font-size: 13px; color: var(--accent, #f59e0b); background: none;
  border: 1px solid var(--accent, #f59e0b); border-radius: 16px;
  padding: 4px 12px; cursor: pointer; font-family: inherit;
}
.drawer-list { flex: 1; overflow-y: auto; }
.drawer-item {
  display: flex; align-items: center; padding: 12px 16px;
  border-bottom: 1px solid var(--border-light); cursor: pointer;
  transition: background .12s;
}
.drawer-item:hover { background: rgba(0,0,0,.03); }
.drawer-item.active { background: rgba(200,160,100,.1); border-left: 3px solid var(--accent, #f59e0b); }
.drawer-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.drawer-item-title {
  font-size: 14px; font-weight: 600; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}
.drawer-item-meta { font-size: 11px; color: var(--text-tertiary); }
.drawer-item-del {
  width: 26px; height: 26px; border-radius: 50%; border: none;
  background: transparent; color: var(--text-tertiary); cursor: pointer;
  font-size: 12px; flex-shrink: 0; display: flex;
  align-items: center; justify-content: center; transition: all .15s;
}
.drawer-item-del:hover { background: rgba(220,38,38,.1); color: #dc2626; }
.drawer-empty { text-align: center; padding: 40px 16px; color: var(--text-tertiary); font-size: 14px; }

/* ── 过渡动画 ── */
.drawer-enter-active, .drawer-leave-active { transition: opacity .25s; }
.drawer-enter-active .drawer-panel, .drawer-leave-active .drawer-panel { transition: transform .25s; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer-panel { transform: translateX(-100%); }
.drawer-leave-to .drawer-panel { transform: translateX(-100%); }

/* ── 数字人区 ── */
.dh-area {
  flex: 0 0 20%; display: flex; align-items: center;
  justify-content: center; overflow: hidden;
}
.chat-area {
  flex: 1; display: flex; flex-direction: column;
  background: linear-gradient(180deg, rgba(255,255,255,.4), rgba(250,246,240,.6));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden; min-height: 0;
}
.chat-messages {
  flex: 1; overflow-y: auto; padding: 14px 14px 4px;
  -webkit-overflow-scrolling: touch;
  display: flex; flex-direction: column;
}
.chat-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 24px 16px; text-align: center;
}
.empty-logo { font-size: 48px; margin-bottom: 8px; }
.empty-title { margin: 0 0 4px; font-size: 18px; font-weight: 700; }
.empty-sub { margin: 0 0 14px; font-size: 14px; color: var(--text-secondary); }
.quick-asks { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.quick-btn {
  padding: 8px 14px; border-radius: 20px; cursor: pointer;
  border: 1px solid rgba(200,160,100,.2); background: rgba(255,255,255,.7);
  color: var(--text); font-size: 13px; font-family: inherit;
  transition: all .2s; white-space: nowrap;
}
.quick-btn:hover { border-color: var(--accent, #f59e0b); background: rgba(200,160,100,.1); }
.quick-btn:active { transform: scale(.96); }

.chat-bottom {
  padding: 8px 10px; display: flex; flex-direction: column; gap: 8px;
  border-top: 1px solid var(--border-light, #eee);
  background: rgba(255,255,255,.4); backdrop-filter: blur(6px);
}

.streaming-indicator {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; font-size: 13px; color: var(--accent, #f59e0b);
}
.streaming-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent, #f59e0b);
  animation: pulse .8s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }

.floating-avatar-btn {
  position: absolute; bottom: 90px; right: 16px;
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; border: none; border-radius: 28px;
  font-size: 14px; font-weight: 600; font-family: inherit;
  cursor: pointer; box-shadow: 0 4px 16px rgba(102,126,234,.4);
  z-index: 20; animation: fab-bounce 2s ease-in-out infinite;
  transition: transform .2s;
}
.floating-avatar-btn:active { transform: scale(.94); }
.fab-icon { font-size: 20px; }
@keyframes fab-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>
