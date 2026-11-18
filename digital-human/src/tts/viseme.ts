/**
 * Viseme 口型映射 — 基于汉语拼音的 Viseme 时间轴生成
 *
 * Viseme 索引定义（21 个口型，兼容 Unity Oculus LipSync / Microsoft Viseme）:
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

// ─── 拼音声母 → Viseme 映射 ───
const initialVisemeMap: Record<string, number> = {
  b: 21, p: 21, m: 21,  // 双唇音
  f: 18,                 // 唇齿音
  d: 19, t: 19, n: 19,  // 舌尖中音
  l: 14,                 // 边音
  g: 20, k: 20, h: 12,  // 舌根音
  j: 16, q: 16, x: 16,  // 舌面音
  z: 15, c: 15, s: 15,  // 舌尖前音
  zh: 16, ch: 16, sh: 16, r: 13, // 舌尖后音
  w: 7,  y: 6,          // 半元音
}

// ─── 拼音韵母 → Viseme 映射 ───
const finalVisemeMap: Record<string, number> = {
  a: 2,   ia: 2,  ua: 2,   // aa 类
  o: 8,   uo: 8,            // ow 类
  e: 4,   ie: 6,  ue: 6,  // 不同开口度
  i: 6,   ai: 11, ei: 4,  ui: 7,
  u: 7,   ou: 8,  iu: 7,
  ü: 7,   // 撮口呼，近似 uw
  ao: 3,  iao: 3,
  an: 2,  ian: 6, uan: 2, üan: 6,
  en: 4,  in: 6,  un: 7,  ün: 7,
  ang: 2, iang: 2, uang: 2,
  eng: 4, ing: 6,
  ong: 8, iong: 8,
  er: 5,
}

// ─── 辅助函数 ───

/** 将汉字字符串分解为拼音占位符。简易版：按字符边界估算，用 Unicode 范围识别中文字符 */
function segmentText(text: string): string[] {
  const segments: string[] = []
  const cjkRegex = /[一-鿿]/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = cjkRegex.exec(text)) !== null) {
    // 中文前的非中文字符
    if (match.index > lastIndex) {
      const nonCjk = text.slice(lastIndex, match.index).trim()
      if (nonCjk) {
        segments.push(...nonCjk.split(/\s+/).filter(Boolean))
      }
    }
    segments.push(match[0])
    lastIndex = match.index + 1
  }

  // 剩余的非中文字符
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim()
    if (remaining) {
      segments.push(...remaining.split(/\s+/).filter(Boolean))
    }
  }

  return segments
}

/**
 * 估计拼音的 Viseme ID。
 * 采用简化策略：按声母+韵母拆分，优先用声母定义开口度。
 */
function estimatePinyinViseme(pinyin: string): number {
  if (!pinyin) return 0

  // 尝试匹配声母
  for (const [initial, visemeId] of Object.entries(initialVisemeMap)) {
    if (pinyin.startsWith(initial)) {
      // 检查剩余韵母是否能细化
      const rest = pinyin.slice(initial.length)
      if (rest && finalVisemeMap[rest]) {
        return finalVisemeMap[rest]
      }
      return visemeId
    }
  }

  // 零声母：直接用韵母映射
  if (finalVisemeMap[pinyin]) {
    return finalVisemeMap[pinyin]
  }

  // 默认中开口
  return 1
}

/**
 * 为纯文本估算 Viseme ID。
 * 中文单字 -> 查字典（简化为按 Unicode 码点分桶）
 * 英文/标点 -> 按字母映射
 */
export function estimateCharViseme(char: string): number {
  const code = char.charCodeAt(0)

  // 中文字符：按 Unicode 区块分桶近似
  if (code >= 0x4e00 && code <= 0x9fff) {
    // 用码点对 21 取模分桶，提供基本的口型变化
    // 这不是精确的音素映射，但为唇形动画提供了自然的多样性
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

/**
 * 从文本和估算的语速生成 Viseme 时间轴。
 *
 * @param text - 合成语音的文本
 * @param duration - 音频总时长（秒）
 * @param charPerSecond - 每秒大约几个汉字（中文默认 3.5 字/秒）
 * @returns VisemeFrame[] 时间轴
 */
export function generateVisemeTimeline(
  text: string,
  duration: number,
  charPerSecond: number = 3.5
): VisemeTimeline {
  const segments = segmentText(text)
  if (segments.length === 0) return []

  // 估算总 speaking 字符数
  const speakingChars = segments.filter(s => /[一-鿿\w]/.test(s))

  // 每个 speaking 段的时长
  const totalFrames = speakingChars.length
  if (totalFrames === 0) return []

  const frameInterval = duration / totalFrames
  const timeline: VisemeTimeline = []

  let frameIdx = 0

  for (const seg of segments) {
    const isSpeaking = /[一-鿿\w]/.test(seg)
    if (!isSpeaking) {
      // 标点/停顿：插入短暂静音
      if (timeline.length > 0) {
        const lastFrame = timeline[timeline.length - 1]
        timeline.push({
          time: lastFrame.time + lastFrame.duration,
          visemeId: 0,
          duration: 0.15, // 150ms 停顿
        })
      }
      continue
    }

    // 中文单字逐个生成帧
    if (/[一-鿿]/.test(seg)) {
      for (const char of seg) {
        timeline.push({
          time: frameIdx * frameInterval,
          visemeId: estimateCharViseme(char),
          duration: frameInterval * 0.85, // 85% 为该口型，15% 为过渡
        })
        frameIdx++
      }
    } else {
      // 英文单词：每个音节约 2-3 个字母
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
 * 在某个时间点查找对应的 Viseme ID。
 * 用于 Unity 轮询当前口型（每帧调用）。
 */
export function getVisemeAtTime(
  timeline: VisemeTimeline,
  currentTime: number
): number {
  if (!timeline.length) return 0

  // 查找最后一个 time <= currentTime 的帧
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

/**
 * 将 VisemeTimeline 序列化为 JSON 字符串，用于发送给 Unity。
 */
export function serializeTimeline(timeline: VisemeTimeline): string {
  return JSON.stringify(timeline)
}

/**
 * 预设的音色配置的默认语速（字/秒）
 */
export const VOICE_SPEEDS: Record<string, number> = {
  'gentle-female': 3.5,
  'steady-male': 3.3,
  'lively-female': 4.0,
  'warm-male': 3.4,
}
