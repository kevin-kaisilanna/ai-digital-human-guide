<template>
  <aside class="sidebar">
    <div class="logo" @click="$router.push('/dashboard')">
      <div class="logo-mark">
        <img src="/images/logo.png" alt="灵山导览" class="logo-img" />
      </div>
      <div class="logo-text">
        <span class="logo-title">灵山导览</span>
        <span class="logo-sub">LINGSHAN · ADMIN</span>
      </div>
    </div>
    <nav class="nav">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" :class="{active:isActive(item.path)}">
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label">{{item.label}}</span>
        <span v-if="isActive(item.path)" class="nav-active-dot"></span>
      </router-link>
    </nav>
    <div class="sidebar-footer">
      <div class="service-status">
        <div class="status-item">
          <span class="status-dot" :class="aiOnline?'online':'offline'"></span>
          <span class="status-label">AI 引擎</span>
          <span class="status-state" :class="aiOnline?'online':'offline'">{{aiOnline?'在线':'离线'}}</span>
        </div>
        <div class="status-item">
          <span class="status-dot" :class="dhOnline?'online':'offline'"></span>
          <span class="status-label">数字人</span>
          <span class="status-state" :class="dhOnline?'online':'offline'">{{dhOnline?'在线':'离线'}}</span>
        </div>
      </div>
      <div class="user-info">
        <div class="user-avatar">{{ avatarText }}</div>
        <div class="user-meta">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/auth-store'

const route=useRoute()
const router=useRouter()
const auth=useAuthStore()
const aiOnline=ref(true)
const dhOnline=ref(true)

const navItems=[
  {path:'/dashboard',label:'数据大屏',icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/></svg>'},
  {path:'/knowledge',label:'知识库',icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'},
  {path:'/digital-human',label:'数字人',icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><circle cx="12" cy="8" r="10"/></svg>'},
  {path:'/visitor-analytics',label:'行为分析',icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'},
  {path:'/users',label:'账户管理',icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},
  {path:'/reports',label:'游客报告',icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'},
  {path:'/settings',label:'系统设置',icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'},
]

function getLoginUser() {
  try { const raw = sessionStorage.getItem('admin_user'); if (raw) return JSON.parse(raw) } catch {}
  return null
}
const user = getLoginUser()
const userName = computed(() => user?.username || auth.userName)
const userRole = computed(() => user?.role || auth.userRole)
const avatarText = computed(() => {
  const name = userName.value
  if (!name) return '管'
  return name.slice(0, 2).toUpperCase()
})
function isActive(path:string):boolean{
  if(path==='/dashboard') return route.path==='/dashboard'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.55) 0%,
    rgba(255,252,247,0.45) 30%,
    rgba(250,246,240,0.4) 70%,
    rgba(248,242,235,0.35) 100%);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  padding: 20px 14px;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Logo 区 */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px 20px;
  cursor: pointer;
  transition: opacity 0.3s;
}
.logo:hover { opacity: 0.8; }
.logo-mark {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius);
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(120,90,50,.1);
  transition: box-shadow 0.4s;
}
.logo:hover .logo-mark {
  box-shadow: 0 4px 20px rgba(200,160,100,.2);
}
.logo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.logo-text { display: flex; flex-direction: column; }
.logo-title {
  font-weight: 800;
  font-size: 17px;
  letter-spacing: .04em;
  color: var(--text);
}
.logo-sub {
  font-size: 10px;
  color: var(--text-tertiary);
  letter-spacing: .08em;
}

/* 导航 */
.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  color: var(--muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition);
  position: relative;
  letter-spacing: .02em;
}
.nav-item:hover {
  background: var(--surface-hover);
  color: var(--text);
  transform: translateX(3px);
}
.nav-item.active {
  background: linear-gradient(135deg, rgba(200,132,60,.16), rgba(220,180,120,.08));
  color: var(--text);
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(200,150,100,.12);
  transform: translateX(4px);
}
.nav-active-dot {
  position: absolute;
  right: 10px;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px rgba(200,160,100,.5);
}
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
  opacity: .7;
}
.nav-item.active .nav-icon { opacity: 1; }
.nav-label { flex: 1; }

/* 底部 */
.sidebar-footer {
  border-top: 1px solid var(--border-light);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.service-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--muted);
  padding: 0 4px;
}
.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: box-shadow 0.3s;
}
.status-dot.online {
  background: var(--success);
  box-shadow: 0 0 8px rgba(74,154,110,.5);
}
.status-dot.offline {
  background: var(--danger);
}
.status-label { flex: 1; }
.status-state { font-weight: 500; font-size: 11px; }
.status-state.online { color: var(--success); }
.status-state.offline { color: var(--danger); }

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  border-radius: var(--radius-sm);
  background: rgba(200,160,100,.04);
  transition: background 0.3s;
}
.user-info:hover { background: rgba(200,160,100,.08); }
.user-avatar {
  width: 36px; height: 36px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, rgba(200,132,60,.25), rgba(180,130,80,.12));
  border: 1px solid rgba(200,160,100,.2);
  color: var(--accent-gold);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; flex-shrink: 0;
}
.user-meta { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.user-name { font-size: 13px; font-weight: 600; color: var(--text); }
.user-role { font-size: 11px; color: var(--muted); }
</style>
