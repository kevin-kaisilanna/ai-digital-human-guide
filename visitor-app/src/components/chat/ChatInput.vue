<template>
  <div class="chat-input-bar">
    <input
      ref="inputRef"
      v-model="text"
      class="chat-text-input"
      :placeholder="placeholder"
      @keyup.enter="send"
      type="text"
      enterkeyhint="send"
    />
    <button class="send-btn" :class="{ active: text.trim() }" @click="send" :disabled="!text.trim()" aria-label="发送">
      <svg viewBox="0 0 24 24" width="20" height="20"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps({ placeholder: { type: String, default: '输入您的问题…' } })
const emit = defineEmits<{ send: [text: string] }>()
const text = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
function send() {
  const val = text.value.trim()
  if (!val) return
  emit('send', val)
  text.value = ''
  inputRef.value?.focus()
}
</script>

<style scoped>
.chat-input-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: rgba(255,255,255,.6);
  backdrop-filter: blur(8px); border-top: 1px solid var(--border-light);
}
.chat-text-input {
  flex: 1; padding: 10px 14px; border-radius: var(--radius-full);
  border: 1px solid var(--border); background: rgba(255,255,255,.7);
  color: var(--text); font-size: 15px; font-family: inherit; outline: none;
  transition: all var(--transition);
}
.chat-text-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200,160,100,.1); }
.chat-text-input::placeholder { color: var(--text-tertiary); }
.send-btn {
  width: 42px; height: 42px; border-radius: 50%; border: none;
  background: var(--border); color: var(--muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: all var(--transition);
}
.send-btn.active { background: var(--accent); color: #fff; box-shadow: 0 2px 10px rgba(200,160,100,.3); }
.send-btn:active { transform: scale(.92); }
</style>
