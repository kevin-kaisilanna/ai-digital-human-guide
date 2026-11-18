import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles.css'

// 提前初始化账号数据库（异步，不阻塞应用启动）
import { adminDb } from '@/services/admin-db'
adminDb.ready().catch(() => {})

createApp(App).use(createPinia()).use(router).mount('#app')
