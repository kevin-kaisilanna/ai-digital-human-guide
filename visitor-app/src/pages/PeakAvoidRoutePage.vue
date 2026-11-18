<template>
  <div class="route-detail">
    <button class="back-btn" @click="$router.push('/route')">
      <span class="back-arrow">&larr;</span>
      <span>返回路线列表</span>
    </button>

    <div class="header">
      <div class="badges">
        <span class="badge badge--peak">错峰智慧游</span>
        <span class="badge badge--time">约6小时</span>
      </div>
      <h1 class="title">避让高峰路线</h1>
      <p class="subtitle">基于大数据分析，巧用人流低谷，独享清净游览体验</p>
    </div>

    <!-- 路线规划图 -->
    <div class="route-map">
      <img src="/images/route-peak-avoid.webp" alt="避让高峰路线规划图" class="map-img" />
      <span class="map-caption">避让高峰路线规划图</span>
    </div>

    <!-- 概览 -->
    <div class="card overview">
      <h3 class="sec-title">路线概览</h3>
      <div class="ov-row">
        <div class="ov-item"><span class="ov-val">7</span><span class="ov-label">景点数量</span></div>
        <div class="ov-item"><span class="ov-val">6h</span><span class="ov-label">预计时长</span></div>
        <div class="ov-item ov-item--wide"><span class="ov-val-s">旺季/节假日出行</span><span class="ov-label">适合人群</span></div>
      </div>
      <p class="ov-desc">基于景区游客流量大数据精心设计的错峰游览方案。清晨8:30首站无尽意斋独享纪念馆宁静；9:30赶在大部队前进入佛教文化博览馆；10:30前往曼飞龙塔欣赏晨光中的白塔金顶；11:00提前在灵山精舍享用素斋避开午餐高峰；12:30趁午间低谷游览灵山大佛轻松抱佛脚；14:00观看梵宫《吉祥颂》下午首场；15:30前往五印坛城享受傍晚转经的宁静时刻。全程逆向思维，巧用人流低谷。</p>
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

    <!-- 错峰时间策略 -->
    <div class="card peak-strategy">
      <h3 class="sec-title">错峰时间策略</h3>
      <div class="strategy-list">
        <div v-for="(s, i) in strategyList" :key="i" class="strategy-item">
          <div class="st-time">{{ s.time }}</div>
          <div class="st-content">
            <h4 class="st-name">{{ s.spot }}</h4>
            <p class="st-reason">{{ s.reason }}</p>
          </div>
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
          <svg v-if="i===0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <svg v-else-if="i===1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <svg v-else-if="i===2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <p class="exp-text">{{ e }}</p>
      </div>
    </div>

    <div class="card tips">
      <h3 class="sec-title">错峰出行贴士</h3>
      <ul class="tips-list">
        <li>本路线专为旺季（3-5月、9-11月）和节假日设计，平日出行体验更佳</li>
        <li>建议上午8:30景区开门即入园，首站直奔无尽意斋（最偏远冷门）</li>
        <li>午餐提前至11:00在灵山精舍用餐，避开12:00-13:00就餐高峰</li>
        <li>灵山大佛午间12:30-13:30为人流低谷，抱佛脚几乎无需排队</li>
        <li>梵宫下午14:00场《吉祥颂》观众较少，入场不用争抢好座位</li>
        <li>五印坛城接近闭园时段（16:00后）游客渐少，夕阳金顶倒影绝美</li>
        <li>九龙灌浴上午10:00场游人最多，本路线将其排除以避开拥挤</li>
      </ul>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { allRoutes } from '@/data/routes'

const routeData = allRoutes.find(r => r.id === 'peak-avoid')!
const spots = routeData.spots
const spotNames = spots.map(s => s.name)
const galleryImages = routeData.gallery || []

const strategyList = [
  { time: '08:30-09:30', spot: '无尽意斋', reason: '景区开门首站直奔最偏远冷门点位，几乎独享整个四合院，赵朴初书法作品可从容细品' },
  { time: '09:30-10:30', spot: '佛教文化博览馆', reason: '趁大部队还在中轴线中段时，悠闲游览三层万佛殿，免费讲解时段无人争抢' },
  { time: '10:30-11:00', spot: '曼飞龙塔', reason: '上午光线从东侧照来，白塔金顶在晨光中熠熠生辉，且此时段游客稀少' },
  { time: '11:00-12:30', spot: '灵山精舍', reason: '比正常午餐时间提前1-2小时，素斋餐厅无需排队，静享禅意用餐时光' },
  { time: '12:30-14:00', spot: '灵山大佛', reason: '午间是灵山大佛人流最低谷时段，抱佛脚无需排队，佛脚平台空旷好出片' },
  { time: '14:00-15:30', spot: '灵山梵宫', reason: '下午首场《吉祥颂》（14:00场）观众较少，大部队多已下山，入场座位充裕' },
  { time: '15:30-17:00', spot: '五印坛城', reason: '接近闭园时段游客渐少，夕阳下的金顶白墙倒映香水海，转经长廊空灵静谧' },
]

const experienceList = [
  '清晨独享无尽意斋，在无人的天井中静坐冥想，感受真正的禅意时光',
  '午间"包场"灵山大佛平台，与88米大佛合影无需避开人群，出片率100%',
  '灵山精舍提前用餐可享受更优质的服务体验，厨师有更多时间精心烹制',
  '傍晚在五印坛城顶层观景台独赏夕阳下的香水海全景，金光洒满藏式金顶',
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
.badge--peak { background: #c04848; }
.badge--time { background: var(--primary-soft); color: var(--text); }
.title { margin: 0 0 6px; font-size: 24px; font-weight: 800; color: var(--text); line-height: 1.3; }
.subtitle { margin: 0; font-size: 14px; color: var(--text-tertiary); }

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
.path-num { width: 20px; height: 20px; border-radius: 50%; background: #c04848; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.path-name { color: var(--text-secondary); white-space: nowrap; }
.path-arrow { color: var(--muted); font-size: 14px; margin: 0 2px; }

/* 错峰策略 */
.peak-strategy { padding: 18px; }
.strategy-list { display: flex; flex-direction: column; }
.strategy-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-light); }
.strategy-item:last-child { border-bottom: none; }
.st-time { font-size: 12px; font-weight: 700; color: #c04848; background: rgba(192,72,72,.08); padding: 4px 8px; border-radius: var(--radius-full); white-space: nowrap; align-self: flex-start; flex-shrink: 0; }
.st-content { flex: 1; }
.st-name { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: var(--text); }
.st-reason { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

.gallery-card { padding: 18px; }
.gallery { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); }
.gallery--2 { grid-template-columns: repeat(2, 1fr); }
.gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-light); }

.timeline { position: relative; margin-bottom: 16px; }
.tl-line { position: absolute; left: 24px; top: 8px; bottom: 8px; width: 3px; background: linear-gradient(180deg, #c04848, #e06868, rgba(192,72,72,.06)); border-radius: 2px; }
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #c04848, #e06868); color: #fff; font-size: 16px; font-weight: 700; z-index: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(192,72,72,.35); }
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.tl-time { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; font-size: 12px; color: #c04848; font-weight: 600; background: rgba(192,72,72,.08); padding: 3px 8px; border-radius: var(--radius-full); }
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.75; }
.tl-tips { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: var(--muted); line-height: 1.6; background: rgba(192,72,72,.04); padding: 10px 12px; border-radius: var(--radius-sm); border-left: 3px solid #c04848; }
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: #c04848; }

.experiences { padding: 18px; }
.exp-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.exp-item:last-child { margin-bottom: 0; }
.exp-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(192,72,72,.1); color: #c04848; display: flex; align-items: center; justify-content: center; }
.exp-text { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }

.tips { padding: 18px; }
.tips-list { margin: 0; padding: 0 0 0 18px; }
.tips-list li { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 4px; }
.bottom-spacer { height: 40px; }
</style>
