<template>
  <nav class="breadcrumb" aria-label="面包屑导航">
    <template v-for="(item,i) in items" :key="item.path||i">
      <span v-if="i>0" class="sep">›</span>
      <router-link v-if="item.path&&i<items.length-1" :to="item.path" class="crumb">{{item.label}}</router-link>
      <span v-else class="crumb current">{{item.label}}</span>
    </template>
  </nav>
</template>
<script setup lang="ts">defineProps<{items:Array<{label:string;path?:string}>}>()</script>
<style scoped>
.breadcrumb{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;color:var(--muted);}
.crumb{color:var(--muted);text-decoration:none;transition:color .18s;}
.crumb:hover{color:var(--accent);}.crumb.current{color:var(--text);font-weight:600;}
.sep{color:rgba(61,46,28,.2);user-select:none;font-size:15px;}
</style>
