<template><div class="config-tabs"><div class="tab-list"><button v-for="t in tabs" :key="t" :class="{active:t===active}" @click="active=t">{{t}}</button></div><div class="tab-body"><slot :active="active"/></div></div></template>
<script setup lang="ts">import {ref} from 'vue';const tabs=['外观','服装','声音'];const active=ref(tabs[0])</script>
<style scoped>
.tab-list{display:flex;gap:4px;padding:8px;background:rgba(250,240,225,.4);border-radius:var(--radius-sm);margin-bottom:12px;}
.tab-list button{flex:1;background:transparent;border:none;color:var(--muted);padding:7px 12px;border-radius:var(--radius-sm);cursor:pointer;font-size:13px;font-family:inherit;transition:all var(--transition);}
.tab-list button:hover{color:var(--text);}.tab-list button.active{background:var(--primary);color:#fff;font-weight:600;}.tab-body{padding:0 4px;}
</style>
