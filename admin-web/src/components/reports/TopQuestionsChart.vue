<template>
  <div class="chart-card card"><div class="chart-header"><h3>热门问题</h3></div><div class="chart-body"><canvas ref="c"/></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from 'vue';import {Chart,registerables} from 'chart.js';Chart.register(...registerables)
const props=defineProps<{data?:Array<{question:string;count:number}>}>();const c=ref<HTMLCanvasElement|null>(null);let ch:Chart|null=null
const palette=['#c8843c','#d4a060','#5a9e80','#c06840','#d49830','#4a8a6a','#c89850','#a88860','#b89058','#d4a860']
function build(labels:string[],data:number[]){if(!c.value)return;if(ch)ch.destroy();const ctx=c.value.getContext('2d')!;ch=new Chart(ctx,{type:'bar',data:{labels,datasets:[{data,backgroundColor:labels.map((_,i)=>palette[i]),borderRadius:4}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:'rgba(180,150,120,.15)'},ticks:{color:'#8b7558'}},y:{grid:{display:false},ticks:{color:'#8b7558',font:{size:11}}}}}})}
onMounted(()=>{if(props.data?.length)build(props.data.map(d=>d.question),props.data.map(d=>d.count));else build(['灵山大佛多高','卫生间在哪','开放时间','游览路线','门票价格','停车方便吗','导游服务','可以带宠物吗','附近美食','拍照最佳点'],[328,291,256,234,198,187,165,143,132,119])})
watch(()=>props.data,(d)=>{if(d?.length)build(d.map(x=>x.question),d.map(x=>x.count))})
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body{position:relative;height:300px;}canvas{width:100%!important;height:100%!important;}</style>
