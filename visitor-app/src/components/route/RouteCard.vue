<template>
  <div class="route-card card" @click="$emit('click')">
    <div class="rc-top">
      <div class="rc-preview">
        <slot name="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
        </slot>
      </div>
      <div class="rc-info">
        <h4 class="rc-name">{{ route.name }}</h4>
        <div class="rc-meta">
          <span>{{ route.spots }} 个景点</span>
          <span>{{ route.duration }}</span>
        </div>
        <p class="rc-reason">{{ route.reason }}</p>
      </div>
    </div>
    <div class="rc-footer">
      <BaseBadge v-if="route.tag" :variant="tagVariant(route.tag)">{{ tagLabel(route.tag) }}</BaseBadge>
      <span class="rc-arrow">查看详情 &rsaquo;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseBadge from '@/components/common/BaseBadge.vue'

defineProps<{ route: { id: string; name: string; icon?: string; spots: number; duration: string; reason: string; tag?: string } }>()
defineEmits<{ click: [] }>()

function tagVariant(tag: string): string {
  const m: Record<string, string> = { history: 'blue', nature: 'green', family: 'amber', photo: 'purple', food: 'gold' }
  return m[tag] ?? 'blue'
}

function tagLabel(tag: string): string {
  const m: Record<string, string> = { history: '历史人文', nature: '自然风光', family: '亲子游', photo: '摄影打卡', food: '美食体验' }
  return m[tag] ?? tag
}
</script>

<style scoped>
.route-card { padding: 14px 16px; cursor: pointer; transition: all var(--transition); }
.route-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.route-card:active { transform: scale(.98); }
.rc-top { display: flex; gap: 12px; }
.rc-preview {
  width: 52px; height: 52px; border-radius: var(--radius); display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
  background: rgba(200,160,100,.08); color: var(--accent);
}
.rc-info { flex: 1; min-width: 0; }
.rc-name { margin: 0 0 4px; font-size: 16px; font-weight: 700; }
.rc-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px; }
.rc-reason { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rc-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.rc-arrow { font-size: 13px; color: var(--accent); font-weight: 500; }
</style>
