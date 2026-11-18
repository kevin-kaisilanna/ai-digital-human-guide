<template>
  <header class="header">
    <div class="header-left">
      <Breadcrumb :items="breadcrumbs"/>
    </div>
    <div class="header-right">
      <div class="header-clock">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" fill="none" style="opacity:.5">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="clock-text">{{ now }}</span>
      </div>
      <button class="hdr-btn hdr-btn--refresh" @click="refresh" title="刷新数据">
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
      </button>
      <button class="hdr-btn hdr-btn--ai" @click="goAiDeploy">
        <span class="ai-dot"></span>
        <span>AI 部署</span>
      </button>
      <button class="hdr-btn hdr-btn--logout" @click="handleLogout">
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>退出</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import {ref,computed,onMounted,onBeforeUnmount} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import Breadcrumb from './Breadcrumb.vue'

const route=useRoute()
const router=useRouter()
const now=ref('')
let timer: ReturnType<typeof setInterval>

function tick(){
  now.value = new Date().toLocaleString('zh-CN',{
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit',
    hour12:false
  })
}

onMounted(()=>{ tick(); timer=setInterval(tick, 1000) })
onBeforeUnmount(()=>clearInterval(timer))

const breadcrumbMap: Record<string,string> = {
  '/dashboard': '数据大屏',
  '/knowledge': '知识库管理',
  '/digital-human': '数字人配置',
  '/visitor-analytics': '游客行为分析',
  '/users': '账户管理',
  '/reports': '游客报告',
  '/settings': '系统设置',
}

const breadcrumbs = computed(() => {
  const c: Array<{label: string; path?: string}> = [
    { label: '首页', path: '/dashboard' },
  ]
  const l = breadcrumbMap[route.path]
  if (l && route.path !== '/dashboard') {
    c.push({ label: l, path: route.path })
  }
  return c
})

function refresh() {
  window.dispatchEvent(new CustomEvent('admin:refresh'))
}
function goAiDeploy() {
  router.push('/settings')
}
function handleLogout() {
  sessionStorage.removeItem('admin_logged_in')
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('admin_user')
  router.push('/admin-login')
}
</script>

<style scoped>
.header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-light);
  background: linear-gradient(180deg,
    rgba(255,255,255,.45) 0%,
    rgba(250,246,240,.35) 100%);
  backdrop-filter: blur(14px);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 9;
}
.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px; right: 24px;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(200,160,100,.15),
    rgba(180,130,80,.12),
    rgba(200,160,100,.15),
    transparent);
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 时钟 */
.header-clock {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,.55);
  border: 1px solid var(--border-light);
  letter-spacing: .02em;
}

/* Header 按钮 */
.hdr-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  letter-spacing: .02em;
  background: transparent;
  color: var(--muted);
}
.hdr-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.hdr-btn--refresh:hover {
  border-color: var(--border);
  transform: rotate(180deg);
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hdr-btn--ai {
  color: var(--accent);
  border-color: rgba(200,160,100,.3);
  background: rgba(200,160,100,.06);
}
.hdr-btn--ai:hover {
  background: rgba(200,160,100,.12);
  border-color: rgba(200,160,100,.45);
  box-shadow: 0 0 16px rgba(200,160,100,.12);
}

.hdr-btn--logout {
  color: var(--danger);
}
.hdr-btn--logout:hover {
  background: var(--danger-soft);
  border-color: rgba(192,80,64,.15);
}

.ai-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px rgba(200,160,100,.7);
  animation: ai-blink 2s ease-in-out infinite;
}
@keyframes ai-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: .3; }
}
</style>
