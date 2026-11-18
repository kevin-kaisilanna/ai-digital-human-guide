<template>
  <div class="voice-panel">
    <!-- 音色选择 -->
    <div class="form-group">
      <label>音色选择</label>
      <p class="form-hint">从百度语音 TTS 全部可用音色中选择数字人播报音色</p>
      <div class="voice-select-area">
        <select
          v-model="selectedPer"
          class="voice-select"
          :disabled="loading || saving"
        >
          <optgroup
            v-for="group in groupedOptions"
            :key="group.cat"
            :label="group.cat"
          >
            <option
              v-for="v in group.items"
              :key="v.per"
              :value="v.per"
            >
              {{ v.desc }}
            </option>
          </optgroup>
        </select>
        <span v-if="currentVoice" class="voice-meta">
          {{ currentVoice.cat }} · {{ currentVoice.scene }}
        </span>
      </div>
    </div>

    <!-- 试听按钮 -->
    <button
      class="btn btn--outline btn--sm preview-btn"
      @click="previewVoice"
      :disabled="isPlaying"
    >
      {{ isPlaying ? '试听中…' : '试听当前音色' }}
    </button>

    <!-- 语速调节 -->
    <div class="form-group">
      <label>语速：{{ localRate }}x</label>
      <input
        type="range" min="0.5" max="2" step="0.1"
        v-model.number="localRate"
        class="rate-slider"
      />
      <div class="rate-labels">
        <span>0.5x 慢</span>
        <span>1.0x 正常</span>
        <span>2.0x 快</span>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="save-row">
      <button
        class="btn btn--primary"
        @click="saveVoice"
        :disabled="loading || saving || selectedPer === savedPer"
      >
        <span v-if="saving" class="btn-spinner"></span>
        <template v-else>保存音色设置</template>
      </button>
      <Transition name="fade">
        <span v-if="saveMsg" :class="['save-msg', saveOk ? 'msg-ok' : 'msg-err']">
          {{ saveMsg }}
        </span>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { fetchVoiceConfig, updateVoiceConfig } from '@/services/digital-human-service'

interface VoiceOption {
  per: number
  name: string
  desc: string
  cat: string
  scene: string
}

interface CurrentVoice {
  per: number
  name: string
  description: string
  category: string
}

// ── 状态 ────────────────────────────────────────────────────
const allOptions = ref<VoiceOption[]>([])
const currentPer = ref<number | null>(null)  // 服务端当前生效的 per
const selectedPer = ref<number | null>(null) // 下拉框选中值
const savedPer = ref<number | null>(null)    // 上次保存成功的值
const loading = ref(false)
const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)
const isPlaying = ref(false)

const localRate = ref(1.0)

const emit = defineEmits<{ update: [v: Record<string, any>] }>()

// ── 计算属性 ────────────────────────────────────────────────

/** 按音库分组的下拉选项 */
const groupedOptions = computed(() => {
  const order = ['臻品音库', '精品音库', '基础音库']
  const groups = new Map<string, VoiceOption[]>()
  for (const v of allOptions.value) {
    if (!groups.has(v.cat)) groups.set(v.cat, [])
    groups.get(v.cat)!.push(v)
  }
  return order
    .filter(cat => groups.has(cat))
    .map(cat => ({ cat, items: groups.get(cat)! }))
})

/** 当前选中的完整音色信息 */
const currentVoice = computed(() => {
  if (selectedPer.value == null) return null
  return allOptions.value.find(v => v.per === selectedPer.value) ?? null
})

// ── 初始化加载 ──────────────────────────────────────────────

async function loadVoiceConfig() {
  loading.value = true
  try {
    const res = await fetchVoiceConfig()
    allOptions.value = (res.options ?? []) as VoiceOption[]
    const data = res.data as CurrentVoice
    if (data?.per != null) {
      currentPer.value = data.per
      selectedPer.value = data.per
      savedPer.value = data.per
    } else if (allOptions.value.length > 0) {
      // 默认选中第一个臻品音色
      const first = allOptions.value[0]
      currentPer.value = first.per
      selectedPer.value = first.per
      savedPer.value = first.per
    }
  } catch (e) {
    console.error('加载音色配置失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadVoiceConfig)

// ── 保存 ────────────────────────────────────────────────────

async function saveVoice() {
  if (selectedPer.value == null) return
  saving.value = true
  saveMsg.value = ''
  try {
    const matched = allOptions.value.find(v => v.per === selectedPer.value)
    await updateVoiceConfig({
      per: selectedPer.value,
      name: matched?.name ?? '',
      description: matched?.desc ?? '',
      category: matched?.cat ?? '',
    })
    savedPer.value = selectedPer.value
    currentPer.value = selectedPer.value
    saveOk.value = true
    saveMsg.value = '音色设置已更新'

    // 同步当前音色描述给父组件（用于预览等场景）
    emit('update', { voice: matched?.desc ?? '', rate: localRate.value })
  } catch (e) {
    saveOk.value = false
    saveMsg.value = '保存失败，请检查网络连接'
    console.error('保存音色失败:', e)
  } finally {
    saving.value = false
    setTimeout(() => { saveMsg.value = '' }, 3000)
  }
}

// ── 试听 ────────────────────────────────────────────────────

function previewVoice() {
  isPlaying.value = true
  // 通过父组件的 TTS 测试功能试听
  emit('update', {
    voice: currentVoice.value?.desc ?? '',
    per: selectedPer.value,
    rate: localRate.value,
  })
  setTimeout(() => { isPlaying.value = false }, 1500)
}
</script>

<style scoped>
.voice-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}
.form-hint {
  margin: 0;
  font-size: 11px;
  color: var(--text-tertiary);
}

.voice-select-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.voice-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(255,255,255,.85);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition);
}
.voice-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79,110,246,.08);
}
.voice-select:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.voice-meta {
  font-size: 11px;
  color: var(--text-tertiary);
  padding-left: 4px;
}

.preview-btn {
  align-self: flex-start;
}

/* 语速 */
.rate-slider {
  width: 100%;
  accent-color: var(--primary);
}
.rate-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-tertiary);
}

/* 保存 */
.save-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}
.save-msg {
  font-size: 12px;
  font-weight: 500;
}
.msg-ok { color: var(--success); }
.msg-err { color: var(--danger, #e74c3c); }

.btn-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
  margin-right: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
