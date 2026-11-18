<template>
  <div class="route-detail">
    <button class="back-btn" @click="$router.push('/route')">
      <span class="back-arrow">&larr;</span>
      <span>返回路线列表</span>
    </button>

    <div class="header">
      <div class="badges">
        <span class="badge badge--unofficial">秘境探索</span>
        <span class="badge badge--time">约5小时</span>
      </div>
      <h1 class="title">非官方旅游路线</h1>
      <p class="subtitle">避开常规人潮，深入灵山秘境，独享禅意宁静</p>
    </div>

    <!-- 路线规划图 -->
    <div class="route-map">
      <img src="/images/route-unofficial.webp" alt="非官方旅游路线规划图" class="map-img" />
      <span class="map-caption">非官方旅游路线规划图</span>
    </div>

    <!-- 概览 -->
    <div class="card overview">
      <h3 class="sec-title">路线概览</h3>
      <div class="ov-row">
        <div class="ov-item"><span class="ov-val">7</span><span class="ov-label">景点数量</span></div>
        <div class="ov-item"><span class="ov-val">5h</span><span class="ov-label">预计时长</span></div>
        <div class="ov-item ov-item--wide"><span class="ov-val-s">深度探索者</span><span class="ov-label">适合人群</span></div>
      </div>
      <p class="ov-desc">避开常规人流，从南门入园后走五明桥感受五种佛教智慧，经降魔浮雕细品佛陀成道故事，瞻仰阿育王柱了解佛法东传历史，入佛教文化博览馆三层万佛殿打卡祈福，游曼飞龙塔感受南传佛教建筑美学，访无尽意斋在赵朴初纪念馆静心品茗，最后到灵山精舍体验禅意园林的宁静。全程远离主客流，独享灵山静谧之美。</p>
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

    <!-- 讲解重点 -->
    <div class="card highlights">
      <h3 class="sec-title">讲解重点</h3>
      <p class="hl-intro">本路线专为追求独特体验的游客设计，避开常规大客流路线，深入探访灵山胜境中容易被忽略的文化瑰宝。</p>
      <div v-for="(h, i) in highlightList" :key="i" class="hl-item">
        <div class="hl-num">{{ i + 1 }}</div>
        <div class="hl-content">
          <h4 class="hl-name">{{ h.title }}</h4>
          <p class="hl-text">{{ h.text }}</p>
        </div>
      </div>
    </div>

    <!-- 实景照片 -->
    <div class="card gallery-card">
      <h3 class="sec-title">沿途风光</h3>
      <div class="gallery" :class="'gallery--' + galleryImages.length">
        <img v-for="(img, i) in galleryImages" :key="i" :src="img" class="gallery-img" :alt="'沿途风光 ' + (i+1)" loading="lazy" />
      </div>
    </div>

    <!-- 时间线 -->
    <h3 class="sec-title sec-title--main">详细行程</h3>
    <div class="timeline">
      <div class="tl-line"></div>
      <div v-for="(spot, i) in spots" :key="i" class="tl-item">
        <div class="tl-num">{{ i + 1 }}</div>
        <div class="tl-card card">
          <div class="tl-head">
            <h4 class="tl-name">{{ spot.name }}</h4>
            <span class="tl-time"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{{ spot.visit_time }}</span>
          </div>
          <p class="tl-desc">{{ spot.detail }}</p>
          <div class="tl-tips" v-if="spot.tips"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span>{{ spot.tips }}</span></div>
        </div>
      </div>
    </div>

    <!-- 特色体验 -->
    <div class="card experiences">
      <h3 class="sec-title">特色体验</h3>
      <div v-for="(e, i) in experienceList" :key="i" class="exp-item">
        <div class="exp-icon">
          <svg v-if="i===0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <svg v-else-if="i===1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <svg v-else-if="i===2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
        </div>
        <p class="exp-text">{{ e }}</p>
      </div>
    </div>

    <div class="card tips">
      <h3 class="sec-title">秘境探索贴士</h3>
      <ul class="tips-list">
        <li>建议上午9点前入园，首站直奔无尽意斋享受清晨无人时光</li>
        <li>佛教文化博览馆免费参观，讲解时段 9:30/11:00/14:30/16:00</li>
        <li>本路线步行距离较长（约6公里），建议穿舒适的步行鞋</li>
        <li>灵山精舍素斋自助50元/位，食材取自自营菜园</li>
        <li>无尽意斋因位于山林间道路略有坡度，不便步行可选择观光车前往</li>
      </ul>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { allRoutes } from '@/data/routes'

const routeData = allRoutes.find(r => r.id === 'unofficial')!
const spots = routeData.spots
const spotNames = spots.map(s => s.name)
const galleryImages = routeData.gallery || []

const highlightList = [
  { title: '五明桥', text: '五座汉白玉石拱桥象征佛教五种核心智慧（声明/因明/内明/医方明/工巧明），漫步过桥体悟"开启智慧、走向觉悟"的禅意，桥面倒映香水海如五条玉带横卧碧波。' },
  { title: '降魔浮雕', text: '26米巨型花岗岩浮雕再现佛陀在菩提树下战胜魔王波旬诱惑威胁、最终觉悟成佛的场景，高浮雕与浅浮雕结合的精湛工艺令人叹为观止，是佛教艺术珍品。' },
  { title: '阿育王柱', text: '复刻古印度阿育王石柱造型，柱头四头狮子分别朝向东南西北四方，象征佛法向世界各地传播，是佛教从印度传入中国的重要历史象征。' },
  { title: '佛教文化博览馆', text: '大佛座基内三层展馆，三层万佛殿9999尊小佛像与室外大佛形成"万佛朝宗"震撼格局，免费参观，一层展示五方五佛与四大名山文化。' },
  { title: '无尽意斋', text: '赵朴初先生北京故居复刻，青砖灰瓦四合院，正房展出赵朴初数十幅书法真迹与灵山渊源史料，天井翠竹掩映，禅茶室免费品茗。' },
]

const experienceList = [
  '在五明桥拍摄石桥与香水海倒影同框美景，五条洁白汉白玉玉带横卧碧波水面，意境悠远',
  '在佛教文化博览馆三层万佛殿免费领取祈福卡，写下心愿悬挂于指定祈福区',
  '在无尽意斋禅意茶室免费品鉴灵山禅茶，于天井石凳静坐阅读，远离景区喧嚣',
  '在灵山精舍品尝素斋（50元/位），食材取自自营菜园，体验"禅食一味"的佛门饮食文化',
]
</script>

<style scoped>
.route-detail { padding: 16px 16px 40px; flex: 1; min-height: 0; min-width: 0; overflow-y: auto; overflow-x: hidden; width: 100%; box-sizing: border-box; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; font-size: 15px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: inherit; padding: 8px 12px; margin-bottom: 12px; margin-left: -12px; border-radius: var(--radius-sm); transition: all var(--transition); }
.back-btn:hover { color: var(--text); background: var(--surface-hover); }
.back-arrow { font-size: 18px; }
.header { margin-bottom: 16px; }
.badges { display: flex; gap: 8px; margin-bottom: 10px; }
.badge { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full); color: #fff; }
.badge--unofficial { background: #8a6aaa; }
.badge--time { background: var(--primary-soft); color: var(--text); }
.title { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: var(--text); line-height: 1.3; }
.subtitle { margin: 0; font-size: 14px; color: var(--text-tertiary); }

/* 路线规划图 */
.route-map { margin-bottom: 16px; border-radius: var(--radius); overflow: hidden; background: var(--card-bg); border: 1px solid var(--border-light); }
.map-img { width: 100%; display: block; object-fit: cover; }
.map-caption { display: block; text-align: center; font-size: 11px; color: var(--muted); padding: 8px; }

.card { background: var(--card-bg); border: 1px solid var(--border-light); border-radius: var(--radius); padding: 18px; margin-bottom: 14px; }
.sec-title { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: var(--text); }
.sec-title--main { margin: 20px 0 16px; font-size: 18px; }
.ov-row { display: flex; gap: 10px; margin-bottom: 14px; }
.ov-item { flex: 1; text-align: center; padding: 12px 6px; background: var(--primary-soft); border-radius: var(--radius-sm); }
.ov-item--wide { flex: 2; }
.ov-val { display: block; font-size: 24px; font-weight: 800; color: var(--accent); line-height: 1.2; }
.ov-val-s { display: block; font-size: 13px; font-weight: 700; color: var(--accent); line-height: 1.4; }
.ov-label { display: block; font-size: 10px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: .05em; }
.ov-desc { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.8; }

.route-path { padding: 16px; }
.path-flow { display: flex; flex-wrap: wrap; gap: 6px 4px; align-items: center; }
.path-node { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; }
.path-num { width: 20px; height: 20px; border-radius: 50%; background: #8a6aaa; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.path-name { color: var(--text-secondary); white-space: nowrap; }
.path-arrow { color: var(--muted); font-size: 14px; margin: 0 2px; }

.hl-intro { margin: 0 0 16px; font-size: 13px; color: var(--text-tertiary); line-height: 1.6; }
.hl-item { display: flex; gap: 12px; margin-bottom: 14px; }
.hl-num { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #8a6aaa, #a88acc); color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.hl-content { flex: 1; }
.hl-name { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: var(--text); }
.hl-text { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }

/* 实景照片 */
.gallery-card { padding: 18px; }
.gallery { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); }
.gallery--2 { grid-template-columns: repeat(2, 1fr); }
.gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-light); }

.timeline { position: relative; margin-bottom: 16px; }
.tl-line { position: absolute; left: 24px; top: 8px; bottom: 8px; width: 3px; background: linear-gradient(180deg, #8a6aaa, #a88acc, rgba(138,106,170,.06)); border-radius: 2px; }
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #8a6aaa, #a88acc); color: #fff; font-size: 16px; font-weight: 700; z-index: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(138,106,170,.35); }
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.tl-time { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; font-size: 12px; color: #8a6aaa; font-weight: 600; background: rgba(138,106,170,.08); padding: 3px 8px; border-radius: var(--radius-full); }
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.75; }
.tl-tips { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: var(--muted); line-height: 1.6; background: rgba(138,106,170,.04); padding: 10px 12px; border-radius: var(--radius-sm); border-left: 3px solid #8a6aaa; }
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: #8a6aaa; }

.experiences { padding: 18px; }
.exp-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.exp-item:last-child { margin-bottom: 0; }
.exp-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(138,106,170,.1); color: #8a6aaa; display: flex; align-items: center; justify-content: center; }
.exp-text { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }

.tips { padding: 18px; }
.tips-list { margin: 0; padding: 0 0 0 18px; }
.tips-list li { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 4px; }
.bottom-spacer { height: 40px; }
</style>
