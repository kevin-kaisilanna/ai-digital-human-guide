<template>
  <div class="sbc-root">
    <div class="sbc-header">消费结构分析</div>
    <div class="sbc-body"><canvas ref="c"></canvas></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps<{ data: Array<{ category: string; total: number; percentage: number }> }>()
const c = ref<HTMLCanvasElement | null>(null)
let ch: Chart | null = null

const palette = ['#c8843c','#d4a060','#5a9e80','#8b7558','#c06840']

function build(d: typeof props.data) {
  if (!c.value || !d?.length) return
  if (ch) ch.destroy()
  ch = new Chart(c.value.getContext('2d')!, {
    type: 'pie',
    data: {
      labels: d.map(r => r.category),
      datasets: [{
        data: d.map(r => r.total),
        backgroundColor: palette.slice(0, d.length),
        borderColor: '#fffdf8', borderWidth: 2.5, hoverBorderWidth: 3,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart', animateRotate: true },
      plugins: {
        legend: { position: 'bottom', usePointStyle: true, padding: 8,
          labels: { font: { size: 11 }, color: '#8b7558', padding: 14 } },
        tooltip: {
          backgroundColor: 'rgba(40,26,14,.94)', titleColor: '#fdf8f0', bodyColor: 'rgba(255,255,255,.75)',
          padding: 14, cornerRadius: 10, titleFont: { size: 13, weight: '700' }, bodyFont: { size: 12 }, displayColors: false,
          callbacks: {
            label: (ctx: any) => {
              const r = d[ctx.dataIndex]; const v = r.total >= 1e7 ? (r.total/1e7).toFixed(1)+'千万' : r.total >= 1e4 ? (r.total/1e4).toFixed(1)+'万' : r.total.toLocaleString()
              return ` ${r.category}  ¥${v}  (${r.percentage}%)`
            },
          },
        },
      },
    },
  })
}
onMounted(() => { if (props.data?.length) build(props.data) })
watch(() => props.data, (d) => { if (d?.length) build(d) }, { deep: true })
</script>
<style scoped>
.sbc-root { background: rgba(255,255,255,.45); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(180,150,120,.12); border-radius: 16px; padding: 20px; box-shadow: 0 2px 20px rgba(120,90,50,.04); }
.sbc-header { font-size: 14px; font-weight: 700; color: var(--text); letter-spacing: .02em; margin-bottom: 2px; }
.sbc-body { position: relative; height: 260px; }
canvas { width: 100% !important; height: 100% !important; }
</style>
