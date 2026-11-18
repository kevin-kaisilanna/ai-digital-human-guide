<template>
  <div class="sdc-root">
    <div class="sdc-header">满意度分布</div>
    <div class="sdc-body"><canvas ref="c"></canvas></div>
    <div class="sdc-stat" v-if="data">
      <span>均分 <strong>{{ data.averageSatisfaction || '--' }}</strong></span>
      <span class="sdc-sep">·</span>
      <span>高满意度 <strong>{{ data.highSatisfactionPct || '--' }}%</strong></span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps<{ data: any }>()
const c = ref<HTMLCanvasElement | null>(null)
let ch: Chart | null = null

function build(d: any) {
  if (!c.value || !d?.distribution?.length) return
  if (ch) ch.destroy()
  const values = d.distribution.map((r: any) => r.count)
  ch = new Chart(c.value.getContext('2d')!, {
    type: 'doughnut',
    data: {
      labels: d.distribution.map((r: any) => r.rating + '分'),
      datasets: [{
        data: values, borderColor: '#fffdf8', borderWidth: 2.5, hoverBorderWidth: 3,
        backgroundColor: ['rgba(192,80,64,.7)','rgba(212,152,48,.7)','rgba(180,150,120,.6)','rgba(90,158,128,.7)','rgba(74,154,110,.75)'],
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      animation: { duration: 900, easing: 'easeOutQuart', animateRotate: true },
      plugins: {
        legend: { position: 'bottom', usePointStyle: true, pointStyleWidth: 8, padding: 12,
          labels: { font: { size: 11 }, color: '#8b7558', padding: 14 } },
        tooltip: {
          backgroundColor: 'rgba(40,26,14,.94)', titleColor: '#fdf8f0', bodyColor: 'rgba(255,255,255,.75)',
          padding: 14, cornerRadius: 10, titleFont: { size: 13, weight: '700' }, bodyFont: { size: 12 }, displayColors: false,
          callbacks: { label: (ctx: any) => { const t = values.reduce((s:number,v:number) => s+v,0); return ` ${ctx.raw.toLocaleString()} 人次  (${(ctx.raw/t*100).toFixed(1)}%)` } },
        },
      },
    },
  })
}
onMounted(() => { if (props.data?.distribution?.length) build(props.data) })
watch(() => props.data, (d) => { if (d?.distribution?.length) build(d) })
</script>
<style scoped>
.sdc-root { background: rgba(255,255,255,.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(180,150,120,.12); border-radius: 16px; padding: 20px; box-shadow: 0 2px 20px rgba(120,90,50,.04); display: flex; flex-direction: column; }
.sdc-header { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: .02em; margin-bottom: 2px; }
.sdc-body { position: relative; height: 200px; }
canvas { width: 100% !important; height: 100% !important; }
.sdc-stat { display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); margin-top: 2px; }
.sdc-stat strong { color: var(--text); font-size: 14px; }
.sdc-sep { color: var(--border); font-weight: 300; }
</style>
