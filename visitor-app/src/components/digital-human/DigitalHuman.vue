<template>
  <div class="digital-human" :style="bgStyle">
    <!-- 粒子装饰层 -->
    <div class="dh-particles" v-if="isSpeaking">
      <span v-for="i in 8" :key="i" class="dh-particle" :style="particleStyle(i)"></span>
    </div>

    <div class="dh-stage">
      <!-- 光环 -->
      <div class="dh-halo" :class="{ 'halo-active': isSpeaking }"></div>

      <!-- 人物形象容器 -->
      <div
        class="dh-figure"
        :class="[`expr-${expressionKey}`, `action-${actionKey}`, { 'is-speaking': isSpeaking }]"
      >
        <!-- 动作标签 -->
        <div class="dh-action-tag" v-if="showActionTag && currentAction !== '无'">
          <span class="action-icon">{{ actionIcon }}</span>
          <span>{{ currentAction }}</span>
        </div>

        <!-- 身体容器（鞠躬时整体前倾） -->
        <div class="dh-body-container">
          <!-- SVG 身体底图 -->
          <div class="dh-body-svg">
            <svg viewBox="0 0 160 200" class="dh-svg">
              <!-- 身体光晕 -->
              <ellipse cx="80" cy="100" rx="55" ry="65" fill="rgba(200,160,120,.06)"
                :class="{ 'glow-pulse': isSpeaking }" />
              <!-- 头部 -->
              <ellipse cx="80" cy="62" rx="38" ry="42" fill="rgba(200,160,120,.18)" stroke="rgba(200,160,120,.3)" stroke-width="1"/>
              <!-- 头发 -->
              <ellipse cx="80" cy="45" rx="40" ry="28" fill="rgba(180,140,100,.15)"/>
              <!-- 身体 -->
              <path d="M42 105 Q40 120 50 200 L110 200 Q120 120 118 105" fill="rgba(200,160,120,.12)" stroke="rgba(200,160,120,.2)" stroke-width="1"/>
              <!-- 衣领 -->
              <path d="M36 108 Q80 118 124 108" fill="none" stroke="rgba(200,160,120,.2)" stroke-width="1.5"/>
              <!-- 领结 -->
              <path d="M64 105 L80 128 L96 105" fill="none" stroke="rgba(200,132,60,.25)" stroke-width="1.5"/>
            </svg>
          </div>

          <!-- ═══ CSS 面部特征 ═══ -->
          <div class="dh-face-features">
            <!-- 眉毛 -->
            <div class="dh-brow dh-brow-left"></div>
            <div class="dh-brow dh-brow-right"></div>

            <!-- 左眼 -->
            <div class="dh-eye dh-eye-left">
              <div class="dh-pupil"></div>
              <div class="dh-eyelid"></div>
            </div>
            <!-- 右眼 -->
            <div class="dh-eye dh-eye-right">
              <div class="dh-pupil"></div>
              <div class="dh-eyelid"></div>
            </div>

            <!-- 嘴 -->
            <div class="dh-mouth">
              <!-- 说话时 viseme 口型条 -->
              <div v-if="isSpeaking" class="dh-viseme-bars">
                <span v-for="i in 5" :key="i" class="dh-vb" :style="visemeBarStyle(i)"></span>
              </div>
            </div>
          </div>

          <!-- ═══ 手臂 — 动作动画用 ═══ -->
          <div class="dh-arm dh-arm-right">
            <div class="dh-forearm"></div>
            <div class="dh-hand"></div>
          </div>
        </div>
      </div>

      <!-- 名字 -->
      <div class="dh-name">小云</div>

      <!-- 状态指示 -->
      <div class="dh-status" :class="{ speaking: isSpeaking }">
        <span class="dh-status-dot"></span>
        {{ isSpeaking ? '正在讲解…' : '在线' }}
      </div>

      <!-- 当前表情标签 -->
      <Transition name="tag">
        <div class="dh-emotion-tag" v-if="showEmotionTag">
          <span class="tag-emoji">{{ expressionEmoji }}</span>
          {{ expression }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  bgUrl: { type: String, default: '' },
  expression: { type: String, default: '开心' },
  action: { type: String, default: '无' },
  isSpeaking: { type: Boolean, default: false },
  visemeId: { type: Number, default: 0 },
})

// ── 表情 emoji 映射 ──
const expressionEmojiMap: Record<string, string> = {
  '生气': '😠', '困惑': '😕', '难过': '😢', '开心': '😄', '有趣': '😏', '惊讶': '😲',
}
const expressionEmoji = computed(() => expressionEmojiMap[props.expression] ?? '😄')

// ── 表情 → CSS key ──
const expressionKeyMap: Record<string, string> = {
  '生气': 'angry', '困惑': 'confused', '难过': 'sad', '开心': 'happy', '有趣': 'playful', '惊讶': 'surprised',
}
const expressionKey = computed(() => expressionKeyMap[props.expression] ?? 'happy')

// ── 动作 → CSS key ──
const actionKeyMap: Record<string, string> = {
  '鞠躬': 'bow', '右手放胸前': 'hand-chest', '右手放身前': 'hand-front', '右手放头上': 'hand-head', '无': 'none',
}
const actionKey = computed(() => actionKeyMap[props.action] ?? 'none')

// ── 动作图标 ──
const actionIcons: Record<string, string> = {
  '鞠躬': '🙇', '右手放胸前': '🤚', '右手放身前': '🫴', '右手放头上': '🙋',
}
const actionIcon = computed(() => actionIcons[props.action] ?? '')
const currentAction = computed(() => props.action || '无')

// ── 表情 → 背景渐变 ──
const bgColorMap: Record<string, string> = {
  '生气': 'linear-gradient(180deg, rgba(250,240,240,0) 0%, rgba(210,160,150,.18) 50%, rgba(190,130,120,.22) 100%)',
  '困惑': 'linear-gradient(180deg, rgba(245,242,238,0) 0%, rgba(200,195,180,.18) 50%, rgba(175,165,145,.22) 100%)',
  '难过': 'linear-gradient(180deg, rgba(240,242,248,0) 0%, rgba(180,190,210,.18) 50%, rgba(150,165,190,.22) 100%)',
  '开心': 'linear-gradient(180deg, rgba(250,246,238,0) 0%, rgba(220,200,160,.18) 50%, rgba(200,175,130,.22) 100%)',
  '有趣': 'linear-gradient(180deg, rgba(248,244,238,0) 0%, rgba(200,210,180,.18) 50%, rgba(170,190,150,.22) 100%)',
  '惊讶': 'linear-gradient(180deg, rgba(248,242,240,0) 0%, rgba(220,190,170,.18) 50%, rgba(200,160,140,.22) 100%)',
}

const bgStyle = computed(() => {
  if (props.bgUrl) return { background: `url(${props.bgUrl}) center/cover no-repeat` }
  return { background: bgColorMap[props.expression] ?? bgColorMap['开心'] }
})

// ── 表情切换弹出标签 ──
const showEmotionTag = ref(false)
let tagTimer: ReturnType<typeof setTimeout> | null = null
watch(() => props.expression, () => {
  showEmotionTag.value = true
  if (tagTimer) clearTimeout(tagTimer)
  tagTimer = setTimeout(() => { showEmotionTag.value = false }, 2000)
})

// ── 动作标签弹出 ──
const showActionTag = ref(false)
let actionTagTimer: ReturnType<typeof setTimeout> | null = null
watch(() => props.action, (newVal) => {
  if (newVal && newVal !== '无') {
    showActionTag.value = true
    if (actionTagTimer) clearTimeout(actionTagTimer)
    actionTagTimer = setTimeout(() => { showActionTag.value = false }, 2500)
  }
})

// ── 粒子 ──
function particleStyle(i: number) {
  const angle = (i / 8) * 360
  const delay = i * 0.25
  return { '--angle': `${angle}deg`, '--delay': `${delay}s` }
}

// ── Viseme 口型条样式 ──
function visemeBarStyle(i: number) {
  const v = props.visemeId || 0
  const baseH = v === 0 ? 2 : 4 + (v / 21) * 14
  const variation = Math.sin(i * 1.3 + v * 0.4) * 3
  const h = Math.max(2, baseH + variation)
  const hue = 25 + v * 3
  return {
    height: `${h}px`,
    animationDelay: `${i * 0.07}s`,
    background: `hsl(${hue}, 45%, ${52 + v * 0.5}%)`,
  }
}
</script>

<style scoped>
.digital-human {
  position: relative; width: 100%; height: 100%; display: flex;
  flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden; border-radius: var(--radius-lg);
  transition: background 0.8s ease;
}

/* ═══ 粒子 ═══ */
.dh-particles { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.dh-particle {
  position: absolute; top: 50%; left: 50%;
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(200,160,100,.25);
  animation: particle-float 2.2s ease-in-out infinite;
  animation-delay: var(--delay);
  transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-45px);
}
@keyframes particle-float {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-25px) scale(.6); }
  50% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-55px) scale(1); }
}

/* ═══ 光环 ═══ */
.dh-stage { display: flex; flex-direction: column; align-items: center; z-index: 1; position: relative; }
.dh-halo {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(200,160,100,.06) 0%, transparent 70%);
  transition: all 0.6s ease;
}
.dh-halo.halo-active {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(200,160,100,.12) 0%, transparent 70%);
  animation: halo-breathe 1.5s ease-in-out infinite;
}
@keyframes halo-breathe {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: .8; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
}

/* ═══ 人物容器 ═══ */
.dh-figure {
  position: relative; margin-bottom: 8px;
  width: 140px; height: 210px;
  animation: idle-breathe 4s ease-in-out infinite;
  transition: transform 0.6s cubic-bezier(.34,1.56,.64,1);
}
.dh-figure.is-speaking { animation: idle-breathe 2s ease-in-out infinite; }

@keyframes idle-breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.02); }
}

.dh-body-container {
  position: relative; width: 100%; height: 100%;
  transition: transform 0.8s cubic-bezier(.34,1.56,.64,1);
  transform-origin: bottom center;
}

/* ═══ SVG 底图 ═══ */
.dh-body-svg { position: relative; z-index: 0; }
.dh-svg { width: 120px; height: 170px; margin-top: 8px; }
.glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
@keyframes glow-pulse { 0%, 100% { opacity: .06; } 50% { opacity: .15; } }

/* ════════════════════════════════════════════════
   4 种动作动画
   ════════════════════════════════════════════════ */

/* ── 鞠躬：身体前倾 ── */
.action-bow .dh-body-container {
  animation: act-bow 1.5s ease-in-out;
}
@keyframes act-bow {
  0% { transform: rotateX(0); }
  30% { transform: rotateX(18deg); }
  70% { transform: rotateX(18deg); }
  100% { transform: rotateX(0); }
}

/* ── 右手放胸前 ── */
.action-hand-chest .dh-arm-right {
  animation: act-hand-chest 1.2s ease-in-out;
}
@keyframes act-hand-chest {
  0%   { transform: translate(58px, 50px) rotate(-30deg); }
  40%  { transform: translate(38px, 28px) rotate(-75deg); }
  70%  { transform: translate(38px, 28px) rotate(-75deg); }
  100% { transform: translate(58px, 50px) rotate(-30deg); }
}

/* ── 右手放身前 ── */
.action-hand-front .dh-arm-right {
  animation: act-hand-front 1.5s ease-in-out;
}
@keyframes act-hand-front {
  0%   { transform: translate(58px, 50px) rotate(-30deg); }
  35%  { transform: translate(70px, 62px) rotate(-5deg); }
  70%  { transform: translate(70px, 62px) rotate(-5deg); }
  100% { transform: translate(58px, 50px) rotate(-30deg); }
}

/* ── 右手放头上 ── */
.action-hand-head .dh-arm-right {
  animation: act-hand-head 1.2s ease-in-out;
}
@keyframes act-hand-head {
  0%   { transform: translate(58px, 50px) rotate(-30deg); }
  40%  { transform: translate(46px, 6px) rotate(-140deg); }
  70%  { transform: translate(46px, 6px) rotate(-140deg); }
  100% { transform: translate(58px, 50px) rotate(-30deg); }
}

/* ════════════════════════════════════════════════
   CSS 面部特征
   ════════════════════════════════════════════════ */
.dh-face-features {
  position: absolute;
  top: 28px; left: 50%; transform: translateX(-50%);
  width: 56px; height: 48px;
  pointer-events: none; z-index: 1;
}

/* ── 眼睛 ── */
.dh-eye {
  position: absolute;
  width: 12px; height: 14px;
  background: #3d2e1c;
  border-radius: 50%;
  top: 4px;
  transition: all 0.4s cubic-bezier(.34,1.56,.64,1);
  overflow: hidden;
}
.dh-eye-left  { left: 6px; }
.dh-eye-right { right: 6px; }

/* 瞳孔高光 */
.dh-pupil {
  position: absolute;
  width: 4px; height: 4px;
  background: #fff;
  border-radius: 50%;
  top: 2px; left: 50%; transform: translateX(-50%);
  transition: top 0.35s ease;
}

/* 眼睑（眨眼） */
.dh-eyelid {
  position: absolute; inset: 0;
  background: rgba(200,160,120,.88);
  transform: scaleY(0);
  transform-origin: top center;
  border-radius: 50%;
}
.dh-eye-left  .dh-eyelid { animation: blink 3.5s ease-in-out infinite; }
.dh-eye-right .dh-eyelid { animation: blink 3.5s ease-in-out infinite; animation-delay: 0.12s; }

@keyframes blink {
  0%, 93% { transform: scaleY(0); }
  95% { transform: scaleY(1); }
  97% { transform: scaleY(1); }
  100% { transform: scaleY(0); }
}

/* ── 眉毛 ── */
.dh-brow {
  position: absolute;
  width: 14px; height: 3px;
  background: rgba(61,46,28,.35);
  border-radius: 2px;
  top: -2px;
  transition: all 0.4s cubic-bezier(.34,1.56,.64,1);
}
.dh-brow-left  { left: 5px; }
.dh-brow-right { right: 5px; }

/* ── 嘴 ── */
.dh-mouth {
  position: absolute;
  bottom: 4px; left: 50%; transform: translateX(-50%);
  width: 32px; height: 10px;
  background: rgba(61,46,28,.2);
  border-radius: 50% 50% 50% 50% / 20% 20% 80% 80%;
  transition: all 0.4s cubic-bezier(.34,1.56,.64,1);
}

/* 说话时嘴部扩大为口型条容器 */
.dh-figure.is-speaking .dh-mouth {
  width: 40px; height: 20px;
  border-radius: 10px;
  background: transparent;
  border: 1.5px solid rgba(61,46,28,.15);
}

/* ════════════════════════════════════════════════
   6 种表情 — 面部变化
   ════════════════════════════════════════════════ */

/* 生气 😠 — 眉毛下压内聚、眼睛变窄、嘴部下弯 */
.expr-angry .dh-brow-left  { transform: rotate(10deg) translateY(4px); }
.expr-angry .dh-brow-right { transform: rotate(-10deg) translateY(4px); }
.expr-angry .dh-eye { transform: scaleY(.7) scaleX(.9); border-radius: 43% 43% 50% 50% / 35% 35% 65% 65%; }
.expr-angry .dh-pupil { top: 4px; }
.expr-angry .dh-mouth {
  width: 28px; height: 7px;
  border-radius: 45% 45% 45% 45% / 75% 75% 25% 25%;
  background: rgba(61,46,28,.38);
}

/* 困惑 😕 — 一眉高一眉低、眼睛略微眯起、嘴歪 */
.expr-confused .dh-brow-left  { transform: rotate(-5deg) translateY(-3px); }
.expr-confused .dh-brow-right { transform: rotate(4deg) translateY(3px); }
.expr-confused .dh-eye { transform: scaleY(.85); }
.expr-confused .dh-mouth {
  width: 26px; height: 8px;
  border-radius: 30% 60% 40% 40% / 30% 30% 70% 70%;
  background: rgba(61,46,28,.25);
}

/* 难过 😢 — 眉毛内端上抬、眼睛下垂、嘴下弯 */
.expr-sad .dh-brow-left  { transform: rotate(-6deg) translateY(-1px); }
.expr-sad .dh-brow-right { transform: rotate(6deg) translateY(-1px); }
.expr-sad .dh-eye { transform: scaleY(.8); border-radius: 48% 48% 50% 50% / 42% 42% 58% 58%; }
.expr-sad .dh-pupil { top: 3px; }
.expr-sad .dh-mouth {
  width: 26px; height: 7px;
  border-radius: 45% 45% 45% 45% / 80% 80% 20% 20%;
  background: rgba(61,46,28,.35);
}

/* 开心 😄 — 眉毛上扬、眼睛弯弯（笑眼）、大嘴笑 */
.expr-happy .dh-brow { transform: rotate(-3deg) translateY(-2px); }
.expr-happy .dh-eye {
  transform: scaleY(.75);
  border-radius: 45% 45% 50% 50% / 25% 25% 75% 75%;
}
.expr-happy .dh-mouth {
  width: 36px; height: 13px;
  border-radius: 50% 50% 50% 50% / 15% 15% 85% 85%;
  background: rgba(61,46,28,.18);
}

/* 有趣 😏 — 单眉挑、正常眼、歪嘴笑 */
.expr-playful .dh-brow-left  { transform: rotate(-8deg) translateY(-3px); }
.expr-playful .dh-brow-right { transform: rotate(2deg) translateY(1px); }
.expr-playful .dh-eye { transform: scaleY(.85); }
.expr-playful .dh-mouth {
  width: 28px; height: 10px;
  border-radius: 35% 55% 40% 40% / 15% 15% 85% 85%;
  background: rgba(61,46,28,.18);
}

/* 惊讶 😲 — 眉毛高抬、眼睛瞪大、嘴张开成 O 形 */
.expr-surprised .dh-brow { transform: rotate(-1deg) translateY(-5px); }
.expr-surprised .dh-eye {
  transform: scale(1.2);
  border-radius: 50%;
}
.expr-surprised .dh-pupil { top: 0; }
.expr-surprised .dh-mouth {
  width: 18px; height: 16px;
  border-radius: 50%;
  background: rgba(61,46,28,.08);
  border: 2px solid rgba(61,46,28,.25);
}

/* ═══ Viseme 口型条 ═══ */
.dh-viseme-bars {
  display: flex; align-items: flex-end; justify-content: center;
  gap: 2px; height: 100%; padding: 2px 4px;
}
.dh-vb {
  width: 3px; min-height: 2px; border-radius: 2px;
  transition: height .06s ease, background .1s ease;
  animation: vb-bounce .3s ease-in-out infinite alternate;
}
@keyframes vb-bounce {
  from { transform: scaleY(.4); opacity: .5; }
  to   { transform: scaleY(1); opacity: 1; }
}

/* ═══ 手臂 ═══ */
.dh-arm {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 2;
  transition: transform 0.6s cubic-bezier(.34,1.56,.64,1);
}
.dh-arm-right { transform: translate(58px, 50px) rotate(-30deg); }

.dh-forearm {
  width: 8px; height: 38px;
  border-radius: 4px;
  background: rgba(200,160,120,.16);
  border: 1px solid rgba(200,160,120,.13);
}
.dh-hand {
  width: 11px; height: 11px;
  border-radius: 50%;
  background: rgba(200,160,120,.2);
  border: 1px solid rgba(200,160,120,.16);
  margin-top: -2px; margin-left: -1.5px;
}

/* ═══ 名字 & 状态 ═══ */
.dh-name { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.dh-status {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--success); font-weight: 500;
  transition: color .4s;
}
.dh-status.speaking { color: var(--accent); }
.dh-status-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--success);
  transition: background .4s;
}
.dh-status.speaking .dh-status-dot {
  background: var(--accent);
  animation: pulse .8s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .3; transform: scale(1.5); } }

/* ═══ 表情标签弹出 ═══ */
.dh-emotion-tag {
  margin-top: 6px; font-size: 13px; color: var(--accent); font-weight: 600;
  padding: 3px 14px; border-radius: 14px;
  background: rgba(200,160,100,.1); border: 1px solid rgba(200,160,100,.2);
  display: flex; align-items: center; gap: 4px;
}
.tag-emoji { font-size: 16px; }

.tag-enter-active { transition: all .35s cubic-bezier(.34,1.56,.64,1); }
.tag-leave-active { transition: all .25s ease; }
.tag-enter-from, .tag-leave-to { opacity: 0; transform: translateY(8px); }

/* ═══ 动作标签 ═══ */
.dh-action-tag {
  position: absolute; top: -38px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 4px;
  padding: 4px 12px; border-radius: 16px;
  background: rgba(200,160,100,.14); border: 1px solid rgba(200,160,100,.22);
  font-size: 12px; color: var(--accent); font-weight: 600;
  white-space: nowrap; z-index: 5;
  animation: action-tag-in .4s cubic-bezier(.34,1.56,.64,1);
}
.action-icon { font-size: 15px; }
@keyframes action-tag-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
