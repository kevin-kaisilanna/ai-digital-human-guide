/**
 * TTS (Text-to-Speech) Pinia Store
 * 管理 AI 语音播报状态：播放 / 暂停 / 静音
 * 依赖 AvatarServer 的 /chat/synthesis/ 接口，降级使用浏览器 speechSynthesis
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { synthesizeApi } from '@/assets/static/js/severConfig.js'

export const useTtsStore = defineStore('tts', () => {
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const isMuted = ref(false)
  const currentText = ref('')
  const currentAudio = ref<HTMLAudioElement | null>(null)

  const isIdle = computed(() => !isPlaying.value && !isLoading.value)

  function init() {
    console.log('[TTS] Store initialized')
  }

  /** 播放语音：优先调 AvatarServer TTS 接口，失败则降级到浏览器内置 TTS */
  async function speak(text: string) {
    if (!text || !text.trim()) return
    currentText.value = text
    isLoading.value = true
    isPlaying.value = true

    try {
      const url = `${synthesizeApi}?text=${encodeURIComponent(text)}`
      const audio = new Audio(url)
      currentAudio.value = audio
      audio.muted = isMuted.value

      audio.oncanplaythrough = () => {
        isLoading.value = false
        audio.play().catch(() => fallbackToBrowserTTS(text))
      }
      audio.onended = () => {
        isPlaying.value = false
        currentAudio.value = null
      }
      audio.onerror = () => {
        console.warn('[TTS] AvatarServer TTS failed, falling back to browser speechSynthesis')
        fallbackToBrowserTTS(text)
      }
      audio.load()
    } catch {
      fallbackToBrowserTTS(text)
    }
  }

  function fallbackToBrowserTTS(text: string) {
    if (window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'zh-CN'
      utter.rate = 1.0
      utter.onend = () => { isPlaying.value = false }
      utter.onerror = () => { isPlaying.value = false }
      window.speechSynthesis.speak(utter)
      isLoading.value = false
    } else {
      isLoading.value = false
      isPlaying.value = false
    }
  }

  function stopSpeaking() {
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value = null
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    isPlaying.value = false
    isLoading.value = false
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (currentAudio.value) {
      currentAudio.value.muted = isMuted.value
    }
  }

  return {
    isPlaying, isLoading, isMuted, isIdle,
    currentText, currentAudio,
    init, speak, stopSpeaking, toggleMute,
  }
})
