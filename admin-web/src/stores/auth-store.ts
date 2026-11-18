import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const token = ref<string | null>(sessionStorage.getItem('auth_token'))

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? '管理员')
  const userRole = computed(() => user.value?.role ?? '管理员')

  function setUser(u: any) {
    user.value = u
  }

  function setToken(t: string | null) {
    token.value = t
    if (t) {
      sessionStorage.setItem('auth_token', t)
    } else {
      sessionStorage.removeItem('auth_token')
      user.value = null
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return { user, token, isLoggedIn, userName, userRole, setUser, setToken, logout }
})
