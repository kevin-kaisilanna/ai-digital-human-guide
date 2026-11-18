import { ref } from 'vue'
import { fetchConfig, saveConfig } from '@/services/digital-human-service'

export function useDigitalHuman() {
  const cfg = ref<any>(null)
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      cfg.value = await fetchConfig()
    } catch (e) {
      console.error('数字人配置加载失败', e)
    }
    loading.value = false
  }

  async function save(payload: any) {
    await saveConfig(payload)
    cfg.value = { ...cfg.value, ...payload }
  }

  // 初始化
  load()

  return { cfg, loading, load, save }
}
