<template>
  <div class="knowledge-page">
    <section class="page-hero">
      <div>
        <h1 class="hero-title">知识库管理</h1>
        <p class="hero-sub">管理 AI 导游知识条目 · 确保游客问答精准可靠 · 共 <strong>{{ list.length }}</strong> 条<span v-if="lastUpdated" class="k-updated"> · 更新于 {{ lastUpdated }}</span></p>
      </div>
      <div class="hero-stats">
        <div class="hs-item" v-for="cat in categories" :key="cat.key">
          <span class="hs-dot" :style="{background: catColor(cat.key)}"></span>
          <span class="hs-val">{{ cat.count }}</span>
          <span class="hs-lbl">{{ cat.title }}</span>
        </div>
      </div>
    </section>
    <div class="k-body">
      <aside class="k-side">
        <div class="card tree-card">
          <KnowledgeTree :categories="categories" @select="onSelect" />
        </div>
      </aside>
      <div class="k-main">
        <div class="toolbar">
          <SearchInput v-model="q" placeholder="搜索知识…" @search="onSearch" @clear="q = ''" />
          <div class="t-actions">
            <UploadButton @uploaded="onUpload" />
            <button class="btn btn--accent" @click="openEditor">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新建
            </button>
          </div>
        </div>
        <div class="card table-card">
          <div v-if="loading" class="loading-state">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width:80%"></div>
            <div class="skeleton skeleton-text" style="width:60%"></div>
          </div>
          <KnowledgeTable v-else :entries="filtered" @edit="onEdit" @delete="onDelete" />
        </div>
        <KnowledgeEditor
          v-model:visible="editorVis"
          :entry="editing"
          @save="onSave"
          @cancel="editing = null"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import KnowledgeTree from '@/components/knowledge/KnowledgeTree.vue'
import KnowledgeTable from '@/components/knowledge/KnowledgeTable.vue'
import KnowledgeEditor from '@/components/knowledge/KnowledgeEditor.vue'
import UploadButton from '@/components/knowledge/UploadButton.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import { useKnowledge } from '@/composables/useKnowledge'
import { uploadKnowledgeFile } from '@/services/knowledge-service'

const { list, loading, load: reloadKnowledge, create: createEntry, update: updateEntry, remove: removeEntry } = useKnowledge()

const lastUpdated = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // 初始加载后更新时间戳
  const origLoad = reloadKnowledge
  lastUpdated.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  // 每 30 秒自动刷新知识库
  pollTimer = setInterval(async () => {
    await reloadKnowledge()
    lastUpdated.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, 30_000)
})
onBeforeUnmount(() => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } })

const categoryLabels: Record<string, string> = {
  history: '历史文化',
  spots: '景点介绍',
  facility: '设施服务',
  events: '活动资讯',
  faq: '常见问答',
  guide: '游览指南',
  routes: '路线推荐',
}

const categoryColors: Record<string, string> = {
  history: '#5a9ab8',
  spots: '#4a9a6e',
  facility: '#d49830',
  events: '#9a6ab0',
  faq: '#c06840',
  guide: '#4f6ef6',
  routes: '#3a8a5e',
}

function catColor(key: string): string {
  return categoryColors[key] || '#8b7558'
}

const categories = computed(() => {
  const counts: Record<string, number> = {}
  for (const entry of list.value) {
    const cat = entry.category || 'unknown'
    counts[cat] = (counts[cat] || 0) + 1
  }
  return Object.entries(categoryLabels).map(([key, title]) => ({
    key,
    title,
    count: counts[key] || 0,
  }))
})

const q = ref('')
const activeCat = ref('')

const filtered = computed(() => {
  let items = list.value
  if (activeCat.value) {
    items = items.filter((e: any) => e.category === activeCat.value)
  }
  if (q.value.trim()) {
    const s = q.value.toLowerCase()
    items = items.filter(
      (e: any) =>
        e.title?.toLowerCase().includes(s) ||
        e.content?.toLowerCase().includes(s),
    )
  }
  return items
})

function onSelect(key: string) {
  activeCat.value = activeCat.value === key ? '' : key
}
function onSearch() {}

const editorVis = ref(false)
const editing = ref<any>(null)

function openEditor() {
  editing.value = {}
  editorVis.value = true
}

function onEdit(row: any) {
  editing.value = { ...row }
  editorVis.value = true
}

async function onSave(payload: any) {
  if (payload.id) {
    await updateEntry(payload.id, payload)
  } else {
    await createEntry(payload)
  }
  editorVis.value = false
  editing.value = null
}

async function onDelete(row: any) {
  if (!confirm(`确定删除「${row.title}」？`)) return
  await removeEntry(row.id)
}

async function onUpload(file: File) {
  try {
    const result = await uploadKnowledgeFile(file)
    alert(result.message || '文件已导入知识库')
    await reloadKnowledge()
    lastUpdated.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch (e: any) {
    alert('导入失败：' + (e.message || '未知错误'))
  }
}
</script>

<style scoped>
.knowledge-page { padding: 4px 0 40px; }
.k-updated { color: var(--text-tertiary); font-size: 11px; margin-left: 8px; }

/* Hero 统计 */
.hero-stats { display: flex; gap: 16px; flex-wrap: wrap; }
.hs-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.hs-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.hs-val { font-weight: 700; color: var(--text); min-width: 18px; text-align: center; }
.hs-lbl { color: var(--text-tertiary); }

/* 布局 */
.k-body { display: flex; gap: 20px; align-items: flex-start; }
.k-side { width: 220px; flex-shrink: 0; }
.tree-card { padding: 14px; }
.k-main { flex: 1; min-width: 0; }

/* 工具栏 */
.toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px; flex-wrap: wrap; gap: 10px;
}
.t-actions { display: flex; gap: 8px; align-items: center; }
.table-card { padding: 14px; }

/* 加载 */
.loading-state { padding: 20px; }
.loading-state .skeleton { margin-bottom: 12px; }

@media (max-width: 900px) {
  .k-body { flex-direction: column; }
  .k-side { width: 100%; }
}
</style>
