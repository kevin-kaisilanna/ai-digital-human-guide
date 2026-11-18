<template>
  <div class="dc-root">
    <div class="dc-header">游客画像 · 年龄与性别</div>
    <div class="dc-body"><canvas ref="c"></canvas></div>
    <div class="dc-gender" v-if="data?.genderSplit">
      <span class="dc-gitem male">♂ {{ (data.genderSplit.male||0).toLocaleString() }}</span>
      <span class="dc-gsep">·</span>
      <span class="dc-gitem female">♀ {{ (data.genderSplit.female||0).toLocaleString() }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps<{ data: { ageGroups: Array<{ group: string; count: number }>; genderSplit: { male: number; female: number; unknown?: number } } }>()
const c = ref<HTMLCanvasElement | null>(null)
let ch: Chart | null = null

const colors = [
  { bg: 'rgba(200,132,60,.6)', border: '#c8843c' },
  { bg: 'rgba(212,160,96,.6)', border: '#d4a060' },
  { bg: 'rgba(90,158,128,.6)', border: '#5a9e80' },
  { bg: 'rgba(192,104,64,.6)', border: '#c06840' },
  { bg: 'rgba(180,140,100,.6)', border: '#b48c64' },
]

function build(d: typeof props.data) {
  if (!c.value || !d?.ageGroups?.length) return
  if (ch) ch.destroy()
  ch = new Chart(c.value.getContext('2d')!, {
    type: 'bar',
    data: {
      labels: d.ageGroups.map(g => g.group),
      datasets: [{
        data: d.ageGroups.map(g => g.count),
        backgroundColor: d.ageGroups.map((_, i) => colors[i%5].bg),
        borderColor: d.ageGroups.map((_, i) => colors[i%5].border),
        borderWidth: 1.5, borderRadius: 8, barThickness: 34,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(40,26,14,.94)', titleColor: '#fdf8f0', bodyColor: 'rgba(255,255,255,.75)',
          padding: 14, cornerRadius: 10, titleFont: { size: 13, weight: '700' }, bodyFont: { size: 12 }, displayColors: false,
          callbacks: {
            label: (ctx: any) => ` ${ctx.raw.toLocaleString()} 人`,
            afterLabel: () => { const m=d.genderSplit?.male||0; const f=d.genderSplit?.female||0; const t=(m+f)||1; return `♂ ${(m/t*100).toFixed(0)}%  ·  ♀ ${(f/t*100).toFixed(0)}%` },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8b7558', font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: 'rgba(168,140,110,.1)' }, ticks: { color: '#8b7558', font: { size: 10 } } },
      },
    },
  })
}
onMounted(() => { if (props.data?.ageGroups?.length) build(props.data) })
watch(() => props.data, (d) => { if (d?.ageGroups?.length) build(d) }, { deep: true })
</script>
<style scoped>
.dc-root { background: rgba(255,255,255,.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(180,150,120,.12); border-radius: 16px; padding: 20px; box-shadow: 0 2px 20px rgba(120,90,50,.04); }
.dc-header { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: .02em; margin-bottom: 2px; }
.dc-body { position: relative; height: 240px; }
canvas { width: 100% !important; height: 100% !important; }
.dc-gender { display: flex; justify-content: center; gap: 16px; font-size: 12px; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(180,150,120,.08); }
.dc-gitem { font-weight: 700; }
.dc-gitem.male { color: #5a9ab8; }
.dc-gitem.female { color: #c06840; }
.dc-gsep { color: var(--border); font-weight: 300; }
</style>
