<template>
  <div class="chart-card card"><div class="chart-header"><h3>关注类别饼图</h3></div><div class="chart-body"><canvas ref="c"/></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from 'vue';import {Chart,registerables} from 'chart.js';Chart.register(...registerables)
const props=defineProps<{data?:Array<{category:string;count:number}>}>();const c=ref<HTMLCanvasElement|null>(null);let ch:Chart|null=null
const palette=['#c8843c','#d4a060','#5a9e80','#c06840','#d49830','#4a8a6a','#c89850','#a88860']
function build(labels:string[],data:number[]){if(!c.value)return;if(ch)ch.destroy();const ctx=c.value.getContext('2d')!;ch=new Chart(ctx,{type:'pie',data:{labels,datasets:[{data,backgroundColor:palette.slice(0,labels.length),borderColor:'#fffdf8',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#8b7558',usePointStyle:true,padding:12,font:{size:11}}}}}})}
onMounted(()=>{if(props.data?.length)build(props.data.map(d=>d.category),props.data.map(d=>d.count));else build(['历史文化','景点介绍','设施服务','活动资讯','路线推荐'],[35,30,15,12,8])})
watch(()=>props.data,(d)=>{if(d?.length)build(d.map(x=>x.category),d.map(x=>x.count))})
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body{position:relative;height:230px;}canvas{width:100%!important;height:100%!important;}</style>
