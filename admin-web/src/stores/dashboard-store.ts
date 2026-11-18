import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchDashboard } from '@/services/dashboard-service'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchDashboard()
    } catch (e) {
      error.value = '数据加载失败'
      console.error('Dashboard store 加载失败:', e)
    }
    loading.value = false
  }

  // 首次加载
  load()

  return { data, loading, error, load }
})
