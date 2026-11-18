<template>
  <div class="lip-sync-overlay" v-if="visemes.length">
    <div class="ls-label">👄 口型同步</div>
    <div class="ls-timeline">
      <span
        v-for="(v, i) in visemes"
        :key="i"
        class="ls-marker"
        :style="{ left: `${(v.time / totalTime) * 100}%` }"
        :title="`${v.viseme} @ ${v.time.toFixed(1)}s`"
      ></span>
    </div>
    <div class="ls-current">当前嘴型：<strong>{{ currentViseme }}</strong></div>
  </div>
  <div v-else class="lip-sync-placeholder">
    <span class="ph-icon">👄</span>
    <span class="ph-text">口型数据待 TTS 生成</span>
    <span class="ph-hint">AI 语音合成后将自动驱动嘴型</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visemes: Array<{ time: number; viseme: string }>
  currentTime?: number
}>()

const totalTime = computed(() => {
  if (!props.visemes.length) return 1
  return props.visemes.at(-1)!.time || 1
})

const currentViseme = computed(() => {
  if (!props.currentTime || !props.visemes.length) return '—'
  const t = props.currentTime
  for (let i = props.visemes.length - 1; i >= 0; i--) {
    if (props.visemes[i].time <= t) return props.visemes[i].viseme
  }
  return props.visemes[0].viseme
})
</script>

<style scoped>
.lip-sync-overlay { padding: 10px 0; }
.ls-label { font-size: 12px; color: var(--accent); font-weight: 600; margin-bottom: 6px; }
.ls-timeline {
  position: relative; height: 20px; background: rgba(180,150,120,.1);
  border-radius: 4px; overflow: hidden; margin-bottom: 6px;
}
.ls-marker {
  position: absolute; top: 2px; width: 3px; height: 16px;
  background: var(--accent); border-radius: 2px; transform: translateX(-50%);
  box-shadow: 0 0 4px rgba(200,160,100,.4);
}
.ls-current { font-size: 12px; color: var(--muted); }
.lip-sync-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 16px 0; color: var(--text-tertiary); text-align: center;
}
.ph-icon { font-size: 24px; }
.ph-text { font-size: 13px; }
.ph-hint { font-size: 11px; }
</style>
