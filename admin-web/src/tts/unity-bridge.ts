/**
 * Unity Viseme 桥接器 — 驱动 Unity 数字人口型动画
 *
 * 核心设计：
 * - 使用 performance.now() 墙钟时间作为主时钟（不依赖 audio.currentTime）
 * - 音频同步是 best-effort：如果 audio 在播放则用其 currentTime 校准
 * - Unity 未就绪时静默跳过，不报错
 */

import type { VisemeTimeline } from './types'
import { getVisemeAtTime } from './viseme'

/** Viseme 轮询间隔 (ms) */
const VISEME_POLL_INTERVAL = 50

export interface VisemeBridge {
  stop: () => void
  readonly running: boolean
}

// 安全获取 Unity 实例
function getUnity(): any {
  return (window as any).UnityIns
}

/** 检查 Unity 实例是否已加载 */
export function isUnityReady(): boolean {
  const ins = getUnity()
  return typeof ins !== 'undefined' && ins !== null
}

/** 安全地向 Unity 发送 Viseme */
export function sendVisemeToUnity(visemeId: number): boolean {
  const ins = getUnity()
  if (!ins) return false
  try {
    ins.SendMessage('ChatManager', 'OnVisemeUpdate', visemeId)
    return true
  } catch {
    return false
  }
}

/**
 * 启动 Viseme 桥接器。
 *
 * 使用 performance.now() 作为主时钟 — 不依赖 audio.currentTime，
 * 这样即使音频被浏览器静音或拦截，口型动画仍然能正常驱动。
 *
 * @param timeline      - Viseme 时间轴
 * @param totalDuration  - 总时长（秒），到达该时间后自动停止
 * @param audioEl       - 可选的 Audio 元素，用于同步校准
 * @returns VisemeBridge
 */
export function startVisemeBridge(
  timeline: VisemeTimeline,
  totalDuration: number,
  audioEl?: HTMLAudioElement | null
): VisemeBridge {
  let timer: ReturnType<typeof setInterval> | null = null
  let running = true
  const startWallClock = performance.now() / 1000
  let lastSentViseme = -1

  const tick = () => {
    if (!running) return

    // 墙钟经过的时间
    let elapsed = (performance.now() / 1000) - startWallClock

    // 如果音频在正常播放，用 audio.currentTime 微调（更精确）
    if (audioEl && audioEl.currentTime > 0 && !audioEl.paused && !audioEl.ended) {
      // 用音频时间校准，但限制偏差不超过 500ms（防止拖拽进度条等异常）
      const audioTime = audioEl.currentTime
      if (Math.abs(audioTime - elapsed) < 0.5) {
        elapsed = audioTime
      }
    }

    // 超出总时长 → 停止
    if (elapsed >= totalDuration) {
      stop()
      return
    }

    const visemeId = getVisemeAtTime(timeline, elapsed)

    // 避免重复发送相同口型
    if (visemeId !== lastSentViseme) {
      lastSentViseme = visemeId
      sendVisemeToUnity(visemeId)
    }
  }

  timer = setInterval(tick, VISEME_POLL_INTERVAL)
  // 立即发送第一帧
  tick()

  function stop() {
    if (!running) return
    running = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    sendVisemeToUnity(0) // 闭嘴
  }

  // 如果提供了 audio，监听结束事件提前停止
  if (audioEl) {
    audioEl.addEventListener('ended', stop, { once: true })
  }

  return {
    stop,
    get running() { return running },
  }
}
