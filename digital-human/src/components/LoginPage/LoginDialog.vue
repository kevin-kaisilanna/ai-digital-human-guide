<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/assets/static/js/useAuth.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const isLogin = ref(route.query.form !== 'register')

async function handleSubmit() {
  if (!username.value || !password.value) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  // 模拟登录
  login({ username: username.value, role: 'visitor' })
  ElMessage.success(isLogin.value ? '登录成功' : '注册成功')
  router.push('/portal')
}
</script>

<template>
  <div class="login-dialog">
    <div class="login-card">
      <h2>{{ isLogin ? '游客登录' : '游客注册' }}</h2>
      <el-input v-model="username" placeholder="用户名" size="large" style="margin-bottom: 16px" />
      <el-input v-model="password" placeholder="密码" type="password" size="large" style="margin-bottom: 20px" />
      <el-button type="primary" size="large" style="width: 100%" @click="handleSubmit">
        {{ isLogin ? '登录' : '注册' }}
      </el-button>
      <p class="toggle-link" @click="isLogin = !isLogin">
        {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-dialog {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh; background: linear-gradient(135deg, #1a3a2a, #2d5a3f);
}
.login-card {
  background: rgba(255,255,255,.95); border-radius: 16px;
  padding: 40px 32px; width: 360px; box-shadow: 0 8px 32px rgba(0,0,0,.2);
}
.login-card h2 { text-align: center; margin: 0 0 24px; color: #1a3a2a; }
.toggle-link { text-align: center; margin-top: 16px; color: #2d5a3f; cursor: pointer; font-size: 13px; }
.toggle-link:hover { text-decoration: underline; }
</style>
