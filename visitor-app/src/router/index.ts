import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { title: '登录 — 灵山导览', guest: true },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/AvatarPage.vue'),
    meta: { title: 'AI 导游小云', requiresAuth: true },
  },
  {
    path: '/route',
    name: 'route',
    component: () => import('@/pages/RoutePage.vue'),
    meta: { title: '路线推荐', requiresAuth: true },
  },
  {
    path: '/route/history',
    name: 'route-history',
    component: () => import('@/pages/HistoryRoutePage.vue'),
    meta: { title: '历史文化爱好者路线 — 灵山胜境', requiresAuth: true },
  },
  {
    path: '/route/nature',
    name: 'route-nature',
    component: () => import('@/pages/NatureRoutePage.vue'),
    meta: { title: '自然风光爱好者路线 — 灵山胜境', requiresAuth: true },
  },
  {
    path: '/route/family',
    name: 'route-family',
    component: () => import('@/pages/FamilyRoutePage.vue'),
    meta: { title: '亲子家庭路线 — 灵山胜境', requiresAuth: true },
  },
  {
    path: '/route/unofficial',
    name: 'route-unofficial',
    component: () => import('@/pages/UnofficialRoutePage.vue'),
    meta: { title: '非官方旅游路线 — 灵山胜境', requiresAuth: true },
  },
  {
    path: '/route/bus',
    name: 'route-bus',
    component: () => import('@/pages/BusRoutePage.vue'),
    meta: { title: '观光车路线 — 灵山胜境', requiresAuth: true },
  },
  {
    path: '/route/peak-avoid',
    name: 'route-peak-avoid',
    component: () => import('@/pages/PeakAvoidRoutePage.vue'),
    meta: { title: '避让高峰路线 — 灵山胜境', requiresAuth: true },
  },
  {
    path: '/route/half-day',
    name: 'route-half-day',
    component: () => import('@/pages/HalfDayRoutePage.vue'),
    meta: { title: '半日精华游 — 灵山胜境', requiresAuth: true },
  },
  {
    path: '/route/two-day',
    name: 'route-two-day',
    component: () => import('@/pages/TwoDayRoutePage.vue'),
    meta: { title: '灵山+拈花湾两日深度游 — 灵山胜境', requiresAuth: true },
  },
  {
    path: '/route/:id',
    name: 'route-detail',
    component: () => import('@/pages/RouteDetailPage.vue'),
    meta: { title: '路线详情', requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { title: '账号设置', requiresAuth: true },
  },
  {
    path: '/settings/name',
    name: 'settings-name',
    component: () => import('@/pages/SettingsNamePage.vue'),
    meta: { title: '修改展示名称', requiresAuth: true },
  },
  {
    path: '/settings/password',
    name: 'settings-password',
    component: () => import('@/pages/SettingsPasswordPage.vue'),
    meta: { title: '修改登录密码', requiresAuth: true },
  },
  {
    path: '/settings/logout',
    name: 'settings-logout',
    component: () => import('@/pages/SettingsLogoutPage.vue'),
    meta: { title: '退出登录', requiresAuth: true },
  },
]

const router = createRouter({ history: createWebHashHistory(), routes })

/** 检查 token 是否过期 */
function isTokenExpired(token: string): boolean {
  if (!token || !token.startsWith('tk-')) return false
  const parts = token.split('-')
  if (parts.length < 3) return false
  const expiry = parseInt(parts[2], 36)
  if (isNaN(expiry)) return false
  return Date.now() > expiry
}

/** 获取 token 并校验合法性 */
function isAuthenticated(): boolean {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  if (!token) return false
  if (isTokenExpired(token)) {
    // token 过期 — 清除所有会话
    localStorage.removeItem('auth_token')
    localStorage.removeItem('current_user')
    localStorage.removeItem('remember_me')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('current_user')
    return false
  }
  return true
}

router.beforeEach((to, _from) => {
  document.title = `${to.meta?.title || '灵山导览'} — AI 数字人导游`

  const loggedIn = isAuthenticated()

  if (to.meta.requiresAuth && !loggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && loggedIn) {
    return { name: 'home' }
  }
})

export default router
