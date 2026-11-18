<template>
  <div class="chart-card card"><div class="chart-header"><h3>景区类型分布</h3></div><div class="chart-body"><canvas ref="c"/></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from "vue";import {Chart,registerables} from "chart.js";Chart.register(...registerables)
const props=defineProps<{data?:Array<{type:string;count:number;percentage:number}>}>();const c=ref<HTMLCanvasElement|null>(null);let ch:Chart|null=null
function build(labels:string[],data:number[]){if(!c.value)return;if(ch)ch.destroy();const ctx=c.value.getContext("2d")!;ch=new Chart(ctx,{type:"doughnut",data:{labels,datasets:[{data,backgroundColor:["#c8843c","#d4a060","#5a9e80","#c06840","#d49830"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{color:"#8b7558",usePointStyle:true,padding:16}}},cutout:"60%"}})}
onMounted(()=>{if(props.data?.length)build(props.data.map(d=>d.type),props.data.map(d=>d.count));else build(["风景名胜与休闲度假"],[777])})
watch(()=>props.data,(d)=>{if(d?.length)build(d.map(x=>x.type),d.map(x=>x.count))})
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body{position:relative;height:260px;}canvas{width:100%!important;height:100%!important;}</style>