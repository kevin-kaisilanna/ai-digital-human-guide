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
        <span class="badge badge--history">历史人文</span>
        <span class="badge badge--time">约6小时</span>
      </div>
      <h1 class="title">历史文化爱好者路线</h1>
      <p class="subtitle">深度体验灵山胜境的千年佛教文化底蕴</p>
    </div>

    <!-- Hero 图占位 -->
    <div class="hero-placeholder">
      <div class="hero-inner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>灵山胜境 · 6小时深度游</span>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="card overview">
      <h3 class="sec-title">路线概览</h3>
      <div class="ov-row">
        <div class="ov-item">
          <span class="ov-val">11</span>
          <span class="ov-label">景点数量</span>
        </div>
        <div class="ov-item">
          <span class="ov-val">6h</span>
          <span class="ov-label">预计时长</span>
        </div>
        <div class="ov-item ov-item--wide">
          <span class="ov-val-s">历史文化爱好者</span>
          <span class="ov-label">适合人群</span>
        </div>
      </div>
      <p class="ov-desc">从南门入园，览大照壁感受"华夏第一壁"的恢弘气势，过胜境广场至佛手广场摸掌祈福，访千年祥符禅寺聆听玄奘法师与"小灵山"的渊源、解读古井与银杏的历史故事，经杏坛广场与佛前广场仰望灵山大佛，登顶解析佛像手印与"五方五佛"理念，入灵山梵宫细赏东阳木雕、《华藏世界》琉璃与星空穹顶，最后到五印坛城转经祈福、对比汉藏佛教建筑差异，在三圣殿回向圆满。</p>
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
      <p class="hl-intro">本路线覆盖灵山胜境中轴线全部核心文化节点，从景区入口到最高处灵山大佛，全程以佛教历史与文化为主线。</p>
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
          <svg v-if="i === 0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <svg v-else-if="i === 1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <svg v-else-if="i === 2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24"/><path d="M14.83 14.83l4.24 4.24"/><path d="M14.83 9.17l4.24-4.24"/><path d="M4.93 19.07l4.24-4.24"/></svg>
        </div>
        <p class="exp-text">{{ e }}</p>
      </div>
    </div>

    <!-- 游览贴士 -->
    <div class="card tips">
      <h3 class="sec-title">实用贴士</h3>
      <ul class="tips-list">
        <li>春秋季节（3-5月、9-11月）气候宜人，秋季银杏金黄景色最美</li>
        <li>建议上午9点前入园避开人流高峰</li>
        <li>下午可观赏太湖日落，感受"佛光普照"的壮丽景象</li>
        <li>景区提供导游讲解服务，300元起</li>
        <li>梵宫素斋自助50元/位，素面套餐35元/位</li>
        <li>景区为佛教文化场所，请保持安静，尊重宗教信仰</li>
      </ul>
    </div>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup lang="ts">
import { allRoutes } from '@/data/routes'

const routeData = allRoutes.find(r => r.id === 'history')!
const spots = routeData.spots
const galleryImages = routeData.gallery || []

const spotNames = spots.map(s => s.name)

const highlightList = [
  {
    title: '灵山大照壁',
    text: '重点讲解"华夏第一壁"的石雕艺术，赵朴初题字与《小灵山》诗刻的禅意内涵，以及照壁作为景区文化序章的重要意义。',
  },
  {
    title: '祥符禅寺',
    text: '重点讲解玄奘法师与"小灵山"的渊源，古井与银杏的历史故事，江南第一钟的文化意义，以及祥符禅寺千年兴衰的历史轨迹。',
  },
  {
    title: '灵山大佛',
    text: '解析佛像手印的佛教含义（与愿印/无畏印），216级台阶的文化寓意（108烦恼与108愿望），青铜铸造工艺与现代科技的结合，以及"五方五佛"理念。',
  },
  {
    title: '灵山梵宫',
    text: '详细介绍穹顶天象图的创作依据与艺术价值，《华藏世界》琉璃作品的工艺特点与佛教内涵，东阳木雕的历史渊源与艺术特色，以及梵宫作为世界佛教论坛主会场的文化地位。',
  },
  {
    title: '五印坛城',
    text: '对比汉传与藏传佛教建筑艺术差异，讲解藏传佛教文化特色，曼荼罗的佛教意义，以及转经筒的祈福文化。',
  },
]

const experienceList = [
  '在祥符禅寺参与撞钟祈福，聆听12.8吨重的江南第一钟敲响，感受佛教文化的庄严与神圣',
  '在梵宫欣赏《灵山吉祥颂》演出，体验全息投影、水雾等现代科技与佛教文化的完美融合',
  '在灵山大佛平台俯瞰太湖全景，拍摄夕阳下的大佛，感受"佛光普照"的壮丽景象',
  '在五印坛城转经廊转动经筒，体验"转经一圈，福慧双增"的祈福文化',
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
.badge--history { background: #5a8aaa; }
.badge--time { background: var(--primary-soft); color: var(--text); }
.title {
  margin: 0 0 6px; font-size: 24px; font-weight: 800; color: var(--text); line-height: 1.3;
}
.subtitle { margin: 0; font-size: 14px; color: var(--text-tertiary); }

/* ── Hero 占位 ── */
.hero-placeholder {
  height: 160px; border-radius: var(--radius);
  background: linear-gradient(135deg, #d5e8f0 0%, #b8d4e3 30%, #c5dbe8 60%, #a8c8d8 100%);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; color: #5a8aaa;
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
  background: #5a8aaa; color: #fff; font-size: 10px; font-weight: 700;
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
  background: linear-gradient(135deg, #5a8aaa, #7ab5cc);
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
  width: 3px; background: linear-gradient(180deg, #5a8aaa, #7ab5cc, rgba(90,138,170,.06));
  border-radius: 2px;
}
.tl-item { display: flex; gap: 14px; margin-bottom: 18px; position: relative; }
.tl-num {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #5a8aaa, #7ab5cc);
  color: #fff; font-size: 16px; font-weight: 700; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 12px rgba(90,138,170,.35);
}
.tl-card { flex: 1; padding: 16px; }
.tl-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.tl-name { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.tl-time {
  display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: 12px; color: #5a8aaa; font-weight: 600;
  background: rgba(90,138,170,.08); padding: 3px 8px; border-radius: var(--radius-full);
}
.tl-desc { margin: 0 0 10px; font-size: 14px; color: var(--text-secondary); line-height: 1.75; }
.tl-tips {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 12px; color: var(--muted); line-height: 1.6;
  background: rgba(90,138,170,.04); padding: 10px 12px;
  border-radius: var(--radius-sm); border-left: 3px solid #5a8aaa;
}
.tl-tips svg { flex-shrink: 0; margin-top: 1px; color: #5a8aaa; }

/* ── 特色体验 ── */
.experiences { padding: 18px; }
.exp-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
.exp-item:last-child { margin-bottom: 0; }
.exp-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(90,138,170,.1); color: #5a8aaa;
  display: flex; align-items: center; justify-content: center;
}
.exp-text { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.7; flex: 1; }

/* ── 实用贴士 ── */
.tips { padding: 18px; }
.tips-list { margin: 0; padding: 0 0 0 18px; }
.tips-list li { font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 4px; }

.bottom-spacer { height: 40px; }
</style>
