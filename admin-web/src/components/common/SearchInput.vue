<template>
  <div class="search-input-wrap"><span class="search-icon">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </span><input ref="inp" :value="modelValue" :placeholder="placeholder" @input="onInput" @keyup.enter="onSearch" @keyup.esc="onClear" type="text"/><button v-if="modelValue" class="search-clear" @click="onClear" title="清除">&times;</button><button class="search-btn" @click="onSearch">搜索</button></div>
</template>
<script setup lang="ts">import {ref} from 'vue';const props=defineProps({modelValue:{type:String,default:''},placeholder:{type:String,default:'搜索…'}});const emit=defineEmits(['update:modelValue','search','clear']);const inp=ref<HTMLInputElement|null>(null);function onInput(e:Event){emit('update:modelValue',(e.target as HTMLInputElement).value)};function onSearch(){emit('search',props.modelValue)};function onClear(){emit('update:modelValue','');emit('clear');inp.value?.focus()}</script>
<style scoped>
.search-input-wrap{display:flex;align-items:center;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm);background:rgba(255,255,255,.6);overflow:hidden;transition:border-color var(--transition);}
.search-input-wrap:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px rgba(200,160,100,.1);}
.search-icon{display:flex;align-items:center;padding:0 4px 0 10px;color:var(--muted);opacity:.55;}
.search-input-wrap input{flex:1;padding:8px 4px;border:none;background:transparent;color:var(--text);font-size:14px;outline:none;min-width:160px;font-family:inherit;}
.search-input-wrap input::placeholder{color:var(--text-tertiary);}
.search-clear{background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;padding:4px 8px;}.search-clear:hover{color:var(--text);}
.search-btn{padding:8px 14px;border:none;background:var(--primary);color:#fff;font-size:13px;cursor:pointer;transition:background var(--transition);font-family:inherit;}.search-btn:hover{background:var(--primary-hover);}
</style>
