import { getUseMock, apiPost } from './api-client'

export async function login(username: string, password: string) {
  if (getUseMock()) {
    const token = 'mock-token-' + Date.now()
    sessionStorage.setItem('auth_token', token)
    return { token, user: { name: username || 'admin', role: '管理员' } }
  }
  const result = await apiPost('/api/auth/login', { username, password })
  if (result.token) {
    sessionStorage.setItem('auth_token', result.token)
  }
  return result
}

export async function logout() {
  sessionStorage.removeItem('auth_token')
  if (getUseMock()) return true
  await apiPost('/api/auth/logout')
  return true
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem('auth_token')
}
