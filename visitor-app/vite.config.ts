import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { authPlugin } from './vite-plugin-auth'
import { chatStoragePlugin } from './vite-plugin-chat-storage'

export default defineConfig({
  base: './',
  plugins: [vue(), authPlugin(), chatStoragePlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: {
    hmr: { overlay: true },
    port: 5173,
    proxy: {
      // 业务 API → FastAPI :8001（user 由 authPlugin 本地处理，不走代理）
      '^/api/(chat|routes|knowledge|analytics|reports|digital-human|ai|asr|auth|health|config|admin)': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      // Unity 数字人接口 → AvatarServer Django :8000
      '/chat': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  }
})
