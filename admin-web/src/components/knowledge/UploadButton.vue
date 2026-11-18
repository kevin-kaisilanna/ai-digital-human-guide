<template>
  <div class="upload-btn-wrap">
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      @change="onFileChange"
      style="display:none"
    />
    <button class="btn btn--outline" @click="$refs.fileInput.click()">
      {{ label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  label: { type: String, default: '上传文档' },
  accept: { type: String, default: '.docx,.doc,.txt,.pdf' },
})

const emit = defineEmits<{
  uploaded: [file: File]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('uploaded', file)
  }
  // 重置以便重复选择同一文件
  input.value = ''
}
</script>

<style scoped>
.upload-btn-wrap {
  display: inline-flex;
}
</style>
