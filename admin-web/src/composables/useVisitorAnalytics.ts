import { ref, onBeforeUnmount } from 'vue'
import {
  fetchVisitorDashboard,
  fetchAttractionAttention,
  fetchTypeAttention,
  fetchSpendingBreakdown,
  fetchSentimentOverview,
  fetchSentimentTrend,
  fetchSentimentByAttraction,
  fetchSentimentByDemographic,
  fetchDemographics,
  fetchRecommendations,
  fetchDailyTrend,
  fetchSeasonalTrend,
} from '@/services/visitor-analytics-service'

export function useVisitorAnalytics() {
  const dashboard = ref<any>(null)
  const attractionAttention = ref<any[]>([])
  const typeAttention = ref<any[]>([])
  const spendingBreakdown = ref<any[]>([])
  const sentimentOverview = ref<any>(null)
  const sentimentTrend = ref<any[]>([])
  const sentimentByAttraction = ref<any[]>([])
  const sentimentByDemographic = ref<any>(null)
  const demographics = ref<any>(null)
  const recommendations = ref<any[]>([])
  const dailyTrend = ref<any[]>([])
  const seasonalTrend = ref<any[]>([])
  const loading = ref(false)
  const lastUpdated = ref('')

  let timer: ReturnType<typeof setInterval> | null = null

  async function loadAll() {
    loading.value = true
    try {
      const [
        d, aa, ta, sb, so, st, sba, sbd, dm, rec, dt, sst
      ] = await Promise.all([
        fetchVisitorDashboard(),
        fetchAttractionAttention(),
        fetchTypeAttention(),
        fetchSpendingBreakdown(),
        fetchSentimentOverview(),
        fetchSentimentTrend(),
        fetchSentimentByAttraction(),
        fetchSentimentByDemographic(),
        fetchDemographics(),
        fetchRecommendations(),
        fetchDailyTrend(),
        fetchSeasonalTrend(),
      ])
      dashboard.value = d
      attractionAttention.value = aa
      typeAttention.value = ta
      spendingBreakdown.value = sb
      sentimentOverview.value = so
      sentimentTrend.value = st
      sentimentByAttraction.value = sba
      sentimentByDemographic.value = sbd
      demographics.value = dm
      recommendations.value = rec
      dailyTrend.value = dt
      seasonalTrend.value = sst
    } catch (e) {
      console.error('VisitorAnalytics 数据加载失败', e)
    }
    loading.value = false
    lastUpdated.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  function startPolling(intervalMs = 60_000) {
    stopPolling()
    timer = setInterval(() => loadAll(), intervalMs)
  }

  function stopPolling() {
    if (timer) { clearInterval(timer); timer = null }
  }

  loadAll()
  startPolling()

  onBeforeUnmount(() => stopPolling())

  return {
    dashboard, attractionAttention, typeAttention, spendingBreakdown,
    sentimentOverview, sentimentTrend, sentimentByAttraction, sentimentByDemographic,
    demographics, recommendations, dailyTrend, seasonalTrend,
    loading, lastUpdated, loadAll, startPolling, stopPolling,
  }
}
