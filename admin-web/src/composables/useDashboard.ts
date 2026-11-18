import { ref, onBeforeUnmount } from 'vue'
import { fetchDashboard } from '@/services/dashboard-service'

export function useDashboard() {
  const data = ref<any>(null)
  const loading = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  async function load() {
    loading.value = true
    try {
      data.value = await fetchDashboard()
    } catch (e) {
      console.error('Dashboard 数据加载失败', e)
    }
    loading.value = false
  }

  // 自动刷新轮询（每 30s）
  function startPolling(intervalMs = 30_000) {
    stopPolling()
    timer = setInterval(() => load(), intervalMs)
  }

  function stopPolling() {
    if (timer) { clearInterval(timer); timer = null }
  }

  // 初始化加载
  load()
  startPolling()

  onBeforeUnmount(() => stopPolling())

  return { data, loading, load, startPolling, stopPolling }
}
