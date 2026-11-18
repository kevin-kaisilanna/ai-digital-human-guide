<template>
  <Teleport to="body"><Transition name="modal"><div v-if="visible" class="modal-backdrop" @click.self="close"><div class="modal" :style="{maxWidth}"><header class="modal-header"><slot name="header"><h3 class="modal-title">{{title}}</h3></slot><button class="modal-close" @click="close" aria-label="关闭">&times;</button></header><section class="modal-body"><slot/></section><footer v-if="$slots.footer" class="modal-footer"><slot name="footer"/></footer></div></div></Transition></Teleport>
</template>
<script setup lang="ts">
defineProps({visible:{type:Boolean,default:false},title:{type:String,default:''},maxWidth:{type:String,default:'760px'}})
const emit=defineEmits(['update:visible','close']);function close(){emit('update:visible',false);emit('close')}
</script>
<style scoped>
.modal-backdrop{position:fixed;inset:0;background:rgba(60,40,20,.4);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;}
.modal{width:100%;background:linear-gradient(180deg,#fffdf8,#fef9f2);border:1px solid rgba(200,160,100,.18);border-radius:var(--radius-lg);box-shadow:0 24px 60px rgba(120,90,50,.15);color:var(--text);overflow:hidden;display:flex;flex-direction:column;}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border-light);background:linear-gradient(180deg,rgba(250,240,225,.5),transparent);}
.modal-title{margin:0;font-size:17px;font-weight:700;}
.modal-close{background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-sm);transition:all var(--transition);}
.modal-close:hover{color:var(--text);background:var(--surface-hover);}
.modal-body{padding:20px;overflow-y:auto;max-height:60vh;}
.modal-footer{padding:14px 20px;border-top:1px solid var(--border-light);display:flex;justify-content:flex-end;gap:10px;background:rgba(250,240,225,.3);}
.modal-enter-active,.modal-leave-active{transition:opacity .25s ease;}
.modal-enter-active .modal,.modal-leave-active .modal{transition:transform .25s ease,opacity .25s ease;}
.modal-enter-from,.modal-leave-to{opacity:0;}.modal-enter-from .modal{transform:scale(.96) translateY(10px);}.modal-leave-to .modal{transform:scale(.96) translateY(10px);}
</style>
