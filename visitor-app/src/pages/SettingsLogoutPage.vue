<template>
  <div class="settings-page">
    <div class="settings-top">
      <button class="back-btn" @click="$router.back()">
        <span class="back-arrow">&larr;</span>
        <span>返回</span>
      </button>
      <h2 class="settings-title">退出登录</h2>
    </div>

    <section class="card section-card">
      <div class="logout-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>
      <p class="logout-desc">确定要退出当前账号 <strong>{{ store.accountName }}</strong> 吗？</p>
      <p class="logout-hint">退出后需要重新输入账号密码才能登录。</p>

      <div class="logout-actions">
        <button class="btn btn--outline cancel-btn" @click="$router.back()">取消</button>
        <button class="btn confirm-btn" @click="handleLogout">确认退出</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user-store'

const store = useUserStore()
const router = useRouter()

function handleLogout() {
  store.doLogout()
  ElMessage({ message: '已退出登录', type: 'info', duration: 1500 })
  router.push('/login')
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

.section-card { padding: 32px 16px 24px; text-align: center; }

.logout-icon {
  width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 22px;
  background: var(--danger-soft); color: var(--danger);
  display: flex; align-items: center; justify-content: center;
}
.logout-desc { margin: 0 0 10px; font-size: 17px; color: var(--text); line-height: 1.6; }
.logout-hint { margin: 0 0 32px; font-size: 15px; color: var(--text-tertiary); }

.logout-actions { display: flex; gap: 14px; justify-content: center; }
.cancel-btn { min-width: 130px; padding: 14px 28px; font-size: 16px; }
.confirm-btn { min-width: 130px; padding: 14px 28px; font-size: 16px; background: var(--danger); color: #fff; border-radius: var(--radius); }
.confirm-btn:hover { background: #a84038; }
</style>
