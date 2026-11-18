import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './styles/styles.css'
import { initNative } from './services/native-init'

const app = createApp(App)
app.use(createPinia()).use(router).use(ElementPlus)
app.mount('#app')

// 原生平台初始化（Web 环境为 no-op）
initNative()
