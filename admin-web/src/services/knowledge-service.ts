import { getUseMock, apiGet, apiPost, apiPut, apiDelete } from './api-client'
import { mergeArrays, shouldTryApi } from './data-merge'

/** 所有知识库 JSON 数据文件 */
const DATA_FILES = [
  'knowledge-spots.json',
  'knowledge-guide.json',
  'knowledge-history.json',
  'knowledge-routes.json',
  'knowledge-faq.json',
]

/** 从静态 JSON 加载基线数据 */
async function loadStaticEntries(): Promise<any[]> {
  const all: any[] = []
  for (const filename of DATA_FILES) {
    try {
      const res = await fetch(`/data/${filename}`, { cache: 'no-cache' })
      if (res.ok) {
        const data = await res.json()
        for (const item of data) {
          all.push({
            id: item.id ?? item.index ?? all.length + 1,
            title: item.title ?? (item.question ?? ''),
            category: item.category ?? 'unknown',
            source: item.source_file ?? item.source ?? filename,
            content: item.content ?? (item.answer ?? ''),
            excerpt: ((item.content || item.answer || '').slice(0, 180)) + (((item.content || item.answer || '').length > 180) ? '…' : ''),
            updated_at: item.updated_at ?? '',
          })
        }
      }
    } catch { /* 单个文件加载失败不影响其他文件 */ }
  }
  return all
}

export async function getKnowledgeList(page = 1, pageSize = 50) {
  // 1. 基线：静态 JSON（74 条完整数据）
  let all = await loadStaticEntries()

  // 2. 合并后端 API 数据（去重：title + content 前 100 字）
  if (shouldTryApi()) {
    try {
      const apiEntries = await apiGet(`/api/knowledge?page=1&pageSize=200`)
      if (apiEntries?.length) {
        const keyFn = (e: any) => `${e.title || ''}::${(e.content || '').slice(0, 100)}`
        all = mergeArrays(all, apiEntries, keyFn)
        console.log(`[knowledge] 合并完成：静态 ${all.length} 条（含后端 ${apiEntries.length} 条）`)
      }
    } catch { /* 后端不可用，仅用静态数据 */ }
  }

  // 3. 内存分页
  const start = (page - 1) * pageSize
  return all.slice(start, start + pageSize)
}

export async function createKnowledge(payload: any) {
  if (getUseMock()) {
    return {
      id: Date.now(),
      ...payload,
      excerpt: (payload.content || '').slice(0, 180),
      updated_at: new Date().toISOString().slice(0, 10),
    }
  }
  return apiPost('/api/knowledge', payload)
}

export async function updateKnowledge(id: string | number, payload: any) {
  if (getUseMock()) return { id, ...payload }
  return apiPut(`/api/knowledge/${id}`, payload)
}

export async function deleteKnowledge(id: string | number) {
  if (getUseMock()) return { ok: true }
  return apiDelete(`/api/knowledge/${id}`)
}

export async function uploadKnowledgeFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const baseURL = import.meta.env.VITE_API_BASE ?? 'http://localhost:8001'
  const res = await fetch(`${baseURL}/api/knowledge/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '上传失败' }))
    throw new Error(err.detail || `服务器错误 ${res.status}`)
  }
  return res.json()
}
