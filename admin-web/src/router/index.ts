import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ===== 游客端 =====
  {
    path: '/',
    name: 'landing',
    component: () => import('@/pages/LandingPage.vue'),
    meta: { title: '灵山胜境' },
  },
  {
    path: '/scenic-tour',
    name: 'scenic-tour',
    component: () => import('@/pages/ScenicTour.vue'),
    meta: { title: '景区游览' },
  },
  {
    path: '/admin-login',
    name: 'admin-login',
    component: () => import('@/pages/AdminLogin.vue'),
    meta: { title: '后台管理登录' },
  },

  // ===== 后台管理（需登录）=====
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { title: '数据大屏', requiresAuth: true },
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import('@/pages/KnowledgePage.vue'),
    meta: { title: '知识库管理', requiresAuth: true },
  },
  {
    path: '/digital-human',
    name: 'digital-human',
    component: () => import('@/pages/DigitalHumanPage.vue'),
    meta: { title: '数字人配置', requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/pages/ReportsPage.vue'),
    meta: { title: '游客报告', requiresAuth: true },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/pages/UserManagementPage.vue'),
    meta: { title: '账户管理', requiresAuth: true },
  },
  {
    path: '/visitor-analytics',
    name: 'visitor-analytics',
    component: () => import('@/pages/VisitorAnalyticsPage.vue'),
    meta: { title: '游客行为分析', requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { title: '系统设置', requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局前置守卫 — 认证检查 + 页面标题
router.beforeEach((to, _from) => {
  const title = (to.meta?.title as string) || '管理后台'
  document.title = `${title} — 灵山导览`

  // 需要认证的后台页面
  if (to.meta?.requiresAuth) {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    const hasToken = !!sessionStorage.getItem('auth_token')
    if (!isLoggedIn || !hasToken) {
      // 未登录，跳转到登录页
      return { name: 'admin-login' }
    }
  }

  // 已登录用户访问登录页 → 直接跳转后台首页
  if (to.name === 'admin-login') {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true'
    if (isLoggedIn) {
      return { name: 'dashboard' }
    }
  }
})

export default router
