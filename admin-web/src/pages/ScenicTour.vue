<template>
  <div class="scenic-container">
    <!-- 顶部导航栏 -->
    <header class="scenic-header">
      <button class="btn-back" @click="goBack">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span>返回首页</span>
      </button>
      <div class="scenic-counter">
        <span class="counter-current">{{ currentIndex + 1 }}</span>
        <span class="counter-sep">/</span>
        <span class="counter-total">{{ images.length }}</span>
      </div>
      <div class="scenic-title">灵山景区游览</div>
    </header>

    <!-- 图片轮播区 -->
    <div
      class="scenic-viewport"
      @touchstart="onTouchStart" @touchend="onTouchEnd"
      @mousedown="onMouseDown" @mouseup="onMouseUp" @mousemove="onMouseMove"
    >
      <div
        class="scenic-track"
        :style="{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }"
      >
        <div v-for="(img, idx) in images" :key="idx" class="scenic-slide">
          <div class="scenic-image-wrapper">
            <img :src="img.src" :alt="img.name" class="scenic-image"
              :class="{ 'scenic-image--loaded': loadedImages.has(idx) }"
              @load="onImageLoad(idx)" draggable="false" />
            <div v-if="!loadedImages.has(idx)" class="scenic-loader">
              <div class="loader-spinner"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 左右箭头 -->
      <button v-if="currentIndex > 0" class="btn-arrow btn-arrow--left" @click="prevImage">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button v-if="currentIndex < images.length - 1" class="btn-arrow btn-arrow--right" @click="nextImage">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>

    <!-- 底部缩略图导航 -->
    <footer class="scenic-footer">
      <div class="scenic-dots">
        <button v-for="(img, idx) in images" :key="idx" class="scenic-dot"
          :class="{ 'scenic-dot--active': idx === currentIndex }"
          @click="goToImage(idx)" :aria-label="`跳转到第 ${idx + 1} 张`"></button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const images = reactive([
  { src: '/images/scenic/img_1.jpg',  name: '灵山全景' },
  { src: '/images/scenic/img_2.jpg',  name: '梵宫金顶' },
  { src: '/images/scenic/img_3.jpg',  name: '九龙灌浴' },
  { src: '/images/scenic/img_4.jpg',  name: '五印坛城' },
  { src: '/images/scenic/img_5.jpg',  name: '曼飞龙塔' },
  { src: '/images/scenic/img_6.jpg',  name: '灵山大佛' },
  { src: '/images/scenic/img_7.jpg',  name: '降魔浮雕' },
  { src: '/images/scenic/img_8.jpg',  name: '灵山福地' },
  { src: '/images/scenic/img_9.jpg',  name: '天下第一掌' },
  { src: '/images/scenic/img_10.jpg', name: '百子戏弥勒' },
  { src: '/images/scenic/img_11.jpg', name: '菩提大道' },
  { src: '/images/scenic/img_12.jpg', name: '古银杏广场' },
  { src: '/images/scenic/img_13.jpg', name: '香水海' },
  { src: '/images/scenic/img_14.jpg', name: '灵山暮色' },
])

const currentIndex = ref(0)
const loadedImages = ref(new Set<number>())
const isDragging = ref(false)
const dragOffset = ref(0)
let touchStartX = 0, mouseStartX = 0, isMouseDown = false
let autoTimer: ReturnType<typeof setInterval> | null = null
let pauseTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => { preloadImages(); window.addEventListener('keydown', onKeyDown); startAutoPlay() })
onUnmounted(() => { window.removeEventListener('keydown', onKeyDown); stopAutoPlay() })

function startAutoPlay() {
  stopAutoPlay()
  autoTimer = setInterval(() => {
    if (!isDragging.value) {
      if (currentIndex.value < images.length - 1) {
        currentIndex.value++
      } else {
        currentIndex.value = 0
      }
    }
  }, 3000)
}

function stopAutoPlay() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
}

function pauseAutoPlay() {
  stopAutoPlay()
  if (pauseTimer) clearTimeout(pauseTimer)
  pauseTimer = setTimeout(() => { startAutoPlay() }, 6000)
}

function preloadImages() {
  images.forEach((img, idx) => {
    const imageEl = new Image()
    imageEl.onload = () => { loadedImages.value = new Set([...loadedImages.value, idx]) }
    imageEl.src = img.src
  })
}
function onImageLoad(idx: number) { loadedImages.value = new Set([...loadedImages.value, idx]) }
function goBack() { router.push('/') }
function goToImage(idx: number) { currentIndex.value = idx; pauseAutoPlay() }
function prevImage() { if (currentIndex.value > 0) currentIndex.value--; else currentIndex.value = images.length - 1; pauseAutoPlay() }
function nextImage() { if (currentIndex.value < images.length - 1) currentIndex.value++; else currentIndex.value = 0; pauseAutoPlay() }
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') { prevImage(); pauseAutoPlay() }
  else if (e.key === 'ArrowRight') { nextImage(); pauseAutoPlay() }
  else if (e.key === 'Escape') goBack()
}
function onTouchStart(e: TouchEvent) { touchStartX = e.touches[0].clientX; isDragging.value = true; dragOffset.value = 0 }
function onTouchEnd(e: TouchEvent) { finishDrag(e.changedTouches[0].clientX - touchStartX) }
function onMouseDown(e: MouseEvent) { mouseStartX = e.clientX; isMouseDown = true; isDragging.value = true; dragOffset.value = 0 }
function onMouseMove(e: MouseEvent) { if (!isMouseDown) return; dragOffset.value = e.clientX - mouseStartX }
function onMouseUp(e: MouseEvent) { if (!isMouseDown) return; finishDrag(e.clientX - mouseStartX); isMouseDown = false }
function finishDrag(diff: number) {
  const threshold = 80
  let moved = false
  if (diff < -threshold) { currentIndex.value = currentIndex.value < images.length - 1 ? currentIndex.value + 1 : 0; moved = true }
  else if (diff > threshold) { currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : images.length - 1; moved = true }
  if (moved) pauseAutoPlay()
  isDragging.value = false; dragOffset.value = 0
}
</script>

<style scoped>
.scenic-container {
  width: 100vw; height: 100vh; display: flex; flex-direction: column;
  background: #0a0a0a; position: fixed; inset: 0; z-index: 10; overflow: hidden;
}

/* ===== 顶部导航 ===== */
.scenic-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%);
  position: absolute; top: 0; left: 0; right: 0; z-index: 20; color: #fff;
}

/* 返回按钮 — 米黄暖调 */
.btn-back {
  display: inline-flex; align-items: center; gap: 6px;
  height: 38px; padding: 0 18px;
  background: rgba(220,195,160,0.15);
  border: 1px solid rgba(200,170,140,0.3);
  border-radius: 6px;
  color: rgba(250,245,235,0.85);
  font-size: 14px; font-family: inherit; cursor: pointer;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  transition: all 0.35s ease;
}
.btn-back:hover {
  background: rgba(220,195,160,0.25);
  border-color: rgba(200,170,140,0.5);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(100,60,30,0.25);
}
.btn-back:active { transform: translateY(0) scale(0.97); }

.scenic-counter { font-size: 15px; letter-spacing: 0.05em; }
.counter-current { font-weight: 700; font-size: 22px; }
.counter-sep { margin: 0 2px; opacity: 0.4; }
.counter-total { opacity: 0.5; font-size: 13px; }
.scenic-title { font-size: 14px; opacity: 0.65; letter-spacing: 0.06em; }

/* ===== 视口 ===== */
.scenic-viewport { flex: 1; position: relative; overflow: hidden; cursor: grab; }
.scenic-viewport:active { cursor: grabbing; }
.scenic-track { display: flex; height: 100%; will-change: transform; }
.scenic-slide { min-width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
.scenic-image-wrapper { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.scenic-image {
  max-width: 100%; max-height: 100%; object-fit: contain;
  opacity: 0; transition: opacity 0.5s ease;
  -webkit-user-drag: none; user-select: none;
}
.scenic-image--loaded { opacity: 1; }

/* 加载 */
.scenic-loader { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.loader-spinner { width: 36px; height: 36px; border: 2px solid rgba(255,255,255,0.1); border-top-color: rgba(200,160,100,0.75); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 左右箭头 ===== */
.btn-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(160,120,80,0.25);
  border: 1px solid rgba(200,160,120,0.25);
  color: rgba(245,235,215,0.8);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  z-index: 15; transition: all 0.35s ease;
}
.btn-arrow:hover {
  background: rgba(160,120,80,0.45);
  border-color: rgba(210,170,130,0.45);
  color: #fdf8f0;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 0 30px rgba(120,80,40,0.25);
}
.btn-arrow:active { transform: translateY(-50%) scale(0.95); transition: transform 0.1s; }
.btn-arrow--left { left: 20px; }
.btn-arrow--right { right: 20px; }

/* ===== 底部圆点 ===== */
.scenic-footer {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 20;
  padding: 16px 24px 28px;
  background: linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 100%);
  display: flex; justify-content: center;
}
.scenic-dots { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; max-width: 600px; }
.scenic-dot {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1px solid rgba(200,170,140,0.3);
  background: rgba(200,170,140,0.18);
  cursor: pointer; padding: 0;
  transition: all 0.35s ease;
}
.scenic-dot:hover { background: rgba(210,175,145,0.45); border-color: rgba(210,175,145,0.5); }
.scenic-dot--active {
  background: rgba(200,155,110,0.9);
  border-color: rgba(220,175,130,0.6);
  box-shadow: 0 0 12px rgba(190,145,100,0.5);
  transform: scale(1.25);
}

/* ===== 响应式 ===== */
@media (max-width: 600px) {
  .scenic-header { padding: 12px 14px; }
  .btn-back { height: 34px; padding: 0 14px; font-size: 13px; }
  .btn-arrow { width: 40px; height: 40px; }
  .btn-arrow--left { left: 10px; }
  .btn-arrow--right { right: 10px; }
}
</style>
