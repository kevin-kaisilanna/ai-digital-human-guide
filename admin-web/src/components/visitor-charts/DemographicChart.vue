<template>
  <div class="chart-card card"><div class="chart-header"><h3>游客画像 · 年龄与性别</h3></div><div class="chart-body chart-body--split"><div class="chart-half"><canvas ref="ageC"/></div><div class="chart-half"><canvas ref="genderC"/></div></div></div>
</template>
<script setup lang="ts">
import {ref,onMounted,watch} from "vue";import {Chart,registerables} from "chart.js";Chart.register(...registerables)
const props=defineProps<{data?:{ageGroups:Array<{group:string;count:number}>;genderSplit:{male:number;female:number}}}>()
const ageC=ref<HTMLCanvasElement|null>(null);const genderC=ref<HTMLCanvasElement|null>(null)
let ch1:Chart|null=null;let ch2:Chart|null=null
function build(){if(!ageC.value||!genderC.value)return;if(ch1)ch1.destroy();if(ch2)ch2.destroy()
const ages=props.data?.ageGroups||[{group:"19-30岁",count:275},{group:"31-45岁",count:303},{group:"46-60岁",count:142},{group:"60岁以上",count:57}]
const gender=props.data?.genderSplit||{male:401,female:376}
ch1=new Chart(ageC.value.getContext("2d")!,{type:"bar",data:{labels:ages.map(d=>d.group),datasets:[{data:ages.map(d=>d.count),backgroundColor:["#c8843c","#d4a060","#5a9e80","#c06840"],borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:"rgba(180,150,120,.15)"},ticks:{color:"#8b7558"}},x:{grid:{display:false},ticks:{color:"#8b7558"}}}}})
ch2=new Chart(genderC.value.getContext("2d")!,{type:"doughnut",data:{labels:["男性","女性"],datasets:[{data:[gender.male,gender.female],backgroundColor:["#c8843c","#d4a060"],borderWidth:2,borderColor:"#fff"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{color:"#8b7558",usePointStyle:true}}},cutout:"55%"}})}
onMounted(build)
watch(()=>props.data,()=>build())
</script>
<style scoped>.chart-card{padding:16px;}.chart-header h3{margin:0 0 12px;font-size:15px;color:var(--text);}.chart-body--split{display:flex;gap:16px;}.chart-half{flex:1;position:relative;height:220px;}canvas{width:100%!important;height:100%!important;}@media(max-width:768px){.chart-body--split{flex-direction:column;}}</style>