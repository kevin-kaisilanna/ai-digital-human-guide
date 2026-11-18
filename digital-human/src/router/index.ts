import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/assets/static/js/useAuth.js'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/LoginPage/LoginDialog.vue'),
  },
  {
    path: '/',
    redirect: '/portal',
  },
  {
    path: '/portal',
    name: 'Portal',
    component: () => import('@/components/MainPage/CourseCard.vue'),
  },
  {
    path: '/routes',
    name: 'Routes',
    component: () => import('@/components/MainPage/CourseCard.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/components/UseCenterPage/UserInformation/BasicInfoCard.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫：未登录跳转登录页
router.beforeEach((to, _from, next) => {
  if (to.path !== '/login') {
    const { isAuthenticated } = useAuth()
    // 需要登录的页面
    const authRequired = ['/profile']
    if (authRequired.includes(to.path) && !isAuthenticated.value) {
      next('/login')
      return
    }
    next()
  } else {
    next()
  }
})

export default router
