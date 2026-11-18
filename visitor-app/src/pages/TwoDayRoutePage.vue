<template>
  <div class="route-detail">
    <button class="back-btn" @click="$router.push('/route')">
      <span class="back-arrow">&larr;</span>
      <span>返回路线列表</span>
    </button>

    <div class="header">
      <div class="badges">
        <span class="badge badge--two">两日深度游</span>
        <span class="badge badge--time">两天一夜</span>
      </div>
      <h1 class="title">灵山+拈花湾两日深度游</h1>
      <p class="subtitle">两天一夜深度体验，完整体验灵山佛教文化与拈花湾禅意生活</p>
    </div>

    <!-- 路线规划图 -->
    <div class="route-map">
      <img src="/images/route-unofficial.webp" alt="两日深度游路线规划图" class="map-img" />
      <span class="map-caption">灵山+拈花湾两日深度游路线规划图</span>
    </div>

    <!-- 概览 -->
    <div class="card overview">
      <h3 class="sec-title">路线概览</h3>
      <div class="ov-row">
        <div class="ov-item"><span class="ov-val">11</span><span class="ov-label">灵山景点</span></div>
        <div class="ov-item"><span class="ov-val">两天</span><span class="ov-label">行程天数</span></div>
        <div class="ov-item ov-item--wide"><span class="ov-val-s">周末出游 / 二日游</span><span class="ov-label">适合人群</span></div>
      </div>
      <p class="ov-desc">第一天灵山胜境深度朝圣：大照壁→五明桥→佛足坛→菩提大道→九龙灌浴→祥符禅寺→灵山大佛→梵宫→五印坛城→曼飞龙塔→无尽意斋，傍晚拍摄太湖日落，夜宿灵山精舍或拈花湾民宿。第二天拈花湾禅意小镇：拈花广场→香月花街→梵天花海→拈花堂→五灯湖→鹿鸣谷，晚上观看《禅行》灯光秀和水上禅舞表演后返程。涵盖汉传、藏传、南传三大语系佛教建筑群落。</p>
    </div>

    <!-- 行程总览 -->
    <div class="card itinerary">
      <h3 class="sec-title">行程总览</h3>
      <div class="day-section">
        <div class="day-header">
          <span class="day-badge">Day 1</span>
          <span class="day-label">灵山胜境 深度朝圣（11个景点）</span>
        </div>
        <div class="path-flow">
          <span v-for="(s, i) in spotNames" :key="i" class="path-node">
            <span class="path-num">{{ i + 1 }}</span>
            <span class="path-name">{{ s }}</span>
            <span v-if="i < spotNames.length - 1" class="path-arrow">&rarr;</span>
          </span>
        </div>
      </div>
      <div class="day-divider"></div>
      <div class="day-section">
        <div class="day-header">
          <span class="day-badge day-badge--two">Day 2</span>
          <span class="day-label">拈花湾禅意小镇</span>
        </div>
        <div class="path-flow">
          <span v-for="(s, i) in day2Spots" :key="i" class="path-node">
            <span class="path-num day2-num">{{ i + 1 }}</span>
            <span class="path-name">{{ s }}</span>
            <span v-if="i < day2Spots.length - 1" class="path-arrow">&rarr;</span>
          </span>
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

    <!-- Day 1 时间线 -->
    <h3 class="sec-title sec-title--main">Day 1 · 灵山胜境深度朝圣</h3>
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

    <!-- Day 2 行程 -->
    <h3 class="sec-title sec-title--main">Day 2 · 拈花湾禅意小镇</h3>
    <div class="timeline timeline--day2">
      <div class="tl-line tl-line--day2"></div>
      <div v-for="(item, i) in day2Detail" :key="i" class="tl-item">
        <div class="tl-num tl-num--day2">{{ i + 1 }}</div>
        <div class="tl-card card">
          <div class="tl-head">
            <h4 class="tl-name">{{ item.name }}</h4>
            <span class="tl-time tl-time--day2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{{ item.time }}</span>
          </div>
          <p class="tl-desc">{{ item.desc }}</p>
          <div class="tl-tips tl-tips--day2" v-if="item.tip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span>{{ item.tip }}</span></div>
        </div>
      </div>
    </div>

    <!-- 特色体验 -->
    <div class="card experiences">
      <h3 class="sec-title">特色体验</h3>
      <div v-for="(e, i) in experienceList" :key="i" class="exp-item">
        <div class="exp-icon">
          <svg v-if="i===0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <svg v-else-if="i===1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <svg v-else-if="i===2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
          <svg v-else-if="i===3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </div>
        <p class="exp-text">{{ e }}</p>
      </div>
    </div>

    <div class="card tips">
      <h3 class="sec-title">两日游出行贴士</h3>
      <ul class="tips-list">
        <li>第一天建议上午9点前入园，先走历史文化路线覆盖灵山核心景点</li>
        <li>中午在梵宫品尝素斋（人均50-80元），下午参观梵宫+五印坛城+曼飞龙塔</li>
        <li>傍晚在大佛平台拍摄太湖日落，金色阳光洒在大佛与湖面之上绝美</li>
        <li>夜宿推荐：灵山精舍（禅意酒店，约400元/晚）或拈花湾民宿（约300-600元/晚）</li>
        <li>第二天拈花湾建议上午9点到达，先游览香月花街和梵天花海拍照</li>
        <li>拈花湾《禅行》灯光秀每晚19:30/20:30各一场，建议观看天黑后场次效果最佳</li>
        <li>灵山到拈花湾驾车约15分钟，景区间有免费接驳班车（每小时一班）</li>
        <li>两天一夜预算参考：门票420元+住宿300-600元+餐饮200元+交通50元≈1000元/人</li>
      </ul>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { allRoutes } from '@/data/routes'

const routeData = allRoutes.find(r => r.id === 'two-day')!
const spots = routeData.spots
const spotNames = spots.map(s => s.name)
const galleryImages = routeData.gallery || []

const day2Spots = ['拈花广场', '香月花街', '梵天花海', '拈花堂', '五灯湖', '鹿鸣谷']

const day2Detail = [
  {
    name: '拈花广场',
    time: '约20分钟',
    desc: '拈花湾核心入口广场，以"拈花一笑"为主题设计，广场中央设有大型铜雕莲花装置，周围环绕禅意水景与枯山水庭院。广场视野开阔，可远眺灵山与太湖风光，是拈花湾之旅的起点和最佳拍照打卡地。',
    tip: '广场入口处有导览图和禅意体验项目预约点，建议先了解当日活动安排',
  },
  {
    name: '香月花街',
    time: '约40分钟',
    desc: '拈花湾最具特色的禅意商业街区，街道两旁为仿唐风格建筑，青瓦白墙、木格门窗。汇集禅茶体验馆、手工香铺、素食餐厅、文创商店等数十家特色店铺，空气中弥漫着淡淡檀香。可体验手工制香、抄经、茶道等禅意活动。',
    tip: '推荐品尝"禅意冰淇淋"（抹茶/桂花味）和手工素饼；香铺可定制专属合香',
  },
  {
    name: '梵天花海',
    time: '约30分钟',
    desc: '占地近百亩的四季花海景观区，春季樱花与郁金香烂漫、夏季薰衣草与向日葵绽放、秋季格桑花与波斯菊遍野、冬季腊梅傲雪。花海中设有禅意茶亭与观景平台，远山近花色彩斑斓如入画中，是拈花湾最受欢迎的拍照胜地。',
    tip: '春季（3-4月）和秋季（10-11月）是最佳赏花季节；花海中有多条小径可漫步拍照',
  },
  {
    name: '拈花堂',
    time: '约20分钟',
    desc: '拈花湾核心禅修体验空间，建筑采用"一花一世界"的设计理念，内部以圆形曼陀罗布局。提供抄经、禅坐、品茗等免费体验项目。堂内光线柔和、檀香袅袅，是感受禅意生活、静心冥想的理想场所。',
    tip: '抄经体验免费，约需15-20分钟；禅坐区需保持安静，手机请调至静音模式',
  },
  {
    name: '五灯湖',
    time: '约25分钟',
    desc: '拈花湾中心人工湖，湖面约30亩，形似五瓣莲花。"五灯"取自禅宗"五灯会元"典故。湖中有五座小岛，分别以五种禅意植物（莲、竹、梅、松、兰）为主题。湖畔设有环湖步道与亲水平台，可泛舟湖上感受"舟行碧波上，人在画中游"的禅意。',
    tip: '湖上泛舟30元/人/30分钟；傍晚时分湖面倒映夕阳与远山是最佳拍摄时机',
  },
  {
    name: '鹿鸣谷',
    time: '约30分钟',
    desc: '拈花湾后山的自然生态山谷，林木茂密、溪水潺潺。谷中散养数十只梅花鹿，温顺亲人可近距离互动喂食。"鹿鸣"取自《诗经·小雅》"呦呦鹿鸣，食野之苹"。山谷深处有古风凉亭与瀑布小景，山林漫步间感受远离尘嚣的宁静。',
    tip: '鹿食10元/份，喂食时请勿大声喧哗惊吓鹿群；建议穿长裤以防蚊虫',
  },
]

const experienceList = [
  '第一天中午在梵宫品尝素斋，感受"禅食一味"的佛门饮食文化，食材取自自营菜园清淡雅致',
  '傍晚在灵山大佛平台拍摄太湖日落，金色阳光洒在88米大佛与湖面之上，出片率极高',
  '夜宿灵山精舍体验禅意住宿（或拈花湾特色民宿），在宁静中感受"禅宿一味"的静心之夜',
  '第二天上午在拈花湾梵天花海拍照赏花，春季樱花秋季格桑花，色彩斑斓如入画中',
  '第二天晚间观看拈花湾《禅行》灯光秀，水上光影禅舞如梦如幻，为旅途画上完美句号',
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
.badge--two { background: #7c3aed; }
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

/* 行程总览 */
.itinerary { padding: 18px; }
.day-section { padding: 8px 0; }
.day-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.day-badge { font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: var(--radius-full); background: #7c3aed; color: #fff; flex-shrink: 0; }
.day-badge--two { background: #f59e0b; color: #fff; }
.day-label { font-size: 14px; font-weight: 600; color: var(--text); }
.day-divider { height: 1px; background: var(--border-light); margin: 12px 0; }
.path-flow { display: flex; flex-wrap: wrap; gap: 6px 4px; align-items: center; padding: 8px 0; }
.path-node { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; }
.path-num { width: 20px; height: 20px; border-radius: 50%; background: #7c3aed; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.day2-num { background: #f59e0b; }
.path-name { color: var(--text-secondary); white-space: nowrap; }
.path-arrow { color: var(--muted); font-size: 14px; margin: 0 2px; }

.gallery-card { padding: 18px; }
.gallery { display: grid; gap: 8px; grid-template-columns: repeat(3, 1fr); }
.gallery--2 { grid-template-columns: repeat(2, 1fr); }
.gallery-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-light); }

/* Day 1 时间线 */
.timeline { position: relative; margin-bottom: 16px; }
.tl-line { position: absolute; left: 24px; top: 8px; bottom: 8px; width: 3px; background: linear-gradient(180deg, #7c3aed, #a78bfa, rgba(124,58,237,.06)); border-radius: 2px; }
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #fff; font-size: 16px; font-weight: 700; z-index: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(124,58,237,.35); }
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.tl-time { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; font-size: 12px; color: #7c3aed; font-weight: 600; background: rgba(124,58,237,.08); padding: 3px 8px; border-radius: var(--radius-full); }
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.75; }
.tl-tips { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: var(--muted); line-height: 1.6; background: rgba(124,58,237,.04); padding: 10px 12px; border-radius: var(--radius-sm); border-left: 3px solid #7c3aed; }
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: #7c3aed; }

/* Day 2 时间线 */
.timeline--day2 { margin-top: 0; }
.tl-line--day2 { background: linear-gradient(180deg, #f59e0b, #fbbf24, rgba(245,158,11,.06)); }
.tl-num--day2 { background: linear-gradient(135deg, #f59e0b, #fbbf24); box-shadow: 0 3px 12px rgba(245,158,11,.35); }
.tl-time--day2 { color: #f59e0b; background: rgba(245,158,11,.08); }
.tl-tips--day2 { background: rgba(245,158,11,.04); border-left-color: #f59e0b; }
.tl-tips--day2 svg { color: #f59e0b; }

.experiences { padding: 18px; }
.exp-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.exp-item:last-child { margin-bottom: 0; }
.exp-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(124,58,237,.1); color: #7c3aed; display: flex; align-items: center; justify-content: center; }
.exp-text { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }

.tips { padding: 18px; }
.tips-list { margin: 0; padding: 0 0 0 18px; }
.tips-list li { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 4px; }
.bottom-spacer { height: 40px; }
</style>
