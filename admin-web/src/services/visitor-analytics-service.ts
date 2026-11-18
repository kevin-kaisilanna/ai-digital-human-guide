/**
 * 游客行为分析 API 服务
 * 对应后端 /api/visitor-analytics/* 端点
 * 数据来源：经典景区旅游数据行为分析数据（灵山胜境、灵山大佛、禅意小镇·拈花湾）
 * 三级加载策略：1. 静态 JSON 报告  2. 后端 API  3. Mock 数据
 */
import { getUseMock, apiGet } from './api-client'

// ── Mock 数据（灵山景区 & 拈花湾 真实统计）────────────────────────────

const MOCK_DASHBOARD = {
  totalVisitors: 777,
  avgSatisfaction: 3.07,
  satisfactionDistribution: [
    { rating: 2, count: 134 },
    { rating: 3, count: 469 },
    { rating: 4, count: 163 },
    { rating: 5, count: 11 },
  ],
  dailyTrend: [
    { date: '2025-09-01', visitors: 5 },
    { date: '2025-09-02', visitors: 3 },
    { date: '2025-09-03', visitors: 8 },
    { date: '2025-09-05', visitors: 8 },
    { date: '2025-09-10', visitors: 5 },
    { date: '2025-09-15', visitors: 5 },
    { date: '2025-09-19', visitors: 9 },
  ],
  spendingBreakdown: [
    { category: '门票', key: 'ticket', total: 143442, percentage: 20.2 },
    { category: '餐饮', key: 'food', total: 187288, percentage: 26.3 },
    { category: '购物', key: 'shopping', total: 193893, percentage: 27.2 },
    { category: '交通', key: 'transport', total: 103895, percentage: 14.6 },
    { category: '娱乐', key: 'entertainment', total: 83186, percentage: 11.7 },
  ],
  seasonalTrend: [
    { period: '1月', count: 23, avgSatisfaction: 3.04 },
    { period: '2月', count: 19, avgSatisfaction: 2.95 },
    { period: '3月', count: 59, avgSatisfaction: 3.05 },
    { period: '4月', count: 70, avgSatisfaction: 2.99 },
    { period: '5月', count: 90, avgSatisfaction: 3.09 },
    { period: '6月', count: 63, avgSatisfaction: 3.02 },
    { period: '7月', count: 73, avgSatisfaction: 3.11 },
    { period: '8月', count: 88, avgSatisfaction: 3.08 },
    { period: '9月', count: 107, avgSatisfaction: 2.97 },
    { period: '10月', count: 50, avgSatisfaction: 3.18 },
    { period: '11月', count: 49, avgSatisfaction: 3.24 },
    { period: '12月', count: 86, avgSatisfaction: 3.08 },
  ],
  typeDistribution: [
    { type: '景点介绍', count: 272, percentage: 35.0, avgSatisfaction: 3.12, avgCost: 956, avgStayDuration: 4.2 },
    { type: '历史文化', count: 156, percentage: 20.1, avgSatisfaction: 3.21, avgCost: 884, avgStayDuration: 4.5 },
    { type: '常见问答', count: 98, percentage: 12.6, avgSatisfaction: 2.89, avgCost: 743, avgStayDuration: 3.2 },
    { type: '设施服务', count: 86, percentage: 11.1, avgSatisfaction: 3.35, avgCost: 1102, avgStayDuration: 3.8 },
    { type: '游览指南', count: 72, percentage: 9.3, avgSatisfaction: 2.78, avgCost: 1320, avgStayDuration: 5.1 },
    { type: '路线推荐', count: 54, percentage: 7.0, avgSatisfaction: 3.45, avgCost: 1650, avgStayDuration: 6.0 },
    { type: '活动资讯', count: 39, percentage: 5.0, avgSatisfaction: 3.08, avgCost: 780, avgStayDuration: 3.5 },
  ],
  demographics: {
    ageGroups: [
      { group: '19-30岁', count: 275 },
      { group: '31-45岁', count: 303 },
      { group: '46-60岁', count: 142 },
      { group: '60岁以上', count: 57 },
    ],
    genderSplit: { male: 401, female: 376 },
  },
}

const MOCK_ATTRACTION_ATTENTION = [
  { name: '灵山大佛', visitorCount: 286, avgStayDuration: 4.0, avgTotalCost: 870, avgSatisfaction: 3.12 },
  { name: '禅意小镇·拈花湾', visitorCount: 255, avgStayDuration: 4.0, avgTotalCost: 957, avgSatisfaction: 3.03 },
  { name: '灵山胜境', visitorCount: 236, avgStayDuration: 4.0, avgTotalCost: 927, avgSatisfaction: 3.04 },
]

const MOCK_SPENDING = [
  { category: '门票', key: 'ticket', total: 143442, percentage: 20.2 },
  { category: '餐饮', key: 'food', total: 187288, percentage: 26.3 },
  { category: '购物', key: 'shopping', total: 193893, percentage: 27.2 },
  { category: '交通', key: 'transport', total: 103895, percentage: 14.6 },
  { category: '娱乐', key: 'entertainment', total: 83186, percentage: 11.7 },
]

const MOCK_SENTIMENT_OVERVIEW = {
  distribution: [
    { rating: 2, count: 134 }, { rating: 3, count: 469 },
    { rating: 4, count: 163 }, { rating: 5, count: 11 },
  ],
  averageSatisfaction: 3.07,
  totalRecords: 777,
}

const MOCK_SENTIMENT_TREND = [
  { date: '2025-09-01', avgSatisfaction: 3.0, count: 5 },
  { date: '2025-09-05', avgSatisfaction: 3.12, count: 8 },
  { date: '2025-09-10', avgSatisfaction: 3.0, count: 5 },
  { date: '2025-09-15', avgSatisfaction: 2.6, count: 5 },
  { date: '2025-09-19', avgSatisfaction: 3.0, count: 9 },
  { date: '2025-09-26', avgSatisfaction: 3.2, count: 5 },
  { date: '2025-09-29', avgSatisfaction: 3.4, count: 5 },
]

const MOCK_SENTIMENT_BY_ATTRACTION = [
  { name: '禅意小镇·拈花湾', avgSatisfaction: 3.03, visitorCount: 255 },
  { name: '灵山胜境', avgSatisfaction: 3.04, visitorCount: 236 },
  { name: '灵山大佛', avgSatisfaction: 3.12, visitorCount: 286 },
]

const MOCK_SENTIMENT_BY_DEMOGRAPHIC = {
  byAge: [
    { group: '19-30岁', avgSatisfaction: 3.0, count: 275 },
    { group: '31-45岁', avgSatisfaction: 2.88, count: 303 },
    { group: '46-60岁', avgSatisfaction: 3.23, count: 142 },
    { group: '60岁以上', avgSatisfaction: 3.98, count: 57 },
  ],
  byGender: {
    male: { avgSatisfaction: 3.05, count: 401 },
    female: { avgSatisfaction: 3.08, count: 376 },
  },
}

const MOCK_DEMOGRAPHICS = {
  ageGroups: [
    { group: '19-30岁', count: 275 }, { group: '31-45岁', count: 303 },
    { group: '46-60岁', count: 142 }, { group: '60岁以上', count: 57 },
  ],
  genderSplit: { male: 401, female: 376 },
  groupSize: [
    { groupSize: 1, count: 111, avgTotalCost: 653 },
    { groupSize: 2, count: 273, avgTotalCost: 776 },
    { groupSize: 3, count: 219, avgTotalCost: 974 },
    { groupSize: 4, count: 150, avgTotalCost: 1160 },
    { groupSize: 5, count: 24, avgTotalCost: 1673 },
  ],
}

const MOCK_RECOMMENDATIONS = [
  { level: 'warning', title: '「禅意小镇·拈花湾」满意度低于整体均值', description: '该景点平均满意度 3.03 分，低于整体均值 3.07 分。建议排查服务流程与设施问题（255 条记录）。' },
  { level: 'warning', title: '「灵山胜境」满意度低于整体均值', description: '该景点平均满意度 3.04 分，低于整体均值 3.07 分。建议排查服务流程与设施问题（236 条记录）。' },
  { level: 'info', title: '「灵山大佛」满意度有提升空间', description: '该景点平均满意度 3.12 分，接近整体水平（3.07），建议优化服务细节，进一步提升游客体验。' },
  { level: 'info', title: '餐饮消费占比突出', description: '餐饮消费占总消费 26.3%，建议丰富灵山素斋、拈花湾禅食等特色餐饮业态、推出主题套餐以提升客单价。' },
  { level: 'info', title: '购物消费占比较高', description: '购物消费占总消费 27.2%，得益于景区文创产品受欢迎，建议进一步开发灵山/拈花湾特色文创周边（祈福香囊、禅意茶具等）。' },
  { level: 'info', title: '年轻游客满意度有待提升', description: '19-30岁年轻游客群体满意度略低（3.0分），建议在灵山/拈花湾增加互动体验、禅意打卡点、社交媒体传播元素以提升年轻客群体验。' },
  { level: 'info', title: '团体游客平均 2.6 人出行', description: '团体游客占比较高，建议优化团体导览服务、设置团体专用通道和集合点，推出家庭/亲友套票。' },
  { level: 'success', title: '整体满意度表现良好', description: '22% 游客给出 4 分及以上评价，灵山景区（灵山大佛、灵山胜境）和禅意小镇·拈花湾整体服务水平处于较优水平，继续保持。' },
  { level: 'info', title: '数据样本充足（共 777 条记录）', description: '当前分析基于灵山景区（灵山大佛、灵山胜境）和禅意小镇·拈花湾的完整游客行为数据（2025-01-03 ~ 2025-12-31），统计可信度高。建议定期分析数据变化，持续优化运营策略。' },
]

const MOCK_DAILY_TREND = [
  { date: '2025-09-01', visitors: 5 }, { date: '2025-09-03', visitors: 8 },
  { date: '2025-09-05', visitors: 8 }, { date: '2025-09-10', visitors: 5 },
  { date: '2025-09-15', visitors: 5 }, { date: '2025-09-19', visitors: 9 },
  { date: '2025-09-26', visitors: 5 },
]

const MOCK_SEASONAL_TREND = [
  { period: '1月', count: 23, avgSatisfaction: 3.04 },
  { period: '2月', count: 19, avgSatisfaction: 2.95 },
  { period: '3月', count: 59, avgSatisfaction: 3.05 },
  { period: '4月', count: 70, avgSatisfaction: 2.99 },
  { period: '5月', count: 90, avgSatisfaction: 3.09 },
  { period: '6月', count: 63, avgSatisfaction: 3.02 },
  { period: '7月', count: 73, avgSatisfaction: 3.11 },
  { period: '8月', count: 88, avgSatisfaction: 3.08 },
  { period: '9月', count: 107, avgSatisfaction: 2.97 },
  { period: '10月', count: 50, avgSatisfaction: 3.18 },
  { period: '11月', count: 49, avgSatisfaction: 3.24 },
  { period: '12月', count: 86, avgSatisfaction: 3.08 },
]

// ── API 函数 — mock 为基线，真实 API 在上层覆盖 ──────────────

import { mergeArrays, mergeObjects, shouldTryApi, safeFetch } from './data-merge'
import { getBaseURL } from './api-client'

function apiUrl(path: string) { return getBaseURL() + path }

export async function fetchVisitorDashboard() {
  let result = { ...MOCK_DASHBOARD }
  if (shouldTryApi()) {
    // 尝试真实 dashboard API，覆盖实时统计数据
    const api = await safeFetch(apiUrl('/api/analytics/dashboard'))
    if (api) {
      result.totalVisitors = api.todayVisitors || api.weeklyVisitors || result.totalVisitors
      result.avgSatisfaction = api.satisfaction ? (api.satisfaction / 20).toFixed(2) : result.avgSatisfaction
    }
  }
  return result
}

export async function fetchAttractionAttention(limit = 10) {
  let result = [...MOCK_ATTRACTION_ATTENTION]
  if (shouldTryApi()) {
    const api = await safeFetch(apiUrl('/api/analytics/dashboard'))
    if (api?.spotPopularity?.length) {
      const merged = mergeArrays(result, api.spotPopularity.map((s: any) => ({
        name: s.name,
        visitorCount: s.count || 0,
        avgStayDuration: 4.0,
        avgTotalCost: 900,
        avgSatisfaction: 3.0,
      })), (x: any) => x.name)
      result = merged.slice(0, limit)
    }
  }
  return result.slice(0, limit)
}

export async function fetchTypeAttention() {
  let result = [...MOCK_DASHBOARD.typeDistribution]
  if (shouldTryApi()) {
    // 尝试从后端报告获取真实类别分布
    const api = await safeFetch(apiUrl('/api/reports/summary'))
    if (api?.categoryDistribution?.length) {
      const enriched = api.categoryDistribution.map((c: any) => ({
        type: c.category,
        count: Math.round((c.percentage / 100) * 777),
        percentage: c.percentage,
        avgSatisfaction: 3.0,
        avgCost: 900,
        avgStayDuration: 4.0,
      }))
      result = mergeArrays(result, enriched, (x: any) => x.type)
    }
  }
  return result
}

export async function fetchSpendingBreakdown() {
  return [...MOCK_SPENDING]  // 后端无对应端点，保持 mock 数据
}

export async function fetchSentimentOverview() {
  let result = { ...MOCK_SENTIMENT_OVERVIEW }
  if (shouldTryApi()) {
    const api = await safeFetch(apiUrl('/api/reports/summary'))
    if (api?.sentimentTrend?.length) {
      // 从 sentimentTrend 推导概览分布
      const total = api.sentimentTrend.reduce((s: number, d: any) => s + d.positive + d.neutral + d.negative, 0)
      const pos = api.sentimentTrend.reduce((s: number, d: any) => s + d.positive, 0)
      const neu = api.sentimentTrend.reduce((s: number, d: any) => s + d.neutral, 0)
      const neg = api.sentimentTrend.reduce((s: number, d: any) => s + d.negative, 0)
      if (total > 0) {
        result.distribution = [
          { rating: 5, count: Math.round(pos * 0.15) },
          { rating: 4, count: Math.round(pos * 0.55) },
          { rating: 3, count: Math.round(neu) },
          { rating: 2, count: Math.round(neg) },
        ].filter(d => d.count > 0)
        result.averageSatisfaction = ((pos * 4.5 + neu * 3 + neg * 1.5) / total).toFixed(2)
        result.totalRecords = total
      }
    }
  }
  return result
}

export async function fetchSentimentTrend(days = 90) {
  let result = [...MOCK_SENTIMENT_TREND]
  if (shouldTryApi()) {
    const api = await safeFetch(apiUrl('/api/reports/summary'))
    if (api?.sentimentTrend?.length) {
      const enriched = api.sentimentTrend.map((d: any) => ({
        date: d.date, avgSatisfaction: (d.positive * 0.8 + d.neutral * 0.5 + d.negative * 0.2) / Math.max(d.positive + d.neutral + d.negative, 1) * 5,
        count: d.positive + d.neutral + d.negative,
      }))
      result = mergeArrays(result, enriched, (x: any) => x.date)
      result = result.slice(-days)
    }
  }
  return result
}

export async function fetchSentimentByAttraction(limit = 10) {
  let result = [...MOCK_SENTIMENT_BY_ATTRACTION]
  if (shouldTryApi()) {
    const api = await safeFetch(apiUrl('/api/analytics/dashboard'))
    if (api?.spotPopularity?.length) {
      const enriched = api.spotPopularity.map((s: any) => ({
        name: s.name,
        avgSatisfaction: 3.0,
        visitorCount: s.count || 0,
      }))
      result = mergeArrays(result, enriched, (x: any) => x.name)
      result = result.slice(0, limit)
    }
  }
  return result.slice(0, limit)
}

export async function fetchSentimentByDemographic() {
  return { ...MOCK_SENTIMENT_BY_DEMOGRAPHIC }  // 后端无用户画像数据
}

export async function fetchDemographics() {
  return { ...MOCK_DEMOGRAPHICS }  // 后端无用户画像数据
}

export async function fetchRecommendations() {
  let result = [...MOCK_RECOMMENDATIONS]
  if (shouldTryApi()) {
    const api = await safeFetch(apiUrl('/api/reports/summary'))
    if (api?.suggestions?.length) {
      const enriched = api.suggestions.map((s: any) => ({
        level: s.level || 'info',
        title: s.content || s.title || '',
        description: s.content || s.description || '',
      }))
      result = mergeArrays(result, enriched, (x: any) => x.title || x.description)
    }
  }
  return result
}

export async function fetchDailyTrend(days = 30) {
  let result = [...MOCK_DAILY_TREND]
  if (shouldTryApi()) {
    const api = await safeFetch(apiUrl('/api/analytics/dashboard'))
    if (api?.weeklyTrend?.length) {
      const today = new Date()
      const enriched = api.weeklyTrend.map((count: number, i: number) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (api.weeklyTrend.length - 1 - i))
        return { date: d.toISOString().slice(0, 10), visitors: count }
      })
      result = mergeArrays(result, enriched, (x: any) => x.date)
      result = result.slice(-days)
    }
  }
  return result
}

export async function fetchSeasonalTrend(by: 'month' | 'weekday' = 'month') {
  return [...MOCK_SEASONAL_TREND]  // 后端无季节性聚合
}
