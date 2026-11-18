<template>
  <div class="chart-card card"><div class="chart-header"><h3>景点游客关注度</h3></div><div class="chart-body"><canvas ref="c"/></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from "vue";import {Chart,registerables} from "chart.js";Chart.register(...registerables)
const props=defineProps<{data?:Array<{name:string;visitorCount:number}>}>();const c=ref<HTMLCanvasElement|null>(null);let ch:Chart|null=null
const palette=["#c8843c","#d4a060","#5a9e80","#c06840","#d49830","#4a8a6a","#c89850","#a88860"]
function build(labels:string[],data:number[]){if(!c.value)return;if(ch)ch.destroy();const ctx=c.value.getContext("2d")!;ch=new Chart(ctx,{type:"bar",data:{labels,datasets:[{data,backgroundColor:labels.map((_,i)=>palette[i]),borderRadius:4}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:"rgba(180,150,120,.15)"},ticks:{color:"#8b7558"}},y:{grid:{display:false},ticks:{color:"#8b7558"}}}}})}
onMounted(()=>{if(props.data?.length)build(props.data.map(d=>d.name),props.data.map(d=>d.visitorCount));else build(["灵山大佛","禅意小镇·拈花湾","灵山胜境"],[286,255,236])})
watch(()=>props.data,(d)=>{if(d?.length)build(d.map(x=>x.name),d.map(x=>x.visitorCount))})
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body{position:relative;height:280px;}canvas{width:100%!important;height:100%!important;}</style>