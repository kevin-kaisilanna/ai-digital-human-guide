<template>
  <div class="avatar-page">
    <div class="pull-scroll" ref="scrollContainer">
      <div class="dh-page">
        <button class="back-to-chat-btn" @click="scrollToChat" title="返回对话">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span class="back-to-chat-label">返回对话</span>
        </button>
        <UnityComponent
          :initial-unity-canvas-height="stageHeight"
          :initial-unity-canvas-width="unityWidth"
        />
        <div class="pull-hint pull-hint--up">
          <span class="hint-arrow">&uarr;</span> 上滑回到对话
        </div>
      </div>

      <div class="chat-page">
        <div class="pull-hint pull-hint--down" v-if="chatMessages.length === 0">
          <span class="hint-arrow">&darr;</span> 下拉查看数字人
        </div>
        <div class="chat-toolbar">
          <button class="tool-btn" @click="onNewChat">+ 新建</button>
          <button class="tool-btn" @click="showHistory = !showHistory">记录</button>
          <span class="chat-title">{{ activeTitle }}</span>
          <button class="tool-btn" @click="clearMessages">清空</button>
        </div>
        <div class="chat-messages" ref="chatMsgs" v-if="!showHistory">
          <div v-if="chatMessages.length === 0" class="chat-welcome">
            <img class="welcome-avatar" src="/images/xiaoyuntouxiang.png" alt="小云" />
            <p class="welcome-text">你好！我是AI导游<strong>小云</strong></p>
            <p class="welcome-sub">长按下方按钮说话，或输入文字提问</p>
            <div class="quick-asks">
              <button v-for="q in quickQuestions" :key="q" class="quick-btn" @click="sendQuick(q)">{{ q }}</button>
            </div>
          </div>
          <div v-for="(msg, i) in chatMessages" :key="msg.id" :class="['msg-row', msg.role]">
            <img class="msg-avatar" :src="msg.role === 'ai' ? '/images/xiaoyuntouxiang.png' : '/images/visitor.jpg'" :alt="msg.role === 'ai' ? '小云' : '游客'" />
            <div class="msg-bubble">
              <div class="msg-content">{{ msg.content }}</div>
              <div class="msg-time">{{ msg.time }}</div>
            </div>
          </div>
          <div v-if="isReplying" class="msg-row ai">
            <img class="msg-avatar" src="/images/xiaoyuntouxiang.png" alt="小云" />
            <div class="msg-bubble typing"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>
          </div>
        </div>
        <div class="history-panel" v-else>
          <div v-if="allSessions.length === 0" class="history-empty">暂无对话记录</div>
          <div v-for="s in allSessions" :key="s.session_id" class="history-item" @click="onLoadSession(s)">
            <span class="hist-info">
              <span class="hist-title">{{ s.title || '新对话' }}</span>
              <span class="hist-meta">{{ s.messages?.length || 0 }} 条消息 · {{ fmtSessionTime(s.updated_at) }}</span>
            </span>
            <button class="hist-del" @click.stop="onDeleteSession(s.session_id)" title="删除此记录">&times;</button>
          </div>
        </div>
      </div>
    </div>

    <div class="record-bar">
      <button class="record-btn" :class="{ recording: isRecording, priming: isPriming }"
        @pointerdown="onPress" @pointerup="onRelease" @pointerleave="onRelease" @pointercancel="onRelease">
        <span class="record-dot"></span>
        {{ isRecording ? '松开以结束录音' : (isPriming ? '继续按住…' : '长按开始录音') }}
      </button>
      <span class="record-hint" v-if="!isRecording && !isPriming">向小云说出你的问题</span>
      <span class="record-hint recording-hint" v-else-if="isRecording">正在聆听…</span>
    </div>

    <div class="chat-input-glass">
      <div class="input-row">
        <input class="chat-input" v-model="inputText" placeholder="输入文字…" @keydown.enter="sendTextFromInput" />
        <button class="send-btn" @click="sendTextFromInput" :disabled="!inputText.trim()">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getBaseURL } from '@/services/api-client'
import { useVoiceRecorder } from '@/composables/useVoiceRecorder'
import UnityComponent from '@/components/digital-human/UnityComponent.vue'
import {
  initChatStorage, fetchSessions, createSession, deleteSession, appendMessage, updateMessage,
} from '@/services/chat-storage'
import { useUserStore } from '@/stores/user-store'

const userStore = useUserStore()

/** sendMsgToAI 发送给 Unity 后 Unity 回显 <用户输入> 时跳过重复气泡 */
let _lastSentToUnity = ''

window.handleUnityTransmission = function (str: string) {
  console.log('[Unity→Vue]', str.substring(0, 100))
  if (str.startsWith('<LLM回复>')) {
    let reply = str.substring(7)
    const m = reply.match(/[|｜]\s*回复文本[：:]\s*([^|｜]+)/)
    if (m) reply = m[1].trim()
    else reply = reply.replace(/表情[：:].+?[|｜]动作[：:].+?[|｜]回复文本[：:]/, '').replace(/[|｜]指令[：:].+/, '').trim()
    const aiMsg = { id: Date.now() + 1, role: 'ai', type: 'text', content: reply, time: timeNow() }
    chatMessages.value.push(aiMsg)
    _persistMsg(aiMsg)
    scrollToBottom()
    isReplying.value = false
  } else if (str.startsWith('<聊天完成>') || str.startsWith('<请求失败>')) {
    isReplying.value = false
  } else if (str.startsWith('<网站指令>')) {
    ElMessage({ message: '小云执行: ' + str.substring(6), type: 'success', duration: 2000 })
  } else if (str.startsWith('<用户输入>')) {
    const txt = str.substring(6).trim()
    if (txt && txt !== '（识别失败）') {
      // 如果是 sendMsgToAI 发送给 Unity 后的回显，跳过（气泡已在 sendMsgToAI 中推送）
      if (_lastSentToUnity === txt) {
        _lastSentToUnity = ''
        return
      }
      // Unity 侧自主语音输入：需要推送气泡 + 持久化
      const userMsg = { id: Date.now(), role: 'user', type: 'voice', content: txt, time: timeNow() }
      chatMessages.value.push(userMsg)
      _persistMsg(userMsg)
      scrollToBottom()
    }
  }
}

const scrollContainer = ref<HTMLElement | null>(null)
const chatMsgs = ref<HTMLElement | null>(null)
const isReplying = ref(false)
const inputText = ref('')
const showHistory = ref(false)
const chatMessages = ref<{ id: number; role: string; type: string; content: string; time: string }[]>([])

const activeSessionId = ref('')
const allSessions = ref<any[]>([])

const activeTitle = computed(() => {
  const s = allSessions.value.find(s => s.session_id === activeSessionId.value)
  return s?.title || '新对话'
})

function _persistMsg(msg: any) {
  if (!activeSessionId.value) return
  appendMessage(activeSessionId.value, msg).catch(() => {})
}

async function refreshSessions() {
  try { allSessions.value = await fetchSessions() } catch { allSessions.value = [] }
}

async function onNewChat() {
  showHistory.value = false
  try {
    const s = await createSession(undefined, userStore.accountName)
    activeSessionId.value = s.session_id
    chatMessages.value = []
    await refreshSessions()
  } catch {}
}

async function onLoadSession(s: any) {
  showHistory.value = false
  activeSessionId.value = s.session_id
  chatMessages.value = [...(s.messages || [])]
  scrollToBottom()
}

async function onDeleteSession(sid: string) {
  try {
    await deleteSession(sid)
    await refreshSessions()
    if (sid === activeSessionId.value) {
      const remaining = allSessions.value.filter(s => s.status === 'active')
      if (remaining.length > 0) {
        activeSessionId.value = remaining[0].session_id
        chatMessages.value = [...(remaining[0].messages || [])]
      } else { await onNewChat() }
      showHistory.value = false
    }
  } catch {}
}

function clearMessages() { chatMessages.value = [] }

async function initSessions() {
  await initChatStorage()
  await refreshSessions()
  const active = allSessions.value.filter(s => s.status === 'active')
  if (active.length > 0) {
    activeSessionId.value = active[0].session_id
    chatMessages.value = [...(active[0].messages || [])]
  } else {
    try {
      const s = await createSession(undefined, userStore.accountName)
      activeSessionId.value = s.session_id
      chatMessages.value = []
      await refreshSessions()
    } catch { activeSessionId.value = 'visitor-' + Date.now() }
  }
}

const sessionId = (() => {
  let sid = localStorage.getItem('scenic_session_id')
  if (!sid) { sid = 'visitor-' + Date.now(); localStorage.setItem('scenic_session_id', sid) }
  return sid
})()

function scrollToBottom() {
  nextTick(() => {
    const sc = scrollContainer.value
    if (!sc) return
    // 用户正在查看数字人界面时，不自动跳转到对话区
    const nearBottom = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 80
    if (!nearBottom) return
    sc.scrollTop = sc.scrollHeight
  })
}

function scrollToChat() {
  const sc = scrollContainer.value
  if (!sc) return
  sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' })
}

function timeNow() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function fmtSessionTime(iso: string) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前'
  return Math.floor(diff / 86400000) + ' 天前'
}

const quickQuestions = (() => {
  const navLang = (navigator.language || '').toLowerCase()
  if (navLang.startsWith('en')) {
    return [
      'How tall is the Grand Buddha?',
      'Recommend a tour route',
      'What are the opening hours?',
      'Where can I eat?',
    ]
  }
  return [
    '灵山大佛有多高？',
    '有什么推荐的游览路线？',
    '景区开放到几点？',
    '附近有什么好吃的？',
  ]
})()

// ═══ Unity 画布 ═══
const unityWidth = ref(Math.min(480, window.innerWidth))
const stageHeight = ref(window.innerHeight)
function onResize() {
  unityWidth.value = Math.min(480, window.innerWidth)
  stageHeight.value = window.innerHeight
}
window.addEventListener('resize', onResize)

// ═══ 录音 ═══
const LONG_PRESS_MS = 300
const isPriming = ref(false)
let pressTimer: ReturnType<typeof setTimeout> | null = null
const { isRecording, start: recStart, stop: recStop } = useVoiceRecorder()

function onPress(e: PointerEvent) {
  e.preventDefault()
  isPriming.value = true
  pressTimer = setTimeout(async () => {
    isPriming.value = false
    await recStart()
  }, LONG_PRESS_MS)
}

async function onRelease(_e: PointerEvent) {
  if (pressTimer) { clearTimeout(pressTimer); pressTimer = null }
  if (isPriming.value) {
    isPriming.value = false
    ElMessage({ message: '请长按说话', type: 'info', duration: 1500 })
    return
  }
  if (isRecording.value) {
    try {
      const result = await recStop()
      if (result.text) {
        const text = result.text.trim()
        sendMsgToAI(text, 'voice')
      } else {
        ElMessage({ message: '没有识别到语音，请再试一次', type: 'warning', duration: 2000 })
      }
    } catch {
      ElMessage({ message: '语音识别出错', type: 'warning', duration: 2000 })
    }
  }
}

// ═══ 对话 ═══
function sendQuick(q: string) { sendMsgToAI(q) }
function sendTextFromInput() {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''
  sendMsgToAI(text)
}

async function sendMsgToAI(text: string, msgType: 'text' | 'voice' = 'text') {
  if (!text) return
  const userMsgId = Date.now()
  chatMessages.value.push({ id: userMsgId, role: 'user', type: msgType, content: text, time: timeNow() })
  scrollToBottom()
  if (activeSessionId.value) {
    appendMessage(activeSessionId.value, { id: userMsgId, role: 'user', type: msgType, content: text, time: timeNow() }).catch(() => {})
  }

  // Unity 路径：发送给 Unity，AI 回复由 handleUnityTransmission(<LLM回复>) 回调处理
  if (window.UnityIns) {
    _lastSentToUnity = text
    isReplying.value = true
    try { window.UnityIns.SendMessage('ChatManager', 'StartChat', text) } catch { _lastSentToUnity = ''; isReplying.value = false }
    return
  }

  // 非 Unity 路径：直接调用 HTTP API
  isReplying.value = true
  try {
    const resp = await fetch(getBaseURL() + '/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, type: msgType, content: text }),
    })
    const raw = await resp.text()
    const data = JSON.parse(raw)
    const reply = data.reply || data.content || ''
    const aiMsgId = Date.now()
    const aiMsg = { id: aiMsgId, role: 'ai', type: 'text', content: reply || '(空)', time: timeNow() }
    chatMessages.value.push(aiMsg)
    if (activeSessionId.value && reply) {
      appendMessage(activeSessionId.value, { id: aiMsgId, role: 'ai', type: 'text', content: reply, time: aiMsg.time }).catch(() => {})
    }
  } catch (e: any) {
    console.warn('[chat] sendMsgToAI 失败:', e.message)
    const aiMsgId = Date.now()
    const errMsg = { id: aiMsgId, role: 'ai', type: 'text', content: '抱歉，小云暂时无法回应。', time: timeNow() }
    chatMessages.value.push(errMsg)
    if (activeSessionId.value) {
      appendMessage(activeSessionId.value, { id: aiMsgId, role: 'ai', type: 'text', content: errMsg.content, time: errMsg.time }).catch(() => {})
    }
  } finally { isReplying.value = false }
  scrollToBottom()
}

onMounted(async () => {
  await initSessions()
  setTimeout(() => scrollToBottom(), 300)
})

onBeforeUnmount(() => { window.removeEventListener('resize', onResize) })
</script>

<style scoped>
.avatar-page { display: flex; flex-direction: column; flex: 1; min-height: 0; position: relative; overflow: hidden; }
.pull-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; }
.dh-page { height: 100%; min-height: 100%; display: flex; align-items: center; justify-content: center; position: relative; background: linear-gradient(180deg, rgba(250,246,240,.3) 0%, rgba(240,232,218,.2) 100%); }
.dh-page :deep(#unity-container) { width: 100% !important; height: 100% !important; display: flex; align-items: center; justify-content: center; }
.dh-page :deep(#unity-canvas) { max-width: 100vw; max-height: 100dvh; object-fit: contain; }
.dh-page :deep(.unity-mobile) { width: 100vw !important; height: 100dvh !important; }
.back-to-chat-btn { position: absolute; top: 12px; left: 12px; z-index: 100; display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 24px; border: 1px solid rgba(180,150,120,.25); background: rgba(255,255,255,.85); backdrop-filter: blur(10px); color: var(--muted); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; box-shadow: 0 4px 16px rgba(120,90,50,.12); transition: all .3s ease; }
.back-to-chat-btn:hover { background: rgba(255,255,255,.95); color: var(--accent); border-color: var(--accent); box-shadow: 0 4px 20px rgba(200,132,60,.2); }
.back-to-chat-btn:active { transform: scale(.94); }

.chat-page { min-height: 100%; display: flex; flex-direction: column; position: relative; padding-bottom: 120px; }

.record-bar { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 16px; position: absolute; bottom: 55px; left: 0; right: 0; z-index: 10; background: transparent; border-top: 1px solid transparent; }
.record-btn { display: flex; align-items: center; gap: 8px; padding: 12px 32px; border-radius: 30px; border: 2px solid #e74c3c; background: #fff; color: #e74c3c; font-size: 15px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all .15s; -webkit-user-select: none; user-select: none; touch-action: manipulation; }
.record-btn:active { transform: scale(.96); }
.record-btn.priming { border-color: #d4984a; color: #d4984a; background: #fff8f0; }
.record-btn.recording { background: #e74c3c; color: #fff; }
.record-dot { width: 10px; height: 10px; border-radius: 50%; background: #e74c3c; }
.priming .record-dot { background: #d4984a; }
.recording .record-dot { background: #fff; animation: pulse-dot .6s ease-in-out infinite; }
@keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: .4; } }
.record-hint { font-size: 12px; color: #999; }
.recording-hint { color: #e74c3c; font-weight: 500; }

.chat-toolbar { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-bottom: 1px solid #eee; background: #fff; flex-shrink: 0; }
.tool-btn { background: none; border: 1px solid #ddd; font-size: 12px; color: #555; cursor: pointer; font-family: inherit; padding: 4px 10px; border-radius: 12px; transition: all .15s; white-space: nowrap; }
.tool-btn:hover { border-color: #d4984a; color: #d4984a; }
.chat-title { flex: 1; text-align: center; font-size: 13px; font-weight: 600; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.chat-messages { flex: 1; padding: 12px 14px 4px; }
.chat-welcome { text-align: center; padding: 24px 16px; }
.welcome-avatar { width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 10px; object-fit: cover; display: block; border: 2px solid rgba(200,160,100,.2); box-shadow: 0 4px 12px rgba(200,130,60,.2); }
.welcome-text { font-size: 16px; margin: 0 0 4px; color: #333; }
.welcome-sub { font-size: 13px; color: #999; margin: 0 0 16px; }
.quick-asks { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.quick-btn { padding: 8px 16px; border-radius: 20px; cursor: pointer; border: 1px solid rgba(200,160,100,.25); background: rgba(255,255,255,.55); backdrop-filter: blur(4px); color: #3d2e1c; font-size: 13px; font-family: inherit; transition: all .22s; white-space: nowrap; }
.quick-btn:hover { border-color: #d4984a; background: rgba(255,255,255,.8); }
.quick-btn:active { transform: scale(.96); }

.msg-row { display: flex; gap: 8px; margin-bottom: 12px; animation: msg-in .25s ease; }
.msg-row.user { flex-direction: row-reverse; }
.msg-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(200,160,100,.15); }
.msg-bubble { max-width: 75%; padding: 9px 12px; border-radius: 14px; font-size: 14px; line-height: 1.5; }
.msg-row.ai .msg-bubble { background: #fff; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.msg-row.user .msg-bubble { background: #d4e4ff; border-bottom-right-radius: 4px; }
.msg-time { font-size: 10px; color: #aaa; margin-top: 3px; }
.msg-bubble.typing { display: flex; gap: 4px; padding: 12px 16px; }
.typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #ccc; animation: typing-bounce 1.2s infinite; }
.typing-dot:nth-child(2) { animation-delay: .2s; }
.typing-dot:nth-child(3) { animation-delay: .4s; }
@keyframes typing-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

.history-panel { flex: 1; overflow-y: auto; padding: 8px 14px; }
.history-empty { text-align: center; padding: 40px 0; color: #999; font-size: 14px; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 8px; background: #fff; margin-bottom: 8px; cursor: pointer; transition: background .15s; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.history-item:hover { background: #f5f0e8; }
.hist-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.hist-title { font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.hist-meta { font-size: 11px; color: #999; }
.hist-del { background: none; border: none; font-size: 18px; color: #ccc; cursor: pointer; padding: 0 4px; line-height: 1; flex-shrink: 0; }
.hist-del:hover { color: var(--danger, #c05040); }

@keyframes msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.pull-hint { position: absolute; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 12px; color: rgba(61,46,28,.35); pointer-events: none; animation: hint-bounce 2s ease-in-out infinite; }
.pull-hint--up { bottom: 20px; }
.pull-hint--down { top: 12px; position: relative; left: auto; transform: none; margin-bottom: 8px; text-align: center; }
.hint-arrow { font-size: 18px; line-height: 1; }
@keyframes hint-bounce { 0%, 100% { opacity: .4; transform: translateX(-50%) translateY(0); } 50% { opacity: 1; transform: translateX(-50%) translateY(-6px); } }

.chat-input-glass { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; position: absolute; bottom: 0; left: 0; right: 0; z-index: 10; background: transparent; border-top: 1px solid transparent; }
.input-row { display: flex; gap: 8px; align-items: center; }
.chat-input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 20px; font-size: 14px; outline: none; font-family: inherit; background: rgba(255,255,255,.7); }
.chat-input:focus { border-color: #4f6ef6; }
.send-btn { padding: 10px 20px; border-radius: 20px; border: none; background: #4f6ef6; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
.send-btn:disabled { background: #ccc; cursor: default; }
.send-btn:not(:disabled):active { background: #3d5de7; }
</style>