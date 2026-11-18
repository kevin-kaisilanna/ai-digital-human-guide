<template>
  <div class="clothing-panel">
    <div class="form-group">
      <label>服装风格</label>
      <div class="cloth-grid">
        <div
          v-for="opt in styleOptions"
          :key="opt.value"
          :class="['cloth-card', { active: model.style === opt.value }]"
          @click="selectStyle(opt.value)"
        >
          <div class="cloth-img-wrap">
            <img
              v-if="opt.img"
              :src="`/images/digital-human/${opt.img}`"
              :alt="opt.label"
              class="cloth-img"
            />
            <div v-else class="cloth-placeholder">
              <span class="cloth-placeholder-icon">👔</span>
            </div>
          </div>
          <span class="cloth-label">{{ opt.label }}</span>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>颜色</label>
      <div class="color-row">
        <input type="color" v-model="model.color" class="color-picker" />
        <span class="color-hex">{{ model.color }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ClothModel { style: string; color: string }

const model = defineModel<ClothModel>({
  default: () => ({ style: '汉服', color: '#c41e3a' }),
})

const styleOptions = [
  { value: '汉服', label: '汉服', img: 'cloth_hanfu.jpg' },
  { value: '唐装', label: '唐装', img: 'cloth_tang.jpg' },
  { value: '民族', label: '民族', img: 'cloth_minzu.jpg' },
  { value: '现代', label: '现代', img: 'hair_short.jpg' },
]

function selectStyle(v: string) {
  model.value = { ...model.value, style: v }
}
</script>

<style scoped>
.clothing-panel {
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
.cloth-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.cloth-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  background: rgba(255,255,255,.25);
  transition: all var(--transition);
}
.cloth-card:hover {
  border-color: var(--accent);
  background: rgba(200,160,100,.06);
}
.cloth-card.active {
  border-color: var(--primary);
  background: rgba(79,110,246,.08);
  box-shadow: 0 0 0 2px rgba(79,110,246,.15);
}
.cloth-img-wrap {
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f0e8;
}
.cloth-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .2s;
}
.cloth-card:hover .cloth-img { transform: scale(1.05); }
.cloth-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0ebe0, #e8e0d5);
}
.cloth-placeholder-icon {
  font-size: 36px;
  opacity: .5;
}
.cloth-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}
.cloth-card.active .cloth-label {
  color: var(--primary);
  font-weight: 600;
}
.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.color-picker {
  width: 40px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: none;
  cursor: pointer;
}
.color-hex {
  font-size: 13px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
</style>
