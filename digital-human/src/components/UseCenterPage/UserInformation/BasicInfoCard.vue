<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/assets/static/js/useAuth.js'

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()

const displayName = computed(() => user.value?.username || '游客')
const roleLabel = computed(() => user.value?.role === 'admin' ? '管理员' : '游客')

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="avatar">👤</div>
      <h2>{{ displayName }}</h2>
      <p class="role">{{ roleLabel }}</p>
      <p class="status">{{ isAuthenticated ? '已登录' : '未登录' }}</p>

      <div class="menu-list">
        <div class="menu-item" @click="router.push('/routes')">
          <span>🗺️</span><span>游览路线推荐</span><span>›</span>
        </div>
        <div class="menu-item" @click="router.push('/portal')">
          <span>🏠</span><span>返回主页</span><span>›</span>
        </div>
      </div>

      <el-button type="danger" style="width: 100%; margin-top: 20px" @click="handleLogout">
        退出登录
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; background: linear-gradient(135deg, #1a3a2a, #2d5a3f); padding: 20px;
}
.profile-card {
  background: rgba(255,255,255,.95); border-radius: 16px;
  padding: 32px 24px; width: 360px; text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,.2);
}
.avatar { font-size: 56px; margin-bottom: 12px; }
h2 { margin: 0 0 4px; }
.role { color: #2d5a3f; font-size: 13px; margin: 0 0 2px; }
.status { color: #999; font-size: 12px; margin: 0 0 20px; }
.menu-list { text-align: left; }
.menu-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 0; border-bottom: 1px solid #eee;
  cursor: pointer; font-size: 15px;
}
.menu-item:hover { color: #2d5a3f; }
.menu-item span:last-child { margin-left: auto; color: #ccc; }
</style>
