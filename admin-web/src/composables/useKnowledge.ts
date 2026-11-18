import { ref } from 'vue'
import { getKnowledgeList, createKnowledge, updateKnowledge, deleteKnowledge } from '@/services/knowledge-service'

export function useKnowledge() {
  const list = ref<any[]>([])
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      list.value = await getKnowledgeList()
    } catch (e) {
      console.error('知识库数据加载失败', e)
    }
    loading.value = false
  }

  async function create(payload: any) {
    const entry = await createKnowledge(payload)
    list.value.unshift(entry)
    return entry
  }

  async function update(id: string | number, payload: any) {
    const updated = await updateKnowledge(id, payload)
    const idx = list.value.findIndex((e: any) => e.id === id)
    if (idx >= 0) list.value[idx] = { ...list.value[idx], ...updated }
    return updated
  }

  async function remove(id: string | number) {
    await deleteKnowledge(id)
    list.value = list.value.filter((e: any) => e.id !== id)
  }

  function search(query: string): any[] {
    const q = query.toLowerCase()
    return list.value.filter((e: any) =>
      e.title?.toLowerCase().includes(q) ||
      e.content?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q),
    )
  }

  // 初始化
  load()

  return { list, loading, load, create, update, remove, search }
}
