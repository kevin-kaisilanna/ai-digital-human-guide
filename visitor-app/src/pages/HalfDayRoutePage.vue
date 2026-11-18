<template>
  <div class="route-detail">
    <button class="back-btn" @click="$router.push('/route')">
      <span class="back-arrow">&larr;</span>
      <span>返回路线列表</span>
    </button>

    <div class="header">
      <div class="badges">
        <span class="badge badge--half">半日精华</span>
        <span class="badge badge--time">约3小时</span>
      </div>
      <h1 class="title">半日精华游</h1>
      <p class="subtitle">覆盖灵山最核心景点，3小时快速领略灵山精华</p>
    </div>

    <!-- 路线规划图 -->
    <div class="route-map">
      <img src="/images/route-bus.webp" alt="半日精华游路线规划图" class="map-img" />
      <span class="map-caption">半日精华游路线规划图</span>
    </div>

    <!-- 概览 -->
    <div class="card overview">
      <h3 class="sec-title">路线概览</h3>
      <div class="ov-row">
        <div class="ov-item"><span class="ov-val">6</span><span class="ov-label">景点数量</span></div>
        <div class="ov-item"><span class="ov-val">3h</span><span class="ov-label">预计时长</span></div>
        <div class="ov-item ov-item--wide"><span class="ov-val-s">时间有限 / 快速打卡</span><span class="ov-label">适合人群</span></div>
      </div>
      <p class="ov-desc">从南门入园先打卡灵山大照壁"华夏第一壁"，经五明桥感受佛教五种智慧，直奔九龙灌浴观看必看的动态音乐喷泉表演"花开见佛"，到佛手广场摸"天下第一掌"沾福气，登灵山大佛抱佛脚俯瞰太湖全景，最后入灵山梵宫快速参观佛教艺术殿堂。覆盖灵山最核心的6大景点，高效不绕路，全程约3小时。</p>
    </div>

    <!-- 游览顺序 -->
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

    <!-- 时间分配建议 -->
    <div class="card time-plan">
      <h3 class="sec-title">时间分配建议</h3>
      <div class="time-list">
        <div v-for="(t, i) in timePlan" :key="i" class="time-item">
          <div class="tm-slot">{{ t.time }}</div>
          <div class="tm-content">
            <h4 class="tm-name">{{ t.spot }}</h4>
            <p class="tm-desc">{{ t.tip }}</p>
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
    <h3 class="sec-title sec-title--main">景点详情</h3>
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

    <!-- 核心体验 -->
    <div class="card experiences">
      <h3 class="sec-title">核心体验</h3>
      <div v-for="(e, i) in experienceList" :key="i" class="exp-item">
        <div class="exp-icon">
          <svg v-if="i===0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <svg v-else-if="i===1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="i===2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="8 14 12 10 16 14"/></svg>
        </div>
        <p class="exp-text">{{ e }}</p>
      </div>
    </div>

    <div class="card tips">
      <h3 class="sec-title">快速游览贴士</h3>
      <ul class="tips-list">
        <li>建议上午9点前入园，趁人少快速完成大照壁和五明桥的打卡拍照</li>
        <li>九龙灌浴每日4-5场（平日10:00/11:30/13:30/15:00），建议赶10:00首场，人少视角好</li>
        <li>灵山大佛建议乘电梯登顶（节省爬216级台阶的20分钟时间）</li>
        <li>梵宫《灵山吉祥颂》演出每日10:35/11:30/14:00/16:00，若时间匹配可顺路观看</li>
        <li>本路线全程步行约3公里，节奏较快，建议穿舒适步行鞋</li>
        <li>若还有富余时间，可顺路增加五印坛城（梵宫步行3分钟即达）</li>
      </ul>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { allRoutes } from '@/data/routes'

const routeData = allRoutes.find(r => r.id === 'half-day')!
const spots = routeData.spots
const spotNames = spots.map(s => s.name)
const galleryImages = routeData.gallery || []

const timePlan = [
  { time: '08:30-08:50', spot: '灵山大照壁', tip: '入园首站打卡"华夏第一壁"，拍摄湖光壁影同框，5分钟即可完成' },
  { time: '08:50-09:10', spot: '五明桥', tip: '漫步五座汉白玉石拱桥，感受五种佛教智慧，拍摄石桥倒映香水海美景' },
  { time: '09:10-09:50', spot: '九龙灌浴', tip: '提前10分钟到场占位，观看10:00首场"花开见佛"动态喷泉表演，接取圣水祈福' },
  { time: '09:50-10:10', spot: '佛手广场', tip: '摸"天下第一掌"沾福气，与11.7m高佛手合影，悬挂祈福牌寄托心愿' },
  { time: '10:10-11:10', spot: '灵山大佛', tip: '乘电梯登顶抱佛脚祈福，俯瞰太湖三万顷碧波，参观佛教文化博览馆三层万佛殿' },
  { time: '11:10-11:50', spot: '灵山梵宫', tip: '快速参观佛教艺术殿堂，欣赏《华藏世界》琉璃巨制与28m星空穹顶，赶11:30场《吉祥颂》' },
]

const experienceList = [
  '在九龙灌浴接取龙头"圣水"祈福，水幕与阳光交织出七彩佛光，寓意吉祥安康',
  '登216级台阶（或乘电梯）抱佛脚祈福许愿，佛脚平台俯瞰太湖马山半岛绝美全景',
  '在梵宫圣坛观看《灵山吉祥颂》全息投影演出，感受现代科技与佛教文化的完美融合',
  '摸"天下第一掌"掌心沾福气，与家人合影留念，分享灵山之行的美好时刻',
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
.badge--half { background: #2a9d8f; }
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
.path-num { width: 20px; height: 20px; border-radius: 50%; background: #2a9d8f; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.path-name { color: var(--text-secondary); white-space: nowrap; }
.path-arrow { color: var(--muted); font-size: 14px; margin: 0 2px; }

/* 时间分配 */
.time-plan { padding: 18px; }
.time-list { display: flex; flex-direction: column; }
.time-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-light); }
.time-item:last-child { border-bottom: none; }
.tm-slot { font-size: 12px; font-weight: 700; color: #2a9d8f; background: rgba(42,157,143,.08); padding: 4px 8px; border-radius: var(--radius-full); white-space: nowrap; align-self: flex-start; flex-shrink: 0; }
.tm-content { flex: 1; }
.tm-name { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: var(--text); }
.tm-desc { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

.gallery-card { padding: 18px; }
.gallery { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); }
.gallery--2 { grid-template-columns: repeat(2, 1fr); }
.gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-light); }

.timeline { position: relative; margin-bottom: 16px; }
.tl-line { position: absolute; left: 24px; top: 8px; bottom: 8px; width: 3px; background: linear-gradient(180deg, #2a9d8f, #40b5a5, rgba(42,157,143,.06)); border-radius: 2px; }
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #2a9d8f, #40b5a5); color: #fff; font-size: 16px; font-weight: 700; z-index: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(42,157,143,.35); }
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.tl-time { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; font-size: 12px; color: #2a9d8f; font-weight: 600; background: rgba(42,157,143,.08); padding: 3px 8px; border-radius: var(--radius-full); }
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.75; }
.tl-tips { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: var(--muted); line-height: 1.6; background: rgba(42,157,143,.04); padding: 10px 12px; border-radius: var(--radius-sm); border-left: 3px solid #2a9d8f; }
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: #2a9d8f; }

.experiences { padding: 18px; }
.exp-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.exp-item:last-child { margin-bottom: 0; }
.exp-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(42,157,143,.1); color: #2a9d8f; display: flex; align-items: center; justify-content: center; }
.exp-text { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }

.tips { padding: 18px; }
.tips-list { margin: 0; padding: 0 0 0 18px; }
.tips-list li { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 4px; }
.bottom-spacer { height: 40px; }
</style>
