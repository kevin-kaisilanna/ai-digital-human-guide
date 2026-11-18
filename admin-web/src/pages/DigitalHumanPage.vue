<template>
  <div class="digital-page">
    <section class="page-hero">
      <div>
        <h1 class="hero-title">数字人配置</h1>
        <p class="hero-sub">AI 导游小云 · 外观定制 · 智能交互</p>
      </div>
    </section>
    <div class="dh-body">
      <!-- 左侧：AI 测试 + 外观配置 -->
      <div class="dh-left">
        <!-- AI 对话测试 -->
        <div class="card test-card card-glow">
          <div class="card-head">
            <h3><span class="head-icon">&#9679;</span> AI 对话测试</h3>
            <span class="chip">AI 引擎</span>
          </div>
          <p class="card-desc">测试 AI 导游问答能力，验证知识库覆盖度与回答准确性。</p>
          <div class="chat-area">
            <textarea v-model="prompt" placeholder="例如：灵山大佛有多高？拈花湾晚上有表演吗？" rows="3"></textarea>
            <button class="btn btn--accent" @click="testAI" :disabled="aiLoading">
              <span v-if="aiLoading" class="btn-spinner"></span>
              <template v-else>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                发送
              </template>
            </button>
          </div>
          <Transition name="slide-up">
            <div v-if="aiResp" class="ai-bubble">
              <div class="bub-avatar">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              <div class="bub-body">
                <div class="bub-label">AI 导游 · 小云</div>
                <div class="bub-text">{{ aiResp }}</div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 外观 / 服装 / 声音 / 背景 配置 -->
        <div class="card cfg-card">
          <ConfigTabs>
            <template #default="{ active }">
              <div v-if="active === '外观'"><AppearancePanel v-model="appear" :disabled="!isModern" /></div>
              <div v-if="active === '服装'"><ClothingPanel v-model="cloth" /></div>
              <div v-if="active === '声音'"><VoicePanel :value="voiceCfg" @update="onV" /></div>
            </template>
          </ConfigTabs>
          <div class="cfg-footer">
            <button class="btn btn--accent" @click="saveAll">保存配置</button>
            <button class="btn btn--outline" @click="preview">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              预览效果
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：预览窗口 -->
      <div class="dh-right">
        <PreviewPanel :appear="appear" :cloth="cloth" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDigitalHuman } from '@/composables/useDigitalHuman'
import { chatOnce } from '@/services/ai-service'
import PreviewPanel from '@/components/digital-human/PreviewPanel.vue'
import ConfigTabs from '@/components/digital-human/ConfigTabs.vue'
import AppearancePanel from '@/components/digital-human/AppearancePanel.vue'
import ClothingPanel from '@/components/digital-human/ClothingPanel.vue'
import VoicePanel from '@/components/digital-human/VoicePanel.vue'

const { cfg, save } = useDigitalHuman()

// ── AI 对话 ──
const prompt = ref('灵山大佛有多高？')
const aiResp = ref('')
const aiLoading = ref(false)

async function testAI() {
  if (!prompt.value.trim()) return
  aiLoading.value = true
  try {
    const r = await chatOnce(prompt.value)
    aiResp.value = r?.answer ?? '(无响应)'
  } catch {
    aiResp.value = 'AI 服务暂不可用，请检查系统设置中的 AI 引擎连接。'
  }
  aiLoading.value = false
}

// ── 外观 / 服装 / 声音 ──
const appear = ref({ hair: '短发', hairColor: 'blue', face: '鹅蛋脸' })
const cloth = ref({ style: '现代', color: '#c41e3a' })
const voiceCfg = ref({ voice: '温柔', rate: 1.0 })

const isModern = computed(() => cloth.value.style === '现代')

function onV(v: any) { voiceCfg.value = v }

async function saveAll() {
  await save({ appearance: appear.value, clothing: cloth.value, voice: voiceCfg.value, background: {} })
  alert('配置已保存！')
}

function preview() {
  alert('预览功能将在数字人引擎就绪后开放。')
}
</script>

<style scoped>
.digital-page { padding: 4px 0 40px; }

.page-hero {
  margin-bottom: 24px;
  padding: 20px 24px 16px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(255,255,255,.5), rgba(255,252,247,.4));
  border: 1px solid rgba(180,150,120,.12);
  box-shadow: 0 1px 16px rgba(120,90,50,.04);
  position: relative; overflow: hidden;
}
.page-hero::after {
  content: '';
  position: absolute;
  bottom: 0; left: 24px; right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,160,100,.15), transparent);
}
.hero-title { margin: 0 0 4px; font-size: 22px; font-weight: 800; color: var(--text); padding-left: 18px; position: relative; }
.hero-title::before { content: ''; position: absolute; left: 0; top: 4px; bottom: 4px; width: 4px; border-radius: 2px; background: linear-gradient(180deg, var(--accent-gold), var(--primary)); }
.hero-sub { margin: 0; font-size: 13px; color: var(--text-tertiary); padding-left: 18px; }

/* ── 双栏布局 ── */
.dh-body { display: flex; gap: 20px; align-items: flex-start; }
.dh-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.dh-right { width: 370px; flex-shrink: 0; }

/* ── AI 测试卡片 ── */
.test-card { padding: 18px 20px; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.card-head h3 { margin: 0; font-size: 15px; color: var(--text); display: flex; align-items: center; gap: 6px; }
.head-icon { font-size: 8px; color: var(--success); }
.chip { font-size: 10px; padding: 3px 10px; border-radius: var(--radius-full); background: rgba(200,160,100,.15); color: var(--accent); font-weight: 600; letter-spacing: .04em; border: 1px solid rgba(200,150,100,.15); }
.card-desc { font-size: 12px; color: var(--text-tertiary); margin: 0 0 12px; }

.chat-area { display: flex; flex-direction: column; gap: 10px; }
.chat-area textarea {
  width: 100%; padding: 10px 14px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: rgba(255,255,255,.7);
  color: var(--text); font-size: 14px; font-family: inherit;
  resize: vertical; outline: none; transition: all var(--transition);
}
.chat-area textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200,160,100,.1); }

/* AI 回复气泡 */
.ai-bubble {
  margin-top: 14px; display: flex; gap: 12px;
  padding: 14px 16px; border-radius: var(--radius);
  background: linear-gradient(135deg, rgba(200,160,100,.06), rgba(220,180,120,.03));
  border: 1px solid rgba(200,160,100,.12);
}
.bub-avatar { flex-shrink: 0; color: var(--accent); opacity: .7; }
.bub-label { font-size: 11px; font-weight: 600; color: var(--accent); margin-bottom: 4px; text-transform: uppercase; letter-spacing: .05em; }
.bub-text { font-size: 14px; color: var(--text); line-height: 1.7; }

/* ── 配置卡片 ── */
.cfg-card { padding: 16px 20px 0; }
.cfg-footer {
  display: flex; gap: 8px; padding: 14px 0;
  border-top: 1px solid var(--border-light);
  margin-top: 12px;
}

.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.slide-up-enter-active, .slide-up-leave-active { transition: opacity .3s ease, transform .3s cubic-bezier(0.34,1.56,0.64,1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }

@media (max-width: 1000px) { .dh-body { flex-direction: column; } .dh-right { width: 100%; } }
</style>
