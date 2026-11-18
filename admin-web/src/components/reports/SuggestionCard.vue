<template>
  <div class="suggestion-card" :class="`suggestion--${variant}`">
    <div class="suggestion-icon" :class="`suggestion-icon--${variant}`">
      <svg v-if="variant==='warning'" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <svg v-else-if="variant==='info'" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
    </div>
    <div class="suggestion-content">
      <div class="suggestion-title">{{ title }}</div>
      <div class="suggestion-desc">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String as () => 'warning' | 'info' | 'success',
    default: 'info',
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<style scoped>
.suggestion-card {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius);
  border: 1px solid;
  transition: transform var(--transition);
}
.suggestion-card:hover { transform: translateY(-2px); }

.suggestion--warning { background: rgba(245, 158, 11, 0.06); border-color: rgba(245, 158, 11, 0.2); }
.suggestion--info    { background: rgba(56, 189, 248, 0.06);  border-color: rgba(56, 189, 248, 0.2); }
.suggestion--success { background: rgba(16, 185, 129, 0.06); border-color: rgba(16, 185, 129, 0.2); }

.suggestion-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.suggestion-icon--warning { background: rgba(245,158,11,0.12); color: #d97706; }
.suggestion-icon--info    { background: rgba(56,189,248,0.12); color: #0284c7; }
.suggestion-icon--success { background: rgba(16,185,129,0.12); color: #059669; }
.suggestion-title { font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 4px; }
.suggestion-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
</style>
