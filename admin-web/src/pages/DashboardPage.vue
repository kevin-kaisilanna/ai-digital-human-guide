<template>
  <div class="dash-root">
    <!-- Hero -->
    <section class="dash-hero">
      <div class="dash-hero-left">
        <div class="dash-hero-chip">
          <span class="hero-chip-dot"></span>
          {{ reportMeta?.dataSource || '灵山胜境 · 拈花湾' }}
        </div>
        <h1 class="dash-hero-title">灵山胜境 · 拈花湾</h1>
        <p class="dash-hero-desc">
          基于 <strong>{{ reportMeta?.totalRecords?.toLocaleString() || '777' }}</strong> 条真实游客数据
          · 覆盖 {{ reportMeta?.attractions?.join('、') || '灵山大佛、灵山胜境、禅意小镇·拈花湾' }}
          · 平均满意度 <strong>{{ dashData?.avgSatisfaction || '3.07' }} / 5</strong>
          <router-link to="/visitor-analytics" class="dash-hero-link">完整行为分析 →</router-link>
          <span v-if="lastUpdated" class="dash-updated">· 更新于 {{ lastUpdated }}</span>
        </p>
      </div>
      <div class="dash-hero-right">
        <div class="hero-stat">
          <div class="hero-stat-val">{{ dashData?.totalVisitors?.toLocaleString() || '777' }}</div>
          <div class="hero-stat-lbl">灵山/拈花湾游客</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val accent">{{ dashData?.avgSatisfaction || '3.07' }}</div>
          <div class="hero-stat-lbl">平均满意度 /5</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val gold">&yen;{{ totalRevenue }}</div>
          <div class="hero-stat-lbl">总收入</div>
        </div>
      </div>
    </section>

    <!-- KPI 卡片 -->
    <section class="dash-kpi">
      <KpiCard label="游客总数" :value="dashData?.totalVisitors || 777" icon="👥" color="blue" subText="灵山·拈花湾全年" />
      <KpiCard label="平均停留时长" :value="`${dashData?.avgStayDuration || 4.0}h`" icon="⏱" color="green" subText="人均游览时间" />
      <KpiCard label="人均消费" :value="`¥${dashData?.avgTotalCost || 916}`" icon="💰" color="amber" subText="门票+餐饮+购物+交通+娱乐" />
      <KpiCard label="游客满意度" :value="`${(dashData?.avgSatisfaction * 20 || 61.4).toFixed(1)}%`" icon="⭐" color="purple" :subText="`5分制均分 ${dashData?.avgSatisfaction || '3.07'}`" />
      <KpiCard label="样本覆盖率" :value="`${((reportMeta?.uniqueTourists / reportMeta?.totalRecords * 100) || 97.3).toFixed(1)}%`" icon="📊" color="rose" :subText="`${reportMeta?.uniqueTourists || 756} 位独立游客`" />
    </section>

    <!-- 图表行：月度趋势 + 满意度趋势 + 景点热度 -->
    <section class="dash-row-3">
      <div class="chart-box">
        <div class="chart-header">
          <h3>月度游客量 · 满意度双轴</h3>
          <span class="chart-badge">12个月</span>
        </div>
        <div class="chart-body" style="height:260px"><canvas ref="monthlyCanvas"></canvas></div>
      </div>
      <div class="chart-box">
        <div class="chart-header">
          <h3>满意度周趋势</h3>
          <span class="chart-live"><span class="live-dot"></span>近14周</span>
        </div>
        <div class="chart-body" style="height:260px"><canvas ref="satCanvas"></canvas></div>
      </div>
      <div class="chart-box">
        <div class="chart-header">
          <h3>景点游客热度</h3>
          <span class="chart-badge">Top 8</span>
        </div>
        <div class="chart-body" style="height:260px"><canvas ref="spotCanvas"></canvas></div>
      </div>
    </section>

    <!-- 图表行：消费构成 + 满意度分布 + 游客画像 -->
    <section class="dash-row-2">
      <div class="chart-box">
        <div class="chart-header">
          <h3>消费构成</h3>
          <span class="chart-live"><span class="live-dot"></span>数据驱动</span>
        </div>
        <div class="chart-body" style="height:300px"><canvas ref="spendCanvas"></canvas></div>
        <div class="chart-center-stat">
          <span class="ccs-val">&yen;{{ totalRevenue }}</span>
          <span class="ccs-lbl">总收入</span>
        </div>
      </div>
      <div class="chart-box">
        <div class="chart-header"><h3>满意度分布 · 游客画像</h3></div>
        <div class="dash-demographic">
          <div class="demo-row" v-for="d in satisfactionDist" :key="d.rating">
            <span class="demo-label">{{ d.rating }} 分</span>
            <div class="demo-bar-wrap">
              <div class="demo-bar" :style="{ width: (d.count / (dashData?.totalVisitors || 777) * 100).toFixed(1) + '%', background: d.color }"></div>
            </div>
            <span class="demo-count">{{ d.count }}</span>
            <span class="demo-pct">{{ (d.count / (dashData?.totalVisitors || 777) * 100).toFixed(1) }}%</span>
          </div>
          <div class="demo-summary">
            <div class="demo-avg">
              <span class="demo-avg-label">平均满意度</span>
              <span class="demo-avg-val">{{ dashData?.avgSatisfaction || '3.07' }}</span>
              <span class="demo-avg-unit">/ 5</span>
            </div>
            <div class="demo-ages">
              <span class="demo-ages-label">主要客群</span>
              <span class="demo-ages-val">{{ topAgeGroups }}</span>
            </div>
            <div class="demo-gender" v-if="dashData?.demographics?.genderSplit">
              <span class="demo-ages-label">男女比例</span>
              <span class="demo-ages-val">{{ dashData.demographics.genderSplit['男'] || 401 }} : {{ dashData.demographics.genderSplit['女'] || 376 }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Chart, registerables, type ScriptableContext } from 'chart.js'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { safeFetch } from '@/services/data-merge'
import { getBaseURL } from '@/services/api-client'

Chart.register(...registerables)

// ── 调色板 ──
const C = {
  gold: '#c8843c', goldLight: 'rgba(200,132,60,0.25)', goldTrans: 'rgba(200,132,60,0.06)',
  green: '#5a9e80', greenLight: 'rgba(90,158,128,0.25)', greenTrans: 'rgba(90,158,128,0.05)',
  amber: '#d49830', rose: '#c06840', blue: '#6a9ab8', purple: '#9a6ab0',
  warm1: '#c8843c', warm2: '#d4a060', warm3: '#c89048', warm4: '#e0a040',
  gray: '#8b7558', grayLight: 'rgba(180,150,120,0.12)',
}

// ── Canvas refs ──
const monthlyCanvas = ref<HTMLCanvasElement | null>(null)
const satCanvas = ref<HTMLCanvasElement | null>(null)
const spotCanvas = ref<HTMLCanvasElement | null>(null)
const spendCanvas = ref<HTMLCanvasElement | null>(null)
let charts: (Chart | null)[] = [null, null, null, null]

// ── 数据 ──
const reportMeta = ref<any>(null)
const dashData = ref<any>(null)
const satisfactionDist = ref<Array<{ rating: number; count: number; color: string }>>([])
const distColors = ['#c05040', '#d49830', '#d4a060', '#5a9e80']
const lastUpdated = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

const totalRevenue = computed(() => {
  const t = dashData.value?.totalRevenue || 711705
  return t >= 10000 ? (t / 10000).toFixed(1) + '万' : t.toLocaleString()
})
const topAgeGroups = computed(() => {
  const ages = dashData.value?.demographics?.ageGroups
  if (!ages?.length) return '31-45岁、19-30岁'
  return [...ages].sort((a: any, b: any) => b.count - a.count).slice(0, 2).map((a: any) => a.group).join('、')
})

// ── 工具函数 ──
function destroyAll() { charts.forEach(c => { try { c?.destroy() } catch { /* ignore */ } }) }

function grad(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  const g = ctx.createLinearGradient(0, 0, 0, 280)
  g.addColorStop(0, c1); g.addColorStop(1, c2); return g
}

// ═══════════ 图表 1: 月度游客量 · 满意度双轴 ═══════════
function buildMonthlyChart(labels: string[], counts: number[], sats: number[]) {
  const canvas = monthlyCanvas.value; if (!canvas) return
  const ctx = canvas.getContext('2d')!; if (charts[0]) charts[0]!.destroy()
  charts[0] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '游客数', data: counts, yAxisID: 'y', order: 2,
          backgroundColor: (c: ScriptableContext<'bar'>) => grad(c.chart.ctx, 'rgba(200,132,60,0.4)', 'rgba(200,132,60,0.08)'),
          borderColor: C.gold, borderWidth: 1.5, borderRadius: 6,
        },
        {
          label: '满意度', data: sats, type: 'line', yAxisID: 'y1', order: 1,
          borderColor: C.green, borderWidth: 2.5, pointRadius: 5,
          pointBackgroundColor: '#fff', pointBorderColor: C.green, pointBorderWidth: 2,
          pointHoverRadius: 8, tension: 0.45, fill: true,
          backgroundColor: (c: ScriptableContext<'line'>) => grad(c.chart.ctx, 'rgba(90,158,128,0.15)', 'rgba(90,158,128,0)'),
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: C.gray, usePointStyle: true, pointStyleWidth: 8, padding: 24, font: { size: 11 } } },
        tooltip: {
          backgroundColor: 'rgba(40,28,15,0.9)', titleColor: '#fdf8f0', bodyColor: '#fdf8f0',
          cornerRadius: 8, padding: 12, displayColors: true,
          callbacks: { label: (ctx: any) => ctx.dataset.yAxisID === 'y1' ? `满意度: ${ctx.raw.toFixed(2)}` : `游客: ${ctx.raw} 人` },
        },
      },
      scales: {
        y: { type: 'linear', position: 'left', beginAtZero: true, grid: { color: C.grayLight }, ticks: { color: C.gray, callback: (v: any) => v + '人' } },
        y1: { type: 'linear', position: 'right', min: 2.5, max: 3.5, grid: { display: false }, ticks: { color: C.gray, callback: (v: any) => v.toFixed(1) } },
        x: { grid: { display: false }, ticks: { color: C.gray } },
      },
    },
  })
}

// ═══════════ 图表 2: 满意度周趋势 ═══════════
function buildSatChart(labels: string[], values: number[]) {
  const canvas = satCanvas.value; if (!canvas) return
  const ctx = canvas.getContext('2d')!; if (charts[1]) charts[1]!.destroy()
  charts[1] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '满意度指数', data: values,
        borderColor: C.green, borderWidth: 2.5, pointRadius: 4,
        pointBackgroundColor: (c: ScriptableContext<'line'>) => {
          const v = (c.raw as number) || 0; return v > 60 ? C.green : v > 50 ? C.amber : C.rose
        },
        pointBorderColor: '#fff', pointBorderWidth: 2, pointHoverRadius: 7,
        tension: 0.4, fill: true,
        backgroundColor: (c: ScriptableContext<'line'>) => grad(c.chart.ctx, 'rgba(90,158,128,0.18)', 'rgba(90,158,128,0)'),
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(40,28,15,0.9)', titleColor: '#fdf8f0', bodyColor: '#fdf8f0',
          cornerRadius: 8, padding: 12,
          callbacks: { label: (ctx: any) => `满意度指数: ${ctx.raw}` },
        },
      },
      scales: {
        y: { min: 30, max: 80, grid: { color: C.grayLight }, ticks: { color: C.gray, callback: (v: any) => v + '%' } },
        x: { grid: { display: false }, ticks: { color: C.gray, maxTicksLimit: 8 } },
      },
    },
  })
}

// ═══════════ 图表 3: 景点热度排行 ═══════════
function buildSpotChart(labels: string[], values: number[]) {
  const canvas = spotCanvas.value; if (!canvas) return
  const ctx = canvas.getContext('2d')!; if (charts[2]) charts[2]!.destroy()
  const palette = [C.gold, C.warm2, C.warm3, C.warm4, C.amber, C.green, C.blue, C.purple]
  charts[2] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data: values, backgroundColor: palette.slice(0, labels.length), borderRadius: 6, borderSkipped: false }] },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(40,28,15,0.9)', titleColor: '#fdf8f0', bodyColor: '#fdf8f0',
          cornerRadius: 8, padding: 12,
          callbacks: { label: (ctx: any) => `游客: ${ctx.raw} 人` },
        },
      },
      scales: {
        x: { beginAtZero: true, grid: { color: C.grayLight }, ticks: { color: C.gray, callback: (v: any) => v + '人' } },
        y: { grid: { display: false }, ticks: { color: C.gray, font: { weight: '600' } } },
      },
    },
  })
}

// ═══════════ 图表 4: 消费构成 ═══════════
function buildSpendChart(labels: string[], values: number[]) {
  const canvas = spendCanvas.value; if (!canvas) return
  const ctx = canvas.getContext('2d')!; if (charts[3]) charts[3]!.destroy()
  const palette = [C.gold, C.warm2, C.green, C.amber, C.rose]
  const total = values.reduce((a, b) => a + b, 0)
  charts[3] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: palette, borderColor: '#fffdf8', borderWidth: 3, hoverBorderWidth: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '55%',
      plugins: {
        legend: { position: 'bottom', labels: { color: C.gray, usePointStyle: true, pointStyleWidth: 10, padding: 20, font: { size: 12 } } },
        tooltip: {
          backgroundColor: 'rgba(40,28,15,0.9)', titleColor: '#fdf8f0', bodyColor: '#fdf8f0',
          cornerRadius: 8, padding: 12,
          callbacks: {
            label: (ctx: any) => {
              const pct = ((ctx.raw / total) * 100).toFixed(1)
              return `${ctx.label}: ¥${ctx.raw.toLocaleString()} (${pct}%)`
            },
          },
        },
      },
    },
  })
}

// ═══════════ 数据加载 ═══════════
async function loadData() {
  try {
    const res = await fetch('/data/visitor-analysis-report.json', { cache: 'no-cache' })
    if (!res.ok) throw new Error('加载失败')
    const r = await res.json()
    reportMeta.value = r.meta
    const d = r.dashboard; dashData.value = d
    lastUpdated.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    // 满意度分布
    if (d?.satisfactionDistribution?.length) {
      satisfactionDist.value = d.satisfactionDistribution.map((s: any, i: number) => ({ rating: s.rating, count: s.count, color: distColors[i] || C.gray }))
    }

    // 图表 1: 月度趋势
    if (r.temporal?.monthlyTrend?.length) {
      const mt = r.temporal.monthlyTrend
      buildMonthlyChart(mt.map((m: any) => m.period), mt.map((m: any) => m.count), mt.map((m: any) => m.avgSatisfaction))
    }

    // 图表 2: 满意度周趋势
    if (r.sentiment?.dailyTrend?.length) {
      const daily = r.sentiment.dailyTrend
      const weeks = new Map<string, number[]>()
      for (const d of daily) { const date = new Date(d.date_str); const wk = `${date.getFullYear()}-W${String(Math.ceil(date.getDate() / 7)).padStart(2, '0')}`; if (!weeks.has(wk)) weeks.set(wk, []); weeks.get(wk)!.push(d.avgSatisfaction) }
      const entries = Array.from(weeks.entries()).slice(-14)
      buildSatChart(entries.map(([w]) => w), entries.map(([, s]) => Math.round(s.reduce((a, b) => a + b, 0) / s.length * 20)))
    }

    // 图表 3: 景点热度
    if (r.attention?.topAttractions?.length) {
      const spots = r.attention.topAttractions.slice(0, 8)
      buildSpotChart(spots.map((a: any) => a.attraction_name), spots.map((a: any) => a.visitorCount))
    } else {
      buildSpotChart(['灵山大佛', '禅意小镇·拈花湾', '灵山胜境'], [286, 255, 236])
    }

    // 图表 4: 消费构成
    if (d?.spendingBreakdown?.length) {
      buildSpendChart(d.spendingBreakdown.map((s: any) => s.category), d.spendingBreakdown.map((s: any) => s.total))
    } else {
      buildSpendChart(['门票', '餐饮', '购物', '交通', '娱乐'], [143442, 187288, 193893, 103895, 83186])
    }
  } catch {
    dashData.value = { totalVisitors: 777, avgSatisfaction: 3.07, avgStayDuration: 4.0, avgTotalCost: 916 }
    satisfactionDist.value = [{ rating: 2, count: 134, color: '#c05040' }, { rating: 3, count: 469, color: '#d49830' }, { rating: 4, count: 163, color: '#d4a060' }, { rating: 5, count: 11, color: '#5a9e80' }]
    buildMonthlyChart(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], [23, 19, 59, 70, 90, 63, 73, 88, 107, 50, 49, 86], [3.04, 2.95, 3.05, 2.99, 3.09, 3.02, 3.11, 3.08, 2.97, 3.18, 3.24, 3.08])
    buildSatChart(['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14'], [55, 58, 53, 61, 64, 62, 67, 70, 68, 72, 69, 74, 71, 75])
    buildSpotChart(['灵山大佛', '禅意小镇·拈花湾', '灵山胜境'], [286, 255, 236])
    buildSpendChart(['门票', '餐饮', '购物', '交通', '娱乐'], [143442, 187288, 193893, 103895, 83186])
  }
}

onMounted(() => { loadData(); pollTimer = setInterval(loadData, 30_000) })
onBeforeUnmount(() => { destroyAll(); if (pollTimer) { clearInterval(pollTimer); pollTimer = null } })
</script>

<style scoped>
.dash-root { padding: 4px 0 40px; max-width: 1380px; margin: 0 auto; }

/* Hero */
.dash-hero { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; margin-bottom: 24px; padding: 28px 32px; border-radius: var(--radius-xl); background: linear-gradient(135deg, rgba(255,255,255,.55), rgba(255,252,247,.48)); border: 1px solid rgba(180,150,120,.14); box-shadow: 0 2px 24px rgba(120,90,50,.05); position: relative; overflow: hidden; }
.dash-hero::before { content: ''; position: absolute; top: -30%; right: -15%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(220,195,160,.15), transparent 70%); border-radius: 50%; pointer-events: none; }
.dash-hero-chip { display: inline-flex; align-items: center; gap: 8px; padding: 3px 14px; border-radius: 14px; border: 1px solid rgba(200,150,100,.25); font-size: 10px; letter-spacing: .1em; color: var(--accent); font-weight: 600; margin-bottom: 10px; background: rgba(200,150,100,.06); }
.hero-chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 6px rgba(200,160,100,.5); }
.dash-hero-title { margin: 0 0 8px; font-size: 28px; font-weight: 800; letter-spacing: .03em; color: var(--text); }
.dash-hero-desc { margin: 0; font-size: 13px; color: var(--text-secondary); }
.dash-hero-desc strong { color: var(--text); }
.dash-hero-link { color: var(--accent); text-decoration: none; font-weight: 600; margin-left: 10px; font-size: 12px; transition: color .2s; }
.dash-hero-link:hover { text-decoration: underline; }
.dash-updated { color: var(--text-tertiary); font-size: 11px; margin-left: 6px; }
.dash-hero-right { display: flex; gap: 28px; }
.hero-stat { display: flex; flex-direction: column; align-items: center; }
.hero-stat-val { font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -.01em; }
.hero-stat-val.accent { color: var(--accent); }
.hero-stat-val.gold { color: #b08040; }
.hero-stat-lbl { font-size: 10px; color: var(--text-tertiary); letter-spacing: .06em; text-transform: uppercase; }

/* KPI */
.dash-kpi { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 20px; }

/* Rows */
.dash-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }
.dash-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }

.chart-badge { font-size: 10px; padding: 3px 10px; border-radius: var(--radius-full); background: rgba(200,160,100,.12); color: var(--accent); font-weight: 600; border: 1px solid rgba(200,150,100,.15); letter-spacing: .04em; }
.chart-live { display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--info); letter-spacing: .04em; font-weight: 600; }
.live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--info); box-shadow: 0 0 6px rgba(106,154,184,.5); }

/* 消费甜甜圈中心文字 */
.chart-center-stat { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -58%); text-align: center; pointer-events: none; z-index: 2; }
.ccs-val { display: block; font-size: 22px; font-weight: 800; color: var(--text); line-height: 1; }
.ccs-lbl { display: block; font-size: 10px; color: var(--text-tertiary); margin-top: 3px; letter-spacing: .04em; }

/* 满意度分布 */
.dash-demographic { padding: 12px 16px 0; display: flex; flex-direction: column; gap: 10px; }
.demo-row { display: flex; align-items: center; gap: 10px; }
.demo-label { width: 36px; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-align: right; flex-shrink: 0; }
.demo-bar-wrap { flex: 1; height: 24px; border-radius: 5px; background: rgba(180,150,120,.08); overflow: hidden; }
.demo-bar { height: 100%; border-radius: 5px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); min-width: 2px; position: relative; }
.demo-bar::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 40%; background: linear-gradient(180deg, rgba(255,255,255,.25), transparent); border-radius: 5px 5px 0 0; }
.demo-count { font-size: 12px; font-weight: 600; color: var(--text); width: 36px; text-align: right; flex-shrink: 0; }
.demo-pct { font-size: 11px; color: var(--text-tertiary); width: 40px; text-align: right; flex-shrink: 0; }
.demo-summary { display: flex; gap: 16px; padding: 14px 0 8px; border-top: 1px solid var(--border-light); margin-top: 6px; }
.demo-avg, .demo-ages, .demo-gender { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.demo-avg-label, .demo-ages-label { font-size: 10px; color: var(--text-tertiary); letter-spacing: .04em; }
.demo-avg-val { font-size: 26px; font-weight: 800; color: var(--accent); }
.demo-avg-unit { font-size: 11px; color: var(--text-tertiary); }
.demo-ages-val { font-size: 14px; font-weight: 600; color: var(--text); }

@media (max-width: 1200px) { .dash-kpi { grid-template-columns: repeat(3, 1fr); } .dash-row-3 { grid-template-columns: 1fr 1fr; } }
@media (max-width: 900px) { .dash-kpi { grid-template-columns: repeat(2, 1fr); } .dash-row-3, .dash-row-2 { grid-template-columns: 1fr; } .dash-hero-right { gap: 16px; } }
@media (max-width: 600px) { .dash-kpi { grid-template-columns: 1fr 1fr; } .dash-hero { padding: 20px; } .dash-hero-title { font-size: 22px; } }
</style>
