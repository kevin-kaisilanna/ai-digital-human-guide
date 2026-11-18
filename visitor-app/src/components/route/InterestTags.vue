<template>
  <div class="interest-tags">
    <!-- 左箭头 -->
    <button
      v-if="showLeftArrow"
      class="scroll-arrow scroll-arrow--left"
      @click="scroll(-200)"
      aria-label="向左滑动"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
    </button>

    <!-- 滑动标签区 -->
    <div ref="scrollRef" class="tags-scroll" @scroll="onScroll">
      <button
        v-for="tag in tags"
        :key="tag.key"
        :ref="el => { if (el) tagRefs[tag.key] = el as HTMLElement }"
        :class="{ active: modelValue === tag.key }"
        @click="selectTag(tag.key)"
        class="tag-btn"
      >
        <span class="tag-dot" :class="'tag-dot--' + tag.key"></span>
        <span class="tag-label">{{ tag.label }}</span>
      </button>
    </div>

    <!-- 右箭头 -->
    <button
      v-if="showRightArrow"
      class="scroll-arrow scroll-arrow--right"
      @click="scroll(200)"
      aria-label="向右滑动"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [key: string] }>()

const tags = [
  { key: 'all',         label: '全部' },
  { key: 'history',     label: '历史人文' },
  { key: 'nature',      label: '自然风光' },
  { key: 'family',      label: '亲子游' },
  { key: 'unofficial',  label: '秘境探索' },
  { key: 'bus',         label: '观光车' },
  { key: 'peak-avoid',  label: '错峰游' },
  { key: 'half-day',    label: '半日精华' },
  { key: 'two-day',     label: '两日游' },
]

const scrollRef = ref<HTMLElement | null>(null)
const tagRefs = reactive<Record<string, HTMLElement>>({})
const showLeftArrow = ref(false)
const showRightArrow = ref(false)

function checkArrows() {
  const el = scrollRef.value
  if (!el) return
  showLeftArrow.value = el.scrollLeft > 2
  showRightArrow.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

function scroll(delta: number) {
  scrollRef.value?.scrollBy({ left: delta, behavior: 'smooth' })
}

function onScroll() {
  checkArrows()
}

function selectTag(key: string) {
  emit('update:modelValue', key)
  // 滚动使选中标签可见
  nextTick(() => {
    const btn = tagRefs[key]
    if (btn && scrollRef.value) {
      const container = scrollRef.value
      const btnLeft = btn.offsetLeft
      const btnRight = btnLeft + btn.offsetWidth
      if (btnLeft < container.scrollLeft + 40) {
        container.scrollTo({ left: Math.max(0, btnLeft - 40), behavior: 'smooth' })
      } else if (btnRight > container.scrollLeft + container.clientWidth - 40) {
        container.scrollTo({ left: btnRight - container.clientWidth + 40, behavior: 'smooth' })
      }
    }
  })
}

onMounted(() => {
  checkArrows()
  // 初始加载时确保活跃标签可见
  nextTick(() => {
    const btn = tagRefs[props.modelValue]
    if (btn && scrollRef.value) {
      const container = scrollRef.value
      container.scrollTo({ left: Math.max(0, btn.offsetLeft - 60), behavior: 'instant' as any })
      checkArrows()
    }
  })
})

// 监听窗口尺寸变化重新检查箭头
watch(() => typeof window !== 'undefined' ? window.innerWidth : 0, () => {
  nextTick(checkArrows)
})
</script>

<style scoped>
.interest-tags {
  position: relative;
  display: block;
  padding: 6px 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

/* ── 滚动箭头 ── */
.scroll-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 6px rgba(0,0,0,.06);
  transition: all var(--transition);
}
.scroll-arrow:hover {
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 2px 10px rgba(0,0,0,.1);
}
.scroll-arrow--left  { left: 0; }
.scroll-arrow--right { right: 0; }

/* ── 滑动容器 ── */
.tags-scroll {
  overflow-x: auto;
  white-space: nowrap;
  padding: 4px 0 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  width: 100%;
}
.tags-scroll::-webkit-scrollbar { display: none; }

/* ── 标签按钮 ── */
.tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: var(--radius-full);
  cursor: pointer;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.6);
  font-size: 13px;
  font-family: inherit;
  color: var(--muted);
  transition: all var(--transition);
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  margin-right: 8px;
  vertical-align: middle;
}
.tag-btn:last-child { margin-right: 0; }
.tag-btn:hover { border-color: var(--accent); }
.tag-btn:active { transform: scale(.96); }
.tag-btn.active {
  background: var(--primary-soft);
  border-color: var(--accent);
  color: var(--text);
  font-weight: 600;
}

/* ── 彩点 ── */
.tag-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--border);
  transition: background var(--transition);
}
.tag-dot--all         { background: #8b7558; }
.tag-dot--history     { background: #5a8aaa; }
.tag-dot--nature      { background: #3a8a5e; }
.tag-dot--family      { background: #b08028; }
.tag-dot--unofficial  { background: #8a6aaa; }
.tag-dot--bus         { background: #c08040; }
.tag-dot--peak-avoid  { background: #c04848; }
.tag-dot--half-day    { background: #2a9d8f; }
.tag-dot--two-day     { background: #7c3aed; }
.tag-btn.active .tag-dot { opacity: 1; }
</style>
