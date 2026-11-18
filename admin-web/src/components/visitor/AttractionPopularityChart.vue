<template>
  <div class="apc-root">
    <div class="apc-header">
      <span class="apc-title">景点热门排行</span>
      <span class="apc-badge">Top {{ data.length }}</span>
    </div>
    <div class="apc-body"><canvas ref="c"></canvas></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps<{ data: Array<{ name: string; visitorCount: number; avgSatisfaction: number }> }>()
const c = ref<HTMLCanvasElement | null>(null)
let ch: Chart | null = null

function build(d: typeof props.data) {
  if (!c.value || !d?.length) return
  if (ch) ch.destroy()
  const ctx = c.value.getContext('2d')!

  const gold = (i: number) => {
    const stops = [['#c8843c','#d4a060'],['#b87530','#c89050'],['#a86828','#b88048'],['#5a9e80','#6eae90'],['#4a8a6a','#5e9e7a'],['#c06840','#d07850'],['#d49830','#e0a840'],['#c89850','#d8a860'],['#b08040','#c09050'],['#8a6850','#9a7860']]
    const [from, to] = stops[i % stops.length]
    const g = ctx.createLinearGradient(0, 0, 360, 0)
    g.addColorStop(0, from); g.addColorStop(1, to)
    return g
  }

  ch = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.map(r => r.name.length > 8 ? r.name.slice(0,8)+'…' : r.name),
      datasets: [{
        data: d.map(r => r.visitorCount),
        backgroundColor: d.map((_, i) => gold(i)),
        borderRadius: 6, borderWidth: 0, barThickness: 18,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      animation: { duration: 900, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(40,26,14,.94)',
          titleColor: '#fdf8f0', bodyColor: 'rgba(255,255,255,.75)',
          padding: 14, cornerRadius: 10,
          titleFont: { size: 13, weight: '700' }, bodyFont: { size: 12 },
          displayColors: false,
          callbacks: {
            title: (ctx: any) => d[ctx[0].dataIndex].name,
            label: (ctx: any) => `${ctx.raw.toLocaleString()} 人次  ·  满意度 ${d[ctx.dataIndex].avgSatisfaction}/5`,
          },
        },
      },
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(168,140,110,.1)' }, ticks: { color: '#8b7558', font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { color: '#8b7558', font: { size: 11, weight: '600' } } },
      },
    },
  })
}
onMounted(() => { if (props.data?.length) build(props.data) })
watch(() => props.data, (d) => { if (d?.length) build(d) }, { deep: true })
</script>
<style scoped>
.apc-root { background: rgba(255,255,255,.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(180,150,120,.12); border-radius: 16px; padding: 20px; box-shadow: 0 2px 20px rgba(120,90,50,.04); }
.apc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.apc-title { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: .02em; }
.apc-badge { font-size: 10px; padding: 3px 10px; border-radius: 12px; background: linear-gradient(135deg, rgba(200,132,60,.12), rgba(220,180,120,.06)); color: var(--accent); font-weight: 600; border: 1px solid rgba(200,150,100,.15); }
.apc-body { position: relative; height: 300px; }
canvas { width: 100% !important; height: 100% !important; }
</style>
