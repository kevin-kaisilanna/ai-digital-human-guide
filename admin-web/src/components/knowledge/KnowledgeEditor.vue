<template>
  <BaseModal :visible="visible" :title="isNew?'新建知识':'编辑知识'" maxWidth="700px" @update:visible="v=>$emit('update:visible',v)" @close="$emit('cancel')">
    <div class="editor-form">
      <div class="form-group"><label>标题</label><input v-model="form.title" placeholder="知识标题"/></div>
      <div class="form-group"><label>分类</label><select v-model="form.category"><option value="history">历史文化</option><option value="spots">景点介绍</option><option value="facility">设施服务</option><option value="events">活动资讯</option><option value="faq">常见问答</option><option value="guide">游览指南</option><option value="routes">路线推荐</option></select></div>
      <div class="form-group"><label>来源</label><input v-model="form.source" placeholder="来源文件名"/></div>
      <div class="form-group"><label>内容</label><div class="editor-toolbar"><button type="button" @click="execCmd('bold')" title="加粗"><b>B</b></button><button type="button" @click="execCmd('italic')" title="斜体"><i>I</i></button><button type="button" @click="execCmd('underline')" title="下划线"><u>U</u></button><span class="sep"></span><button type="button" @click="execCmd('insertUnorderedList')" title="无序">•=</button><button type="button" @click="execCmd('insertOrderedList')" title="有序">1.</button></div><div ref="editorEl" class="editor-content" contenteditable="true" @input="onEditorInput" @paste="onPaste"></div></div>
    </div>
    <template #footer><button class="btn btn--outline" @click="onCancel">取消</button><button class="btn" @click="onSave" :disabled="!form.title.trim()">保存</button></template>
  </BaseModal>
</template>
<script setup lang="ts">
import {reactive,ref,watch,nextTick} from 'vue';import BaseModal from '@/components/common/BaseModal.vue'
const props=defineProps<{visible:boolean;entry?:Record<string,any>|null}>();const emit=defineEmits<{'update:visible':[v:boolean];save:[p:any];cancel:[]}>()
const editorEl=ref<HTMLDivElement|null>(null);const form=reactive({title:'',category:'history',source:'',content:''});const isNew=ref(true)
watch(()=>props.entry,(entry)=>{if(entry&&Object.keys(entry).length>0){form.title=entry.title??'';form.category=entry.category??'history';form.source=entry.source??'';form.content=entry.content??'';isNew.value=false}else{form.title='';form.category='history';form.source='';form.content='';isNew.value=true}nextTick(()=>{if(editorEl.value)editorEl.value.innerHTML=form.content||''})},{immediate:true})
function onEditorInput(){form.content=editorEl.value?.innerHTML??''}
function onPaste(e:ClipboardEvent){e.preventDefault();const text=e.clipboardData?.getData('text/plain')??'';document.execCommand('insertText',false,text)}
function execCmd(cmd:string){document.execCommand(cmd,false);editorEl.value?.focus()}
function onSave(){emit('save',{...form});emit('update:visible',false)}
function onCancel(){emit('cancel');emit('update:visible',false)}
</script>
<style scoped>
.editor-form{display:flex;flex-direction:column;gap:4px;}.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:10px;}
.form-group label{font-size:13px;font-weight:600;color:var(--text-secondary);}
.form-group input,.form-group select{padding:9px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);background:rgba(255,255,255,.7);color:var(--text);font-size:14px;font-family:inherit;outline:none;}
.form-group input:focus,.form-group select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(200,160,100,.1);}
.editor-toolbar{display:flex;gap:4px;padding:6px 8px;border:1px solid var(--border);border-bottom:none;border-radius:var(--radius-sm) var(--radius-sm) 0 0;background:rgba(250,240,225,.5);flex-wrap:wrap;}
.editor-toolbar button{background:none;border:1px solid transparent;color:var(--muted);width:28px;height:28px;border-radius:4px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all var(--transition);}
.editor-toolbar button:hover{background:var(--surface-hover);color:var(--text);border-color:var(--border);}.editor-toolbar .sep{width:1px;background:var(--border);margin:0 4px;}
.editor-content{min-height:160px;padding:12px;border:1px solid var(--border);border-top:none;border-radius:0 0 var(--radius-sm) var(--radius-sm);background:rgba(255,255,255,.7);color:var(--text);font-size:14px;line-height:1.7;outline:none;overflow-y:auto;}
.editor-content:focus{border-color:var(--accent);}.editor-content:empty::before{content:'请输入知识内容…';color:var(--text-tertiary);}
</style>
