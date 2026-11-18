<template><span :class="['base-badge',`badge--${variant}`]"><slot/></span></template>
<script setup lang="ts">defineProps({variant:{type:String as ()=>'blue'|'green'|'amber'|'red'|'purple'|'gold',default:'blue'}})</script>
<style scoped>
.base-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;line-height:1.6;letter-spacing:.02em;transition:all var(--transition);}
.badge--blue{background:rgba(106,154,184,.12);color:#4a7a9a;}
.badge--green{background:var(--success-soft);color:var(--success);}
.badge--amber{background:var(--warning-soft);color:#b08028;}
.badge--red{background:var(--danger-soft);color:var(--danger);}
.badge--purple{background:rgba(160,130,190,.12);color:#7a5a9a;}
.badge--gold{background:rgba(200,160,100,.15);color:var(--accent-gold);}
</style>
