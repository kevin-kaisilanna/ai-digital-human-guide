/**
 * useVoiceRecorder — 语音录制
 * 按住说话 / 音频采集 / 上传转写
 *
 * 双模 ASR：
 *   1. 浏览器 Web Speech API（优先，低延迟，离线也能识别部分）
 *   2. 后端 Baidu ASR 接口（兜底，跨浏览器兼容）
 */
import { ref } from 'vue'
import { getApiBaseUrl } from '@/services/platform-adapter'

export interface VoiceRecordResult {
  /** 转写文本 */
  text: string
  /** 录音时长（秒） */
  duration: number
  /** 原始音频 Blob（WebM/Opus）—— 用于后端 ASR 或回放 */
  audioBlob: Blob | null
  /** ASR 来源 */
  source: 'browser' | 'server'
}

export function useVoiceRecorder() {
  const isRecording = ref(false)
  const duration = ref(0)
  const audioBlob = ref<Blob | null>(null)
  const error = ref<string | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let chunks: Blob[] = []
  let startTime = 0
  let timer: ReturnType<typeof setInterval> | null = null
  let speechRecognition: InstanceType<typeof SpeechRecognition> | null = null

  // ══════════════════════════════════════════════════
  //  Web Speech API 识别（浏览器端 ASR）
  // ══════════════════════════════════════════════════
  function createSpeechRecognition(): SpeechRecognition | null {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return null

    const rec = new SR()
    rec.lang = 'zh-CN'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.continuous = false
    return rec
  }

  /**
   * 开始录音
   * - 同时启动 MediaRecorder（采集音频 Blob）和 Web Speech API（实时识别）
   */
  async function start(): Promise<void> {
    error.value = null
    chunks = []
    audioBlob.value = null

    // 重置计时
    startTime = Date.now()
    duration.value = 0
    timer = setInterval(() => {
      duration.value = Math.round((Date.now() - startTime) / 1000)
    }, 200)

    // 1. 尝试获取麦克风 + 启动 MediaRecorder
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // 检测 MIME 支持（WebM 优先，回退到浏览器默认）
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''

      mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          audioBlob.value = new Blob(chunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
        }
        // 释放麦克风
        stream?.getTracks().forEach((t) => t.stop())
        stream = null
      }
      mediaRecorder.onerror = () => {
        error.value = '录音过程中发生错误'
      }
      mediaRecorder.start(250) // 每 250ms 收集一个 chunk
    } catch (e: any) {
      // 麦克风权限被拒绝
      clearInterval(timer!)
      timer = null
      error.value = '无法访问麦克风，请检查权限设置。'
      isRecording.value = false
      return
    }

    // 2. 尝试启动 Web Speech API（浏览器端实时识别）
    speechRecognition = createSpeechRecognition()
    if (speechRecognition) {
      speechRecognition.onresult = undefined // 由 stop() 中的 Promise 接管
      speechRecognition.onerror = (ev) => {
        console.warn('[VoiceRecorder] Web Speech API 错误:', ev.error)
        // no-speech / aborted / network — 静默处理，stop() 会回退到服务端
      }
      try {
        speechRecognition.start()
      } catch {
        speechRecognition = null
      }
    }

    isRecording.value = true
  }

  /**
   * 停止录音并返回转写结果
   * - 优先使用 Web Speech API 结果（低延迟）
   * - 兜底：上传音频到后端 Baidu ASR
   */
  function stop(): Promise<VoiceRecordResult> {
    return new Promise((resolve) => {
      isRecording.value = false
      if (timer) {
        clearInterval(timer)
        timer = null
      }

      const dur = Math.round((Date.now() - startTime) / 1000)
      duration.value = dur

      // 停止 MediaRecorder
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = () => {
          if (chunks.length > 0) {
            audioBlob.value = new Blob(chunks, {
              type: mediaRecorder?.mimeType || 'audio/webm',
            })
          }
          stream?.getTracks().forEach((t) => t.stop())
          stream = null
          finalizeResult(dur, resolve)
        }
        mediaRecorder.stop()
      } else {
        finalizeResult(dur, resolve)
      }
    })
  }

  /**
   * 确定最终转写来源并返回结果
   */
  async function finalizeResult(
    dur: number,
    resolve: (result: VoiceRecordResult) => void,
  ) {
    // 尝试从 Web Speech API 获取识别结果
    let browserText = ''
    if (speechRecognition) {
      browserText = await waitForSpeechResult(speechRecognition, dur)
    }

    if (browserText) {
      resolve({
        text: browserText,
        duration: dur,
        audioBlob: audioBlob.value,
        source: 'browser',
      })
      return
    }

    // 兜底：上传音频到后端 ASR
    if (audioBlob.value && audioBlob.value.size > 0) {
      try {
        const serverText = await transcribeViaServer(audioBlob.value)
        if (serverText) {
          resolve({
            text: serverText,
            duration: dur,
            audioBlob: audioBlob.value,
            source: 'server',
          })
          return
        }
      } catch (e) {
        console.warn('[VoiceRecorder] 后端 ASR 失败:', e)
      }
    }

    // 完全失败
    resolve({
      text: '',
      duration: dur,
      audioBlob: audioBlob.value,
      source: 'server',
    })
  }

  /**
   * 等待 Web Speech API 返回识别结果（带超时）
   */
  function waitForSpeechResult(
    rec: SpeechRecognition,
    durationSec: number,
  ): Promise<string> {
    return new Promise((resolve) => {
      // 超时 = max(录音时长 + 1s, 5s)
      const timeout = Math.max(durationSec * 1000 + 1000, 5000)
      let settled = false

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true
          try { rec.stop() } catch {}
          resolve('')
        }
      }, timeout)

      rec.onresult = (event: SpeechRecognitionEvent) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        const text = (event.results[0]?.[0]?.transcript || '').trim()
        resolve(text)
      }

      rec.onerror = () => {
        if (!settled) {
          settled = true
          clearTimeout(timer)
          resolve('')
        }
      }

      rec.onend = () => {
        if (!settled) {
          settled = true
          clearTimeout(timer)
          resolve('')
        }
      }

      // 如果 MediaRecorder 已经停止，主动停止识别
      try { rec.stop() } catch {}
    })
  }

  /**
   * 上传音频到后端 ASR 接口进行转写
   */
  async function transcribeViaServer(blob: Blob): Promise<string> {
    const formData = new FormData()
    formData.append('audio', blob, 'recording.webm')
    formData.append('duration', String(duration.value))

    // 获取 API 基地址（复用 api-client 逻辑）
    const base = getBaseURLForUpload()

    const resp = await fetch(`${base}/api/asr/transcribe`, {
      method: 'POST',
      body: formData,
    })

    if (!resp.ok) {
      throw new Error(`ASR 服务返回 ${resp.status}`)
    }

    const data = await resp.json()
    return data.text || ''
  }

  /**
   * 同步转写（已录音的 Blob —— 用于回放或重试）
   */
  async function transcribe(blob?: Blob | null): Promise<string> {
    const target = blob || audioBlob.value
    if (!target || target.size === 0) return ''
    return transcribeViaServer(target)
  }

  /**
   * 取消录音（不触发转写）
   */
  function cancel() {
    isRecording.value = false
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    if (speechRecognition) {
      try { speechRecognition.stop() } catch {}
      speechRecognition = null
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = null // 阻止 onstop 回调
      mediaRecorder.stop()
    }
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
    chunks = []
    audioBlob.value = null
    duration.value = 0
  }

  return {
    isRecording,
    duration,
    audioBlob,
    error,
    start,
    stop,
    transcribe,
    cancel,
  }
}

/** 获取上传 API 的基地址（委托给统一的平台适配层） */
function getBaseURLForUpload(): string {
  return getApiBaseUrl()
}
