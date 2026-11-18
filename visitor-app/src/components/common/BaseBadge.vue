<template><span :class="['base-badge',`badge--${variant}`]"><slot/></span></template>
<script setup lang="ts">defineProps({variant:{type:String as ()=>'blue'|'green'|'amber'|'red'|'purple'|'gold',default:'blue'}})</script>
<style scoped>
.base-badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;line-height:1.6;}
.badge--blue{background:rgba(106,154,184,.15);color:#5a8aaa;}.badge--green{background:rgba(74,154,110,.12);color:#3a8a5e;}
.badge--amber{background:rgba(212,152,48,.12);color:#b08028;}.badge--red{background:rgba(192,80,64,.12);color:#b04038;}
.badge--purple{background:rgba(160,130,190,.15);color:#8a6aaa;}.badge--gold{background:rgba(200,160,100,.18);color:#a07840;}
</style>
