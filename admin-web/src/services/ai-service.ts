/**
 * AI 服务层
 *
 * 后端 API 占位：
 * - POST /api/ai/chat      — 单轮问答 { prompt, context? } → { id, answer }
 * - POST /api/ai/stream    — 流式问答 (SSE) { prompt } → ReadableStream
 */

import { getUseMock } from './api-client'
import { getAiBase } from '@/config'

async function postTo(url: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${url} => ${res.status}`)
  return res.json().catch(() => ({}))
}

export async function chatOnce(prompt: string, context?: string) {
  if (getUseMock()) {
    // 模拟 AI 回复
    return {
      id: Date.now(),
      answer: `（模拟 AI 回答）关于「${prompt.slice(0, 30)}${prompt.length > 30 ? '…' : ''}」的问题，根据灵山胜境知识库，灵山大佛高88米，为景区核心地标，最佳观赏时间为清晨或日落。附近有观光电梯与休息区，建议游览时长约1小时。`,
    }
  }
  const base = getAiBase().replace(/\/$/, '')
  return postTo(`${base}/api/ai/chat`, { prompt, context })
}

export async function chatStream(payload: { prompt: string; context?: string }) {
  if (getUseMock()) return { ok: true, stream: null }
  const base = getAiBase().replace(/\/$/, '')
  return postTo(`${base}/api/ai/stream`, payload)
}
