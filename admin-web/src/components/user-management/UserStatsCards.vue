<template>
  <div class="um-stats">
    <div class="stat-card" style="--accent-color: var(--chart-1)">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">总用户数</span>
        <span class="stat-value">{{ stats.total.toLocaleString() }}</span>
      </div>
    </div>

    <div class="stat-card" style="--accent-color: var(--success)">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">活跃用户</span>
        <span class="stat-value">{{ stats.active.toLocaleString() }}</span>
      </div>
    </div>

    <div class="stat-card" style="--accent-color: var(--danger)">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">禁用用户</span>
        <span class="stat-value">{{ stats.disabled.toLocaleString() }}</span>
      </div>
    </div>

    <div class="stat-card" style="--accent-color: var(--chart-5)">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">总聊天会话</span>
        <span class="stat-value">{{ stats.totalChats.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserStats } from '@/services/user-management-service'

defineProps<{ stats: UserStats }>()
</script>

<style scoped>
.um-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-slow);
  cursor: default;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(200, 160, 100, 0.2);
}

.stat-icon {
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent-color) 12%, transparent);
  color: var(--accent-color);
  flex-shrink: 0;
}

.stat-body {
  display: flex; flex-direction: column;
  min-width: 0;
}
.stat-label {
  font-size: 12px; color: var(--text-secondary);
  letter-spacing: .03em; font-weight: 500;
  margin-bottom: 2px;
}
.stat-value {
  font-size: 28px; font-weight: 800;
  color: var(--text); letter-spacing: -.02em;
  line-height: 1.2;
}

@media (max-width: 900px) {
  .um-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .um-stats { grid-template-columns: 1fr; }
}
</style>
