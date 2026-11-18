import { ref } from 'vue'
import { fetchReports, exportPdf } from '@/services/reports-service'

export function useReports() {
  const data = ref<any>(null)
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      data.value = await fetchReports()
    } catch (e) {
      console.error('报告数据加载失败', e)
    }
    loading.value = false
  }

  async function exportReportPdf() {
    loading.value = true
    try {
      const result = await exportPdf()
      if (result?.url) {
        window.open(result.url, '_blank')
      }
    } catch (e) {
      console.error('PDF 导出失败', e)
    }
    loading.value = false
  }

  // 初始化
  load()

  return { data, loading, load, exportReportPdf }
}
