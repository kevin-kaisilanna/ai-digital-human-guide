<template>
  <header class="app-header" :style="{ paddingTop: `calc(8px + var(--safe-top))` }">
    <div class="header-logo" @click="$router.push('/')">
      <div class="logo-img-wrap">
        <img src="/images/logo.png" alt="灵山" class="logo-img" />
      </div>
      <div class="logo-text">
        <span class="logo-name">灵山导览</span>
        <span class="logo-tag">AI 数字人导游</span>
      </div>
    </div>
    <div class="header-right">
      <!-- AI 状态指示 -->
      <span class="ai-badge" :class="{ online: aiOnline }" :title="aiOnline ? 'AI 在线' : 'AI 离线'">
        <span class="ai-dot"></span>AI
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const aiOnline = ref(true)
</script>

<style scoped>
.app-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px 8px; flex-shrink: 0;
  background: linear-gradient(180deg, rgba(255,255,255,.6), rgba(250,246,240,.4));
  backdrop-filter: blur(10px); border-bottom: 1px solid var(--border-light);
  z-index: 10;
}
.header-logo { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.logo-img-wrap { width: 34px; height: 34px; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0; border: 1px solid rgba(200,160,100,.25); }
.logo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.logo-text { display: flex; flex-direction: column; }
.logo-name { font-size: 16px; font-weight: 800; color: var(--text); letter-spacing: .03em; }
.logo-tag { font-size: 10px; color: var(--muted); letter-spacing: .04em; }
.header-right { display: flex; align-items: center; gap: 8px; }
.ai-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; color: var(--muted);
  padding: 4px 10px; border-radius: var(--radius-full);
  background: rgba(180,150,120,.1); transition: all var(--transition);
}
.ai-badge.online { color: var(--success); background: var(--success-soft); }
.ai-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); }
.ai-badge.online .ai-dot { background: var(--success); box-shadow: 0 0 6px rgba(74,154,110,.5); }
</style>
