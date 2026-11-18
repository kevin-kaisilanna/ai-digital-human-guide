<template>
  <div class="route-timeline">
    <div class="rt-header">
      <button class="btn btn--ghost btn--sm" @click="$emit('back')">&larr; 返回路线列表</button>
    </div>
    <h3 class="rt-title">{{ route.name }}</h3>
    <p class="rt-meta">{{ route.spots }} 个景点 &middot; {{ route.duration }}</p>
    <div class="timeline">
      <div class="tl-line"></div>
      <div v-for="(spot, i) in route.spots_list" :key="i" class="tl-item">
        <div class="tl-dot">{{ i + 1 }}</div>
        <div class="tl-content">
          <h4 class="tl-spot-name">{{ spot.name }}</h4>
          <p class="tl-spot-desc">{{ spot.summary }}</p>
          <span class="tl-spot-dur">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ spot.visit_time || '约30分钟' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  route: { name: string; spots: number; duration: string; spots_list: Array<{ name: string; summary: string; visit_time?: string }> }
}>()
defineEmits<{ back: [] }>()
</script>

<style scoped>
.route-timeline { padding: 4px 0; min-width: 0; overflow: hidden; }
.rt-header { margin-bottom: 8px; }
.rt-title { margin: 0 0 4px; font-size: 20px; font-weight: 800; color: var(--text); }
.rt-meta { margin: 0 0 16px; font-size: 13px; color: var(--muted); }
.timeline { position: relative; padding-left: 8px; }
.tl-line {
  position: absolute; left: 17px; top: 8px; bottom: 8px; width: 2px;
  background: linear-gradient(180deg, var(--accent), var(--accent-2), rgba(200,160,100,.1));
  border-radius: 1px;
}
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; min-width: 0; }
.tl-dot {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(200,160,100,.25); z-index: 1;
}
.tl-content { flex: 1; padding-top: 2px; min-width: 0; overflow: hidden; }
.tl-spot-name { margin: 0 0 4px; font-size: 15px; font-weight: 700; }
.tl-spot-desc { margin: 0 0 4px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; word-break: break-word; }
.tl-spot-dur { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-tertiary); }
</style>
