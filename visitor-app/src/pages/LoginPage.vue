<template>
  <div class="login-page">
    <div class="login-hero">
      <div class="hero-icon">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 class="hero-title">灵山导览</h2>
      <p class="hero-sub">AI 数字人导游 &middot; 智慧景区助手</p>
    </div>

    <!-- ═══════════ 登录 ═══════════ -->
    <form v-if="mode === 'login'" class="login-card card animate-in" @submit.prevent="handleLogin">
      <!-- 用户名 -->
      <div class="form-group">
        <label class="form-label">用户名 / 账号</label>
        <input
          v-model="form.username"
          class="form-input"
          :class="{ 'input-error': fieldErrors.username }"
          type="text"
          placeholder="请输入用户名"
          autocomplete="username"
          @blur="validateField('username')"
        />
        <span v-if="fieldErrors.username" class="form-hint form-hint--warn">{{ fieldErrors.username }}</span>
      </div>

      <!-- 密码 -->
      <div class="form-group">
        <label class="form-label">密码</label>
        <div class="pwd-wrap">
          <input
            v-model="form.password"
            class="form-input"
            :class="{ 'input-error': fieldErrors.password }"
            :type="showPwd ? 'text' : 'password'"
            placeholder="请输入密码"
            autocomplete="current-password"
            @blur="validateField('password')"
          />
          <button type="button" class="pwd-toggle" @click="showPwd = !showPwd" tabindex="-1">
            <svg v-if="showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
        <span v-if="fieldErrors.password" class="form-hint form-hint--warn">{{ fieldErrors.password }}</span>
      </div>

      <!-- 记住我 -->
      <label class="remember-row">
        <span class="remember-checkbox" :class="{ checked: rememberMe }" @click="rememberMe = !rememberMe">
          <svg v-if="rememberMe" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <span class="remember-text">记住我（7 天内自动登录）</span>
      </label>

      <!-- 锁定 -->
      <p v-if="store.lockoutSeconds > 0" class="lockout-msg">
        ⏳ 登录过于频繁，请 <strong>{{ store.lockoutSeconds }}</strong> 秒后再试
      </p>

      <!-- 错误 -->
      <p v-if="store.loginError && store.lockoutSeconds === 0" class="form-error">{{ store.loginError }}</p>

      <button class="btn btn--accent btn--lg login-btn" type="submit" :disabled="store.isLoggingIn || !canLogin || store.lockoutSeconds > 0">
        <span v-if="store.isLoggingIn" class="btn-spinner"></span>
        <span v-else>登 录</span>
      </button>

      <div class="login-extras">
        <button type="button" class="link-btn" @click="switchMode('register')">注册账号</button>
        <span class="extra-divider">|</span>
        <button type="button" class="link-btn" @click="switchMode('recover')">忘记密码？</button>
      </div>
    </form>

    <!-- ═══════════ 注册 ═══════════ -->
    <form v-else-if="mode === 'register'" class="login-card card animate-in" @submit.prevent="handleRegister">
      <h3 class="card-title">注册账号</h3>

      <div class="form-group">
        <label class="form-label">用户名</label>
        <input
          v-model="form.username"
          class="form-input"
          :class="{ 'input-error': fieldErrors.username }"
          type="text"
          placeholder="2~20 个字符，支持中文"
          autocomplete="off"
          @blur="validateField('username')"
        />
        <span v-if="fieldErrors.username" class="form-hint form-hint--warn">{{ fieldErrors.username }}</span>
      </div>

      <div class="form-group">
        <label class="form-label">密码</label>
        <div class="pwd-wrap">
          <input
            v-model="form.password"
            class="form-input"
            :class="{ 'input-error': fieldErrors.password }"
            :type="showPwd ? 'text' : 'password'"
            placeholder="至少 4 位，建议字母+数字"
            autocomplete="new-password"
            @input="onPasswordInput"
            @blur="validateField('password')"
          />
          <button type="button" class="pwd-toggle" @click="showPwd = !showPwd" tabindex="-1">
            <svg v-if="showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>

        <!-- 密码强度指示条 -->
        <div v-if="form.password" class="strength-bar-wrap">
          <div class="strength-segments">
            <span v-for="i in 4" :key="i" class="strength-seg" :class="segClass(i)"></span>
          </div>
          <span class="strength-label" :class="'strength-' + passwordStrength.level">{{ passwordStrength.label }}</span>
        </div>
        <span v-if="fieldErrors.password" class="form-hint form-hint--warn">{{ fieldErrors.password }}</span>
      </div>

      <div class="form-group">
        <label class="form-label">确认密码</label>
        <div class="pwd-wrap">
          <input
            v-model="form.confirmPwd"
            class="form-input"
            :class="{ 'input-error': fieldErrors.confirmPwd }"
            :type="showPwd ? 'text' : 'password'"
            placeholder="再次输入密码"
            autocomplete="new-password"
            @blur="validateField('confirmPwd')"
          />
        </div>
        <span v-if="fieldErrors.confirmPwd" class="form-hint form-hint--warn">{{ fieldErrors.confirmPwd }}</span>
      </div>

      <p v-if="store.loginError" class="form-error">{{ store.loginError }}</p>

      <button class="btn btn--accent btn--lg login-btn" type="submit" :disabled="store.isLoggingIn || !canRegister">
        <span v-if="store.isLoggingIn" class="btn-spinner"></span>
        <span v-else>注 册</span>
      </button>

      <p class="form-hint"><span>已有账号？</span><button type="button" class="link-btn" @click="switchMode('login')">返回登录</button></p>
    </form>

    <!-- ═══════════ 找回密码 ═══════════ -->
    <form v-else-if="mode === 'recover'" class="login-card card animate-in" @submit.prevent="handleRecover">
      <h3 class="card-title">找回密码</h3>
      <div class="form-group">
        <label class="form-label">用户名 / 账号</label>
        <input v-model="form.username" class="form-input" type="text" placeholder="请输入您注册时的用户名" />
      </div>

      <p v-if="store.loginError" class="form-error">{{ store.loginError }}</p>

      <div v-if="recoveredPwd" class="recover-result animate-in">
        <div class="recover-check">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <p class="recover-title">密码已重置</p>
        <p class="recover-pwd-label">您的新密码：</p>
        <div class="recover-pwd-box">
          <code>{{ recoveredPwd }}</code>
          <button type="button" class="copy-btn" @click="copyPwd">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <p class="form-hint form-hint--warn">请妥善保管新密码，登录后可修改。</p>
        <button type="button" class="btn btn--accent btn--lg login-btn" @click="switchMode('login')">返回登录</button>
      </div>

      <template v-else>
        <button class="btn btn--accent btn--lg login-btn" type="submit" :disabled="store.isLoggingIn || !canRecover">
          <span v-if="store.isLoggingIn" class="btn-spinner"></span>
          <span v-else>重置密码</span>
        </button>
        <p class="form-hint"><button type="button" class="link-btn" @click="switchMode('login')">返回登录</button></p>
      </template>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user-store'
import {
  validateUsername,
  validatePassword,
  getPasswordStrength,
  validateConfirmPassword,
} from '@/services/validators'
import type { PasswordStrength, StrengthResult } from '@/services/validators'

const store = useUserStore()
const router = useRouter()
const route = useRoute()

type Mode = 'login' | 'register' | 'recover'
const mode = ref<Mode>('login')
const showPwd = ref(false)
const rememberMe = ref(false)
const recoveredPwd = ref('')
const form = reactive({ username: '', password: '', confirmPwd: '' })
const fieldErrors = reactive<Record<string, string>>({ username: '', password: '', confirmPwd: '' })
const passwordStrength = ref<StrengthResult>({ level: 'empty' as PasswordStrength, score: 0, label: '—', message: '' })

// 跟踪上次校验的值，避免在输入过程中重复触发
let _lastValidated: Record<string, string> = {}

// ═══════════════════════ 防抖校验 ═══════════════════════
let _debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {}

function validateField(field: string) {
  // 清除该字段的旧计时器
  if (_debounceTimers[field]) clearTimeout(_debounceTimers[field])

  _debounceTimers[field] = setTimeout(() => {
    // 避免重复校验相同值
    const currentValue = form[field as keyof typeof form]
    if (_lastValidated[field] === currentValue) return
    _lastValidated[field] = currentValue

    switch (field) {
      case 'username': {
        if (!currentValue) { fieldErrors.username = ''; return }
        fieldErrors.username = validateUsername(currentValue).message
        break
      }
      case 'password': {
        if (!currentValue) { fieldErrors.password = ''; return }
        const result = validatePassword(currentValue)
        fieldErrors.password = result.message
        // 同时更新确认密码
        if (form.confirmPwd) {
          fieldErrors.confirmPwd = validateConfirmPassword(currentValue, form.confirmPwd).message
        }
        break
      }
      case 'confirmPwd': {
        if (!currentValue) { fieldErrors.confirmPwd = ''; return }
        fieldErrors.confirmPwd = validateConfirmPassword(form.password, currentValue).message
        break
      }
    }
  }, 300)
}

// ═══════════════════════ 密码强度实时更新 ═══════════════════════
function onPasswordInput() {
  passwordStrength.value = getPasswordStrength(form.password)
}

// ═══════════════════════ 密码强度指示条 ═══════════════════════
function segClass(i: number) {
  // i: 1~4, score: 0~4
  if (passwordStrength.value.score >= i) {
    if (passwordStrength.value.level === 'weak') return 'seg-weak'
    if (passwordStrength.value.level === 'fair') return 'seg-fair'
    if (passwordStrength.value.level === 'good') return 'seg-good'
    return 'seg-strong'
  }
  return ''
}

// ═══════════════════════ 重定向目标 ═══════════════════════
const redirectTarget = computed(() => {
  const r = route.query.redirect
  return (typeof r === 'string' && r) ? r : '/'
})

// ═══════════════════════ 表单校验 ═══════════════════════
function clearFieldErrors() {
  fieldErrors.username = ''
  fieldErrors.password = ''
  fieldErrors.confirmPwd = ''
  _lastValidated = {}
}

const canLogin = computed(() => {
  const ident = form.username.trim()
  return validateUsername(ident).valid && form.password.length > 0
})

const canRegister = computed(() =>
  validateUsername(form.username).valid &&
  validatePassword(form.password).valid &&
  form.password === form.confirmPwd
)

const canRecover = computed(() => form.username.trim().length >= 2)

// ═══════════════════════ 模式切换 ═══════════════════════
function resetForm() {
  form.username = ''
  form.password = ''
  form.confirmPwd = ''
  mode.value = 'login'
  showPwd.value = false
  recoveredPwd.value = ''
  rememberMe.value = false
  passwordStrength.value = { level: 'empty', score: 0, label: '—', message: '' }
  clearFieldErrors()
  store.clearError()
}

onMounted(resetForm)
watch(() => route.path, () => { if (route.path === '/login') resetForm() })

function switchMode(m: Mode) {
  mode.value = m
  store.clearError()
  recoveredPwd.value = ''
  showPwd.value = false
  clearFieldErrors()
  passwordStrength.value = { level: 'empty', score: 0, label: '—', message: '' }
}
watch(mode, () => { form.confirmPwd = ''; clearFieldErrors() })

// ═══════════════════════ 处理函数 ═══════════════════════

async function handleLogin() {
  if (!canLogin.value || store.lockoutSeconds > 0) return
  const ident = form.username.trim()
  const ok = await store.doLogin(ident, form.password, rememberMe.value)
  if (ok) {
    ElMessage({ message: `欢迎回来，${store.userName}！`, type: 'success', duration: 1800 })
    router.replace(redirectTarget.value)
  }
}

async function handleRegister() {
  if (!canRegister.value) return
  const ok = await store.doRegister(form.username.trim(), form.password)
  if (ok) {
    ElMessage({ message: `注册成功！欢迎，${store.userName}！`, type: 'success', duration: 2000 })
    router.replace(redirectTarget.value)
  }
}

async function handleRecover() {
  if (!canRecover.value) return
  const newPwd = await store.doRecover(form.username.trim())
  if (newPwd) {
    recoveredPwd.value = newPwd
    ElMessage({ message: '密码已重置，请查看下方新密码', type: 'success', duration: 3000 })
  }
}

async function copyPwd() {
  try {
    await navigator.clipboard.writeText(recoveredPwd.value)
    ElMessage({ message: '已复制到剪贴板', type: 'success', duration: 1500 })
  } catch {
    ElMessage({ message: '复制失败，请手动复制', type: 'warning', duration: 1500 })
  }
}

// 清理
onUnmounted(() => {
  for (const key of Object.keys(_debounceTimers)) {
    if (_debounceTimers[key]) clearTimeout(_debounceTimers[key])
  }
})
</script>

<style scoped>
.login-page { display: flex; flex-direction: column; align-items: center; padding: 32px 20px 40px; flex: 1; min-height: 0; overflow-y: auto; }
.login-hero { text-align: center; margin-bottom: 28px; }
.hero-icon { width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 12px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(200,132,60,.25); }
.hero-title { margin: 0; font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: .04em; }
.hero-sub { margin: 6px 0 0; font-size: 13px; color: var(--text-tertiary); }
.login-card { width: 100%; max-width: 360px; padding: 24px 20px 20px; }
.card-title { margin: 0 0 16px; font-size: 17px; font-weight: 700; text-align: center; color: var(--text); }

/* ── 表单 ── */
.form-group { margin-bottom: 14px; }
.form-label { display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.pwd-wrap { position: relative; display: flex; align-items: center; }
.pwd-wrap .form-input { padding-right: 40px; }
.pwd-toggle { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; line-height: 1; opacity: .4; transition: opacity .15s; color: var(--muted); }
.pwd-toggle:hover { opacity: .8; }
.input-error { border-color: var(--danger) !important; }
.form-hint { margin: 6px 0 0; font-size: 12px; color: var(--text-tertiary); display: flex; align-items: center; justify-content: center; gap: 4px; }
.form-hint--warn { color: var(--warning); justify-content: flex-start; }
.form-error { margin: 8px 0 0; font-size: 13px; color: var(--danger); font-weight: 500; text-align: center; padding: 6px 10px; background: var(--danger-soft); border-radius: var(--radius-sm); }

/* ── 记住我 ── */
.remember-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer; user-select: none; }
.remember-checkbox { width: 20px; height: 20px; border-radius: 4px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; transition: all var(--transition); flex-shrink: 0; color: #fff; }
.remember-checkbox.checked { background: var(--accent); border-color: var(--accent); }
.remember-text { font-size: 13px; color: var(--text-secondary); }

/* ── 锁定提示 ── */
.lockout-msg { margin: 8px 0 0; font-size: 13px; color: var(--warning); text-align: center; padding: 6px 10px; background: var(--warning-soft); border-radius: var(--radius-sm); font-weight: 500; }
.lockout-msg strong { font-size: 16px; }

/* ── 密码强度 ── */
.strength-bar-wrap { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.strength-segments { display: flex; gap: 4px; flex: 1; }
.strength-seg { flex: 1; height: 5px; border-radius: 3px; background: var(--border); transition: background .25s; }
.strength-seg.seg-weak { background: #e04a3c; }
.strength-seg.seg-fair { background: #e89030; }
.strength-seg.seg-good { background: #5a9e80; }
.strength-seg.seg-strong { background: #3a8a5c; }
.strength-label { font-size: 12px; font-weight: 600; flex-shrink: 0; min-width: 2em; text-align: right; }
.strength-label.strength-weak { color: #e04a3c; }
.strength-label.strength-fair { color: #e89030; }
.strength-label.strength-good { color: #5a9e80; }
.strength-label.strength-strong { color: #3a8a5c; }

/* ── 按钮 ── */
.login-extras { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 18px; }
.extra-divider { color: var(--border); font-size: 13px; }
.link-btn { background: none; border: none; color: var(--muted); font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; padding: 0; transition: color .15s; }
.link-btn:hover { color: var(--accent); }
.login-btn { width: 100%; margin-top: 14px; }
.btn-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── 找回密码 ── */
.recover-result { text-align: center; padding: 8px 0; }
.recover-check { margin-bottom: 8px; }
.recover-title { margin: 0 0 4px; font-size: 16px; font-weight: 700; color: var(--success); }
.recover-pwd-label { margin: 12px 0 6px; font-size: 13px; color: var(--text-secondary); }
.recover-pwd-box { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--success-soft); border: 1px solid rgba(74,154,110,.2); border-radius: var(--radius-sm); font-size: 16px; font-weight: 700; letter-spacing: .06em; }
.recover-pwd-box code { font-family: 'SF Mono','Fira Code','Consolas',monospace; color: var(--text); }
.copy-btn { background: none; border: none; cursor: pointer; padding: 2px 4px; transition: transform .15s; color: var(--muted); }
.copy-btn:active { transform: scale(1.2); }
</style>
