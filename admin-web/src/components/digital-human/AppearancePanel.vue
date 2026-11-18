<template>
  <div class="appearance-panel" :class="{ disabled: disabled }">
    <!-- 禁用提示 -->
    <div v-if="disabled" class="disabled-banner">
      ⚠ 当前为固定造型服装，发型和发色选择已禁用
    </div>

    <!-- 发色 -->
    <div class="form-group">
      <label>发色</label>
      <div class="radio-group">
        <button
          v-for="opt in colorOptions"
          :key="opt.value"
          :class="{ active: model.hairColor === opt.value }"
          :disabled="disabled"
          @click="!disabled && (model.hairColor = opt.value)"
        >
          <span class="color-dot" :style="{ background: opt.dot }"></span>
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 发型 — 图片缩略图选择 -->
    <div class="form-group">
      <label>发型</label>
      <div class="hair-grid">
        <div
          v-for="opt in hairOptions"
          :key="opt.value"
          :class="['hair-card', { active: model.hair === opt.value, dimmed: disabled }]"
          @click="!disabled && (model.hair = opt.value)"
        >
          <div class="hair-img-wrap">
            <img :src="hairImage(opt.value)" :alt="opt.label" class="hair-img" />
          </div>
          <span class="hair-label">{{ opt.label }}</span>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label>脸型</label>
      <div class="radio-group">
        <button
          v-for="opt in faceOptions"
          :key="opt"
          :class="{ active: model.face === opt }"
          :disabled="disabled"
          @click="!disabled && (model.face = opt)"
        >
          {{ opt }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AppearanceModel {
  hair: string
  hairColor: string
  face: string
}

const model = defineModel<AppearanceModel>({
  default: () => ({ hair: '短发', hairColor: 'blue', face: '鹅蛋脸' }),
})

// 服装非"现代"时禁用发型发色选择
defineProps<{ disabled?: boolean }>()

const colorOptions = [
  { value: 'blue', label: '蓝色', dot: '#4f6ef6' },
  { value: 'brown', label: '棕色', dot: '#8B5E3C' },
]

interface HairOption { value: string; label: string; img: string }

const hairOptions: HairOption[] = [
  { value: '短发',   label: '短发',   img: 'short' },
  { value: '长发',   label: '长发',   img: 'long' },
  { value: '盘发',   label: '盘发',   img: 'bun' },
  { value: '马尾',   label: '马尾',   img: 'ponytail' },
  { value: '波浪',   label: '波浪',   img: 'wave' },
  { value: '小马尾', label: '小马尾', img: 'short_ponytail' },
]

const faceOptions = ['鹅蛋脸', '圆脸', '方脸', '瓜子脸', '长脸']

function hairImage(hairValue: string): string {
  const color = model.value.hairColor ?? 'blue'
  const opt = hairOptions.find(h => h.value === hairValue)
  const key = opt?.img ?? 'long'
  if (color === 'blue') {
    return `/images/digital-human/hair_${key}.jpg`
  }
  return `/images/digital-human/hair_brown_${key}.jpg`
}
</script>

<style scoped>
.appearance-panel { display: flex; flex-direction: column; gap: 14px; }

.disabled-banner {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: rgba(200, 150, 60, .12);
  color: var(--accent, #c8a064);
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }

.radio-group { display: flex; gap: 6px; flex-wrap: wrap; }
.radio-group button {
  background: transparent; border: 1px solid var(--border); color: var(--muted);
  padding: 6px 14px; border-radius: var(--radius-full); cursor: pointer;
  font-size: 13px; font-family: inherit; transition: all var(--transition);
  display: flex; align-items: center; gap: 6px;
}
.radio-group button:hover:not(:disabled) { border-color: var(--accent); color: var(--text); }
.radio-group button.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.radio-group button:disabled { opacity: .4; cursor: not-allowed; }
.color-dot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,.4); box-shadow: 0 0 0 1px rgba(0,0,0,.1); }

.hair-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.hair-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px;
  border: 2px solid var(--border); border-radius: var(--radius); cursor: pointer;
  background: rgba(255,255,255,.25); transition: all var(--transition);
}
.hair-card:not(.dimmed):hover { border-color: var(--accent); background: rgba(200,160,100,.06); }
.hair-card.active { border-color: var(--primary); background: rgba(79,110,246,.08); box-shadow: 0 0 0 2px rgba(79,110,246,.15); }
.hair-card.dimmed { opacity: .4; cursor: not-allowed; }
.hair-card.dimmed:hover { border-color: var(--border); background: rgba(255,255,255,.25); }
.hair-img-wrap { width: 100%; aspect-ratio: 1 / 1; border-radius: 6px; overflow: hidden; background: #f5f0e8; }
.hair-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .2s; }
.hair-card:not(.dimmed):hover .hair-img { transform: scale(1.05); }
.hair-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
.hair-card.active .hair-label { color: var(--primary); font-weight: 600; }
</style>