<template>
  <div class="landing-container">
    <!-- ========== 第一屏：p1 ========== -->
    <section class="landing-section" id="section-p1">
      <!-- 左侧文字内容 -->
      <div class="split-left">
        <div class="crest">
          <span class="crest-line"></span>
          <span class="crest-diamond">◆</span>
          <span class="crest-line crest-line--r"></span>
        </div>
        <div class="title-group">
          <h1 class="main-title">
            <span class="title-char" v-for="(c, i) in '灵山胜境'" :key="i" :style="{ animationDelay: i * 0.1 + 's' }">{{ c }}</span>
          </h1>
          <p class="main-subtitle">Lingshan Scenic Area</p>
          <div class="main-divider"><span class="divider-dot"></span></div>
          <p class="main-desc">山水禅意 · 心灵之旅</p>
        </div>
        <div class="main-actions">
          <button class="btn-main btn-main--tour" @click="goScenicTour">
            <span>景区游览</span>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
          <button class="btn-main btn-main--admin" @click="goAdminLogin">
            <span>后台管理</span>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 右侧图片卡片 -->
      <div class="split-right">
        <div class="image-card">
          <div class="image-card-inner">
            <img src="/images/scenic/p1.jpg" alt="灵山胜境" class="card-img" />
          </div>
          <div class="image-card-label">灵山胜境</div>
        </div>
      </div>

      <div class="scroll-hint">
        <span class="scroll-text">向下探索</span>
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.5" fill="none"><path d="M6 9l6 6 6-6"/></svg>
      </div>
    </section>

    <!-- ========== 第二屏：轮播 ========== -->
    <section class="landing-section landing-section--carousel" id="section-img8">
      <div class="carousel-wrap" @mouseenter="pause" @mouseleave="resume">
        <div class="carousel-frame">
          <div
            v-for="(img, i) in images"
            :key="i"
            class="carousel-slide"
            :class="{ active: i === current }"
          >
            <img :src="`/images/scenic/${img}`" :alt="`灵山胜境 ${i + 1}`" />
          </div>
        </div>
        <div class="carousel-dots">
          <button
            v-for="(img, i) in images"
            :key="i"
            class="carousel-dot"
            :class="{ active: i === current }"
            @click="goTo(i)"
          ></button>
        </div>
        <button class="carousel-arrow carousel-arrow--prev" @click="prev">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="1.5" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="carousel-arrow carousel-arrow--next" @click="next">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="1.5" fill="none"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div class="scroll-hint scroll-hint--up">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.5" fill="none"><path d="M6 15l6-6 6 6"/></svg>
        <span class="scroll-text">返回封面</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
function goScenicTour() { router.push('/scenic-tour') }
function goAdminLogin() { router.push('/admin-login') }

// 轮播
const images = ['img_2.jpg', 'img_5.jpg', 'img_9.jpg', 'img_10.jpg', 'img_11.jpg']
const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const INTERVAL = 4000

function next() { current.value = (current.value + 1) % images.length }
function prev() { current.value = (current.value - 1 + images.length) % images.length }
function goTo(i: number) { current.value = i; resetTimer() }
function pause() { if (timer) clearInterval(timer) }
function resume() { resetTimer() }
function resetTimer() { if (timer) clearInterval(timer); timer = setInterval(next, INTERVAL) }

onMounted(() => { timer = setInterval(next, INTERVAL) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
/* ========================================== */
.landing-container {
  width: 100vw; height: 100vh;
  overflow-y: scroll; overflow-x: hidden;
  scroll-snap-type: y mandatory; scroll-behavior: smooth;
  position: fixed; inset: 0; z-index: 10;
}

.landing-section {
  width: 100vw; height: 100vh;
  scroll-snap-align: start; scroll-snap-stop: always;
  display: flex; align-items: center; justify-content: center;
  gap: 0;
  background: url('/images/backgroud.png') center / cover no-repeat;
  position: relative; overflow: hidden;
}

/* 背景装饰 */
.landing-section::before {
  content: ''; position: absolute;
  top: -30%; right: -15%;
  width: 60vw; height: 60vw;
  background: radial-gradient(circle, rgba(220,195,160,0.25) 0%, transparent 70%);
  pointer-events: none; border-radius: 50%;
}
.landing-section::after {
  content: ''; position: absolute;
  bottom: -20%; left: -10%;
  width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(210,185,150,0.18) 0%, transparent 70%);
  pointer-events: none; border-radius: 50%;
}

/* ===== 左侧文字内容 ===== */
.split-left {
  flex: 1 1 auto;
  display: flex; flex-direction: column; align-items: flex-start;
  justify-content: center;
  padding: 40px 8px 40px 48px;
  z-index: 2; max-width: 620px; min-width: 300px;
}

.image-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px;
}

.image-card-inner {
  width: clamp(340px, 45vw, 620px);
  height: clamp(420px, 56vw, 740px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    0 4px 24px rgba(140,110,70,0.18),
    0 1px 4px rgba(100,70,35,0.1),
    0 0 0 8px #fdfaf4,
    0 0 0 9px rgba(180,150,120,0.25);
  position: relative;
}

.card-img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform 8s ease;
}
.image-card:hover .card-img { transform: scale(1.06); }

.image-card-label {
  font-size: clamp(14px, 1.6vw, 17px);
  color: #8b6d50;
  letter-spacing: 0.2em;
  font-family: 'STKaiti','KaiTi','Noto Serif SC',serif;
}

/* ===== 右侧图片卡片 ===== */
.split-right {
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
  z-index: 2;
}

/* 徽标 */
.crest { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.crest-line { width: 30px; height: 1px; background: rgba(140,100,60,0.4); }
.crest-line--r { background: linear-gradient(90deg, rgba(140,100,60,0.4), transparent); }
.crest-diamond { font-size: 6px; color: rgba(160,115,70,0.55); }

/* 标题 */
.title-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.main-title {
  font-size: clamp(52px, 7.5vw, 96px); font-weight: 700; letter-spacing: 0.08em; margin: 0;
  font-family: 'STKaiti','KaiTi','Noto Serif SC','SimSun',serif; line-height: 1.1;
  color: #4a2e18;
}
.title-char { display: inline-block; animation: char-rise 0.7s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes char-rise {
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}
.main-subtitle { font-size: clamp(12px, 1.5vw, 16px); letter-spacing: 0.2em; text-transform: uppercase; margin: 0; color: #9a7a58; font-weight: 400; }
.main-divider { width: 80px; height: 1px; background: linear-gradient(90deg, rgba(160,115,70,0.4), rgba(180,135,85,0.5), rgba(160,115,70,0.4)); margin: 2px 0; position: relative; }
.divider-dot { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 4px; height: 4px; background: rgba(170,125,75,0.65); border-radius: 50%; }
.main-desc { font-size: clamp(13px, 1.4vw, 16px); margin: 0; color: #8b6d50; letter-spacing: 0.1em;
  font-family: 'STKaiti','KaiTi','Noto Serif SC',serif; }

/* 按钮 */
.main-actions { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 24px; }

.btn-main {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  min-width: 170px; padding: 0 36px; height: 50px;
  border: none; border-radius: 6px;
  font-size: clamp(15px, 1.6vw, 17px); font-weight: 500;
  cursor: pointer; letter-spacing: 0.1em;
  font-family: 'STKaiti','KaiTi','Noto Serif SC','SimSun',serif;
  outline: none; overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease;
}
.btn-main:hover { transform: translateY(-2px); }
.btn-main:active { transform: translateY(0) scale(0.97); transition: transform 0.1s; }

.btn-main--tour {
  color: #5c3d20;
  background: linear-gradient(180deg, #f5ece0 0%, #eadbc8 50%, #dfccb0 100%);
  box-shadow: 0 2px 12px rgba(140,110,70,0.16), inset 0 1px 0 rgba(255,255,255,0.5);
  border: 1px solid rgba(180,150,120,0.3);
}
.btn-main--tour:hover {
  color: #4a2e15;
  background: linear-gradient(180deg, #faf4ea 0%, #f0e2d0 50%, #e6d4b8 100%);
  box-shadow: 0 6px 24px rgba(140,110,70,0.22), inset 0 1px 0 rgba(255,255,255,0.6);
}

.btn-main--admin {
  color: #fdf8f0;
  background: linear-gradient(180deg, #c8a078 0%, #b08858 50%, #9a7040 100%);
  box-shadow: 0 2px 12px rgba(120,80,40,0.2), inset 0 1px 0 rgba(255,255,255,0.16);
  border: 1px solid rgba(190,150,110,0.35);
}
.btn-main--admin:hover {
  color: #fff;
  background: linear-gradient(180deg, #d4b088 0%, #c09868 50%, #aa7d50 100%);
  box-shadow: 0 6px 28px rgba(140,100,60,0.28), inset 0 1px 0 rgba(255,255,255,0.2);
}

/* 滚动提示 */
.scroll-hint {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  opacity: 0.45; animation: float-down 2.4s ease-in-out infinite; z-index: 10;
  color: #9a7a58;
}
.scroll-hint--up { top: 32px; bottom: auto; animation-name: float-up; }
.scroll-text { font-size: 11px; letter-spacing: 0.12em; }
@keyframes float-down {
  0%,100% { transform: translateX(-50%) translateY(0); opacity: 0.45; }
  50% { transform: translateX(-50%) translateY(8px); opacity: 0.7; }
}
@keyframes float-up {
  0%,100% { transform: translateX(-50%) translateY(0); opacity: 0.45; }
  50% { transform: translateX(-50%) translateY(-8px); opacity: 0.7; }
}

/* ===== 第二屏：轮播 ===== */
.landing-section--carousel {
  justify-content: center;
}

.carousel-wrap {
  position: relative; z-index: 2;
  width: clamp(360px, 72vw, 960px);
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}

.carousel-frame {
  width: 100%; aspect-ratio: 16 / 10;
  border-radius: 8px; overflow: hidden; position: relative;
  box-shadow:
    0 4px 32px rgba(140,110,70,0.2),
    0 1px 6px rgba(100,70,35,0.12),
    0 0 0 10px rgba(253,250,244,0.7),
    0 0 0 11px rgba(180,150,120,0.3);
}

.carousel-slide {
  position: absolute; inset: 0;
  opacity: 0; transition: opacity 1s ease;
  pointer-events: none;
}
.carousel-slide.active { opacity: 1; pointer-events: auto; }
.carousel-slide img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 6s ease;
}
.carousel-wrap:hover .carousel-slide.active img { transform: scale(1.04); }

.carousel-dots { display: flex; gap: 10px; align-items: center; }
.carousel-dot {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1.5px solid rgba(160,120,80,0.4); background: transparent;
  cursor: pointer; transition: all 0.35s ease; padding: 0;
}
.carousel-dot:hover { border-color: rgba(160,120,80,0.7); }
.carousel-dot.active { background: var(--accent); border-color: var(--accent); transform: scale(1.2); }

.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px; border-radius: 50%;
  border: 1px solid rgba(180,150,120,0.2); background: rgba(255,252,247,0.5);
  backdrop-filter: blur(8px); color: #8b6d50;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.3s ease; z-index: 5; padding: 0;
  opacity: 0;
}
.carousel-wrap:hover .carousel-arrow { opacity: 1; }
.carousel-arrow--prev { left: -58px; }
.carousel-arrow--next { right: -58px; }
.carousel-arrow:hover { background: rgba(255,252,247,0.85); border-color: rgba(180,150,120,0.4); transform: translateY(-50%) scale(1.08); }

/* ===== 响应式 ===== */
@media (max-width: 860px) {
  .landing-section { flex-direction: column; gap: 0; padding: 20px; }
  .split-right { padding: 16px 16px 0; order: -1; }
  .image-card-inner {
    width: clamp(200px, 50vw, 300px);
    height: clamp(240px, 55vw, 350px);
    box-shadow: 0 3px 16px rgba(140,110,70,0.16), 0 0 0 5px #fdfaf4, 0 0 0 6px rgba(180,150,120,0.2);
  }
  .image-card-label { font-size: 13px; }
  .split-left { align-items: center; text-align: center; padding: 20px 24px; max-width: 100%; }
  .main-actions { justify-content: center; }
  .main-divider { margin: 2px auto; }
  .carousel-arrow { display: none; }
  .carousel-wrap { width: 92vw; }
}
@media (max-width: 480px) {
  .main-actions { flex-direction: column; gap: 12px; width: 100%; max-width: 240px; }
  .btn-main { width: 100%; min-width: auto; height: 46px; }
  .carousel-frame {
    border-radius: 6px;
    box-shadow: 0 3px 20px rgba(140,110,70,0.18), 0 0 0 6px rgba(253,250,244,0.6), 0 0 0 7px rgba(180,150,120,0.25);
  }
}
</style>
