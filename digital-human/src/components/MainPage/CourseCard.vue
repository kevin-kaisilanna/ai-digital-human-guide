<script setup lang="ts">
import { ref } from 'vue'
import UnityComponent from '@/components/UnityComponent.vue'
import UnityInteraction from '@/components/UnityInteraction.vue'

const showAssistant = ref(true)
const isCallBtnLoading = ref(false)

function unityCanvasHeight() { return Math.min(window.innerHeight * 0.6, 500) }
function unityCanvasWidth() { return Math.min(window.innerWidth * 0.9, 400) }
</script>

<template>
  <div class="portal-page">
    <div class="unity-area">
      <UnityComponent
        :initialUnityCanvasHeight="unityCanvasHeight()"
        :initialUnityCanvasWidth="unityCanvasWidth()"
      />
    </div>
    <UnityInteraction
      :showAssistant="showAssistant"
      :isCallBtnLoading="isCallBtnLoading"
    />
  </div>
</template>

<style scoped>
.portal-page {
  position: relative; width: 100%; min-height: 100vh;
  background: linear-gradient(180deg, #0d1f15 0%, #1a3a2a 60%, #2d5a3f 100%);
  overflow: hidden;
}
.unity-area {
  width: 100%; display: flex; justify-content: center; padding-top: 40px;
}
</style>
