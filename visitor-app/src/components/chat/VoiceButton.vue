<template>
  <button
    class="voice-btn"
    :class="{ recording }"
    @pointerdown.prevent="onPress"
    @pointerup="onRelease"
    @pointerleave="onRelease"
    @pointercancel="onCancel"
    @contextmenu.prevent
  >
    <span class="voice-icon">{{ recording ? '🔴' : priming ? '🟠' : '🎤' }}</span>
    <span class="voice-label">
      {{ recording ? `录音中 ${elapsed}s` : priming ? '继续按住…' : '按住说话' }}
    </span>
    <span v-if="recording" class="voice-ripple"></span>
  </button>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useVoiceRecorder } from '@/composables/useVoiceRecorder'
import type { VoiceRecordResult } from '@/composables/useVoiceRecorder'

const emit = defineEmits<{
  /** 语音录制完成，携带转写结果 */
  voiceReady: [result: VoiceRecordResult]
  /** 录音开始 */
  recordStart: []
  /** 录音错误 */
  recordError: [error: string]
}>()

const LONG_PRESS_MS = 400

const { isRecording, duration, audioBlob, error, start, stop, cancel } = useVoiceRecorder()

const priming = ref(false)
const recording = ref(false)
// 直接使用 composable 的 duration（基于 MediaRecorder 实际时间轴）
const elapsed = duration
let pressTimer: ReturnType<typeof setTimeout> | null = null

function onPress() {
  priming.value = true
  pressTimer = setTimeout(async () => {
    priming.value = false
    recording.value = true

    emit('recordStart')
    await start()
    // 如果 start() 立即抛错（麦克风权限），isRecording 仍为 false
    if (!isRecording.value) {
      recording.value = false
      emit('recordError', error.value || '无法开始录音')
    }
  }, LONG_PRESS_MS)
}

async function onRelease() {
  clearTimeout(pressTimer!)
  pressTimer = null

  if (recording.value) {
    recording.value = false

    const result: VoiceRecordResult = await stop()
    if (result.text) {
      emit('voiceReady', result)
    } else if (result.duration < 1) {
      emit('recordError', '录音时长太短，请重试')
    } else {
      emit('recordError', '未能识别到语音，请重试')
    }
  } else if (priming.value) {
    priming.value = false
  }
}

function onCancel() {
  clearTimeout(pressTimer!)
  pressTimer = null
  if (recording.value) {
    recording.value = false
    cancel()
  }
  priming.value = false
}

onBeforeUnmount(() => {
  clearTimeout(pressTimer!)
  cancel()
})
</script>

<style scoped>
.voice-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.7);
  color: var(--muted);
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.voice-btn:hover { border-color: var(--accent); }
.voice-btn:active { background: rgba(255, 255, 255, 0.9); }
.voice-btn.recording {
  border-color: var(--danger);
  background: var(--danger-soft);
  color: var(--danger);
}
.voice-icon { font-size: 18px; }
.voice-label { font-weight: 500; }
.voice-ripple {
  position: absolute;
  inset: -4px;
  border-radius: var(--radius-full);
  border: 2px solid var(--danger);
  animation: ripple 1s ease-out infinite;
  pointer-events: none;
}
@keyframes ripple {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.08); opacity: 0; }
}
</style>
