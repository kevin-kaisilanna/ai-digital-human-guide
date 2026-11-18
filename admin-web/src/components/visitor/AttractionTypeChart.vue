<template>
  <div class="atc-root">
    <div class="atc-header">景点类型分布</div>
    <div class="atc-body"><canvas ref="c"></canvas></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps<{ data: Array<{ type: string; count: number; percentage: number }> }>()
const c = ref<HTMLCanvasElement | null>(null)
let ch: Chart | null = null

const palette = ['#c8843c','#5a9e80','#d49830','#c06840','#6a9ab8','#9a6ab0','#8a6a50','#4a8a6a']

function build(d: typeof props.data) {
  if (!c.value || !d?.length) return
  if (ch) ch.destroy()
  ch = new Chart(c.value.getContext('2d')!, {
    type: 'doughnut',
    data: {
      labels: d.map(r => r.type),
      datasets: [{
        data: d.map(r => r.count),
        backgroundColor: palette.slice(0, d.length),
        borderColor: '#fffdf8', borderWidth: 2.5, hoverBorderWidth: 3,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '58%',
      animation: { duration: 900, easing: 'easeOutQuart', animateRotate: true },
      plugins: {
        legend: { position: 'right', usePointStyle: true, pointStyleWidth: 10, padding: 14,
          labels: { font: { size: 11 }, color: '#8b7558', padding: 14, usePointStyle: true } },
        tooltip: {
          backgroundColor: 'rgba(40,26,14,.94)', titleColor: '#fdf8f0', bodyColor: 'rgba(255,255,255,.75)',
          padding: 14, cornerRadius: 10, titleFont: { size: 13, weight: '700' }, bodyFont: { size: 12 }, displayColors: false,
          callbacks: { label: (ctx: any) => { const r = d[ctx.dataIndex]; return ` ${r.count.toLocaleString()} 人次  (${r.percentage}%)` } },
        },
      },
    },
  })
}
onMounted(() => { if (props.data?.length) build(props.data) })
watch(() => props.data, (d) => { if (d?.length) build(d) }, { deep: true })
</script>
<style scoped>
.atc-root { background: rgba(255,255,255,.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(180,150,120,.12); border-radius: 16px; padding: 20px; box-shadow: 0 2px 20px rgba(120,90,50,.04); }
.atc-header { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: .02em; margin-bottom: 2px; }
.atc-body { position: relative; height: 260px; }
canvas { width: 100% !important; height: 100% !important; }
</style>
