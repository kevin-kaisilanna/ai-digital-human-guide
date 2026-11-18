<template>
  <div class="settings-page">
    <section class="page-hero">
      <div>
        <h1 class="hero-title">系统设置</h1>
        <p class="hero-sub">AI 后端 · 数字人引擎 · 通用配置</p>
      </div>
    </section>

    <!-- AI 后端 -->
    <section class="card s-section">
      <div class="s-head">
        <div class="s-icon ai">AI</div>
        <div>
          <h3>AI 后端部署</h3>
          <p class="s-desc">配置 AI 问答服务——处理游客自然语言提问并返回知识性回答。</p>
        </div>
        <span class="s-chip" :class="aiStatus?.ok?'ok':'pending'">
          {{ aiStatus ? (aiStatus.ok ? '已连接' : '未连接') : '未检测' }}
        </span>
      </div>
      <div class="form-group">
        <label>AI 服务地址</label>
        <div class="inp-row">
          <input v-model="aiBase" placeholder="http://localhost:8001"/>
          <button class="btn btn--outline btn--sm" @click="testAi" :disabled="testingAi">
            <span v-if="testingAi" class="btn-spinner"></span>
            <template v-else>测试连接</template>
          </button>
        </div>
        <Transition name="fade">
          <span v-if="aiStatus" :class="['s-msg',aiStatus.ok?'ok':'fail']">{{ aiStatus.msg }}</span>
        </Transition>
      </div>
    </section>

    <!-- 数字人引擎 -->
    <section class="card s-section">
      <div class="s-head">
        <div class="s-icon dh">DH</div>
        <div>
          <h3>数字人引擎</h3>
          <p class="s-desc">数字人渲染与 TTS 语音合成——生成导游形象与语音播报。</p>
        </div>
        <span class="s-chip" :class="dhStatus?.ok?'ok':'pending'">
          {{ dhStatus ? (dhStatus.ok ? '已连接' : '未连接') : '未检测' }}
        </span>
      </div>
      <div class="form-group">
        <label>数字人服务地址</label>
        <div class="inp-row">
          <input v-model="dhBase" placeholder="http://localhost:8002"/>
          <button class="btn btn--outline btn--sm" @click="testDh" :disabled="testingDh">
            <span v-if="testingDh" class="btn-spinner"></span>
            <template v-else>测试连接</template>
          </button>
        </div>
        <Transition name="fade">
          <span v-if="dhStatus" :class="['s-msg',dhStatus.ok?'ok':'fail']">{{ dhStatus.msg }}</span>
        </Transition>
      </div>
    </section>

    <!-- 通用设置 -->
    <section class="card s-section">
      <div class="s-head">
        <div class="s-icon cfg">CFG</div>
        <div>
          <h3>通用设置</h3>
          <p class="s-desc">切换数据模式——Mock 使用本地 JSON 数据，真实 API 需后端运行。</p>
        </div>
      </div>
      <div class="form-group">
        <label>数据模式</label>
        <div class="mode-sw">
          <button :class="{active:useMock}" @click="setMock(true)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            Mock 数据
          </button>
          <button :class="{active:!useMock}" @click="setMock(false)">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            真实 API
          </button>
        </div>
        <span class="help">{{ useMock ? '使用本地 Mock 数据（无需后端）。' : '需要后端服务正在运行。' }}</span>
      </div>
    </section>

    <div class="s-footer">
      <button class="btn btn--accent btn--lg" @click="saveAll">保存设置</button>
      <button class="btn btn--outline" @click="resetAll">恢复默认</button>
    </div>
    <Transition name="fade">
      <p v-if="msg" class="save-toast">{{ msg }}</p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {getAiBase,setAiBase,getDigitalHumanBase,setDigitalHumanBase,resetToEnv} from '@/config'

const aiBase=ref(getAiBase())
const dhBase=ref(getDigitalHumanBase())
const useMock=ref(localStorage.getItem('USE_MOCK')!=='false')
const msg=ref('')
const testingAi=ref(false)
const testingDh=ref(false)
const aiStatus=ref<{ok:boolean;msg:string}|null>(null)
const dhStatus=ref<{ok:boolean;msg:string}|null>(null)

async function testAi(){
  testingAi.value=true; aiStatus.value=null
  try {
    const res=await fetch(`${aiBase.value.replace(/\/$/,'')}/api/ai/chat`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:'ping'}),
      signal:AbortSignal.timeout(5000),
    })
    aiStatus.value=res.ok ? {ok:true,msg:'连接成功 — AI 引擎运行正常'} : {ok:false,msg:`服务器返回状态 ${res.status}`}
  } catch {
    aiStatus.value={ok:false,msg:'无法连接，请检查地址是否正确及服务是否启动'}
  }
  testingAi.value=false
}

async function testDh(){
  testingDh.value=true; dhStatus.value=null
  try {
    const res=await fetch(`${dhBase.value.replace(/\/$/,'')}/api/digital-human/config`,{
      signal:AbortSignal.timeout(5000),
    })
    dhStatus.value=res.ok ? {ok:true,msg:'连接成功 — 数字人引擎运行正常'} : {ok:false,msg:`服务器返回状态 ${res.status}`}
  } catch {
    dhStatus.value={ok:false,msg:'无法连接，请检查地址是否正确及服务是否启动'}
  }
  testingDh.value=false
}

function setMock(v:boolean){ useMock.value=v; localStorage.setItem('USE_MOCK',String(v)) }
function saveAll(){
  setAiBase(aiBase.value||''); setDigitalHumanBase(dhBase.value||'')
  localStorage.setItem('USE_MOCK',String(useMock.value))
  msg.value='设置已保存。'
  setTimeout(()=>{ msg.value='' },3000)
}
function resetAll(){
  resetToEnv(); aiBase.value=getAiBase(); dhBase.value=getDigitalHumanBase()
  useMock.value=true; localStorage.setItem('USE_MOCK','true')
  aiStatus.value=null; dhStatus.value=null
  msg.value='已恢复默认设置。'
  setTimeout(()=>{ msg.value='' },3000)
}
</script>

<style scoped>
.settings-page { max-width: 860px; padding: 4px 0 40px; }

.page-hero {
  margin-bottom: 24px; padding: 20px 24px 16px; border-radius: var(--radius-lg);
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

.s-section { padding: 20px 24px; margin-bottom: 16px; }

.s-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
.s-icon {
  width: 44px; height: 44px; border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; flex-shrink: 0;
  letter-spacing: .04em;
}
.s-icon.ai  { background: rgba(200,150,100,.1); border: 1px solid rgba(200,150,100,.15); color: var(--accent-gold); }
.s-icon.dh  { background: rgba(180,140,200,.1); border: 1px solid rgba(180,140,200,.15); color: #9a6ab0; }
.s-icon.cfg { background: rgba(106,154,184,.1); border: 1px solid rgba(106,154,184,.15); color: #5a9ab8; }

.s-head h3 { margin: 0 0 3px; font-size: 15px; color: var(--text); }
.s-head>:nth-child(2) { flex: 1; }
.s-desc { margin: 0; font-size: 12px; color: var(--text-tertiary); line-height: 1.5; }

.s-chip {
  font-size: 11px; padding: 4px 12px; border-radius: var(--radius-full);
  font-weight: 600; flex-shrink: 0; letter-spacing: .03em;
}
.s-chip.ok { background: var(--success-soft); color: var(--success); }
.s-chip.pending { background: var(--warning-soft); color: var(--warning); }

.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.inp-row { display: flex; gap: 8px; }
.inp-row input {
  flex: 1; padding: 10px 14px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: rgba(255,255,255,.7);
  color: var(--text); font-size: 14px; font-family: inherit;
  outline: none; transition: all var(--transition);
}
.inp-row input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200,160,100,.1); }

.s-msg { font-size: 12px; margin-top: 4px; }
.s-msg.ok { color: var(--success); }
.s-msg.fail { color: var(--danger); }

.mode-sw { display: flex; gap: 8px; }
.mode-sw button {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border: 1px solid var(--border);
  border-radius: var(--radius); background: transparent;
  color: var(--muted); cursor: pointer; font-size: 13px;
  font-family: inherit; transition: all var(--transition);
}
.mode-sw button:hover { border-color: rgba(180,150,120,.35); background: var(--surface-hover); }
.mode-sw button.active {
  background: var(--primary-soft); border-color: var(--primary);
  color: var(--text); font-weight: 600;
  box-shadow: 0 0 0 1px rgba(200,132,60,.1);
}

.help { font-size: 11px; color: var(--text-tertiary); margin-top: 4px; }

.s-footer { display: flex; gap: 10px; margin-top: 8px; }

.save-toast {
  margin-top: 12px; font-size: 13px; color: var(--success);
  background: var(--success-soft); padding: 8px 14px;
  border-radius: var(--radius-sm); display: inline-block;
}

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(200,132,60,.2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity .25s ease, transform .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(6px); }
</style>
