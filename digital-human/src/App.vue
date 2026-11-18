<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import UnityComponent from '@/components/UnityComponent.vue'
import UnityInteraction from '@/components/UnityInteraction.vue'

const route = useRoute()
const showAssistant = ref(true)
const isCallBtnLoading = ref(false)

// 窗口尺寸（模板中不能直接访问 window）
const winWidth = ref(window.innerWidth)
const winHeight = ref(window.innerHeight)

const onResize = () => {
  winWidth.value = window.innerWidth
  winHeight.value = window.innerHeight
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// 登录页不显示数字人
const isLoginPage = () => route.path === '/login'
</script>

<template>
  <div id="app-root">
    <!-- Unity 数字人常驻层（登录页以外） -->
    <div id="unity-layer" v-if="!isLoginPage()">
      <UnityComponent
        :initial-unity-canvas-height="winHeight"
        :initial-unity-canvas-width="winWidth"
      />
      <UnityInteraction
        :show-assistant="showAssistant"
        :is-call-btn-loading="isCallBtnLoading"
      />
    </div>

    <!-- 页面路由 -->
    <div id="page-layer" :class="{ 'overlay': !isLoginPage() }">
      <router-view />
    </div>

    <!-- 隐藏的摄像头 -->
    <video id="cameraVideo" style="display:none;" autoplay playsinline></video>
    <canvas id="cameraPhoto" style="display:none;" width="640" height="480"></canvas>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app, #app-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
}

#unity-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

#page-layer {
  position: relative;
  z-index: 10;
  pointer-events: none;
}

#page-layer.overlay > * {
  pointer-events: auto;
}
</style>
