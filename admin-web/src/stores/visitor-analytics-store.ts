/**
 * 游客行为分析状态 (Pinia)
 * 缓存分析数据，页面切换时保持状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchVisitorDashboard,
  fetchAttractionAttention,
  fetchTypeAttention,
  fetchSpendingBreakdown,
  fetchSentimentOverview,
  fetchSentimentTrend,
  fetchRecommendations,
} from '@/services/visitor-analytics-service'

export const useVisitorAnalyticsStore = defineStore('visitor-analytics', () => {
  const dashboard = ref<any>(null)
  const attractionAttention = ref<any[]>([])
  const typeAttention = ref<any[]>([])
  const spendingBreakdown = ref<any[]>([])
  const sentimentOverview = ref<any>(null)
  const sentimentTrend = ref<any[]>([])
  const recommendations = ref<any[]>([])
  const loading = ref(false)

  async function loadData() {
    loading.value = true
    try {
      const [d, aa, ta, sb, so, st, rec] = await Promise.all([
        fetchVisitorDashboard(),
        fetchAttractionAttention(),
        fetchTypeAttention(),
        fetchSpendingBreakdown(),
        fetchSentimentOverview(),
        fetchSentimentTrend(),
        fetchRecommendations(),
      ])
      dashboard.value = d
      attractionAttention.value = aa
      typeAttention.value = ta
      spendingBreakdown.value = sb
      sentimentOverview.value = so
      sentimentTrend.value = st
      recommendations.value = rec
    } catch (e) {
      console.error('VisitorAnalyticsStore 加载失败', e)
    }
    loading.value = false
  }

  return {
    dashboard, attractionAttention, typeAttention, spendingBreakdown,
    sentimentOverview, sentimentTrend, recommendations,
    loading, loadData,
  }
})
