/**
 * 路线推荐 API 服务
 *
 * 后端占位接口：
 * - GET /api/routes          ?tag=&limit= → { routes }
 * - GET /api/routes/:id      → { route }
 */

import { getUseMock, apiGet } from './api-client'

export async function getRoutes(tag?: string) {
  if (getUseMock()) {
    return {
      routes: [
        { id: '1', name: '半日经典游', icon: '🏯', spots: 5, duration: '3-4小时', reason: '核心景点全覆盖。', tag: 'history' },
        { id: '2', name: '全天深度游', icon: '⛰️', spots: 8, duration: '6-8小时', reason: '深度探索灵山。', tag: 'nature' },
        { id: '3', name: '亲子欢乐游', icon: '🎠', spots: 4, duration: '2-3小时', reason: '轻松亲子时光。', tag: 'family' },
        { id: '4', name: '摄影打卡线', icon: '📸', spots: 6, duration: '4-5小时', reason: '最佳拍摄机位。', tag: 'photo' },
      ],
    }
  }
  const qs = tag ? `?tag=${tag}` : ''
  return apiGet(`/api/routes${qs}`)
}

export async function getRouteDetail(id: string) {
  if (getUseMock()) return { id, name: '半日经典游', spots_list: [] }
  return apiGet(`/api/routes/${id}`)
}
