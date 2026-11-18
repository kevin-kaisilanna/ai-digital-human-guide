/**
 * Viseme 口型映射 — 客户端侧 Viseme 时间轴生成
 *
 * Viseme 索引定义（兼容 Unity Oculus LipSync / Microsoft Viseme）:
 *   0  = sil  (静音)
 *   1  = ae, ax, ah
 *   2  = aa
 *   3  = ao
 *   4  = ey, eh, uh
 *   5  = er
 *   6  = y, iy, ih
 *   7  = w, uw
 *   8  = ow
 *   9  = aw
 *   10 = oy
 *   11 = ay
 *   12 = h
 *   13 = r
 *   14 = l
 *   15 = s, z
 *   16 = ch, jh, sh, zh
 *   17 = th, dh
 *   18 = f, v
 *   19 = d, t, n
 *   20 = k, g, ng
 *   21 = p, b, m
 */

import type { VisemeFrame, VisemeTimeline } from './types'

/** 估计单个字符的 Viseme ID */
export function estimateCharViseme(char: string): number {
  const code = char.charCodeAt(0)

  // 中文字符：按 Unicode 区块分桶近似
  if (code >= 0x4e00 && code <= 0x9fff) {
    const bucket = (code % 19) + 1  // viseme 1–19
    return bucket
  }

  // 英文字母映射
  const lower = char.toLowerCase()
  const letterViseme: Record<string, number> = {
    a: 2, b: 21, c: 15, d: 19, e: 4, f: 18, g: 20, h: 12,
    i: 6, j: 16, k: 20, l: 14, m: 21, n: 19, o: 8, p: 21,
    q: 16, r: 13, s: 15, t: 19, u: 7, v: 18, w: 7, x: 16,
    y: 6, z: 15,
  }
  if (letterViseme[lower]) return letterViseme[lower]

  // 标点、空格：静音
  if (/[，。！？、；：""''（）\s,.!?;:()]/.test(char)) return 0

  return 1 // 默认
}

/** 将文本分段 */
function segmentText(text: string): string[] {
  const segments: string[] = []
  const cjkRegex = /[一-鿿]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = cjkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const nonCjk = text.slice(lastIndex, match.index).trim()
      if (nonCjk) segments.push(...nonCjk.split(/\s+/).filter(Boolean))
    }
    segments.push(match[0])
    lastIndex = match.index + 1
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim()
    if (remaining) segments.push(...remaining.split(/\s+/).filter(Boolean))
  }

  return segments
}

/**
 * 从文本和语速生成 Viseme 时间轴
 * @param text - 合成语音的文本
 * @param duration - 音频总时长（秒），默认按 3.5 字/秒估算
 * @param charPerSecond - 每秒大约几个汉字
 */
export function generateVisemeTimeline(
  text: string,
  duration?: number,
  charPerSecond: number = 3.5
): VisemeTimeline {
  const segments = segmentText(text)
  if (segments.length === 0) return []

  const speakingChars = segments.filter(s => /[一-鿿\w]/.test(s))
  const totalFrames = speakingChars.length
  if (totalFrames === 0) return []

  const effectiveDuration = duration ?? (text.length / charPerSecond)
  const frameInterval = effectiveDuration / totalFrames
  const timeline: VisemeTimeline = []

  let frameIdx = 0

  for (const seg of segments) {
    const isSpeaking = /[一-鿿\w]/.test(seg)
    if (!isSpeaking) {
      if (timeline.length > 0) {
        const lastFrame = timeline[timeline.length - 1]
        timeline.push({
          time: lastFrame.time + lastFrame.duration,
          visemeId: 0,
          duration: 0.15,
        })
      }
      continue
    }

    if (/[一-鿿]/.test(seg)) {
      for (const char of seg) {
        timeline.push({
          time: frameIdx * frameInterval,
          visemeId: estimateCharViseme(char),
          duration: frameInterval * 0.85,
        })
        frameIdx++
      }
    } else {
      const letters = seg.length
      const subFrames = Math.max(1, Math.ceil(letters / 2))
      for (let i = 0; i < subFrames; i++) {
        const char = seg[Math.floor((i / subFrames) * letters)]
        timeline.push({
          time: frameIdx * frameInterval,
          visemeId: estimateCharViseme(char || seg[0]),
          duration: frameInterval,
        })
        frameIdx++
      }
    }
  }

  return timeline
}

/**
 * 在某个时间点查找对应的 Viseme ID
 */
export function getVisemeAtTime(
  timeline: VisemeTimeline,
  currentTime: number
): number {
  if (!timeline.length) return 0

  let activeFrame = timeline[0]
  for (const frame of timeline) {
    if (frame.time <= currentTime) {
      activeFrame = frame
    } else {
      break
    }
  }
  return activeFrame.visemeId
}
