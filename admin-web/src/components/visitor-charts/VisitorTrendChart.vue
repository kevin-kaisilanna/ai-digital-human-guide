<template>
  <div class="chart-card card"><div class="chart-header"><h3>月度游客趋势</h3></div><div class="chart-body"><canvas ref="c"/></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from "vue";import {Chart,registerables} from "chart.js";Chart.register(...registerables)
const props=defineProps<{data?:Array<{period:string;count:number;avgSatisfaction:number}>}>();const c=ref<HTMLCanvasElement|null>(null);let ch:Chart|null=null
function build(labels:string[],counts:number[],sats:number[]){if(!c.value)return;if(ch)ch.destroy();const ctx=c.value.getContext("2d")!;ch=new Chart(ctx,{type:"line",data:{labels,datasets:[{label:"游客数",data:counts,borderColor:"#c8843c",backgroundColor:"rgba(200,132,60,.08)",tension:.4,fill:true,pointRadius:4,yAxisID:"y"},{label:"满意度",data:sats,borderColor:"#5a9e80",backgroundColor:"rgba(90,158,128,.06)",tension:.4,fill:true,pointRadius:4,yAxisID:"y1"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{color:"#8b7558",usePointStyle:true}}},scales:{y:{type:"linear",position:"left",beginAtZero:true,grid:{color:"rgba(180,150,120,.15)"},ticks:{color:"#8b7558"}},y1:{type:"linear",position:"right",min:2,max:4,grid:{display:false},ticks:{color:"#8b7558"}},x:{grid:{display:false},ticks:{color:"#8b7558"}}}}})}
onMounted(()=>{if(props.data?.length)build(props.data.map(d=>d.period),props.data.map(d=>d.count),props.data.map(d=>d.avgSatisfaction));else{const m=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];const c=[23,19,59,70,90,63,73,88,107,50,49,86];const s=[3.04,2.95,3.05,2.99,3.09,3.02,3.11,3.08,2.97,3.18,3.24,3.08];build(m,c,s)}})
watch(()=>props.data,(d)=>{if(d?.length)build(d.map(x=>x.period),d.map(x=>x.count),d.map(x=>x.avgSatisfaction))})
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body{position:relative;height:260px;}canvas{width:100%!important;height:100%!important;}</style>