import { getUseMock, apiGet } from './api-client'
import { mergeArrays, mergeObjects, shouldTryApi } from './data-merge'

const MOCK_DASHBOARD = {
  todayVisitors: 1286,
  onlineUsers: 42,
  weeklyTrend: [1102, 1286, 1350, 1420, 1580, 1820, 1680],
  topQuestions: [
    { question: '灵山大佛有多高？', count: 328, satisfaction: 94 },
    { question: '附近有卫生间吗？', count: 291, satisfaction: 98 },
    { question: '景区开放到几点？', count: 256, satisfaction: 96 },
  ],
}

export async function fetchDashboard() {
  // mock 为基线
  let result: Record<string, any> = { ...MOCK_DASHBOARD }
  if (shouldTryApi()) {
    try {
      const api = await apiGet('/api/analytics/dashboard')
      if (api) {
        // 真实 API 的值覆盖 mock 同名字段
        if (api.todayVisitors !== undefined) result.todayVisitors = api.todayVisitors
        if (api.onlineUsers !== undefined) result.onlineUsers = api.onlineUsers
        if (api.weeklyTrend?.length) result.weeklyTrend = api.weeklyTrend
        if (api.topQuestions?.length) {
          result.topQuestions = mergeArrays(
            result.topQuestions,
            api.topQuestions,
            (x: any) => x.question,
          )
        }
        // 真实 API 额外字段透传
        if (api.spotPopularity) result.spotPopularity = api.spotPopularity
        if (api.satisfaction !== undefined) result.satisfaction = api.satisfaction
        if (api.knowledgeCount !== undefined) result.knowledgeCount = api.knowledgeCount
      }
    } catch { /* 后端不可用，保持 mock */ }
  }
  return result
}
