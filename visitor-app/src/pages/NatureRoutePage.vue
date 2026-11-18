<template>
  <div class="route-detail">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="$router.push('/route')">
      <span class="back-arrow">&larr;</span>
      <span>返回路线列表</span>
    </button>

    <!-- 标题区 -->
    <div class="header">
      <div class="badges">
        <span class="badge badge--nature">自然风光</span>
        <span class="badge badge--time">约5小时</span>
      </div>
      <h1 class="title">自然风光爱好者路线</h1>
      <p class="subtitle">徜徉灵山山水之间，感受佛国净土的自然之美</p>
    </div>

    <!-- Hero 图占位 -->
    <div class="hero-placeholder">
      <div class="hero-inner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 14c1.7 0 3-1.3 3-3 0-4-3-8-8-8S4 7 4 11c0 1.7 1.3 3 3 3"/><path d="M7 14c-1.7 0-3 1.3-3 3s1.3 3 3 3h10c1.7 0 3-1.3 3-3s-1.3-3-3-3"/><path d="M12 11v10"/><path d="M8 14l4-4 4 4"/></svg>
        <span>灵山胜境 · 5小时全景游</span>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="card overview">
      <h3 class="sec-title">路线概览</h3>
      <div class="ov-row">
        <div class="ov-item">
          <span class="ov-val">8</span>
          <span class="ov-label">景点数量</span>
        </div>
        <div class="ov-item">
          <span class="ov-val">5h</span>
          <span class="ov-label">预计时长</span>
        </div>
        <div class="ov-item ov-item--wide">
          <span class="ov-val-s">摄影达人 / 慢游族</span>
          <span class="ov-label">适合人群</span>
        </div>
      </div>
      <p class="ov-desc">从南门入园至佛足坛瞻仰佛祖圣迹，观赏九龙灌浴水幕奇观感受"花开见佛"的震撼，漫步菩提大道欣赏太湖风光与青龙白虎二山的自然风貌、感受"前有照后有靠左右有抱"的风水格局，登灵山大佛平台俯瞰马山半岛与太湖三万顷碧波，游览曼飞龙塔感受傣族佛教建筑与园林景观的和谐融合，到灵山精舍体验禅意园林的宁静之美与"天人合一"的传统园林文化，最后在梵宫广场结束全景之旅。</p>
    </div>

    <!-- 路线导航 -->
    <div class="card route-path">
      <h3 class="sec-title">游览顺序</h3>
      <div class="path-flow">
        <span v-for="(s, i) in spotNames" :key="i" class="path-node">
          <span class="path-num">{{ i + 1 }}</span>
          <span class="path-name">{{ s }}</span>
          <span v-if="i < spotNames.length - 1" class="path-arrow">&rarr;</span>
        </span>
      </div>
    </div>

    <!-- 沿途风光 -->
    <div class="card gallery-card">
      <h3 class="sec-title">沿途风光</h3>
      <div class="gallery" :class="'gallery--' + galleryImages.length">
        <img v-for="(img, i) in galleryImages" :key="i" :src="img" class="gallery-img" :alt="'沿途风光 ' + (i+1)" loading="lazy" />
      </div>
    </div>

    <!-- 讲解重点 -->
    <div class="card highlights">
      <h3 class="sec-title">讲解重点</h3>
      <p class="hl-intro">本路线以灵山胜境的自然风光与景观美学为主线，将佛教文化与自然山水有机融合，适合摄影爱好者和喜爱慢游的游客。</p>
      <div v-for="(h, i) in highlightList" :key="i" class="hl-item">
        <div class="hl-num">{{ i + 1 }}</div>
        <div class="hl-content">
          <h4 class="hl-name">{{ h.title }}</h4>
          <p class="hl-text">{{ h.text }}</p>
        </div>
      </div>
    </div>

    <!-- 景点时间线 -->
    <h3 class="sec-title sec-title--main">详细行程</h3>
    <div class="timeline">
      <div class="tl-line"></div>
      <div v-for="(spot, i) in spots" :key="i" class="tl-item">
        <div class="tl-num">{{ i + 1 }}</div>
        <div class="tl-card card">
          <div class="tl-head">
            <h4 class="tl-name">{{ spot.name }}</h4>
            <span class="tl-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ spot.visit_time }}
            </span>
          </div>
          <p class="tl-desc">{{ spot.detail }}</p>
          <div class="tl-tips" v-if="spot.tips">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>{{ spot.tips }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 特色体验 -->
    <div class="card experiences">
      <h3 class="sec-title">特色体验</h3>
      <div v-for="(e, i) in experienceList" :key="i" class="exp-item">
        <div class="exp-icon">
          <svg v-if="i === 0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <svg v-else-if="i === 1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <svg v-else-if="i === 2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
        </div>
        <p class="exp-text">{{ e }}</p>
      </div>
    </div>

    <!-- 游览贴士 -->
    <div class="card tips">
      <h3 class="sec-title">实用贴士</h3>
      <ul class="tips-list">
        <li>春秋季节（3-5月、9-11月）气候宜人，温度适中，最适合户外游览</li>
        <li>建议上午9点前入园，下午可观赏太湖日落</li>
        <li>九龙灌浴每日4-5场表演（平日10:00/11:30/13:30/15:00），建议提前到达占位</li>
        <li>菩提大道春季菩提花开时景致绝美，秋季可捡拾菩提叶制作书签</li>
        <li>灵山精舍素斋自助50元/位，茶室免费开放</li>
        <li>大佛平台是拍摄太湖日落的最佳地点，金色阳光与佛身交相辉映</li>
      </ul>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { allRoutes } from '@/data/routes'

const routeData = allRoutes.find(r => r.id === 'nature')!
const spots = routeData.spots
const galleryImages = routeData.gallery || []

const spotNames = spots.map(s => s.name)

const highlightList = [
  {
    title: '菩提大道',
    text: '介绍两侧景观植物的佛教文化意义（菩提树枝繁叶茂象征佛教文化的繁荣昌盛），欣赏太湖与青龙山、白虎山的自然风貌，感受"前有照、后有靠、左右有抱"的风水格局。',
  },
  {
    title: '灵山大佛',
    text: '重点讲解大佛选址的地理优势，俯瞰太湖、马山半岛的绝佳视角，以及大佛与自然环境的和谐融合，感受人与自然的完美统一。',
  },
  {
    title: '曼飞龙塔',
    text: '介绍傣族佛教建筑风格、园林景观设计理念、与自然环境的和谐融合，展现不同民族佛教文化与自然的关系。',
  },
  {
    title: '灵山精舍',
    text: '体验禅意园林的宁静之美，讲解"天人合一"的传统园林文化思想，感受佛教文化中"宁静致远"的精神境界。',
  },
]

const experienceList = [
  '在九龙灌浴接取祈福圣水，寓意吉祥安康，同时欣赏水幕与阳光交织出的七彩佛光',
  '在灵山大佛平台拍摄太湖日落，金色阳光洒在大佛身上，佛光普照，与太湖波光粼粼的水面交相辉映，美不胜收',
  '在灵山精舍品尝素斋，感受佛门饮食文化的清淡雅致，体验"禅食一味"的生活方式',
  '在菩提大道漫步，欣赏太湖风光，感受佛教文化与自然环境的完美融合，放松身心，净化心灵',
]
</script>

<style scoped>
.route-detail {
  padding: 16px 16px 40px;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* ── 返回 ── */
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; font-size: 15px; font-weight: 600;
  color: var(--muted); cursor: pointer; font-family: inherit;
  padding: 8px 12px; margin-bottom: 12px; margin-left: -12px;
  border-radius: var(--radius-sm); transition: all var(--transition);
}
.back-btn:hover { color: var(--text); background: var(--surface-hover); }
.back-arrow { font-size: 18px; }

/* ── 标题 ── */
.header { margin-bottom: 16px; }
.badges { display: flex; gap: 8px; margin-bottom: 10px; }
.badge {
  font-size: 12px; font-weight: 700; padding: 4px 12px;
  border-radius: var(--radius-full); color: #fff;
}
.badge--nature { background: #3a8a5e; }
.badge--time { background: var(--primary-soft); color: var(--text); }
.title {
  margin: 0 0 6px; font-size: 24px; font-weight: 800; color: var(--text); line-height: 1.3;
}
.subtitle { margin: 0; font-size: 14px; color: var(--text-tertiary); }

/* ── Hero 占位 ── */
.hero-placeholder {
  height: 160px; border-radius: var(--radius);
  background: linear-gradient(135deg, #c8e6d4 0%, #a8d8ba 30%, #b8dcc8 60%, #90c8a8 100%);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; color: #3a8a5e;
}
.hero-inner { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }

/* ── 卡片 ── */
.card {
  background: var(--card-bg); border: 1px solid var(--border-light);
  border-radius: var(--radius); padding: 18px; margin-bottom: 14px;
}

/* ── 概览 ── */
.sec-title { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: var(--text); }
.sec-title--main { margin: 20px 0 16px; font-size: 18px; }
.ov-row { display: flex; gap: 10px; margin-bottom: 14px; }
.ov-item { flex: 1; text-align: center; padding: 12px 6px; background: var(--primary-soft); border-radius: var(--radius-sm); }
.ov-item--wide { flex: 2; }
.ov-val { display: block; font-size: 24px; font-weight: 800; color: var(--accent); line-height: 1.2; }
.ov-val-s { display: block; font-size: 13px; font-weight: 700; color: var(--accent); line-height: 1.4; }
.ov-label { display: block; font-size: 10px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: .05em; }
.ov-desc { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.8; }

/* ── 路线节点流 ── */
.route-path { padding: 16px; }
.path-flow { display: flex; flex-wrap: wrap; gap: 6px 4px; align-items: center; }
.path-node { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; }
.path-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: #3a8a5e; color: #fff; font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.path-name { color: var(--text-secondary); white-space: nowrap; }
.path-arrow { color: var(--muted); font-size: 14px; margin: 0 2px; }

/* ── 沿途风光 ── */
.gallery-card { padding: 18px; }
.gallery { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); }
.gallery--2 { grid-template-columns: repeat(2, 1fr); }
.gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-light); }

/* ── 讲解重点 ── */
.hl-intro { margin: 0 0 16px; font-size: 13px; color: var(--text-tertiary); line-height: 1.6; }
.hl-item { display: flex; gap: 12px; margin-bottom: 14px; }
.hl-num {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #3a8a5e, #5aaa7e);
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.hl-content { flex: 1; }
.hl-name { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: var(--text); }
.hl-text { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }

/* ── 时间线 ── */
.timeline { position: relative; margin-bottom: 16px; }
.tl-line {
  position: absolute; left: 24px; top: 8px; bottom: 8px;
  width: 3px; background: linear-gradient(180deg, #3a8a5e, #5aaa7e, rgba(58,138,94,.06));
  border-radius: 2px;
}
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #3a8a5e, #5aaa7e);
  color: #fff; font-size: 16px; font-weight: 700; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 12px rgba(58,138,94,.35);
}
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.tl-time {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: 12px; color: #3a8a5e; font-weight: 600;
  background: rgba(58,138,94,.08); padding: 3px 8px; border-radius: var(--radius-full);
}
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.75; }
.tl-tips {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 12px; color: var(--muted); line-height: 1.6;
  background: rgba(58,138,94,.04); padding: 10px 12px;
  border-radius: var(--radius-sm); border-left: 3px solid #3a8a5e;
}
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: #3a8a5e; }

/* ── 特色体验 ── */
.experiences { padding: 18px; }
.exp-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.exp-item:last-child { margin-bottom: 0; }
.exp-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(58,138,94,.1); color: #3a8a5e;
  display: flex; align-items: center; justify-content: center;
}
.exp-text { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }

/* ── 实用贴士 ── */
.tips { padding: 18px; }
.tips-list { margin: 0; padding: 0 0 0 18px; }
.tips-list li { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 4px; }

.bottom-spacer { height: 40px; }
</style>
