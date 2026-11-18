/**
 * useLocation — GPS 定位（可选加分项）
 * 靠近景点自动触发讲解
 * GPS 权限需用户授权
 */

import { ref } from 'vue'

export interface Location {
  lat: number
  lng: number
  accuracy?: number
}

export function useLocation() {
  const current = ref<Location | null>(null)
  const isTracking = ref(false)
  const error = ref<string | null>(null)
  const nearSpot = ref<string | null>(null)

  let watchId: number | null = null

  function startTracking() {
    error.value = null
    if (!navigator.geolocation) {
      error.value = '设备不支持 GPS 定位'
      return
    }
    isTracking.value = true
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        current.value = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
        checkNearbySpots(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => { error.value = `定位失败: ${err.message}`; isTracking.value = false },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 },
    )
  }

  function stopTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    isTracking.value = false
    nearSpot.value = null
  }

  /**
   * 检查是否靠近景点 — 模拟数据，部署后接入真实 POI 坐标
   */
  function checkNearbySpots(lat: number, lng: number) {
    const spots: Array<{ name: string; lat: number; lng: number; radius: number }> = [
      { name: '灵山大佛', lat: 31.42, lng: 120.10, radius: 100 },
      { name: '九龙壁', lat: 31.421, lng: 120.102, radius: 80 },
    ]
    for (const s of spots) {
      const dist = Math.sqrt((lat - s.lat) ** 2 + (lng - s.lng) ** 2) * 111000
      if (dist <= s.radius) { nearSpot.value = s.name; return }
    }
    nearSpot.value = null
  }

  return { current, isTracking, error, nearSpot, startTracking, stopTracking }
}
