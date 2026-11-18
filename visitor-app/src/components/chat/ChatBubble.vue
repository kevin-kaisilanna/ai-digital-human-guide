<template>
  <div :class="['chat-bubble', `bubble--${role}`]" :style="{ animationDelay: `${delay}ms` }">
    <!-- AI 文字消息 -->
    <template v-if="role === 'ai' && type === 'text'">
      <img class="bubble-avatar-img" src="/images/xiaoyuntouxiang.png" alt="小云" />
      <div class="bubble-body">
        <div class="bubble-content">{{ content }}</div>
        <div class="bubble-time">{{ time }}</div>
      </div>
    </template>
    <!-- 用户文字消息 -->
    <template v-if="role === 'user' && type === 'text'">
      <img class="bubble-avatar-img" src="/images/visitor.jpg" alt="游客" />
      <div class="bubble-body">
        <div class="bubble-content">{{ content }}</div>
        <div class="bubble-time">{{ time }}</div>
      </div>
    </template>
    <!-- 用户语音消息 -->
    <template v-if="role === 'user' && type === 'voice'">
      <div class="bubble-body">
        <div class="bubble-voice">
          <span class="voice-icon">🎤</span>
          <span class="voice-dur">{{ duration }}″</span>
          <span class="voice-waves">
            <span v-for="i in 5" :key="i" class="wave-bar" :style="{ animationDelay: `${i*0.12}s` }"></span>
          </span>
        </div>
        <div class="bubble-time">{{ time }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps({
  role: { type: String as () => 'ai' | 'user', required: true },
  type: { type: String as () => 'text' | 'voice', default: 'text' },
  content: { type: String, default: '' },
  time: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  delay: { type: Number, default: 0 },
})
</script>

<style scoped>
.chat-bubble {
  display: flex; gap: 8px; margin-bottom: 14px;
  animation: fade-in-up .3s ease forwards; opacity: 0; max-width: 88%;
}
.bubble--ai { align-self: flex-start; }
.bubble--user { align-self: flex-end; flex-direction: row-reverse; }
.bubble-avatar-img {
  width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
  border: 1px solid rgba(200,160,100,.15);
}
.bubble-body { display: flex; flex-direction: column; gap: 4px; }
.bubble--user .bubble-body { align-items: flex-end; }
.bubble-content {
  padding: 10px 14px; border-radius: var(--radius); font-size: 15px; line-height: 1.55; word-break: break-word;
}
.bubble--ai .bubble-content   { background: rgba(255,255,255,.8); color: var(--text); border: 1px solid var(--border-light); border-top-left-radius: 4px; }
.bubble--user .bubble-content { background: var(--primary-soft); color: var(--text); border: 1px solid rgba(200,132,60,.15); border-top-right-radius: 4px; }
.bubble-time { font-size: 10px; color: var(--text-tertiary); padding: 0 4px; }

/* 语音消息 */
.bubble-voice {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: var(--radius);
  background: var(--primary-soft); border: 1px solid rgba(200,132,60,.15);
  border-top-right-radius: 4px; min-width: 100px;
}
.voice-icon { font-size: 16px; }
.voice-dur { font-size: 13px; font-weight: 600; color: var(--text); }
.voice-waves { display: flex; align-items: flex-end; gap: 2px; height: 18px; }
.wave-bar {
  width: 3px; background: var(--accent); border-radius: 2px;
  animation: wave .8s ease-in-out infinite;
  height: 10px;
}
.wave-bar:nth-child(1) { height: 6px; }
.wave-bar:nth-child(2) { height: 12px; }
.wave-bar:nth-child(3) { height: 8px; }
.wave-bar:nth-child(4) { height: 14px; }
.wave-bar:nth-child(5) { height: 5px; }
@keyframes wave { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(.4); } }
@keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
