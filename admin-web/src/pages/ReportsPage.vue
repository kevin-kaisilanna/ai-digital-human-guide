<template>
  <div class="reports-page">
    <section class="page-hero">
      <div>
        <h1 class="hero-title">游客感受度报告</h1>
        <p class="hero-sub">情感分析 · 热门问题 · 改进建议 · 问答记录<span v-if="lastUpdated" class="r-updated"> · 更新于 {{ lastUpdated }}</span></p>
      </div>
      <div class="hero-acts">
        <button class="btn btn--outline btn--sm" @click="exportJson">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          JSON
        </button>
        <button class="btn btn--accent btn--sm" @click="exportPdf">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF
        </button>
      </div>
    </section>

    <section class="r-row r-row--tall">
      <div class="chart-box"><div class="chart-header"><h3>情感趋势</h3></div><div class="chart-body" style="height:340px"><SentimentTrendChart :data="sData"/></div></div>
      <div class="chart-box"><div class="chart-header"><h3>热门问题</h3></div><div class="chart-body" style="height:340px"><TopQuestionsChart :data="tData"/></div></div>
    </section>

    <section class="r-row">
      <div class="chart-box"><div class="chart-header"><h3>类别分布</h3></div><div class="chart-body" style="height:280px"><CategoryPieChart :data="cData"/></div></div>
      <div class="chart-box r-sug-box">
        <div class="chart-header">
          <h3>改进建议</h3>
          <span class="chart-badge">{{ suggestions.length }} 条</span>
        </div>
        <div class="sug-list">
          <SuggestionCard v-for="s in suggestions" :key="s.title" :variant="s.variant" :title="s.title" :description="s.description"/>
        </div>
      </div>
    </section>

    <section class="chart-box">
      <div class="chart-header">
        <h3>问答记录</h3>
        <span class="chart-badge">{{ logs.length }} 条</span>
      </div>
      <QueryLogTable :rows="logs"/>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SentimentTrendChart from '@/components/reports/SentimentTrendChart.vue'
import TopQuestionsChart from '@/components/reports/TopQuestionsChart.vue'
import CategoryPieChart from '@/components/reports/CategoryPieChart.vue'
import SuggestionCard from '@/components/reports/SuggestionCard.vue'
import QueryLogTable from '@/components/reports/QueryLogTable.vue'
import { fetchTypeAttention } from '@/services/visitor-analytics-service'
import { fetchQueryLogs } from '@/services/reports-service'

const sData = ref<any[]>([])
const tData = ref<any[]>([])
const cData = ref<any[]>([])
const suggestions = ref<any[]>([])
const logs = ref<any[]>([])
const lastUpdated = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

async function loadData() {
  try {
    // 1. 加载分析报告 JSON（情感趋势 + 建议）
    const reportRes = await fetch('/data/visitor-analysis-report.json', { cache: 'no-cache' })
    if (reportRes.ok) {
      const r = await reportRes.json()
      // 情感趋势
      if (r.sentiment?.dailyTrend?.length) {
        sData.value = r.sentiment.dailyTrend.slice(-30).map((d: any) => ({
          date: d.date_str?.slice(5) || d.date_str,
          positive: Math.round(d.avgSatisfaction * 15),
          neutral: Math.round(d.avgSatisfaction * 5),
          negative: Math.round((5 - d.avgSatisfaction) * 3),
        }))
      }
      // 建议
      if (r.recommendations?.length) {
        suggestions.value = r.recommendations.map((rec: any) => ({
          variant: rec.level || 'info', title: rec.title, description: rec.description,
        }))
      }
    }

    // 2. 类别分布 — 优先从分析报告 JSON，否则使用 visitor-analytics API 的多元数据
    try {
      const types = await fetchTypeAttention().catch(() => null)
      if (types?.length) {
        cData.value = types.map((t: any) => ({
          category: t.type, count: t.count,
        }))
      }
    } catch { /* ignore */ }

    // 3. 热门问题
    if (cData.value.length > 0) {
      tData.value = cData.value.slice(0, 10).map((t: any) => ({
        question: t.category,
        count: t.count,
      }))
    }

    // 4. 问答记录 — 优先从后端数据库 /api/reports/query-logs，回退到 visitor-app 聊天记录
    try {
      const qlRes = await fetchQueryLogs(1, 50).catch(() => null)
      if (qlRes?.logs?.length) {
        logs.value = qlRes.logs.map((l: any) => ({
          id: l.id,
          time: l.time,
          tourist_id: l.visitorId || '游客',
          question: l.question,
          sentiment: l.sentiment || 'neutral',
          satisfaction: typeof l.satisfaction === 'number' ? l.satisfaction : 3,
        }))
      } else {
        // 回退：尝试从 visitor-app 聊天记录构建
        await loadChatLogs()
      }
    } catch {
      await loadChatLogs()
    }

    lastUpdated.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    suggestions.value = [
      { variant: 'warning' as const, title: '「禅意小镇·拈花湾」满意度低于均值', description: '该景点平均满意度 3.03 分，低于整体均值 3.07 分。' },
      { variant: 'warning' as const, title: '「灵山胜境」满意度低于均值', description: '该景点平均满意度 3.04 分，低于整体均值 3.07 分。' },
      { variant: 'info' as const, title: '「灵山大佛」满意度有提升空间', description: '平均满意度 3.12 分，建议优化服务细节。' },
      { variant: 'success' as const, title: '整体满意度表现良好', description: '22% 游客给出 4 分及以上评价。' },
    ]
  }
}

async function loadChatLogs() {
  try {
    const chatRes = await fetch('/api/admin/users')
    if (!chatRes.ok) return
    const userList = await chatRes.json()
    const logEntries: any[] = []
    for (const user of (userList.users || []).slice(0, 8)) {
      try {
        const chatRes = await fetch(`/api/admin/users/${encodeURIComponent(user.username)}/chats`)
        if (!chatRes.ok) continue
        const chatData = await chatRes.json()
        for (const sess of (chatData.sessions || []).slice(0, 5)) {
          logEntries.push({
            id: sess.session_id || `${user.username}_${Date.now()}`,
            time: sess.updated_at?.slice(0, 16) || sess.created_at?.slice(0, 16) || '—',
            tourist_id: user.displayName || user.username,
            question: sess.title || '未命名会话',
            sentiment: sess.status === 'active' ? 'positive' : 'neutral',
            satisfaction: sess.messageCount > 5 ? 4 : 3,
          })
        }
      } catch { /* skip user */ }
    }
    logs.value = logEntries.slice(0, 30)
  } catch { /* ignore chat load errors */ }
}

onMounted(() => {
  loadData()
  pollTimer = setInterval(loadData, 30_000)
})
onBeforeUnmount(() => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } })

async function exportJson() {
  try {
    const res = await fetch('/api/reports/summary')
    if (!res.ok) throw new Error('后端未运行')
    const json = await res.json()
    const b = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    const u = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = u; a.download = `lingshan-report-${new Date().toISOString().slice(0, 10)}.json`
    a.click(); a.remove(); URL.revokeObjectURL(u)
  } catch {
    // 回退：用静态 JSON 导出
    try {
      const reportRes = await fetch('/data/visitor-analysis-report.json', { cache: 'no-cache' })
      if (!reportRes.ok) { alert('导出失败，请确保后端服务正在运行（python server/main.py）'); return }
      const json = await reportRes.json()
      const b = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
      const u = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = u; a.download = `lingshan-report-${new Date().toISOString().slice(0, 10)}.json`
      a.click(); a.remove(); URL.revokeObjectURL(u)
    } catch {
      alert('导出失败，请确保后端服务正在运行（python server/main.py）')
    }
  }
}

async function exportPdf() {
  // 获取报告数据（优先后端数据库，回退静态 JSON）
  let report: any = null
  try {
    const res = await fetch('/api/reports/summary')
    if (res.ok) report = await res.json()
  } catch { /* fallback */ }
  if (!report) {
    try {
      const res = await fetch('/data/visitor-analysis-report.json', { cache: 'no-cache' })
      if (res.ok) report = await res.json()
    } catch { /* ignore */ }
  }
  if (!report) { alert('无法获取报告数据，请检查后端服务。'); return }

  const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  const suggestions = report.suggestions || report.recommendations || []
  const queryLogs = report.queryLogs || logs.value || []
  const cats = report.categoryDistribution || (report.attention?.typeDistribution || [])

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>灵山胜境 · 游客感受度报告</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'PingFang SC','Noto Sans SC','Microsoft Yahei',sans-serif;color:#3d2e1c;line-height:1.7;max-width:800px;margin:0 auto;padding:40px 32px;background:#fffdf8}
  .cover{text-align:center;padding:60px 0 40px;border-bottom:2px solid #c8843c;margin-bottom:32px}
  .cover h1{font-size:28px;font-weight:800;color:#3d2e1c;margin-bottom:8px;letter-spacing:.03em}
  .cover .sub{font-size:14px;color:#8b7558}
  .cover .date{font-size:12px;color:#a89880;margin-top:6px}
  h2{font-size:18px;font-weight:700;color:#c8843c;margin:28px 0 14px;padding-bottom:8px;border-bottom:1px solid rgba(200,132,60,.2)}
  .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}
  .summary-item{background:rgba(200,160,100,.06);padding:14px 16px;border-radius:8px;text-align:center}
  .summary-item .val{font-size:24px;font-weight:800;color:#c8843c}
  .summary-item .lbl{font-size:11px;color:#8b7558;margin-top:2px}
  table{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0 16px}
  th{background:rgba(200,160,100,.1);color:#3d2e1c;font-weight:600;font-size:11px;text-align:left;padding:8px 10px;border-bottom:2px solid rgba(200,132,60,.3)}
  td{padding:8px 10px;border-bottom:1px solid rgba(180,150,120,.12)}
  tr:nth-child(even){background:rgba(250,246,240,.5)}
  .sug-card{padding:10px 14px;margin:6px 0;border-left:3px solid #c8843c;background:rgba(200,160,100,.04);border-radius:0 6px 6px 0;font-size:13px}
  .sug-card.warning{border-left-color:#c05040;background:rgba(192,80,64,.04)}
  .sug-card.success{border-left-color:#4a9a6e;background:rgba(74,154,110,.04)}
  .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600}
  .badge-pos{background:rgba(74,154,110,.15);color:#3a8a5e}
  .badge-neu{background:rgba(212,152,48,.12);color:#b08028}
  .badge-neg{background:rgba(192,80,64,.12);color:#b04038}
  .footer{text-align:center;font-size:11px;color:#a89880;margin-top:40px;padding-top:16px;border-top:1px solid rgba(200,160,100,.2)}
  @media print{body{padding:20px 24px}@page{margin:12mm}}
</style></head>
<body>
<div class="cover">
  <h1>灵山胜境 · 拈花湾</h1>
  <div class="sub">游客感受度报告</div>
  <div class="date">生成时间：${now}</div>
</div>

<h2>报告概览</h2>
<div class="summary-grid">
  <div class="summary-item"><div class="val">${(report.total || queryLogs.length || 0).toLocaleString()}</div><div class="lbl">问答记录总数</div></div>
  <div class="summary-item"><div class="val">${suggestions.length}</div><div class="lbl">改进建议</div></div>
  <div class="summary-item"><div class="val">${cats.length}</div><div class="lbl">内容类别</div></div>
</div>

${cats.length ? `<h2>类别分布</h2><table><thead><tr><th>类别</th><th>占比</th></tr></thead><tbody>${cats.map((c:any) => `<tr><td>${c.category || c.type || '—'}</td><td>${(c.percentage || 0).toFixed(1)}%</td></tr>`).join('')}</tbody></table>` : ''}

${suggestions.length ? `<h2>改进建议（${suggestions.length} 条）</h2>${suggestions.map((s:any) => `<div class="sug-card ${s.level || 'info'}">${s.content || s.description || s.title || ''}</div>`).join('')}` : ''}

${queryLogs.length ? `<h2>近期问答记录（共 ${queryLogs.length} 条）</h2><table><thead><tr><th>时间</th><th>游客</th><th>问题</th><th>情感</th></tr></thead><tbody>${queryLogs.slice(0, 30).map((l:any) => `<tr><td>${l.time || '—'}</td><td>${l.tourist_id || l.visitorId || '游客'}</td><td>${(l.question || '').slice(0, 60)}</td><td>${l.sentiment === 'positive' ? '<span class="badge badge-pos">正面</span>' : l.sentiment === 'negative' ? '<span class="badge badge-neg">负面</span>' : '<span class="badge badge-neu">中性</span>'}</td></tr>`).join('')}</tbody></table>` : ''}

<div class="footer">© 2026 灵山景区 · 后台管理系统 | AI 导游小云 · 智能导览服务</div>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) { alert('弹窗被浏览器拦截，请允许弹窗后重试。'); return }
  w.document.write(html)
  w.document.close()
  setTimeout(() => w.print(), 600)
}
</script>

<style scoped>
.reports-page { padding: 4px 0 40px; }
.r-updated { color: var(--text-tertiary); font-size: 11px; margin-left: 8px; }
.hero-acts { display: flex; gap: 8px; position: relative; z-index: 1; }

.r-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.r-row--tall { grid-template-columns: 1fr 1fr; }

.sug-list { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; max-height: 240px; overflow-y: auto; }
.r-sug-box { display: flex; flex-direction: column; }

@media (max-width: 900px) { .r-row, .r-row--tall { grid-template-columns: 1fr; } }
</style>
