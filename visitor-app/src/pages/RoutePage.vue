<template>
  <div class="route-page">
    <div class="page-hero">
      <h2>路线推荐</h2>
      <p class="hero-sub">基于灵山胜境数据，为您规划最佳游览路线</p>
    </div>

    <InterestTags v-model="activeTag" />

    <div class="route-content" v-if="!loading">
      <button
        v-for="r in filteredRoutes"
        :key="r.id"
        class="route-btn card"
        @click="$router.push('/route/' + r.tag)"
      >
        <div class="rb-top">
          <div class="rb-icon" :class="'rb-icon--' + r.tag">
            <svg v-if="r.tag === 'history'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <svg v-else-if="r.tag === 'nature'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 14c1.7 0 3-1.3 3-3 0-4-3-8-8-8S4 7 4 11c0 1.7 1.3 3 3 3"/><path d="M7 14c-1.7 0-3 1.3-3 3s1.3 3 3 3h10c1.7 0 3-1.3 3-3s-1.3-3-3-3"/><path d="M12 11v10"/><path d="M8 14l4-4 4 4"/></svg>
            <svg v-else-if="r.tag === 'family'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="5" r="3"/><path d="M5 14c0-4 3-6 7-6s7 2 7 6"/><path d="M8 14v7"/><path d="M16 14v7"/></svg>
            <svg v-else-if="r.tag === 'unofficial'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7"/><path d="M9 20a7 7 0 0 1-4-6.3c0-2.4 1.2-4.5 3-5.7"/></svg>
            <svg v-else-if="r.tag === 'bus'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 23 19 8 19 1 19"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <svg v-else-if="r.tag === 'peak-avoid'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <svg v-else-if="r.tag === 'half-day'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
            <svg v-else-if="r.tag === 'two-day'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
          </div>
          <div class="rb-info">
            <h4 class="rb-name">{{ r.name }}</h4>
            <div class="rb-meta">
              <span>{{ r.spots_count }} 个景点</span>
              <span class="meta-sep">&middot;</span>
              <span>{{ r.duration }}</span>
              <span class="meta-sep">&middot;</span>
              <span>{{ r.suitable }}</span>
            </div>
            <p class="rb-desc">{{ r.desc }}</p>
          </div>
        </div>
        <div class="rb-footer">
          <span class="rb-tag" :class="'rb-tag--' + r.tag">{{ tagLabel(r.tag) }}</span>
          <span class="rb-arrow">&rsaquo;</span>
        </div>
      </button>

      <div v-if="filteredRoutes.length === 0" class="empty-routes">
        <p>该分类暂无推荐路线</p>
      </div>
    </div>
    <div v-else class="loading-wrap"><LoadingSpinner text="加载路线中&hellip;"/></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import InterestTags from '@/components/route/InterestTags.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { allRoutes, tagLabel } from '@/data/routes'

const activeTag = ref('all')
const loading = ref(false)

const filteredRoutes = computed(() => {
  if (activeTag.value === 'all') return allRoutes
  return allRoutes.filter(r => r.tag === activeTag.value)
})

onMounted(() => { loading.value = false })
</script>

<style scoped>
.route-page {
  padding: 16px 16px 60px;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.page-hero { margin-bottom: 10px; }
.page-hero h2 { margin: 0; font-size: 20px; font-weight: 800; }
.hero-sub { margin: 4px 0 0; font-size: 12px; color: var(--text-tertiary); }
.route-content { display: flex; flex-direction: column; gap: 8px; padding-top: 6px; }
.loading-wrap { padding: 40px 0; }
.empty-routes { display: flex; justify-content: center; padding: 40px 0; color: var(--muted); font-size: 14px; }

.route-btn {
  display: flex; flex-direction: column; gap: 8px;
  width: 100%; padding: 14px; text-align: left;
  border: 1px solid var(--border-light); border-radius: var(--radius);
  background: var(--card-bg); cursor: pointer; font-family: inherit;
  box-shadow: var(--shadow-sm); transition: all var(--transition);
  box-sizing: border-box;
}
.route-btn:active { transform: scale(.985); }

.rb-top { display: flex; gap: 12px; }
.rb-icon {
  width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.rb-icon--history { background: rgba(106,154,184,.15); color: #5a8aaa; }
.rb-icon--nature  { background: rgba(74,154,110,.12); color: #3a8a5e; }
.rb-icon--family  { background: rgba(212,152,48,.14); color: #b08028; }
.rb-icon--unofficial { background: rgba(160,130,190,.15); color: #8a6aaa; }
.rb-icon--bus     { background: rgba(200,160,100,.18); color: #c08040; }
.rb-icon--peak-avoid { background: rgba(210,100,100,.15); color: #c04848; }
.rb-icon--half-day   { background: rgba(42,157,143,.15); color: #2a9d8f; }
.rb-icon--two-day    { background: rgba(124,58,237,.15); color: #7c3aed; }

.rb-info { flex: 1; min-width: 0; overflow: hidden; }
.rb-name { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: var(--text); }
.rb-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-tertiary); margin-bottom: 6px; flex-wrap: wrap; }
.meta-sep { opacity: .4; }
.rb-desc { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.5; word-break: break-word;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.rb-footer { display: flex; justify-content: space-between; align-items: center; }
.rb-tag {
  font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: var(--radius-full);
  background: rgba(180,150,120,.08); color: var(--muted);
}
.rb-tag--history { background: rgba(106,154,184,.12); color: #5a8aaa; }
.rb-tag--nature  { background: rgba(74,154,110,.1);  color: #3a8a5e; }
.rb-tag--family  { background: rgba(212,152,48,.12); color: #b08028; }
.rb-tag--unofficial { background: rgba(160,130,190,.12); color: #8a6aaa; }
.rb-tag--bus     { background: rgba(200,160,100,.15); color: #c08040; }
.rb-tag--peak-avoid { background: rgba(210,100,100,.12); color: #c04848; }
.rb-tag--half-day { background: rgba(42,157,143,.12); color: #2a9d8f; }
.rb-tag--two-day  { background: rgba(124,58,237,.12); color: #7c3aed; }
.rb-tag--peak-avoid { background: rgba(210,100,100,.15); color: #c04848; }

.rb-arrow { font-size: 24px; color: var(--muted); font-weight: 300; }
</style>
