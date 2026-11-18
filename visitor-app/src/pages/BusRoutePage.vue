<template>
  <div class="route-detail">
    <button class="back-btn" @click="$router.push('/route')">
      <span class="back-arrow">&larr;</span>
      <span>返回路线列表</span>
    </button>

    <div class="header">
      <div class="badges">
        <span class="badge badge--bus">观光车</span>
        <span class="badge badge--time">约3-4小时</span>
      </div>
      <h1 class="title">观光车路线</h1>
      <p class="subtitle">乘坐景区观光车，高效游览灵山核心景点</p>
    </div>

    <!-- 路线规划图 -->
    <div class="route-map">
      <img src="/images/route-bus.webp" alt="观光车旅游路线规划图" class="map-img" />
      <span class="map-caption">观光车旅游路线规划图</span>
    </div>

    <!-- 概览 -->
    <div class="card overview">
      <h3 class="sec-title">路线概览</h3>
      <div class="ov-row">
        <div class="ov-item"><span class="ov-val">7</span><span class="ov-label">站点数量</span></div>
        <div class="ov-item"><span class="ov-val">3-4h</span><span class="ov-label">预计时长</span></div>
        <div class="ov-item ov-item--wide"><span class="ov-val-s">时间有限 / 不便步行</span><span class="ov-label">适合人群</span></div>
      </div>
      <p class="ov-desc">乘坐景区观光车沿中轴线高效游览灵山胜境核心景点。从南门观光车总站出发，第一站灵山大照壁打卡"华夏第一壁"，第二站九龙灌浴观赏动态喷泉表演，第三站祥符禅寺聆听千年古刹钟声，第四站灵山大佛登顶抱佛脚俯瞰太湖全景，第五站灵山梵宫欣赏佛教艺术殿堂，第六站五印坛城转经祈福，最后曼飞龙塔感受南传佛教建筑美学。全程接驳车代步，省时省力。</p>
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

    <!-- 观光车信息 -->
    <div class="card bus-info">
      <h3 class="sec-title">观光车乘坐指南</h3>
      <div class="bus-details">
        <div class="bus-row"><span class="bus-label">运营时间</span><span class="bus-val">8:30 - 17:00</span></div>
        <div class="bus-row"><span class="bus-label">发车间隔</span><span class="bus-val">平日10-15分钟/班，节假日5-8分钟/班</span></div>
        <div class="bus-row"><span class="bus-label">车票价格</span><span class="bus-val">30元/人，全天有效，1.2米以下儿童免费</span></div>
        <div class="bus-row"><span class="bus-label">全程距离</span><span class="bus-val">约8公里，单圈约30分钟</span></div>
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
    <h3 class="sec-title sec-title--main">站点详情</h3>
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
          <svg v-if="i===0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 23 19 8 19 1 19"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <svg v-else-if="i===1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="i===2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <p class="exp-text">{{ e }}</p>
      </div>
    </div>

    <div class="card tips">
      <h3 class="sec-title">实用贴士</h3>
      <ul class="tips-list">
        <li>建议入园后第一时间购买观光车票（30元/人），全天无限次乘坐</li>
        <li>各站点均设有候车亭和电子屏显示下一班车到达时间</li>
        <li>灵山大佛站有电梯直达佛脚平台，无需爬216级台阶</li>
        <li>梵宫《灵山吉祥颂》演出时间 10:35/11:30/14:00/16:00，建议提前规划到站时间</li>
        <li>末班车17:00从山顶大佛站发车，请合理安排最后一站时间</li>
        <li>节假日观光车可能排队，建议上午早到或选择非节假日出行</li>
      </ul>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { allRoutes } from '@/data/routes'

const routeData = allRoutes.find(r => r.id === 'bus')!
const spots = routeData.spots
const spotNames = spots.map(s => s.name)
const galleryImages = routeData.gallery || []

const experienceList = [
  '乘坐观光车穿梭于香水海两岸，轻松惬意地欣赏沿途山水风光，省去步行劳累',
  '在灵山大佛站乘电梯直达佛脚平台（无需爬216级台阶），轻松抱佛脚祈福许愿',
  '在梵宫站预留充足时间观赏《灵山吉祥颂》演出，通过全息投影感受佛陀成道故事',
  '观光车票30元/人全天有效，各站点均可购票，1.2米以下儿童免费乘坐',
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
.badge--bus { background: #c08040; }
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
.path-num { width: 20px; height: 20px; border-radius: 50%; background: #c08040; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.path-name { color: var(--text-secondary); white-space: nowrap; }
.path-arrow { color: var(--muted); font-size: 14px; margin: 0 2px; }

/* 观光车信息 */
.bus-info { padding: 18px; }
.bus-details { display: flex; flex-direction: column; gap: 10px; }
.bus-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-light); }
.bus-row:last-child { border-bottom: none; }
.bus-label { font-size: 13px; font-weight: 600; color: var(--text); flex-shrink: 0; }
.bus-val { font-size: 13px; color: var(--text-secondary); text-align: right; line-height: 1.5; }

.gallery-card { padding: 18px; }
.gallery { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); }
.gallery--2 { grid-template-columns: repeat(2, 1fr); }
.gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-light); }

.timeline { position: relative; margin-bottom: 16px; }
.tl-line { position: absolute; left: 24px; top: 8px; bottom: 8px; width: 3px; background: linear-gradient(180deg, #c08040, #d4a060, rgba(192,128,64,.06)); border-radius: 2px; }
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #c08040, #d4a060); color: #fff; font-size: 16px; font-weight: 700; z-index: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(192,128,64,.35); }
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.tl-time { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; font-size: 12px; color: #c08040; font-weight: 600; background: rgba(192,128,64,.08); padding: 3px 8px; border-radius: var(--radius-full); }
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.75; }
.tl-tips { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: var(--muted); line-height: 1.6; background: rgba(192,128,64,.04); padding: 10px 12px; border-radius: var(--radius-sm); border-left: 3px solid #c08040; }
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: #c08040; }

.experiences { padding: 18px; }
.exp-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.exp-item:last-child { margin-bottom: 0; }
.exp-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(192,128,64,.1); color: #c08040; display: flex; align-items: center; justify-content: center; }
.exp-text { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }

.tips { padding: 18px; }
.tips-list { margin: 0; padding: 0 0 0 18px; }
.tips-list li { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 4px; }
.bottom-spacer { height: 40px; }
</style>
