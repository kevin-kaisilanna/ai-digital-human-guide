export const AI_BASE_KEY = 'admin_ai_base'
export const DH_BASE_KEY = 'admin_dh_base'

export function getAiBase(){
  return localStorage.getItem(AI_BASE_KEY) ?? (import.meta.env.VITE_AI_BASE ?? 'http://localhost:8001')
}
export function setAiBase(url:string){ localStorage.setItem(AI_BASE_KEY, url) }

export function getDigitalHumanBase(){
  return localStorage.getItem(DH_BASE_KEY) ?? (import.meta.env.VITE_DH_BASE ?? 'http://localhost:8001')
}
export function setDigitalHumanBase(url:string){ localStorage.setItem(DH_BASE_KEY, url) }

export function resetToEnv(){
  localStorage.removeItem(AI_BASE_KEY)
  localStorage.removeItem(DH_BASE_KEY)
}
