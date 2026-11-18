<template>
  <nav class="bottom-nav" :style="{ paddingBottom: `calc(6px + var(--safe-bottom))` }">
    <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path" class="nav-tab" :class="{ active: isActive(tab.path) }">
      <span class="tab-icon">
        <svg v-if="tab.key === 'chat'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <svg v-else-if="tab.key === 'route'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </span>
      <span class="tab-label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const tabs = [
  { key: 'chat',  path: '/',       label: '对话' },
  { key: 'route', path: '/route',  label: '路线' },
  { key: 'profile', path: '/profile', label: '我的' },
]
function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.bottom-nav {
  display: flex; justify-content: space-around; align-items: center;
  padding: 8px 0 6px; flex-shrink: 0;
  background: linear-gradient(0deg, rgba(255,255,255,.7), rgba(250,246,240,.5));
  backdrop-filter: blur(10px); border-top: 1px solid var(--border-light);
  z-index: 10;
}
.nav-tab {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  text-decoration: none; color: var(--muted); position: relative;
  padding: 4px 16px; transition: all var(--transition);
}
.nav-tab.active { color: var(--primary); }
.nav-tab:active { transform: scale(.94); }
.tab-icon { display: flex; align-items: center; justify-content: center; height: 22px; }
.tab-label { font-size: 11px; font-weight: 600; }
</style>
