<template>
  <div class="chart-card card"><div class="chart-header"><h3>情感趋势</h3></div><div class="chart-body"><canvas ref="c"/></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from 'vue';import {Chart,registerables} from 'chart.js';Chart.register(...registerables)
const props=defineProps<{data?:Array<{date:string;positive:number;neutral:number;negative:number}>}>();const c=ref<HTMLCanvasElement|null>(null);let ch:Chart|null=null
function build(labels:string[],pos:number[],neu:number[],neg:number[]){if(!c.value)return;if(ch)ch.destroy();const ctx=c.value.getContext('2d')!;ch=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'正面',data:pos,borderColor:'#4a9a6e',backgroundColor:'rgba(74,154,110,.1)',tension:.4,fill:true,pointRadius:4},{label:'中性',data:neu,borderColor:'#d49830',backgroundColor:'rgba(212,152,48,.08)',tension:.4,fill:true,pointRadius:4},{label:'负面',data:neg,borderColor:'#c05040',backgroundColor:'rgba(192,80,64,.08)',tension:.4,fill:true,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#8b7558',usePointStyle:true}}},scales:{y:{beginAtZero:true,grid:{color:'rgba(180,150,120,.15)'},ticks:{color:'#8b7558'}},x:{grid:{display:false},ticks:{color:'#8b7558'}}}}})}
onMounted(()=>{if(props.data?.length)build(props.data.map(d=>d.date.slice(5)),props.data.map(d=>d.positive),props.data.map(d=>d.neutral),props.data.map(d=>d.negative));else build(['6天前','5天前','4天前','3天前','2天前','昨天','今天'],[70,72,68,75,73,74,76],[20,18,20,15,17,16,14],[10,10,12,10,10,10,10])})
watch(()=>props.data,(d)=>{if(d?.length)build(d.map(x=>x.date.slice(5)),d.map(x=>x.positive),d.map(x=>x.neutral),d.map(x=>x.negative))})
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body{position:relative;height:300px;}canvas{width:100%!important;height:100%!important;}</style>
