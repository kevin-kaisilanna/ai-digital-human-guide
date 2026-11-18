<template>
  <div class="chart-card card"><div class="chart-header"><h3>消费构成分析</h3></div><div class="chart-body"><canvas ref="c"/></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from "vue";import {Chart,registerables} from "chart.js";Chart.register(...registerables)
const props=defineProps<{data?:Array<{category:string;total:number;percentage:number}>}>();const c=ref<HTMLCanvasElement|null>(null);let ch:Chart|null=null
const palette=["#c8843c","#d4a060","#5a9e80","#c06840","#d49830"]
function build(labels:string[],values:number[]){if(!c.value)return;if(ch)ch.destroy();const ctx=c.value.getContext("2d")!;ch=new Chart(ctx,{type:"pie",data:{labels,datasets:[{data:values,backgroundColor:palette,borderWidth:2,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{color:"#8b7558",usePointStyle:true,padding:16}}}}})}
onMounted(()=>{if(props.data?.length)build(props.data.map(d=>d.category),props.data.map(d=>d.total));else build(["门票","餐饮","购物","交通","娱乐"],[143442,187288,193893,103895,83186])})
watch(()=>props.data,(d)=>{if(d?.length)build(d.map(x=>x.category),d.map(x=>x.total))})
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body{position:relative;height:280px;}canvas{width:100%!important;height:100%!important;}</style>