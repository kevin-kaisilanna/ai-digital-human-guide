<template>
  <div class="settings-page">
    <div class="settings-top">
      <button class="back-btn" @click="$router.push('/profile')">
        <span class="back-arrow">&larr;</span>
        <span>返回</span>
      </button>
      <h2 class="settings-title">账号设置</h2>
    </div>

    <div class="settings-group">
      <button class="settings-btn" @click="$router.push('/settings/name')">
        <span class="btn-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </span>
        <span class="btn-text">修改展示名称</span>
        <span class="btn-sub">当前: {{ store.userName }}</span>
        <span class="btn-arrow">&rsaquo;</span>
      </button>

      <button class="settings-btn" @click="$router.push('/settings/password')">
        <span class="btn-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        <span class="btn-text">修改登录密码</span>
        <span class="btn-sub">定期更换更安全</span>
        <span class="btn-arrow">&rsaquo;</span>
      </button>
    </div>

    <div class="settings-group">
      <button class="settings-btn" @click="$router.push('/settings/logout')">
        <span class="btn-icon btn-icon--danger">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </span>
        <span class="btn-text">退出登录</span>
        <span class="btn-sub">切换到其他账号</span>
        <span class="btn-arrow">&rsaquo;</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user-store'
const store = useUserStore()
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

/* ── 卡片分组 ── */
.settings-group {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(6px);
  margin-bottom: 14px;
}

/* ── 按键 ── */
.settings-btn {
  display: flex; align-items: center; gap: 16px;
  width: 100%; padding: 18px 18px;
  border: none; border-radius: 0;
  border-bottom: 1px solid var(--border-light);
  background: transparent; cursor: pointer; font-family: inherit;
  text-align: left; transition: all var(--transition);
}
.settings-btn:last-child { border-bottom: none; }
.settings-btn:hover { background: var(--surface-hover); }
.settings-btn:active { background: var(--primary-soft); }

.btn-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: var(--primary-soft); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
}
.btn-icon svg { width: 22px; height: 22px; }
.btn-icon--danger { background: var(--danger-soft); color: var(--danger); }
.btn-text { font-size: 16px; font-weight: 600; color: var(--text); }
.btn-sub { flex: 1; font-size: 13px; color: var(--text-tertiary); text-align: right; }
.btn-arrow { font-size: 24px; color: var(--muted); flex-shrink: 0; font-weight: 300; }
</style>
