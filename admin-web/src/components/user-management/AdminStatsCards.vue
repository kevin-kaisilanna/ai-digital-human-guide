<template>
  <div class="am-stats">
    <div class="stat-card" style="--accent-color: var(--chart-1)">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">管理员总数</span>
        <span class="stat-value">{{ stats.total.toLocaleString() }}</span>
      </div>
    </div>

    <div class="stat-card" style="--accent-color: var(--accent-gold)">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">超级管理员</span>
        <span class="stat-value">{{ stats.superAdminCount.toLocaleString() }}</span>
      </div>
    </div>

    <div class="stat-card" style="--accent-color: var(--text-secondary)">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-label">普通管理员</span>
        <span class="stat-value">{{ stats.adminCount.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: { total: number; superAdminCount: number; adminCount: number }
}>()
</script>

<style scoped>
.am-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  .am-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .am-stats { grid-template-columns: 1fr; }
}
</style>
