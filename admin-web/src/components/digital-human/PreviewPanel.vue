<template>
  <div class="preview-panel">
    <div class="preview-body">

      <!-- 模式 A：现代 + 蓝 + 短发 → Unity 3D -->
      <div v-if="isUnityMode" class="stage-box">
        <UnityComponent
          :initial-unity-canvas-height="480"
          :initial-unity-canvas-width="370"
        />
      </div>

      <!-- 模式 B：静态图片 -->
      <template v-else>
        <div v-if="loading" class="loading-placeholder">
          <span class="loading-spinner"></span>
          <span class="loading-text">加载中…</span>
        </div>
        <img
          v-show="!loading"
          :src="imgSrc"
          class="avatar-img"
          alt="数字人预览"
          @load="onImgLoad"
          @error="onImgError"
        />
      </template>

      <!-- 底部标签 -->
      <div class="info-overlay">
        <span class="info-chip">{{ infoText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UnityComponent from './UnityComponent.vue'

window.handleUnityTransmission = function (str: string) {
  console.log('[Unity→Admin]', str)
}

const props = defineProps({
  appear: { type: Object, default: () => ({ hair: '短发', hairColor: 'blue' }) },
  cloth: { type: Object, default: () => ({ style: '现代', color: '#c41e3a' }) },
})

const loading = ref(true)
const imgFailed = ref(false)

function onImgLoad()  { loading.value = false }
function onImgError() { loading.value = false; imgFailed.value = true }

const isUnityMode = computed(() => {
  return (
    props.cloth?.style === '现代' &&
    props.appear?.hairColor === 'blue' &&
    props.appear?.hair === '短发'
  )
})

const hairKeyMap: Record<string, string> = {
  '短发': 'short', '长发': 'long', '盘发': 'bun',
  '马尾': 'ponytail', '波浪': 'wave', '小马尾': 'short_ponytail',
}
const clothKeyMap: Record<string, string> = {
  '汉服': 'cloth_hanfu.jpg', '唐装': 'cloth_tang.jpg', '民族': 'cloth_minzu.jpg',
}

const isModern = computed(() => props.cloth?.style === '现代')

const imgSrc = computed(() => {
  if (isUnityMode.value) return ''
  if (isModern.value) {
    const color = props.appear?.hairColor ?? 'blue'
    const key = hairKeyMap[props.appear?.hair ?? '短发'] ?? 'short'
    const prefix = color === 'brown' ? 'hair_brown_' : 'hair_'
    return `/images/digital-human/${prefix}${key}.jpg`
  }
  const img = clothKeyMap[props.cloth?.style ?? '汉服']
  return img ? `/images/digital-human/${img}` : ''
})

const infoText = computed(() => {
  const hair = props.appear?.hair ?? '短发'
  const color = props.appear?.hairColor === 'brown' ? '棕' : '蓝'
  const cloth = props.cloth?.style ?? '现代'
  if (isModern.value) return `现代 · ${color}${hair}`
  return `${cloth}（固定造型）`
})
</script>

<style scoped>
.preview-panel {
  border-radius: var(--radius, 12px);
  overflow: hidden;
  border: 1px solid rgba(200, 160, 100, .18);
  position: relative;
}

.preview-body {
  width: 100%;
  min-height: 480px;
  overflow: hidden;
  position: relative;
  background: #f5f0e8;
}

.avatar-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.loading-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #f5f0e8;
  z-index: 5;
}
.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(200,160,100,.2);
  border-top-color: var(--accent, #c8a064);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
.loading-text {
  font-size: 13px;
  color: var(--text-tertiary);
}

.info-overlay {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}
.info-chip {
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, .50);
  backdrop-filter: blur(6px);
  color: rgba(255, 255, 255, .85);
  white-space: nowrap;
  font-weight: 500;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
