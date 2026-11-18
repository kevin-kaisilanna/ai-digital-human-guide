<template>
  <div class="vtc-root">
    <div class="vtc-header">访问量与满意度趋势</div>
    <div class="vtc-body"><canvas ref="c"></canvas></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps<{ data: Array<{ date: string; visitors: number; avgSatisfaction?: number }> }>()
const c = ref<HTMLCanvasElement | null>(null)
let ch: Chart | null = null

function build(d: typeof props.data) {
  if (!c.value || !d?.length) return
  if (ch) ch.destroy()
  const ctx = c.value.getContext('2d')!

  const barGrad = ctx.createLinearGradient(0, 0, 0, 300)
  barGrad.addColorStop(0, 'rgba(200,132,60,.35)'); barGrad.addColorStop(1, 'rgba(200,132,60,.04)')
  const lineGrad = ctx.createLinearGradient(0, 0, 0, 300)
  lineGrad.addColorStop(0, 'rgba(90,158,128,.18)'); lineGrad.addColorStop(1, 'rgba(90,158,128,0)')

  ch = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.map(r => r.date),
      datasets: [
        { label: '访问量', data: d.map(r => r.visitors), backgroundColor: barGrad, borderColor: '#c8843c', borderWidth: 1, borderRadius: 6, yAxisID: 'y', order: 2 },
        { label: '满意度', data: d.map(r => r.avgSatisfaction??0), type: 'line', borderColor: '#5a9e80', backgroundColor: lineGrad, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: '#5a9e80', pointBorderColor: '#fff', pointBorderWidth: 1.5, tension: .4, fill: true, yAxisID: 'y1', order: 1 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', usePointStyle: true, labels: { color: '#8b7558', padding: 20, font: { size: 11 }, usePointStyle: true } },
        tooltip: {
          backgroundColor: 'rgba(40,26,14,.94)', titleColor: '#fdf8f0', bodyColor: 'rgba(255,255,255,.75)',
          padding: 14, cornerRadius: 10, titleFont: { size: 13, weight: '700' }, bodyFont: { size: 12 }, displayColors: true,
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8b7558', font: { size: 10 }, maxTicksLimit: 14 } },
        y: { type: 'linear', position: 'left', beginAtZero: true, grid: { color: 'rgba(168,140,110,.1)' }, ticks: { color: '#8b7558', font: { size: 10 } }, title: { display: true, text: '人次', color: '#8b7558', font: { size: 11 } } },
        y1: { type: 'linear', position: 'right', min: 1, max: 5, grid: { display: false }, ticks: { color: '#5a9e80', font: { size: 10 }, stepSize: .5 }, title: { display: true, text: '满意度', color: '#5a9e80', font: { size: 11 } } },
      },
    },
  })
}
onMounted(() => { if (props.data?.length) build(props.data) })
watch(() => props.data, (d) => { if (d?.length) build(d) }, { deep: true })
</script>
<style scoped>
.vtc-root { background: rgba(255,255,255,.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(180,150,120,.12); border-radius: 16px; padding: 20px; box-shadow: 0 2px 20px rgba(120,90,50,.04); }
.vtc-header { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: .02em; margin-bottom: 2px; }
.vtc-body { position: relative; height: 280px; }
canvas { width: 100% !important; height: 100% !important; }
</style>
