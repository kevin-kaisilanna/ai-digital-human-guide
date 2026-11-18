<template>
  <div class="expression-layer">
    <!-- 当前表情 -->
    <div class="expr-current">
      <span class="expr-emoji" :key="expression">{{ emoji }}</span>
      <div class="expr-info">
        <span class="expr-label">{{ expression }}</span>
        <span class="expr-live" v-if="live">● 实时</span>
      </div>
    </div>

    <!-- 表情指示器（圆点） -->
    <div class="expr-indicator">
      <span
        v-for="e in expressions"
        :key="'dot-' + e.name"
        class="expr-dot"
        :class="{ active: expression === e.name }"
        :title="e.name"
        @click="$emit('select', e.name)"
      >
        <span class="dot-inner"></span>
      </span>
    </div>

    <!-- 表情列表 -->
    <div class="expr-list">
      <button
        v-for="e in expressions"
        :key="'btn-' + e.name"
        :class="['expr-btn', { active: expression === e.name }]"
        @click="$emit('select', e.name)"
        :title="e.description"
      >
        <span class="expr-btn-emoji">{{ e.emoji }}</span>
        <span class="expr-btn-label">{{ e.name }}</span>
      </button>
    </div>

    <!-- 分隔线 -->
    <div class="expr-divider">
      <span class="divider-label">身体动作</span>
    </div>

    <!-- 动作列表 -->
    <div class="action-list">
      <button
        v-for="a in actions"
        :key="'act-' + a.name"
        :class="['action-btn', { active: currentAction === a.name }]"
        @click="onActionClick(a.name)"
        :title="a.description"
      >
        <span class="action-btn-icon">{{ a.icon }}</span>
        <span class="action-btn-label">{{ a.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  expression: { type: String, default: '开心' },
  currentAction: { type: String, default: '无' },
  live: { type: Boolean, default: false },
})

const emit = defineEmits<{
  select: [name: string]
  'select-action': [name: string]
}>()

// ── 6 种表情（与 LLM 系统提示词严格一致） ──
const expressions = [
  { name: '生气', emoji: '😠', description: '愤怒/不满' },
  { name: '困惑', emoji: '😕', description: '疑惑/不确定' },
  { name: '难过', emoji: '😢', description: '悲伤/低落' },
  { name: '开心', emoji: '😄', description: '高兴/积极' },
  { name: '有趣', emoji: '😏', description: '感兴趣/俏皮' },
  { name: '惊讶', emoji: '😲', description: '震惊/赞叹' },
]

// ── 4 种动作 + "无"（与 LLM 系统提示词严格一致） ──
const actions = [
  { name: '鞠躬', icon: '🙇', description: '问候、致谢' },
  { name: '右手放胸前', icon: '🤚', description: '自我介绍、表达诚意' },
  { name: '右手放身前', icon: '🫴', description: '展示、介绍' },
  { name: '右手放头上', icon: '🙋', description: '敬礼、招呼' },
  { name: '无', icon: '🧍', description: '不触发任何动画' },
]

const emojiMap: Record<string, string> = {
  '生气': '😠', '困惑': '😕', '难过': '😢', '开心': '😄', '有趣': '😏', '惊讶': '😲',
}
const emoji = computed(() => emojiMap[props.expression] ?? '😄')

function onActionClick(name: string) {
  emit('select-action', name)
}
</script>

<style scoped>
.expression-layer { padding: 14px 0; }

/* ── 当前表情 ── */
.expr-current {
  display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
}
.expr-emoji {
  font-size: 34px;
  animation: expr-pop .35s ease;
  display: inline-block;
}
@keyframes expr-pop {
  0% { transform: scale(.3); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
.expr-info { display: flex; flex-direction: column; gap: 2px; }
.expr-label { font-size: 16px; font-weight: 700; color: var(--text); }
.expr-live {
  font-size: 10px; color: var(--accent); font-weight: 600;
  animation: live-pulse 1.2s ease-in-out infinite;
}
@keyframes live-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }

/* ── 圆点指示器 ── */
.expr-indicator {
  display: flex; gap: 8px; justify-content: center; margin-bottom: 14px;
}
.expr-dot {
  width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .3s ease;
  background: rgba(200,160,100,.08);
}
.expr-dot:hover { background: rgba(200,160,100,.18); }
.expr-dot.active { background: rgba(200,160,100,.2); }
.dot-inner {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(200,160,100,.3);
  transition: all .3s ease;
}
.expr-dot.active .dot-inner {
  background: var(--accent);
  box-shadow: 0 0 8px rgba(200,160,100,.5);
  transform: scale(1.3);
}

/* ── 表情按钮列表 ── */
.expr-list { display: flex; gap: 8px; flex-wrap: wrap; }
.expr-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 14px; border-radius: var(--radius); cursor: pointer;
  border: 1px solid var(--border); background: rgba(255,255,255,.6);
  font-family: inherit; transition: all .25s ease;
  min-width: 56px;
}
.expr-btn:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(200,160,100,.1);
}
.expr-btn.active {
  border-color: var(--accent);
  background: rgba(200,160,100,.12);
  box-shadow: 0 2px 8px rgba(200,160,100,.1);
}
.expr-btn:active { transform: scale(.95); }
.expr-btn-emoji {
  font-size: 24px;
  transition: transform .25s ease;
}
.expr-btn:hover .expr-btn-emoji { transform: scale(1.15); }
.expr-btn-label { font-size: 11px; color: var(--muted); font-weight: 500; }
.expr-btn.active .expr-btn-label { color: var(--accent); font-weight: 600; }

/* ── 分隔线 ── */
.expr-divider {
  display: flex; align-items: center; margin: 16px 0 10px;
}
.expr-divider::before, .expr-divider::after {
  content: ''; flex: 1; height: 1px;
  background: rgba(200,160,100,.15);
}
.divider-label {
  font-size: 12px; color: var(--muted); font-weight: 500;
  padding: 0 12px;
}

/* ── 动作按钮列表 ── */
.action-list { display: flex; gap: 8px; flex-wrap: wrap; }
.action-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 12px; border-radius: var(--radius); cursor: pointer;
  border: 1px solid var(--border); background: rgba(255,255,255,.6);
  font-family: inherit; transition: all .25s ease;
  min-width: 56px;
}
.action-btn:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(200,160,100,.1);
}
.action-btn.active {
  border-color: var(--accent);
  background: rgba(200,160,100,.1);
  box-shadow: 0 2px 8px rgba(200,160,100,.08);
}
.action-btn:active { transform: scale(.95); }
.action-btn-icon {
  font-size: 22px;
  transition: transform .25s ease;
}
.action-btn:hover .action-btn-icon { transform: scale(1.15); }
.action-btn-label { font-size: 11px; color: var(--muted); font-weight: 500; }
.action-btn.active .action-btn-label { color: var(--accent); font-weight: 600; }
</style>
