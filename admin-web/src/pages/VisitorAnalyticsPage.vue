<template>
  <div class="va-root">
    <!-- Hero 区域 -->
    <div class="va-hero">
      <div class="va-hero-left">
        <h1 class="va-hero-title">游客行为分析</h1>
        <p class="va-hero-sub">
          基于 <strong>{{ dash?.totalVisitors || 777 }}</strong> 条真实游客数据
          · 覆盖灵山胜境、灵山大佛、禅意小镇·拈花湾
          <span v-if="lastUpdated" class="va-updated">· 更新于 {{ lastUpdated }}</span>
        </p>
      </div>
      <div class="va-hero-right">
        <div class="va-score-ring">
          <span class="va-score-num">{{ dash?.avgSatisfaction || '3.07' }}</span>
          <span class="va-score-label">平均满意度 / 5</span>
        </div>
      </div>
    </div>

    <!-- 加载骨架 -->
    <template v-if="loading">
      <div class="va-skeleton-row">
        <div v-for="n in 4" :key="n" class="va-skeleton-card"></div>
      </div>
      <div class="va-skeleton-chart"></div>
      <div class="va-skeleton-chart"></div>
    </template>

    <!-- 主体内容 -->
    <template v-else>
      <!-- KPI 概览 -->
      <div class="va-kpi-row">
        <div class="va-kpi-card" style="--kpi-color: var(--chart-1)">
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span class="kpi-val">{{ dash?.totalVisitors?.toLocaleString() || '777' }}</span>
          <span class="kpi-lbl">游客总数</span>
        </div>
        <div class="va-kpi-card" style="--kpi-color: var(--success)">
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>
          </div>
          <span class="kpi-val">{{ dash?.avgSatisfaction || '3.07' }}</span>
          <span class="kpi-lbl">平均满意度 / 5</span>
        </div>
        <div class="va-kpi-card" style="--kpi-color: var(--chart-4)">
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <span class="kpi-val">{{ dash?.spendingBreakdown?.[2]?.total?.toLocaleString() || '193,893' }}</span>
          <span class="kpi-lbl">¥ 最高消费项（购物）</span>
        </div>
        <div class="va-kpi-card" style="--kpi-color: var(--chart-5)">
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span class="kpi-val">{{ recs?.length || '0' }}</span>
          <span class="kpi-lbl">运营建议</span>
        </div>
      </div>

      <!-- 景区关注度 + 运营建议 -->
      <div class="va-sep"><span class="va-sep-dot"></span>景区关注度与运营建议</div>
      <div class="va-row-21">
        <div class="va-chart-box">
          <AttractionPopularityChart :data="attractions" />
        </div>
        <div class="va-rec-sidebar">
          <h4 class="va-rec-sidebar-title">运营建议</h4>
          <div class="va-rec-scroll">
            <div v-for="(rec, i) in recs" :key="i" class="va-rec-card" :class="'rec--' + (rec.level || 'info')">
              <span class="va-rec-icon">{{ rec.level === 'warning' ? '⚠' : rec.level === 'success' ? '✓' : '💡' }}</span>
              <div class="va-rec-body">
                <strong class="va-rec-title">{{ rec.title }}</strong>
                <p class="va-rec-desc">{{ rec.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 消费 & 游客画像 -->
      <div class="va-sep"><span class="va-sep-dot"></span>消费与游客画像</div>
      <div class="va-row-2">
        <SpendingBreakdownChart :data="spending" />
        <DemographicChart :data="demos" />
      </div>

      <!-- 趋势 & 满意度 -->
      <div class="va-sep"><span class="va-sep-dot"></span>趋势与满意度</div>
      <div class="va-row-2">
        <VisitorTrendChart :data="seasonal" />
        <SatisfactionDistChart :data="sentimentOverview?.distribution" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import AttractionPopularityChart from '@/components/visitor-charts/AttractionPopularityChart.vue'
import SpendingBreakdownChart from '@/components/visitor-charts/SpendingBreakdownChart.vue'
import DemographicChart from '@/components/visitor-charts/DemographicChart.vue'
import VisitorTrendChart from '@/components/visitor-charts/VisitorTrendChart.vue'
import SatisfactionDistChart from '@/components/visitor-charts/SatisfactionDistChart.vue'
import { useVisitorAnalytics } from '@/composables/useVisitorAnalytics'

const {
  dashboard, attractionAttention, spendingBreakdown,
  sentimentOverview, demographics, recommendations, seasonalTrend,
  loading, lastUpdated,
} = useVisitorAnalytics()

const dash = dashboard
const attractions = attractionAttention
const spending = spendingBreakdown
const demos = demographics
const recs = recommendations
const seasonal = seasonalTrend
</script>

<style scoped>
.va-root {
  padding: 0 24px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Hero ── */
.va-hero {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 32px 0 28px; gap: 24px; flex-wrap: wrap;
}
.va-hero-title {
  margin: 0 0 6px; font-size: 24px; font-weight: 800;
  color: var(--text); letter-spacing: .02em;
}
.va-hero-sub {
  margin: 0; font-size: 13px; color: var(--text-tertiary);
  max-width: 520px; line-height: 1.6;
}
.va-hero-sub strong { color: var(--accent); font-weight: 700; }
.va-updated { color: var(--text-tertiary); font-size: 11px; }

.va-score-ring {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 96px; height: 96px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(200,132,60,.1), rgba(212,160,96,.04));
  border: 3px solid var(--accent);
  box-shadow: 0 0 24px rgba(200,160,100,.12);
  transition: transform .3s;
}
.va-score-ring:hover { transform: scale(1.05); }
.va-score-num { font-size: 30px; font-weight: 800; color: var(--accent); line-height: 1; }
.va-score-label { font-size: 10px; color: var(--text-tertiary); margin-top: 3px; }

/* ── Skeleton ── */
.va-skeleton-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px;
}
.va-skeleton-card {
  height: 100px; border-radius: var(--radius);
  background: linear-gradient(90deg, var(--surface) 0%, var(--surface-hover) 50%, var(--surface) 100%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
.va-skeleton-chart {
  height: 280px; border-radius: var(--radius);
  background: linear-gradient(90deg, var(--surface) 0%, var(--surface-hover) 50%, var(--surface) 100%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
  margin-bottom: 24px;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── KPI ── */
.va-kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px;
}
.va-kpi-card {
  background: var(--card-bg); border: 1px solid var(--border-light);
  border-radius: var(--radius); padding: 18px 20px;
  box-shadow: var(--shadow-sm); transition: all var(--transition-slow);
  display: flex; flex-direction: column; gap: 6px;
  position: relative; overflow: hidden;
}
.va-kpi-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
  background: var(--kpi-color, var(--accent)); opacity: .6;
}
.va-kpi-card:hover {
  transform: translateY(-3px); box-shadow: var(--shadow-lg);
  border-color: rgba(200,160,100,.18);
}
.va-kpi-card:hover::before { opacity: 1; }
.kpi-icon-wrap {
  width: 34px; height: 34px; border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--kpi-color, var(--accent)) 10%, transparent);
  display: flex; align-items: center; justify-content: center;
  color: var(--kpi-color, var(--accent));
}
.kpi-val { font-size: 26px; font-weight: 800; color: var(--text); line-height: 1.1; }
.kpi-lbl { font-size: 11px; color: var(--text-tertiary); letter-spacing: .03em; }

/* ── Separator ── */
.va-sep {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 600; color: var(--text);
  margin-bottom: 16px; letter-spacing: .03em;
}
.va-sep-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 8px rgba(200,160,100,.5);
}

/* ── Grid ── */
.va-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
.va-row-21 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 28px; align-items: start; }
.va-chart-box {
  background: var(--card-bg); border: 1px solid var(--border-light);
  border-radius: var(--radius); box-shadow: var(--shadow-sm);
}

/* ── 运营建议侧边栏 ── */
.va-rec-sidebar {
  background: var(--card-bg); border: 1px solid var(--border-light);
  border-radius: var(--radius); box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; height: 280px;
}
.va-rec-sidebar-title {
  margin: 0; padding: 14px 16px 10px;
  font-size: 13px; font-weight: 600; color: var(--text);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}
.va-rec-scroll {
  flex: 1; overflow-y: auto; padding: 8px 12px 12px;
  display: flex; flex-direction: column; gap: 6px;
}
.va-rec-card {
  display: flex; gap: 10px; padding: 10px 12px;
  background: rgba(245,239,230,.4); border: 1px solid transparent;
  border-radius: var(--radius-sm); transition: all var(--transition);
}
.va-rec-card:hover {
  border-color: rgba(200,160,100,.15);
  background: var(--surface-hover);
}
.rec--warning { border-left: 3px solid var(--danger); }
.rec--info    { border-left: 3px solid var(--info); }
.rec--success { border-left: 3px solid var(--success); }
.va-rec-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; line-height: 1; }
.va-rec-body { min-width: 0; }
.va-rec-title { display: block; font-size: 12px; color: var(--text); margin-bottom: 2px; line-height: 1.35; }
.va-rec-desc { margin: 0; font-size: 11px; color: var(--text-secondary); line-height: 1.5; }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .va-kpi-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .va-row-2, .va-row-21 { grid-template-columns: 1fr; }
  .va-rec-sidebar { max-height: none; }
}
@media (max-width: 600px) {
  .va-root { padding: 0 14px 30px; }
  .va-hero { padding: 18px 0 14px; }
  .va-hero-title { font-size: 20px; }
  .va-score-ring { width: 76px; height: 76px; }
  .va-score-num { font-size: 24px; }
  .va-kpi-row { grid-template-columns: 1fr 1fr; gap: 10px; }
  .va-kpi-card { padding: 14px; }
  .kpi-val { font-size: 22px; }
}
</style>
