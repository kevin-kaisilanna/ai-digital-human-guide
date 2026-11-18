<template>
  <div>
    <DataTable :columns="columns" :rows="entries" idKey="id">
      <template #cell-category="{ value }">
        <BaseBadge :variant="categoryBadge(value)">{{ categoryLabel(value) }}</BaseBadge>
      </template>
      <template #actions="{ row }">
        <button class="btn btn--ghost btn--sm" @click="$emit('edit', row)">编辑</button>
        <button class="btn btn--ghost btn--sm" style="color:var(--danger)" @click="$emit('delete', row)">删除</button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from '@/components/common/DataTable.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'

defineProps<{
  entries: any[]
}>()

defineEmits<{
  edit: [row: any]
  delete: [row: any]
}>()

const columns = [
  { key: 'title', title: '标题', width: '180px' },
  { key: 'excerpt', title: '摘要', width: '320px' },
  { key: 'category', title: '分类', width: '90px' },
  { key: 'source', title: '来源', width: '140px' },
  { key: 'updated_at', title: '更新时间', width: '110px' },
]

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    history: '历史文化', spots: '景点介绍', facility: '设施服务',
    events: '活动资讯', faq: '常见问答',
  }
  return map[cat] ?? cat
}

function categoryBadge(cat: string): string {
  const map: Record<string, string> = {
    history: 'blue', spots: 'green', facility: 'amber', events: 'purple', faq: 'red',
  }
  return map[cat] ?? 'blue'
}
</script>
