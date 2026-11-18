/**
 * useSessionTimeout — 会话超时自动登出
 *
 * 监听用户交互，30 分钟无操作后自动登出。
 * 登出前 1 分钟弹出预警通知。
 *
 * 用法：
 *   const { resetTimer, destroy } = useSessionTimeout()
 *   在 App.vue 中调用一次即可。
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { useUserStore } from '@/stores/user-store'

const TIMEOUT_MS = 30 * 60 * 1000       // 30 分钟
const WARNING_BEFORE_MS = 1 * 60 * 1000  // 提前 1 分钟预警

export function useSessionTimeout() {
  const store = useUserStore()
  const router = useRouter()

  const lastActivity = ref(Date.now())
  let checkTimer: ReturnType<typeof setInterval> | null = null
  let warningShown = false

  function resetTimer() {
    lastActivity.value = Date.now()
    warningShown = false
    store.updateLastActivity()
  }

  // 监听用户活动
  const events = ['click', 'keydown', 'touchstart', 'scroll']
  function onActivity() {
    if (store.isLoggedIn) resetTimer()
  }

  function checkTimeout() {
    if (!store.isLoggedIn) return

    const elapsed = Date.now() - lastActivity.value
    const remaining = TIMEOUT_MS - elapsed

    if (remaining <= 0) {
      // 超时，自动登出
      ElNotification({
        title: '会话已过期',
        message: '由于长时间未操作，已自动退出登录',
        type: 'warning',
        duration: 3000,
      })
      store.doLogout()
      router.push('/login')
    } else if (remaining <= WARNING_BEFORE_MS && !warningShown) {
      // 提前预警
      warningShown = true
      ElNotification({
        title: '即将退出登录',
        message: `您已长时间未操作，将在 ${Math.ceil(remaining / 60000)} 分钟后自动退出`,
        type: 'info',
        duration: 5000,
      })
    }
  }

  // Page Visibility API — 页面不可见时暂停计时
  function onVisibilityChange() {
    if (document.hidden) return // 挂起时不重置计时
    // 页面重新可见时检查超时
    if (store.isLoggedIn) {
      checkTimeout()
    }
  }

  function destroy() {
    if (checkTimer) { clearInterval(checkTimer); checkTimer = null }
    events.forEach((e) => document.removeEventListener(e, onActivity, { passive: true } as AddEventListenerOptions))
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  if (store.isLoggedIn) {
    // 绑定事件
    events.forEach((e) => document.addEventListener(e, onActivity, { passive: true } as AddEventListenerOptions))
    document.addEventListener('visibilitychange', onVisibilityChange)

    // 定期检查
    checkTimer = setInterval(checkTimeout, 10_000)
  }

  onUnmounted(destroy)

  return { resetTimer, destroy }
}
