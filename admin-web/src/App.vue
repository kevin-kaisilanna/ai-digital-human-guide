<template>
  <!-- 游客端：全屏沉浸式，无侧边栏 -->
  <div v-if="isGuestRoute" class="app-guest">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>

  <!-- 管理后台：侧边栏 + 顶栏布局 -->
  <div v-else class="app-layout">
    <svg class="mountain-bg" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 200 L80 80 L160 120 L260 55 L360 100 L440 65 L540 110 L640 70 L740 105 L840 60 L940 95 L1060 50 L1160 90 L1260 55 L1360 85 L1440 60 L1440 200 Z" fill="rgba(190,160,130,.1)"/>
      <path d="M0 200 L100 110 L190 145 L300 85 L400 130 L510 95 L620 135 L730 100 L830 130 L930 95 L1040 125 L1150 90 L1250 120 L1350 85 L1440 110 L1440 200 Z" fill="rgba(170,140,110,.12)"/>
      <path d="M0 200 L60 140 L160 165 L270 125 L380 155 L490 130 L600 160 L710 138 L820 158 L930 135 L1050 155 L1160 132 L1260 150 L1360 128 L1440 145 L1440 200 Z" fill="rgba(150,120,95,.14)"/>
      <path d="M0 200 L40 160 L130 175 L240 150 L350 170 L460 155 L570 172 L680 158 L790 170 L900 156 L1010 168 L1120 155 L1230 165 L1340 152 L1440 162 L1440 200 Z" fill="rgba(130,100,80,.16)"/>
      <circle cx="220" cy="146" r="12" fill="rgba(90,130,100,.06)"/><circle cx="580" cy="150" r="15" fill="rgba(90,130,100,.05)"/>
      <circle cx="950" cy="142" r="10" fill="rgba(90,130,100,.06)"/><circle cx="1280" cy="148" r="13" fill="rgba(90,130,100,.05)"/>
    </svg>
    <Sidebar />
    <div class="main-area">
      <Header />
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'

const route = useRoute()

// 游客端路由：不需要侧边栏/顶栏的全屏页面
const guestRoutes = ['landing', 'scenic-tour', 'admin-login']
const isGuestRoute = computed(() => guestRoutes.includes(route.name as string))
</script>

<style>
/* 页面过渡 — 淡入 + 微上移 */
.fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  z-index: 1;
  margin-left: var(--sidebar-width);
}

/* 游客端全屏容器 */
.app-guest {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  inset: 0;
}
</style>
