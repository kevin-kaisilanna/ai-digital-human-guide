<template>
  <div class="app-shell">
    <AppHeader v-if="!isGuestRoute" />
    <main class="app-main">
      <router-view />
    </main>
    <BottomNav v-if="!isGuestRoute" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSessionTimeout } from '@/composables/useSessionTimeout'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'

const route = useRoute()
const isGuestRoute = computed(() => !!route.meta.guest)

// 非 guest 路由时启用会话超时检测
useSessionTimeout()
</script>

<style>
.app-shell {
  display: flex; flex-direction: column;
  height: 100vh; height: 100dvh;
  width: 100%; max-width: 480px; min-width: 0;
  margin: 0 auto;
  overflow-x: hidden;
  box-shadow: 0 0 60px rgba(120,90,50,.08);
}
.app-main {
  flex: 1 1 0%;
  display: flex; flex-direction: column;
  min-height: 0; min-width: 0;
}

/* 页面切换 */
.page-enter-active, .page-leave-active { transition: opacity .2s ease, transform .2s ease; }
.page-enter-from { opacity: 0; transform: translateX(20px); }
.page-leave-to   { opacity: 0; transform: translateX(-20px); }
</style>
