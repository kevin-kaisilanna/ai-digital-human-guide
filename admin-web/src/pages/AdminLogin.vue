<template>
  <div class="login-container">
    <div class="login-bg" :style="{ backgroundImage: `url('/images/scenic/p1.jpg')` }"></div>
    <div class="login-bg-overlay"></div>

    <!-- 返回按钮 -->
    <button class="btn-login-back" @click="goBack">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      <span>返回首页</span>
    </button>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-card-glow"></div>

      <div class="login-header">
        <div class="login-logo">
          <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="rgba(220,180,120,0.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M24 4L6 14v12c0 10.5 7.5 20.2 18 22 10.5-1.8 18-11.5 18-22V14L24 4z"/>
            <path d="M16 24l5 5 11-11"/>
          </svg>
        </div>
        <h2 class="login-title">{{ isRegister ? '注册管理员' : isForgot ? '找回密码' : '后台管理登录' }}</h2>
        <p class="login-subtitle">灵山导览 · 管理系统</p>
      </div>

      <!-- 登录 / 注册表单 -->
      <form v-if="!isForgot" class="login-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label class="field-label">管理员账号</label>
          <div class="field-input-wrapper">
            <svg class="field-icon-svg" viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="1.5" fill="none">
              <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
            </svg>
            <input v-model="username" type="text" class="field-input" placeholder="请输入管理员账号" autocomplete="off" required />
          </div>
        </div>

        <div class="form-field">
          <label class="field-label">密码</label>
          <div class="field-input-wrapper">
            <svg class="field-icon-svg" viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="1.5" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="field-input" placeholder="请输入密码" autocomplete="current-password" required />
            <button type="button" class="field-toggle" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.5" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="1.5" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><path d="M14.12 14.12a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="isRegister" class="form-field">
          <label class="field-label">绑定邮箱</label>
          <div class="field-input-wrapper">
            <svg class="field-icon-svg" viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="1.5" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/>
            </svg>
            <input v-model="regEmail" type="email" class="field-input" placeholder="请输入邮箱（用于找回密码）" autocomplete="email" required />
          </div>
        </div>

        <div v-if="isRegister" class="form-field">
          <label class="field-label">确认密码</label>
          <div class="field-input-wrapper">
            <svg class="field-icon-svg" viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="1.5" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input v-model="confirmPassword" type="password" class="field-input" placeholder="请再次输入密码" autocomplete="new-password" required />
          </div>
        </div>

        <div v-if="errorMsg" class="login-error">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorMsg }}</span>
        </div>
        <div v-if="successMsg" class="login-success">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          <span>{{ successMsg }}</span>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="submit-spinner"></span>
          <template v-else>
            <span>{{ isRegister ? '注 册' : '登 录' }}</span>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </template>
        </button>
      </form>

      <!-- 找回密码表单 -->
      <form v-if="isForgot" class="login-form" @submit.prevent="handleForgotPassword">
        <div class="form-field">
          <label class="field-label">管理员账号</label>
          <div class="field-input-wrapper">
            <svg class="field-icon-svg" viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="1.5" fill="none">
              <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
            </svg>
            <input v-model="forgotUsername" type="text" class="field-input" placeholder="请输入您的管理员账号" required />
          </div>
        </div>

        <div class="form-field">
          <label class="field-label">预留邮箱</label>
          <div class="field-input-wrapper">
            <svg class="field-icon-svg" viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="1.5" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/>
            </svg>
            <input v-model="forgotEmail" type="email" class="field-input" placeholder="请输入注册时预留的邮箱" required />
          </div>
        </div>

        <div v-if="errorMsg" class="login-error">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorMsg }}</span>
        </div>
        <div v-if="successMsg" class="login-success">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          <span>{{ successMsg }}</span>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="submit-spinner"></span>
          <template v-else>
            <span>找回密码</span>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </template>
        </button>
      </form>

      <!-- 底部链接 -->
      <div class="login-footer">
        <template v-if="!isForgot">
          <button type="button" class="footer-link" @click="toggleMode">
            {{ isRegister ? '已有账号？去登录' : '没有账号？注册' }}
          </button>
          <span class="footer-divider">·</span>
          <button type="button" class="footer-link" @click="isForgot = true; clearMessages()">找回密码</button>
        </template>
        <template v-else>
          <button type="button" class="footer-link footer-link--back" @click="isForgot = false; isRegister = false; clearMessages()">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M15 18l-6-6 6-6"/></svg>
            返回登录
          </button>
        </template>
      </div>
    </div>

    <div class="login-copyright">© 2026 灵山景区 · 后台管理系统</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminDb } from '@/services/admin-db'

const router = useRouter()

const isRegister = ref(false)
const isForgot = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const username = ref('')
const password = ref('')
const regEmail = ref('')
const confirmPassword = ref('')
const forgotUsername = ref('')
const forgotEmail = ref('')

// 每次进入登录页时彻底重置所有状态
onMounted(() => {
  isRegister.value = false
  isForgot.value = false
  showPassword.value = false
  loading.value = false
  errorMsg.value = ''
  successMsg.value = ''
  username.value = ''
  password.value = ''
  regEmail.value = ''
  confirmPassword.value = ''
  forgotUsername.value = ''
  forgotEmail.value = ''
})

function clearMessages() { errorMsg.value = ''; successMsg.value = '' }
function toggleMode() { isRegister.value = !isRegister.value; clearMessages(); username.value = ''; password.value = ''; regEmail.value = ''; confirmPassword.value = '' }
function goBack() { router.push('/') }

async function handleSubmit() {
  clearMessages()
  if (!username.value.trim()) { errorMsg.value = '请输入管理员账号'; return }
  if (!password.value) { errorMsg.value = '请输入密码'; return }

  if (isRegister.value) {
    if (!regEmail.value.trim()) { errorMsg.value = '请输入绑定邮箱'; return }
    if (password.value.length < 6) { errorMsg.value = '密码长度不能少于6位'; return }
    if (password.value !== confirmPassword.value) { errorMsg.value = '两次输入的密码不一致'; return }
    loading.value = true
    try {
      const result = await adminDb.register(username.value.trim(), password.value, regEmail.value.trim())
      if (result.success) { successMsg.value = '注册成功！请登录'; isRegister.value = false; password.value = ''; regEmail.value = ''; confirmPassword.value = '' }
      else { errorMsg.value = result.message }
    } catch (e: any) { errorMsg.value = e.message || '注册失败，请重试' }
    finally { loading.value = false }
  } else {
    loading.value = true
    try {
      const result = await adminDb.login(username.value.trim(), password.value)
      if (result.success) {
        successMsg.value = '登录成功，正在跳转...'
        sessionStorage.setItem('admin_logged_in', 'true')
        sessionStorage.setItem('admin_user', JSON.stringify(result.user))
        sessionStorage.setItem('auth_token', result.token || '')
        setTimeout(() => { router.push('/dashboard') }, 800)
      } else { errorMsg.value = result.message }
    } catch (e: any) { errorMsg.value = e.message || '登录失败，请重试' }
    finally { loading.value = false }
  }
}

async function handleForgotPassword() {
  clearMessages()
  if (!forgotUsername.value.trim()) { errorMsg.value = '请输入管理员账号'; return }
  if (!forgotEmail.value.trim()) { errorMsg.value = '请输入预留邮箱'; return }
  loading.value = true
  try {
    const result = await adminDb.resetPassword(forgotUsername.value.trim(), forgotEmail.value.trim())
    if (result.success) { successMsg.value = `密码已重置为：${result.newPassword}。请牢记并尽快修改密码！`; forgotUsername.value = ''; forgotEmail.value = '' }
    else { errorMsg.value = result.message }
  } catch (e: any) { errorMsg.value = e.message || '操作失败，请重试' }
  finally { loading.value = false }
}
</script>

<style scoped>
.login-container {
  width: 100vw; height: 100vh; display: flex;
  align-items: center; justify-content: center;
  position: fixed; inset: 0; z-index: 10; overflow: hidden;
}

/* 背景 */
.login-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0;
  animation: login-bg-zoom 25s ease-in-out infinite alternate; }
@keyframes login-bg-zoom { 0% { transform: scale(1); } 100% { transform: scale(1.06); } }

.login-bg-overlay { position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(20,15,10,0.4) 30%, rgba(0,0,0,0.5) 70%, rgba(10,5,0,0.6) 100%); }

/* 返回按钮 */
.btn-login-back {
  position: absolute; top: 24px; left: 24px; z-index: 20;
  display: inline-flex; align-items: center; gap: 6px;
  height: 38px; padding: 0 18px;
  background: rgba(230,210,185,0.15);
  border: 1px solid rgba(210,180,150,0.3);
  border-radius: 6px;
  color: rgba(255,250,240,0.85); font-size: 14px;
  font-family: inherit; cursor: pointer;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  transition: all 0.35s ease;
}
.btn-login-back:hover {
  background: rgba(230,210,185,0.25);
  border-color: rgba(210,180,150,0.5);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(120,80,40,0.2);
}

/* 卡片 */
.login-card {
  position: relative; z-index: 10;
  width: 420px; max-width: 90vw;
  background: rgba(40,28,15,0.3);
  backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(200,170,140,0.18);
  border-radius: 12px; padding: 44px 40px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(240,220,190,0.06);
  overflow: hidden;
}
.login-card-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(ellipse at 30% 20%, rgba(210,165,115,0.1) 0%, transparent 60%);
  pointer-events: none; }

/* 头部 */
.login-header { text-align: center; margin-bottom: 30px; position: relative; }
.login-logo { width: 56px; height: 56px; margin: 0 auto 14px;
  background: rgba(190,150,110,0.15); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(210,175,135,0.3); }
.login-title { margin: 0 0 6px; font-size: 21px; font-weight: 600; color: #fdf8f0; letter-spacing: 0.05em; }
.login-subtitle { margin: 0; font-size: 13px; color: rgba(230,210,180,0.5); letter-spacing: 0.06em; }

/* 表单 */
.login-form { display: flex; flex-direction: column; gap: 18px; position: relative; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; text-transform: uppercase; }

.field-input-wrapper {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 0 14px;
  transition: all 0.35s ease;
}
.field-input-wrapper:focus-within {
  border-color: rgba(200,160,120,0.5);
  background: rgba(240,220,195,0.1);
  box-shadow: 0 0 0 3px rgba(190,150,110,0.08);
}

.field-icon-svg { flex-shrink: 0; margin-right: 10px; color: rgba(220,200,170,0.4); transition: color 0.3s; }
.field-input-wrapper:focus-within .field-icon-svg { color: rgba(210,170,130,0.65); }

.field-input { flex: 1; background: transparent; border: none; padding: 13px 0;
  color: #fff; font-size: 15px; font-family: inherit; outline: none; letter-spacing: 0.02em; }
.field-input::placeholder { color: rgba(255,255,255,0.2); }

.field-toggle { background: none; border: none; cursor: pointer; padding: 4px; flex-shrink: 0; color: rgba(255,255,255,0.4);
  transition: color 0.3s; display: flex; align-items: center; }
.field-toggle:hover { color: rgba(255,255,255,0.7); }

/* 提示条 */
.login-error, .login-success { display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px; font-size: 13px; letter-spacing: 0.02em; }
.login-error { background: rgba(220,60,50,0.12); border: 1px solid rgba(220,60,50,0.25); color: #f8a098; }
.login-success { background: rgba(74,154,110,0.12); border: 1px solid rgba(74,154,110,0.25); color: #8ed4b0; }

/* 提交按钮 — 米黄暖调 */
.btn-submit {
  width: 100%; height: 50px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  border: none; border-radius: 6px;
  background: linear-gradient(180deg, #c8a078 0%, #b08858 50%, #9a7040 100%);
  color: #fdf8f0; font-size: 16px; font-weight: 600;
  cursor: pointer; letter-spacing: 0.1em;
  transition: all 0.35s ease;
  font-family: 'STKaiti','KaiTi','Noto Serif SC','SimSun',serif;
  margin-top: 4px; position: relative; overflow: hidden;
  box-shadow: 0 2px 12px rgba(120,80,40,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
}
.btn-submit::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}
.btn-submit:hover:not(:disabled)::after { transform: translateX(100%); }

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(180deg, #d4b088 0%, #c09868 50%, #aa7d50 100%);
  box-shadow: 0 8px 28px rgba(140,100,60,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  transform: translateY(-2px);
}
.btn-submit:active:not(:disabled) { transform: translateY(0); }
.btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }

.submit-spinner { width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 底部链接 */
.login-footer { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 22px; position: relative; }
.footer-link { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer;
  font-size: 13px; font-family: inherit; transition: color 0.3s; letter-spacing: 0.03em; padding: 4px 8px; }
.footer-link:hover { color: rgba(255,255,255,0.8); }
.footer-link--back { display: inline-flex; align-items: center; gap: 4px; }
.footer-divider { color: rgba(255,255,255,0.2); font-size: 12px; }

/* 版权 */
.login-copyright { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 20;
  color: rgba(255,255,255,0.25); font-size: 12px; letter-spacing: 0.05em; }

@media (max-width: 500px) {
  .login-card { padding: 32px 24px; border-radius: 16px; }
  .login-title { font-size: 19px; }
}
</style>
