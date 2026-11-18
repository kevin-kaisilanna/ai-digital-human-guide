import { getUseMock, apiGet, getBaseURL } from './api-client'
import { mergeArrays, shouldTryApi, safeFetch } from './data-merge'

function apiUrl(path: string) { return getBaseURL() + path }

/**
 * 加载完整报告 — 静态 JSON 为基线，真实 API 数据在上层覆盖
 */
export async function fetchReports() {
  // 1. 基线：静态 JSON 报告
  let baseline: any = {
    sentimentTrend: [],
    topQuestions: [],
    categoryDistribution: [],
    suggestions: [],
    queryLogs: [],
  }
  try {
    const res = await fetch('/data/visitor-analysis-report.json', { cache: 'no-cache' })
    if (res.ok) {
      const r = await res.json()
      // 情感趋势
      if (r.sentiment?.dailyTrend?.length) {
        baseline.sentimentTrend = r.sentiment.dailyTrend.slice(-30).map((d: any) => ({
          date: d.date_str?.slice(5) || d.date_str,
          positive: Math.round(d.avgSatisfaction * 15),
          neutral: Math.round(d.avgSatisfaction * 5),
          negative: Math.round((5 - d.avgSatisfaction) * 3),
        }))
      }
      // 类别分布
      if (r.attention?.typeDistribution?.length) {
        baseline.categoryDistribution = r.attention.typeDistribution.map((t: any) => ({
          category: t.type, count: t.count, percentage: t.percentage,
        }))
      }
      // 建议
      if (r.recommendations?.length) {
        baseline.suggestions = r.recommendations.map((rec: any) => ({
          level: rec.level || 'info', title: rec.title, description: rec.description,
        }))
      }
      // 热门问题
      if (r.attention?.topAttractions?.length) {
        baseline.topQuestions = r.attention.topAttractions.map((a: any) => ({
          question: a.attraction_name, count: a.visitorCount, satisfaction: Math.round(a.avgSatisfaction * 20),
        }))
      }
    }
  } catch { /* 静态 JSON 加载失败，保持空基线 */ }

  // 2. 合并真实 API 数据
  if (shouldTryApi()) {
    const api = await safeFetch(apiUrl('/api/reports/summary'))
    if (api) {
      // 情感趋势
      if (api.sentimentTrend?.length) {
        baseline.sentimentTrend = mergeArrays(
          baseline.sentimentTrend, api.sentimentTrend,
          (x: any) => x.date,
        )
      }
      // 类别分布
      if (api.categoryDistribution?.length) {
        baseline.categoryDistribution = mergeArrays(
          baseline.categoryDistribution,
          api.categoryDistribution.map((c: any) => ({ category: c.category, percentage: c.percentage })),
          (x: any) => x.category,
        )
      }
      // 建议
      if (api.suggestions?.length) {
        const apiSugs = api.suggestions.map((s: any) => ({
          level: s.level || 'info',
          title: s.title || (s.content || '').slice(0, 30),
          description: s.content || s.description || '',
        }))
        baseline.suggestions = mergeArrays(baseline.suggestions, apiSugs, (x: any) => x.description || x.title)
      }
      // 热门问题
      if (api.topQuestions?.length) {
        baseline.topQuestions = mergeArrays(
          baseline.topQuestions,
          api.topQuestions.map((q: any) => ({ question: q.question, count: q.count, satisfaction: q.satisfaction })),
          (x: any) => x.question,
        )
      }
    }
  }

  return baseline
}

export async function fetchQueryLogs(page = 1, pageSize = 50) {
  // 尝试真实后端
  if (shouldTryApi()) {
    try {
      const res = await fetch(apiUrl(`/api/reports/query-logs?page=${page}&pageSize=${pageSize}`))
      if (res.ok) return res.json()
    } catch { /* 后端不可用 */ }
  }
  return { logs: [], total: 0 }
}

export async function exportPdf() {
  return apiGet('/api/reports/export-pdf')
}
