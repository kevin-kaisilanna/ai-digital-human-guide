/**
 * 音频播放管理器
 *
 * 职责：
 * 1. 管理 TTS 播放队列（确保回复按顺序播放）
 * 2. 协调音频播放与 Viseme 口型事件发送到 Unity
 * 3. 支持中断（新用户输入打断当前播放）
 * 4. 播放状态管理（空闲/加载中/播放中/已暂停/被打断）
 */

import type {
  PlaybackState,
  QueueItem,
  TtsCallbacks,
  TtsResult,
  VisemeTimeline,
} from './types'
import { getVisemeAtTime } from './viseme'
import { synthesizeWithFallback } from './engine'

// ─── 常量 ───
/** Unity Viseme 刷新间隔 (ms)，约每 50ms 发送一次口型 */
const VISEME_POLL_INTERVAL = 50

/** 默认最大队列长度 */
const DEFAULT_MAX_QUEUE = 10

// ─── AudioPlayer 类 ───
export class AudioPlayer {
  private state: PlaybackState = 'idle'
  private queue: QueueItem[] = []
  private maxQueue: number

  // 当前播放
  private currentItem: QueueItem | null = null
  private currentResult: TtsResult | null = null
  private audioElement: HTMLAudioElement | null = null
  private visemeTimer: ReturnType<typeof setInterval> | null = null
  private playStartTime: number = 0
  private callbacks: TtsCallbacks = {}
  private muted: boolean = false

  constructor(maxQueue: number = DEFAULT_MAX_QUEUE) {
    this.maxQueue = maxQueue
  }

  // ─── 公开 API ───

  /** 获取当前播放状态 */
  getState(): PlaybackState {
    return this.state
  }

  /** 是否正在播放 */
  get isPlaying(): boolean {
    return this.state === 'playing'
  }

  /** 是否静音 */
  get isMuted(): boolean {
    return this.muted
  }

  /** 队列长度 */
  get queueLength(): number {
    return this.queue.length
  }

  /** 注册回调 */
  setCallbacks(cb: TtsCallbacks): void {
    this.callbacks = cb
  }

  /**
   * 加入播放队列。
   * 如果当前没有在播放，立即开始播放。
   *
   * @returns 队列项的 ID（可用于取消）
   */
  enqueue(item: QueueItem): string {
    if (this.queue.length >= this.maxQueue) {
      // 队列满：移除最旧的待播放项
      this.queue.shift()
    }

    this.queue.push(item)

    // 如果空闲，立即开始播放
    if (this.state === 'idle') {
      this.playNext()
    }

    return item.id
  }

  /**
   * 立即播放（清空队列后插队播放）。
   * 用于高优先级消息，如系统提示。
   */
  async playImmediately(text: string, voice?: QueueItem['voice']): Promise<void> {
    this.stop()
    this.enqueue({
      id: `immediate-${Date.now()}`,
      text,
      voice: voice || 'gentle-female',
    })
  }

  /** 停止播放并清空队列 */
  stop(): void {
    this.cleanupCurrent()
    this.queue = []
    this.state = 'idle'
    this.callbacks.onInterrupt?.()
  }

  /** 暂停当前播放 */
  pause(): void {
    if (this.state !== 'playing') return
    this.state = 'paused'
    this.audioElement?.pause()
    if (this.visemeTimer) {
      clearInterval(this.visemeTimer)
      this.visemeTimer = null
    }
    // 暂停时发送静音口型
    this.sendVisemeToUnity(0)
  }

  /** 恢复播放 */
  resume(): void {
    if (this.state !== 'paused') return
    this.state = 'playing'
    this.audioElement?.play().catch(() => {})
    this.startVisemePolling()
  }

  /** 切换静音 */
  toggleMute(): boolean {
    this.muted = !this.muted
    if (this.audioElement) {
      this.audioElement.muted = this.muted
    }
    return this.muted
  }

  /** 移除指定 ID 的队列项 */
  dequeue(id: string): boolean {
    const idx = this.queue.findIndex(item => item.id === id)
    if (idx >= 0) {
      this.queue.splice(idx, 1)
      return true
    }
    return false
  }

  /** 销毁播放器 */
  destroy(): void {
    this.stop()
    this.callbacks = {}
  }

  // ─── 内部实现 ───

  /** 播放队列中的下一项 */
  private async playNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.state = 'idle'
      this.currentItem = null
      this.currentResult = null
      return
    }

    this.currentItem = this.queue.shift()!
    this.state = 'loading'

    try {
      const result = await synthesizeWithFallback({
        text: this.currentItem.text,
        voice: this.currentItem.voice,
        withViseme: true,
      })

      this.currentResult = result
      this.state = 'playing'
      this.playStartTime = performance.now() / 1000

      this.callbacks.onStart?.(this.currentItem.text)

      // 根据引擎类型选择播放策略
      if (result.engine === 'browser') {
        // 浏览器引擎：语音已通过扬声器播放，我们只需轮询 Viseme
        this.startVisemePolling()
        // 浏览器引擎在 engine.ts 中通过 SpeechSynthesis 播放
        // 这里估算音频时长来设置结束定时器
        const duration = result.duration * 1000 + 500  // +500ms 缓冲
        setTimeout(() => this.onPlaybackComplete(), duration)
      } else {
        // 服务端引擎：通过 Audio 元素播放，同时轮询 Viseme
        await this.playAudioUrl(result.audioUrl)
      }
    } catch (err) {
      console.error('[TTS AudioPlayer] 合成失败:', err)
      this.callbacks.onError?.(err as Error)
      this.onPlaybackComplete()
    }
  }

  /** 播放音频 URL（服务端引擎） */
  private playAudioUrl(url: string): Promise<void> {
    return new Promise((resolve) => {
      this.audioElement = new Audio(url)
      this.audioElement.muted = this.muted

      this.audioElement.onplaying = () => {
        this.startVisemePolling()
      }

      this.audioElement.onended = () => {
        resolve()
      }

      this.audioElement.onerror = (e) => {
        console.warn('[TTS AudioPlayer] 音频播放错误:', e)
        // 即使音频失败，仍尝试驱动 Viseme 动画
        const duration = this.currentResult?.duration
          ? this.currentResult.duration * 1000
          : this.currentItem!.text.length / 3.5 * 1000
        setTimeout(() => resolve(), duration)
      }

      this.audioElement.play().catch((err) => {
        console.warn('[TTS AudioPlayer] 自动播放被阻止，尝试静音播放:', err)
        if (this.audioElement) {
          this.audioElement.muted = true
          this.audioElement.play().catch(() => {
            // 彻底不能播放，用估计时长模拟
            const duration = this.currentResult?.duration
              ? this.currentResult.duration * 1000
              : this.currentItem!.text.length / 3.5 * 1000
            setTimeout(() => resolve(), duration)
          })
        } else {
          resolve()
        }
      })
    })
  }

  /** 启动 Viseme 轮询定时器 */
  private startVisemePolling(): void {
    if (this.visemeTimer) {
      clearInterval(this.visemeTimer)
    }

    const timeline: VisemeTimeline = this.currentResult?.visemeTimeline || []

    this.visemeTimer = setInterval(() => {
      if (this.state !== 'playing') {
        // 非播放状态不发送口型
        return
      }

      const elapsed = (performance.now() / 1000) - this.playStartTime
      const visemeId = getVisemeAtTime(timeline, elapsed)
      this.sendVisemeToUnity(visemeId)
    }, VISEME_POLL_INTERVAL)
  }

  /** 发送 Viseme ID 到 Unity 数字人 */
  private sendVisemeToUnity(visemeId: number): void {
    // 通知本地回调
    this.callbacks.onViseme?.(visemeId)

    // 发送给 Unity
    if (typeof window.UnityIns !== 'undefined' && window.UnityIns) {
      try {
        window.UnityIns.SendMessage('ChatManager', 'OnVisemeUpdate', visemeId)
      } catch {
        // Unity 不可用时静默忽略
      }
    }
  }

  /** 播放完成处理 */
  private onPlaybackComplete(): void {
    this.cleanupCurrent()
    this.sendVisemeToUnity(0) // 最终静音口型

    if (this.state === 'interrupted') {
      this.state = 'idle'
      return
    }

    this.callbacks.onEnd?.()
    this.playNext()
  }

  /** 清理当前播放资源 */
  private cleanupCurrent(): void {
    if (this.visemeTimer) {
      clearInterval(this.visemeTimer)
      this.visemeTimer = null
    }

    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.src = ''
      this.audioElement = null
    }

    // 停止浏览器引擎的 SpeechSynthesis
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
    }

    this.currentItem = null
    this.currentResult = null
  }
}

// ─── 单例 ───
let playerInstance: AudioPlayer | null = null

export function getAudioPlayer(): AudioPlayer {
  if (!playerInstance) {
    playerInstance = new AudioPlayer()
  }
  return playerInstance
}

export function destroyAudioPlayer(): void {
  if (playerInstance) {
    playerInstance.destroy()
    playerInstance = null
  }
}
