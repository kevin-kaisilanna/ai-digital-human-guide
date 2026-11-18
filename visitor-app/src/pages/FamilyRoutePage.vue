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
        <span class="badge badge--family">亲子游</span>
        <span class="badge badge--time">约4小时</span>
      </div>
      <h1 class="title">亲子家庭路线</h1>
      <p class="subtitle">轻松愉快的亲子之旅，让孩子在玩耍中感受佛教文化</p>
    </div>

    <!-- Hero 图占位 -->
    <div class="hero-placeholder">
      <div class="hero-inner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="5" r="3"/><path d="M5 14c0-4 3-6 7-6s7 2 7 6"/><path d="M8 14v7"/><path d="M16 14v7"/></svg>
        <span>灵山胜境 · 4小时轻松游</span>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="card overview">
      <h3 class="sec-title">路线概览</h3>
      <div class="ov-row">
        <div class="ov-item">
          <span class="ov-val">5</span>
          <span class="ov-label">景点数量</span>
        </div>
        <div class="ov-item">
          <span class="ov-val">4h</span>
          <span class="ov-label">预计时长</span>
        </div>
        <div class="ov-item ov-item--wide">
          <span class="ov-val-s">亲子家庭 / 带老人</span>
          <span class="ov-label">适合人群</span>
        </div>
      </div>
      <p class="ov-desc">从南门入园直奔九龙灌浴观看动态表演，用生动故事让孩子了解释迦牟尼诞生的传说与"花开见佛"的祥瑞景象；到佛手广场摸"天下第一掌"沾福气；在百子戏弥勒让孩子与形态各异的孩童雕塑互动，感受"皆大欢喜"的欢乐氛围；入梵宫欣赏色彩绚丽的艺术作品；最后到五印坛城转动经筒体验藏式文化。全程以互动体验为主，轻松不累，推车友好。</p>
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
      <p class="hl-intro">本路线以互动体验和趣味科普为主线，路线轻松短小，全程推车友好，适合带小朋友的家庭和携老人出游的游客。</p>
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
          <svg v-if="i === 0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 00-8.48-8.48L12 3.46l-.24.24a6 6 0 00-1.33 7.79"/><path d="M2 22l1.5-5.5L12 11l5.5-1.5L22 2l-3 3"/></svg>
          <svg v-else-if="i === 1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <svg v-else-if="i === 2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <p class="exp-text">{{ e }}</p>
      </div>
    </div>

    <!-- 游览贴士 -->
    <div class="card tips">
      <h3 class="sec-title">亲子实用贴士</h3>
      <ul class="tips-list">
        <li>九龙灌浴表演建议提前10分钟到达占位，让孩子站在前排看清"花开见佛"全过程</li>
        <li>百子戏弥勒是孩子最喜欢的景点，建议预留充足时间让孩子自由探索拍照</li>
        <li>梵宫《灵山吉祥颂》演出每日10:35/11:30/14:00/16:00，全息投影效果孩子非常喜欢</li>
        <li>景区内素面套餐（35元/位）清淡雅致，适合孩子口味</li>
        <li>全程路面平坦推车友好，各主要景点之间距离适中，老人孩子都不会太累</li>
        <li>记得在百子戏弥勒前拍全家福留念，找找哪个孩子的姿态最像自家宝贝</li>
      </ul>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { allRoutes } from '@/data/routes'

const routeData = allRoutes.find(r => r.id === 'family')!
const spots = routeData.spots
const galleryImages = routeData.gallery || []

const spotNames = spots.map(s => s.name)

const highlightList = [
  {
    title: '九龙灌浴',
    text: '用生动语言讲述释迦牟尼诞生的故事，让孩子理解佛教文化中的慈悲精神；解释"九龙吐水"的传说与"花开见佛"的仪式感，激发孩子对传统文化的兴趣。',
  },
  {
    title: '百子戏弥勒',
    text: '介绍雕塑中孩童的不同形态，引导孩子感受"皆大欢喜"的生活态度，让孩子在轻松愉快的氛围中理解佛教文化的核心价值观。',
  },
  {
    title: '梵宫',
    text: '简化艺术术语，重点介绍色彩、造型等直观元素，激发孩子的艺术兴趣——如穹顶天象图中的飞天形象、《华藏世界》琉璃作品的七彩光芒等。',
  },
  {
    title: '五印坛城',
    text: '用简单易懂的语言介绍藏传佛教文化，如转经筒的作用、唐卡的艺术特色等，让孩子在互动中感受不同民族文化的魅力。',
  },
]

const experienceList = [
  '参与"抱佛脚"亲子活动，让孩子在家长的陪伴下登顶大佛，感受大佛的宏伟气势，培养勇气与探索精神',
  '在梵宫圣坛观看互动表演《灵山吉祥颂》，通过全息投影、水雾等现代科技，让孩子直观感受佛陀修行成佛的故事',
  '在景区内体验特色素面套餐（35元/位），清淡雅致，适合孩子口味，同时让孩子了解佛门饮食文化的特点',
  '在百子戏弥勒雕塑前拍照留念，让孩子与形态各异的孩童雕塑互动，感受"皆大欢喜"的生活态度',
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
.badge--family { background: #b08028; }
.badge--time { background: var(--primary-soft); color: var(--text); }
.title {
  margin: 0 0 6px; font-size: 24px; font-weight: 800; color: var(--text); line-height: 1.3;
}
.subtitle { margin: 0; font-size: 14px; color: var(--text-tertiary); }

/* ── Hero 占位 ── */
.hero-placeholder {
  height: 160px; border-radius: var(--radius);
  background: linear-gradient(135deg, #f5e6c8 0%, #f0d8a0 30%, #f2e0b8 60%, #e8cc90 100%);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; color: #b08028;
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
  background: #b08028; color: #fff; font-size: 10px; font-weight: 700;
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
  background: linear-gradient(135deg, #b08028, #d4a848);
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
  width: 3px; background: linear-gradient(180deg, #b08028, #d4a848, rgba(176,128,40,.06));
  border-radius: 2px;
}
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #b08028, #d4a848);
  color: #fff; font-size: 16px; font-weight: 700; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 12px rgba(176,128,40,.35);
}
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.tl-time {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: 12px; color: #b08028; font-weight: 600;
  background: rgba(176,128,40,.08); padding: 3px 8px; border-radius: var(--radius-full);
}
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.75; }
.tl-tips {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 12px; color: var(--muted); line-height: 1.6;
  background: rgba(176,128,40,.04); padding: 10px 12px;
  border-radius: var(--radius-sm); border-left: 3px solid #b08028;
}
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: #b08028; }

/* ── 特色体验 ── */
.experiences { padding: 18px; }
.exp-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.exp-item:last-child { margin-bottom: 0; }
.exp-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(176,128,40,.1); color: #b08028;
  display: flex; align-items: center; justify-content: center;
}
.exp-text { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }

/* ── 实用贴士 ── */
.tips { padding: 18px; }
.tips-list { margin: 0; padding: 0 0 0 18px; }
.tips-list li { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 4px; }

.bottom-spacer { height: 40px; }
</style>
