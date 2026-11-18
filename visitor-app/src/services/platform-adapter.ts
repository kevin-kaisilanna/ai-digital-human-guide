/**
 * platform-adapter — 平台适配层
 * 检测 Capacitor vs Web 环境，提供统一的 API
 *
 * 原生模式（APK）：API 请求发往开发机/WiFi 上的真实后端。
 * localStorage.API_BASE 可动态覆盖后端地址。
 */
import type { CapacitorGlobal } from '@capacitor/core'

/** 是否运行在 Capacitor 原生壳中 */
export function isNative(): boolean {
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.()
  } catch {
    return false
  }
}

/** 获取当前平台 */
export function getPlatform(): 'android' | 'web' {
  if (!isNative()) return 'web'
  return 'android'
}

/**
 * 原生模式下默认连接的后端地址。
 * 开发阶段：手机和电脑连同一 WiFi，这里填电脑的 LAN IP。
 * 生产阶段：改为云服务器域名。
 *
 * 可通过 localStorage.API_BASE 动态覆盖（最高优先级）。
 */
const NATIVE_DEFAULT_BASE = 'http://172.25.104.69:8001'

/** 获取 API 基础地址 */
export function getApiBaseUrl(): string {
  // 1. localStorage 覆盖（最高优先级 — 可在 App 内动态配置）
  try {
    const override = localStorage.getItem('API_BASE')
    if (override) return override
  } catch { /* ignore */ }

  // 2. Vite 环境变量（Web build 时注入）
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE

  // 3. 原生环境 → 开发机的后端
  if (isNative()) return NATIVE_DEFAULT_BASE

  // 4. Web dev → 空 = 同源（Vite 代理处理 /api/*）
  return ''
}