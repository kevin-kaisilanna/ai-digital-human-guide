<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="dialog-overlay" @click.self="$emit('close')">
        <div class="dialog-panel">
          <div class="dialog-header">
            <h3 class="dialog-title">{{ isResetMode ? '重置密码' : '添加管理员' }}</h3>
            <button class="dialog-close" @click="$emit('close')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- 添加模式 -->
          <form v-if="!isResetMode" class="dialog-body" @submit.prevent="handleAdd">
            <div class="form-field">
              <label class="field-label">用户名 <span class="required">*</span></label>
              <input v-model="form.username" type="text" class="field-input" placeholder="至少3位字符" required minlength="3" />
            </div>
            <div class="form-field">
              <label class="field-label">密码 <span class="required">*</span></label>
              <input v-model="form.password" type="password" class="field-input" placeholder="至少6位字符" required minlength="6" />
            </div>
            <div class="form-field">
              <label class="field-label">邮箱 <span class="required">*</span></label>
              <input v-model="form.email" type="email" class="field-input" placeholder="用于找回密码" required />
            </div>
            <div class="form-field">
              <label class="field-label">角色</label>
              <select v-model="form.role" class="field-select">
                <option value="管理员">管理员</option>
                <option value="超级管理员">超级管理员</option>
              </select>
            </div>

            <div v-if="errorMsg" class="form-error">{{ errorMsg }}</div>

            <div class="dialog-actions">
              <button type="button" class="btn-cancel" @click="$emit('close')">取消</button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                <span v-if="submitting" class="spinner"></span>
                <span v-else>确认添加</span>
              </button>
            </div>
          </form>

          <!-- 重置密码结果模式 -->
          <div v-else class="dialog-body">
            <div class="reset-info">
              <p>为 <strong>{{ resetUsername }}</strong> 重置密码：</p>
              <div v-if="newPassword" class="reset-result">
                <span class="reset-label">新密码</span>
                <code class="reset-pwd">{{ newPassword }}</code>
                <p class="reset-hint">请复制并妥善保管此密码，关闭后不再显示</p>
              </div>
              <div v-if="resetError" class="form-error">{{ resetError }}</div>
            </div>
            <div class="dialog-actions">
              <button type="button" class="btn-cancel" @click="$emit('close')">关闭</button>
              <button v-if="!newPassword" type="button" class="btn-submit" :disabled="resetting" @click="doReset">
                <span v-if="resetting" class="spinner"></span>
                <span v-else>确认重置</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { adminDb } from '@/services/admin-db'

const props = defineProps<{
  visible: boolean
  resetMode: boolean
  resetUsername: string
  resetEmail: string
}>()

const emit = defineEmits<{
  close: []
  done: []
}>()

const form = reactive({ username: '', password: '', email: '', role: '管理员' })
const submitting = ref(false)
const errorMsg = ref('')

const resetting = ref(false)
const newPassword = ref('')
const resetError = ref('')

const isResetMode = ref(false)

// 同步外部 resetMode
watch(() => props.visible, (v) => {
  if (v) {
    isResetMode.value = props.resetMode
    if (props.resetMode) {
      newPassword.value = ''
      resetError.value = ''
      resetting.value = false
    } else {
      form.username = ''
      form.password = ''
      form.email = ''
      form.role = '管理员'
      errorMsg.value = ''
      submitting.value = false
    }
  }
})

async function handleAdd() {
  errorMsg.value = ''
  if (!form.username.trim()) { errorMsg.value = '请输入用户名'; return }
  if (form.username.trim().length < 3) { errorMsg.value = '用户名至少3位字符'; return }
  if (!form.password) { errorMsg.value = '请输入密码'; return }
  if (form.password.length < 6) { errorMsg.value = '密码至少6位字符'; return }
  if (!form.email.trim()) { errorMsg.value = '请输入邮箱'; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { errorMsg.value = '邮箱格式不正确'; return }

  submitting.value = true
  try {
    const result = await adminDb.register(form.username.trim(), form.password, form.email.trim())
    if (result.success) {
      emit('done')
      emit('close')
    } else {
      errorMsg.value = result.message
    }
  } catch (e: any) {
    errorMsg.value = e.message || '添加失败，请重试'
  } finally {
    submitting.value = false
  }
}

async function doReset() {
  resetError.value = ''
  resetting.value = true
  try {
    const result = await adminDb.resetPassword(props.resetUsername, props.resetEmail || undefined)
    if (result.success && result.newPassword) {
      newPassword.value = result.newPassword
    } else {
      resetError.value = result.message
    }
  } catch (e: any) {
    resetError.value = e.message || '重置失败，请重试'
  } finally {
    resetting.value = false
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,.35);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.dialog-panel {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xl);
  width: 440px; max-width: 90vw; max-height: 85vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border-light);
}
.dialog-title { margin: 0; font-size: 16px; font-weight: 700; color: var(--text); }
.dialog-close {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border: none; background: none; cursor: pointer; border-radius: var(--radius-sm);
  color: var(--text-tertiary); transition: all var(--transition);
}
.dialog-close:hover { background: var(--surface-hover); color: var(--text); }

.dialog-body {
  padding: 22px;
  display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto;
}

.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: .02em; }
.required { color: var(--danger); }
.field-input, .field-select {
  width: 100%; padding: 10px 14px;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--surface); font-size: 14px; color: var(--text);
  font-family: inherit; outline: none; transition: border-color var(--transition);
  box-sizing: border-box;
}
.field-input:focus, .field-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(200,160,100,.08);
}
.field-input::placeholder { color: var(--text-tertiary); }

.field-select {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b7558' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.form-error {
  padding: 10px 14px; border-radius: var(--radius-sm);
  background: var(--danger-soft); border: 1px solid rgba(220,60,50,.15);
  color: var(--danger); font-size: 13px;
}

/* 重置结果 */
.reset-info { display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: var(--text); }
.reset-result {
  padding: 16px; background: var(--surface); border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); text-align: center;
}
.reset-label { display: block; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
.reset-pwd {
  display: block; font-size: 22px; font-weight: 700; color: var(--accent-gold);
  letter-spacing: .04em; padding: 8px 16px; background: rgba(200,160,100,.08);
  border-radius: var(--radius-sm); user-select: all; word-break: break-all;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}
.reset-hint { margin: 10px 0 0; font-size: 12px; color: var(--text-tertiary); }

/* 按钮 */
.dialog-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
.btn-cancel {
  padding: 9px 20px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); background: var(--surface);
  font-size: 13px; color: var(--text-secondary); cursor: pointer;
  font-family: inherit; transition: all var(--transition);
}
.btn-cancel:hover { background: var(--surface-hover); }
.btn-submit {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; border: 1px solid var(--accent);
  border-radius: var(--radius-sm); background: var(--accent);
  font-size: 13px; font-weight: 600; color: #fff; cursor: pointer;
  font-family: inherit; transition: all var(--transition);
}
.btn-submit:hover:not(:disabled) { opacity: .88; }
.btn-submit:disabled { opacity: .45; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transition */
.dialog-enter-active, .dialog-leave-active { transition: all .25s ease; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; }
.dialog-enter-from .dialog-panel, .dialog-leave-to .dialog-panel { transform: scale(.95); }
</style>
