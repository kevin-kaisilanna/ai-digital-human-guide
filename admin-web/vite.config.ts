import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { userManagementPlugin } from './vite-plugin-user-management'

export default defineConfig({
  plugins: [vue(), userManagementPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    hmr: { overlay: true },
    proxy: {
      // 用户管理 API → FastAPI :8001（后端运行时优先）
      '^/api/admin': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
    },
  }
})
