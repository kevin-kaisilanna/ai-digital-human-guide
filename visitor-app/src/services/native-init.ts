/**
 * 原生平台初始化 — app 启动时调用
 * Web 环境为 no-op
 */
import { isNative, getPlatform } from './platform-adapter'

export async function initNative(): Promise<void> {
  if (!isNative()) return

  const platform = getPlatform()
  console.log(`[native-init] 平台: ${platform}, 原生初始化完成`)

  // 后续可扩展：
  // - StatusBar 设置主题色
  // - SplashScreen 隐藏
  // - DeepLink 监听
  // - 键盘处理
}