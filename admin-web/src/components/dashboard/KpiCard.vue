<template>
  <div class="kpi-card" :class="`kpi--${color}`">
    <div class="kpi-glow-bg"></div>
    <div class="kpi-accent"></div>
    <div class="kpi-top">
      <span class="kpi-icon" v-if="icon">{{ icon }}</span>
      <div class="kpi-trend" v-if="trend!==undefined">
        <span :class="trend>=0?'up':'down'">
          <svg v-if="trend>=0" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none"><polyline points="18 15 12 9 6 15"/></svg>
          <svg v-else viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="3" fill="none"><polyline points="6 9 12 15 18 9"/></svg>
          {{ trend>=0?'+':'' }}{{ trend }}%
        </span>
      </div>
    </div>
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value" ref="valueEl">{{ displayValue }}</div>
    <div class="kpi-sub" v-if="subText">{{ subText }}</div>
  </div>
</template>

<script setup lang="ts">
import {computed,ref,watch} from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  trend: { type: Number, default: undefined },
  icon: { type: String, default: '' },
  color: { type: String, default: 'blue' },
  subText: { type: String, default: '' },
})

const valueEl = ref<HTMLElement|null>(null)
const displayValue = computed(() => typeof props.value === 'number' ? props.value.toLocaleString() : props.value)

watch(() => props.value, () => {
  if (valueEl.value) {
    valueEl.value.classList.remove('updated')
    void valueEl.value.offsetWidth
    valueEl.value.classList.add('updated')
  }
})
</script>

<style scoped>
.kpi-card {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  padding: 18px 20px 18px 24px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-slow);
  cursor: default;
  overflow: hidden;
}
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-glow);
}
.kpi-card:hover .kpi-glow-bg { opacity: 1; }
.kpi-card:hover .kpi-accent { transform: scaleY(1.1); }

/* 左侧色条 */
.kpi-accent {
  position: absolute;
  left: 0; top: 14px; bottom: 14px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  transition: transform 0.3s;
}
.kpi--blue .kpi-accent   { background: linear-gradient(180deg, #8ab8d4, #5a9ab8); }
.kpi--green .kpi-accent  { background: linear-gradient(180deg, #5ea882, #4a9a6e); }
.kpi--amber .kpi-accent  { background: linear-gradient(180deg, #e8a840, #d49830); }
.kpi--purple .kpi-accent { background: linear-gradient(180deg, #b48cc8, #9a6ab0); }
.kpi--rose .kpi-accent   { background: linear-gradient(180deg, #d4644a, #c05040); }

/* 光晕 */
.kpi-glow-bg {
  position: absolute; inset: 0; pointer-events: none;
  opacity: 0; transition: opacity var(--transition-slow);
}
.kpi--blue .kpi-glow-bg   { background: radial-gradient(ellipse at 80% 20%, rgba(138,184,212,.08), transparent 70%); }
.kpi--green .kpi-glow-bg  { background: radial-gradient(ellipse at 80% 20%, rgba(94,168,130,.08), transparent 70%); }
.kpi--amber .kpi-glow-bg  { background: radial-gradient(ellipse at 80% 20%, rgba(232,168,64,.08), transparent 70%); }
.kpi--purple .kpi-glow-bg { background: radial-gradient(ellipse at 80% 20%, rgba(180,140,200,.08), transparent 70%); }
.kpi--rose .kpi-glow-bg   { background: radial-gradient(ellipse at 80% 20%, rgba(212,100,74,.08), transparent 70%); }

.kpi-top {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 8px; min-height: 20px;
}
.kpi-trend span {
  display: inline-flex; align-items: center; gap: 2px;
  font-weight: 700; font-size: 11px;
  padding: 2px 8px; border-radius: 10px;
}
.kpi-trend .up   { color: var(--success); background: var(--success-soft); }
.kpi-trend .down { color: var(--danger); background: var(--danger-soft); }

.kpi-label {
  font-size: 12px; color: var(--text-secondary);
  margin-bottom: 6px; letter-spacing: .03em;
  text-transform: uppercase; font-weight: 500;
}
.kpi-value {
  font-size: 34px; font-weight: 800; color: var(--text);
  line-height: 1.15; letter-spacing: -.02em;
}
.kpi-sub {
  font-size: 11px; color: var(--text-tertiary);
  margin-top: 8px; letter-spacing: .02em;
}
</style>
