import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getKnowledgeList } from '@/services/knowledge-service'

export const useKnowledgeStore = defineStore('knowledge', () => {
  const entries = ref<any[]>([])
  const loading = ref(false)

  // 按分类分组
  const entriesByCategory = computed(() => {
    const map = new Map<string, any[]>()
    for (const e of entries.value) {
      const cat = e.category ?? 'unknown'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(e)
    }
    return map
  })

  async function load() {
    loading.value = true
    try {
      entries.value = await getKnowledgeList()
    } catch (e) {
      console.error('Knowledge store 加载失败:', e)
    }
    loading.value = false
  }

  // 首次加载
  load()

  return { entries, loading, entriesByCategory, load }
})
