<template>
  <div class="settings-page">
    <div class="settings-top">
      <button class="back-btn" @click="$router.back()">
        <span class="back-arrow">&larr;</span>
        <span>返回</span>
      </button>
      <h2 class="settings-title">修改登录密码</h2>
    </div>

    <section class="card section-card">
      <p class="section-desc">为保障账号安全，建议使用字母、数字组合的密码（至少 4 位）。</p>

      <div class="form-group">
        <label class="form-label">旧密码</label>
        <input v-model="form.oldPwd" class="form-input" type="password" placeholder="输入当前密码" :disabled="store.isUpdating" />
      </div>
      <div class="form-group">
        <label class="form-label">新密码</label>
        <input
          v-model="form.newPwd"
          class="form-input"
          :class="{ 'input-error': newPwdError }"
          type="password"
          placeholder="至少 4 位，建议字母+数字"
          :disabled="store.isUpdating"
          @input="onNewPwdInput"
        />
        <!-- 密码强度指示条 -->
        <div v-if="form.newPwd" class="strength-bar-wrap">
          <div class="strength-segments">
            <span v-for="i in 4" :key="i" class="strength-seg" :class="segClass(i)"></span>
          </div>
          <span class="strength-label" :class="'strength-' + pwdStrength.level">{{ pwdStrength.label }}</span>
        </div>
        <span v-if="newPwdError" class="form-hint form-hint--warn">{{ newPwdError }}</span>
      </div>
      <div class="form-group">
        <label class="form-label">确认新密码</label>
        <input v-model="form.confirmPwd" class="form-input" :class="{ 'input-error': confirmPwdError }" type="password" placeholder="再次输入新密码" :disabled="store.isUpdating" />
        <span v-if="confirmPwdError" class="form-hint form-hint--warn">{{ confirmPwdError }}</span>
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>

      <button class="btn btn--accent save-btn" :disabled="!canSave || store.isUpdating" @click="savePwd">
        <span v-if="store.isUpdating" class="btn-spinner"></span>
        <span v-else>修改密码</span>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user-store'
import { validatePassword, getPasswordStrength } from '@/services/validators'
import type { StrengthResult } from '@/services/validators'

const store = useUserStore()
const form = reactive({ oldPwd: '', newPwd: '', confirmPwd: '' })
const error = ref('')
const newPwdError = ref('')
const confirmPwdError = ref('')
const pwdStrength = ref<StrengthResult>({ level: 'empty', score: 0, label: '—', message: '' })

function onNewPwdInput() {
  pwdStrength.value = getPasswordStrength(form.newPwd)
  if (form.newPwd) {
    const result = validatePassword(form.newPwd)
    newPwdError.value = result.message
  } else {
    newPwdError.value = ''
  }
  // 同步更新确认密码
  if (form.confirmPwd && form.newPwd !== form.confirmPwd) {
    confirmPwdError.value = '两次输入的密码不一致'
  } else if (form.confirmPwd) {
    confirmPwdError.value = ''
  }
}

function segClass(i: number) {
  if (pwdStrength.value.score >= i) {
    const level = pwdStrength.value.level
    if (level === 'weak') return 'seg-weak'
    if (level === 'fair') return 'seg-fair'
    if (level === 'good') return 'seg-good'
    return 'seg-strong'
  }
  return ''
}

const canSave = computed(() => {
  if (!form.oldPwd) return false
  const pwResult = validatePassword(form.newPwd)
  return pwResult.valid && form.newPwd === form.confirmPwd
})

async function savePwd() {
  error.value = ''
  newPwdError.value = ''
  confirmPwdError.value = ''

  if (!canSave.value) return
  if (form.newPwd === form.oldPwd) { error.value = '新密码不能与旧密码相同'; return }

  const ok = await store.doChangePassword(form.oldPwd, form.newPwd)
  if (ok) {
    form.oldPwd = ''; form.newPwd = ''; form.confirmPwd = ''
    pwdStrength.value = { level: 'empty', score: 0, label: '—', message: '' }
    ElMessage({ message: '密码已修改，请妥善保管', type: 'success', duration: 2000 })
  } else {
    error.value = store.loginError
  }
}
</script>

<style scoped>
.settings-page { padding: 16px; flex: 1; min-height: 0; overflow-y: auto; }
.settings-top { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.back-btn {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; font-size: 16px; font-weight: 600;
  color: var(--muted); cursor: pointer; font-family: inherit; padding: 8px 12px;
  border-radius: var(--radius-sm); transition: all var(--transition);
}
.back-btn:hover { color: var(--text); background: var(--surface-hover); }
.back-arrow { font-size: 20px; }
.settings-title { margin: 0; font-size: 22px; font-weight: 800; }

.section-card { padding: 16px; }
.section-desc { margin: 0 0 20px; font-size: 15px; color: var(--text-tertiary); line-height: 1.7; }

.form-group { margin-bottom: 18px; }
.form-label { display: block; margin-bottom: 8px; font-size: 15px; font-weight: 600; color: var(--text-secondary); }
.form-error { margin: 12px 0 6px; font-size: 14px; color: var(--danger); padding: 8px 12px; background: var(--danger-soft); border-radius: var(--radius-sm); }
.form-hint { margin: 6px 0 0; font-size: 12px; color: var(--text-tertiary); }
.form-hint--warn { color: var(--warning); }
.input-error { border-color: var(--danger) !important; }

.form-input { padding: 12px 16px; font-size: 16px; }
.save-btn { width: 100%; margin-top: 12px; padding: 14px; font-size: 16px; border-radius: var(--radius); }

/* 密码强度 */
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

.btn-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
