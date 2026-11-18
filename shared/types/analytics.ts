// 数据分析与报告相关类型 (PRD 4.2.3 游客报告, 4.2.4 数据大屏)

/** 情感类型 */
export type Sentiment = 'positive' | 'neutral' | 'negative'

/** 大屏 KPI 指标 */
export interface DashboardStats {
  todayVisitors: number
  todayVisitorsChange: number     // 较昨日变化百分比
  weeklyVisitors: number
  weeklyVisitorsChange: number
  onlineUsers: number
  satisfaction: number            // 百分比
  satisfactionChange: number
  knowledgeCount: number
  newKnowledgeThisWeek: number
}

/** 周趋势数据点 */
export interface TrendDataPoint {
  date: string
  value: number
}

/** 情感趋势数据点 */
export interface SentimentTrendPoint {
  date: string
  positive: number
  neutral: number
  negative: number
}

/** 景点热度 */
export interface SpotPopularity {
  spotName: string
  count: number
}

/** 热门问题 */
export interface TopQuestion {
  rank: number
  question: string
  count: number
  satisfaction: number
}

/** 类别分布 */
export interface CategoryDistribution {
  category: string
  percentage: number
}

/** 改进建议 */
export interface ImprovementSuggestion {
  level: 'warning' | 'info' | 'success'
  content: string
}

/** 详细问答记录 */
export interface QueryLog {
  id: string
  time: string
  visitorId: string
  question: string
  sentiment: Sentiment
  satisfaction: number
}

/** 报告汇总 */
export interface VisitorReport {
  sentimentTrend: SentimentTrendPoint[]
  topQuestions: TopQuestion[]
  categoryDistribution: CategoryDistribution[]
  suggestions: ImprovementSuggestion[]
  queryLogs: QueryLog[]
}
