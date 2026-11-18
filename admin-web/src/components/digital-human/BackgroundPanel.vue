<template>
  <div class="background-panel">
    <!-- 预设背景图 -->
    <div class="form-group">
      <label>预设背景</label>
      <div class="preset-grid">
        <button
          v-for="bg in presets"
          :key="bg.value"
          :class="{ active: local.bgUrl === bg.value }"
          @click="local.bgUrl = bg.value"
          :title="bg.label"
        >
          <span class="preset-preview" :style="{ background: bg.preview }"></span>
          <span class="preset-label">{{ bg.label }}</span>
        </button>
      </div>
    </div>

    <!-- 自定义上传 -->
    <div class="form-group">
      <label>自定义背景</label>
      <div class="custom-row">
        <input
          v-model="local.bgUrl"
          placeholder="输入背景图片 URL 或点击上传"
          class="url-input"
        />
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display:none"
          @change="onFileUpload"
        />
        <button class="btn btn--outline btn--sm" @click="$refs.fileInput.click()">上传</button>
      </div>
    </div>

    <!-- 模糊 -->
    <div class="form-group">
      <label>背景模糊：{{ local.blur }}px</label>
      <input type="range" min="0" max="20" step="1" v-model.number="local.blur" class="blur-slider" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const props = defineProps<{ value?: Record<string, any> }>()
const emit = defineEmits<{ update: [v: Record<string, any>] }>()

const presets = [
  { value: '', label: '默认渐变', preview: 'linear-gradient(135deg, #1a1a3e, #2d1b69)' },
  { value: 'preset:landscape', label: '山水风景', preview: 'linear-gradient(180deg, #0f2847, #1a5c3a)' },
  { value: 'preset:temple', label: '寺庙殿堂', preview: 'linear-gradient(180deg, #3d1a1a, #6b3a1a)' },
  { value: 'preset:garden', label: '园林庭院', preview: 'linear-gradient(180deg, #1a3d2a, #4a7c3a)' },
]

const local = reactive({
  bgUrl: props.value?.bgUrl ?? '',
  blur: props.value?.blur ?? 0,
})

watch(() => local, (v) => emit('update', { ...v }), { deep: true })

const fileInput = ref<HTMLInputElement | null>(null)

function onFileUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    local.bgUrl = URL.createObjectURL(file)
  }
  input.value = ''
}
</script>

<style scoped>
.background-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}
.preset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.preset-grid button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--muted);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
}
.preset-grid button:hover { border-color: rgba(255,255,255,0.15); }
.preset-grid button.active {
  border-color: var(--primary);
  color: var(--text);
}
.preset-preview {
  width: 100%;
  height: 48px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
}
.preset-label { font-size: 11px; }

.custom-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.url-input {
  flex: 1;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  outline: none;
}
.url-input:focus { border-color: var(--primary); }

.blur-slider {
  width: 100%;
  accent-color: var(--primary);
}
</style>
