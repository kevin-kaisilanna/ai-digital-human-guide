<template>
  <div class="chart-card card"><div class="chart-header"><h3>本周服务人次趋势</h3></div><div class="chart-body"><canvas ref="c"/></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from 'vue';import {Chart,registerables} from 'chart.js';Chart.register(...registerables)
const props=defineProps<{data?:Array<{date:string;count:number}>}>();const c=ref<HTMLCanvasElement|null>(null);let ch:Chart|null=null
function build(labels:string[],data:number[]){if(!c.value)return;if(ch)ch.destroy();const ctx=c.value.getContext('2d')!;ch=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'人次',data,backgroundColor:'rgba(200,132,60,.5)',borderColor:'#c8843c',borderWidth:1,borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'rgba(180,150,120,.15)'},ticks:{color:'#8b7558'}},x:{grid:{display:false},ticks:{color:'#8b7558'}}}}})}
onMounted(()=>{if(props.data?.length)build(props.data.map(d=>d.date.slice(5)),props.data.map(d=>d.count));else build(['一','二','三','四','五','六','日'],[320,380,410,390,450,520,480])})
watch(()=>props.data,(d)=>{if(d?.length)build(d.map(x=>x.date.slice(5)),d.map(x=>x.count))})
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body{position:relative;height:240px;}canvas{width:100%!important;height:100%!important;}</style>
