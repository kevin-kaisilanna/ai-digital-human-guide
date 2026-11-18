/**
 * useAudioPlayer — TTS 音频播放控制
 * 播放 / 暂停 / 队列管理
 * AI TTS 部署后接入真实音频流
 */

import { ref } from 'vue'

export function useAudioPlayer() {
  const isPlaying = ref(false)
  const currentUrl = ref<string | null>(null)
  const queue = ref<string[]>([])
  const error = ref<string | null>(null)

  let audioEl: HTMLAudioElement | null = null

  function getAudio(): HTMLAudioElement {
    if (!audioEl) {
      audioEl = new Audio()
      audioEl.onended = () => {
        isPlaying.value = false
        playNext()
      }
      audioEl.onerror = () => { error.value = '音频播放失败'; isPlaying.value = false }
    }
    return audioEl
  }

  function play(url: string) {
    error.value = null
    const a = getAudio()
    a.src = url
    a.play().catch(() => { error.value = '播放被阻止，请先与页面交互。' })
    isPlaying.value = true
    currentUrl.value = url
  }

  function pause() {
    getAudio().pause()
    isPlaying.value = false
  }

  function resume() {
    getAudio().play().catch(() => {})
    isPlaying.value = true
  }

  function stop() {
    const a = getAudio()
    a.pause(); a.currentTime = 0
    isPlaying.value = false
  }

  function enqueue(url: string) {
    queue.value.push(url)
    if (!isPlaying.value) playNext()
  }

  function playNext() {
    const next = queue.value.shift()
    if (next) play(next)
    else currentUrl.value = null
  }

  function clearQueue() {
    queue.value = []
    stop()
  }

  return { isPlaying, currentUrl, queue, error, play, pause, resume, stop, enqueue, clearQueue }
}
