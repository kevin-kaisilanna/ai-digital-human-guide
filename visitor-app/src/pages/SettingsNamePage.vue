<template>
  <div class="settings-page">
    <div class="settings-top">
      <button class="back-btn" @click="$router.back()">
        <span class="back-arrow">&larr;</span>
        <span>返回</span>
      </button>
      <h2 class="settings-title">修改展示名称</h2>
    </div>

    <section class="card section-card">
      <p class="section-desc">此名称将显示在个人中心，不影响登录账号名 <strong>{{ store.accountName }}</strong>。</p>

      <div class="form-group">
        <label class="form-label">当前名称</label>
        <p class="current-val">{{ store.userName }}</p>
      </div>
      <div class="form-group">
        <label class="form-label">新名称</label>
        <input
          ref="nameInput"
          v-model="editName"
          class="form-input"
          type="text"
          placeholder="输入新昵称（1~20 个字符）"
          maxlength="20"
          :disabled="store.isUpdating"
          @keydown.enter="saveName"
        />
      </div>

      <p v-if="nameError" class="form-error">{{ nameError }}</p>

      <button class="btn btn--accent save-btn" :disabled="!canSave || store.isUpdating" @click="saveName">
        <span v-if="store.isUpdating" class="btn-spinner"></span>
        <span v-else>保存昵称</span>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user-store'

const store = useUserStore()
const editName = ref('')
const nameError = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  editName.value = store.userName
  nextTick(() => nameInput.value?.focus())
})

const canSave = computed(() => {
  const name = editName.value.trim()
  return name && name.length >= 1 && name !== store.userName
})

async function saveName() {
  nameError.value = ''
  const name = editName.value.trim()
  if (!name) { nameError.value = '昵称不能为空'; return }
  const ok = await store.doUpdateDisplayName(name)
  if (ok) { ElMessage({ message: '昵称已更新', type: 'success', duration: 1500 }); editName.value = store.userName }
  else { nameError.value = store.loginError }
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
.current-val { margin: 0; font-size: 17px; font-weight: 600; color: var(--text); }
.form-error { margin: 12px 0 6px; font-size: 14px; color: var(--danger); padding: 8px 12px; background: var(--danger-soft); border-radius: var(--radius-sm); }

.form-input { padding: 12px 16px; font-size: 16px; }
.save-btn { width: 100%; margin-top: 12px; padding: 14px; font-size: 16px; border-radius: var(--radius); }

.btn-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
