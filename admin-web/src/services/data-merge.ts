/**
 * 数据合并工具 — mock 数据为基线，真实 API 数据在上层覆盖
 *
 * 策略：
 *   1. 始终以 mock/静态数据为基线（保证内容完整性）
 *   2. 真实 API 数据在上层覆盖（同 key 字段以 API 为准）
 *   3. 数组数据并集合并、按 key 去重
 *   4. 对象数据浅合并
 */

/**
 * 合并两个对象数组，按 keyFn 去重。
 * base 先放入，overlay 中同 key 的项覆盖 base，新 key 追加。
 */
export function mergeArrays<T>(
  base: T[],
  overlay: T[],
  keyFn: (item: T) => string,
): T[] {
  const map = new Map<string, T>()
  for (const item of base) map.set(keyFn(item), item)
  for (const item of overlay) map.set(keyFn(item), item)
  return Array.from(map.values())
}

/**
 * 合并两个对象，overlay 中非 undefined/null 的值覆盖 base。
 */
export function mergeObjects<T extends Record<string, any>>(
  base: T,
  overlay: Partial<T>,
): T {
  const result = { ...base }
  for (const key of Object.keys(overlay)) {
    const v = (overlay as any)[key]
    if (v !== undefined && v !== null) {
      result[key as keyof T] = v
    }
  }
  return result
}

/**
 * 安全 fetch，超时或网络错误返回 null
 */
export async function safeFetch(url: string, timeoutMs = 5000): Promise<any> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * 根据 localStorage USE_MOCK 判断是否尝试真实 API。
 * 返回 true 表示仅用 mock，false 表示同时尝试真实 API。
 */
export function shouldTryApi(): boolean {
  const v = typeof window !== 'undefined' ? localStorage.getItem('USE_MOCK') : null
  if (v === null) return true  // 默认同时尝试（mock 为基线）
  return v !== 'true'          // 用户手动设为 true 时只用 mock
}
