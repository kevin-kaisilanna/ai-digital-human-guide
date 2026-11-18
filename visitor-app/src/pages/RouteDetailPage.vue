<template>
  <div class="detail-page">
    <!-- 返回 -->
    <button class="back-btn" @click="$router.back()">
      <span class="back-arrow">&larr;</span>
      <span>返回路线列表</span>
    </button>

    <template v-if="route">
      <!-- 标题区 -->
      <div class="header">
        <h2 class="title">{{ route.name }}</h2>
        <div class="badges">
          <span class="badge" :class="'badge--' + route.tag">{{ tagLabel(route.tag) }}</span>
          <span class="badge badge--time">{{ route.duration }}</span>
        </div>
      </div>

      <!-- 路线概览 -->
      <div class="card overview">
        <h3 class="sec-title">路线概览</h3>
        <div class="ov-row">
          <div class="ov-item">
            <span class="ov-val">{{ route.spots_count }}</span>
            <span class="ov-label">景点数量</span>
          </div>
          <div class="ov-item">
            <span class="ov-val">{{ route.duration }}</span>
            <span class="ov-label">预计时长</span>
          </div>
          <div class="ov-item ov-item--wide">
            <span class="ov-val-s">{{ route.suitable }}</span>
            <span class="ov-label">适合人群</span>
          </div>
        </div>
        <p class="ov-desc">{{ route.desc }}</p>
      </div>

      <!-- 游览顺序 -->
      <h3 class="sec-title sec-title--main">游览顺序</h3>
      <div class="timeline">
        <div class="tl-line"></div>
        <div v-for="(spot, i) in route.spots" :key="i" class="tl-item">
          <div class="tl-num">{{ i + 1 }}</div>
          <div class="tl-card card">
            <div class="tl-head">
              <h4 class="tl-name">{{ spot.name }}</h4>
              <span class="tl-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ spot.visit_time }}
              </span>
            </div>
            <p class="tl-desc">{{ spot.detail }}</p>
            <div class="tl-tips" v-if="spot.tips">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>{{ spot.tips }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部占位 -->
      <div class="bottom-spacer"></div>
    </template>

    <div v-else class="empty-state">
      <p>路线未找到</p>
      <button class="btn btn--outline" @click="$router.back()">返回</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { allRoutes, tagLabel } from '@/data/routes'

const route = useRoute()

const routeData = computed(() => {
  const id = route.params.id as string
  return allRoutes.find(r => r.id === id) || null
})
</script>

<style scoped>
.detail-page { padding: 16px 14px 60px; flex: 1; min-height: 0; overflow-y: auto; }

/* ── 返回 ── */
.back-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: none; font-size: 14px; font-weight: 600;
  color: var(--muted); cursor: pointer; font-family: inherit;
  padding: 6px 10px; margin-bottom: 12px; margin-left: -8px;
  border-radius: var(--radius-sm); transition: all var(--transition);
}
.back-btn:hover { color: var(--text); background: var(--surface-hover); }
.back-arrow { font-size: 16px; }

/* ── 标题 ── */
.header { margin-bottom: 16px; }
.title { margin: 0 0 8px; font-size: 21px; font-weight: 800; color: var(--text); line-height: 1.3; }
.badges { display: flex; gap: 6px; flex-wrap: wrap; }
.badge {
  font-size: 12px; font-weight: 700; padding: 4px 12px;
  border-radius: var(--radius-full); color: #fff;
}
.badge--history { background: #5a8aaa; }
.badge--nature  { background: #3a8a5e; }
.badge--family  { background: #b08028; }
.badge--photo   { background: #8a6aaa; }
.badge--food    { background: #a07840; }
.badge--time { background: var(--primary-soft); color: var(--text); }

/* ── 路线概览 ── */
.sec-title {
  margin: 0 0 12px; font-size: 15px; font-weight: 700; color: var(--text);
}
.sec-title--main { margin: 20px 0 14px; font-size: 16px; }
.overview { padding: 16px; margin-bottom: 4px; }
.ov-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.ov-item {
  flex: 1; min-width: 80px; text-align: center; padding: 12px 6px;
  background: var(--primary-soft); border-radius: var(--radius-sm);
}
.ov-item--wide { flex: 3; min-width: 120px; }
.ov-val {
  display: block; font-size: 22px; font-weight: 800; color: var(--accent); line-height: 1.2;
}
.ov-val-s {
  display: block; font-size: 13px; font-weight: 700; color: var(--accent); line-height: 1.4;
}
.ov-label { display: block; font-size: 11px; color: var(--muted); margin-top: 2px; text-transform: uppercase; letter-spacing: .05em; }
.ov-desc { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; }

/* ── 时间线 ── */
.timeline { position: relative; }
.tl-line {
  position: absolute; left: 23px; top: 8px; bottom: 8px;
  width: 2px; background: linear-gradient(180deg, var(--accent), var(--accent-2), rgba(200,160,100,.06));
  border-radius: 1px;
}
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff; font-size: 16px; font-weight: 700; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 12px rgba(200,160,100,.35);
}
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); word-break: break-all; }
.tl-time {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: 12px; color: var(--accent); font-weight: 600;
  background: var(--primary-soft); padding: 3px 8px; border-radius: var(--radius-full);
  white-space: nowrap;
}
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.7; word-break: break-word; }
.tl-tips {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 12px; color: var(--muted); line-height: 1.6;
  background: rgba(200,160,100,.04); padding: 8px 10px;
  border-radius: var(--radius-sm); border-left: 3px solid var(--accent-2);
}
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: var(--accent); }

.bottom-spacer { height: 20px; }

.empty-state { text-align: center; padding: 80px 0; color: var(--muted); }
.empty-state p { font-size: 18px; margin: 0 0 16px; }
</style>
