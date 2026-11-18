<template>
  <div class="table-container"><table class="data-table"><thead><tr><th v-for="col in columns" :key="col.key" :style="{width:col.width}">{{col.title}}</th><th v-if="showActions" class="actions-col">操作</th></tr></thead><tbody><tr v-if="rows.length===0"><td :colspan="columns.length+(showActions?1:0)" class="empty-row"><slot name="empty">暂无数据</slot></td></tr><tr v-for="row in rows" :key="row[idKey]"><td v-for="col in columns" :key="col.key"><slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">{{row[col.key]}}</slot></td><td v-if="showActions" class="actions-col"><slot name="actions" :row="row"/></td></tr></tbody></table></div>
</template>
<script setup lang="ts">defineProps({columns:{type:Array as ()=>Array<{key:string;title:string;width?:string}>,required:true},rows:{type:Array as ()=>any[],default:()=>[]},idKey:{type:String,default:'id'},showActions:{type:Boolean,default:true}})</script>
<style scoped>
.table-container{overflow-x:auto;}.data-table{width:100%;border-collapse:collapse;font-size:13px;}
.data-table th,.data-table td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--border-light);}
.data-table th{color:var(--text-secondary);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}
.data-table tbody tr{transition:background var(--transition);}.data-table tbody tr:hover{background:var(--surface-hover);}
.actions-col{text-align:right;white-space:nowrap;}.actions-col button{margin-left:6px;}
.empty-row{text-align:center;color:var(--muted);padding:32px 12px!important;}
</style>
