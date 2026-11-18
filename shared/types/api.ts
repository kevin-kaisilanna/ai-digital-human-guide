// API 通用响应类型

/** 统一 API 响应 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 错误响应 */
export interface ErrorResponse {
  code: number
  message: string
  details?: string
}

/** 路由推荐 (PRD 4.1.3) */
export interface Route {
  id: string
  name: string
  description: string
  tags: string[]               // 兴趣标签
  imageUrl?: string
  spots: RouteSpot[]
  duration: string             // 预计用时
  spotCount: number
}

export interface RouteSpot {
  order: number
  spotName: string
  talkingPoints: string[]      // 讲解要点
  duration: string
}
