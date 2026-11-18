<template>
  <div class="query-log-table">
    <DataTable :columns="columns" :rows="rows" idKey="id" :showActions="false">
      <template #cell-sentiment="{ value }">
        <BaseBadge :variant="sentimentBadge(value)">{{ sentimentLabel(value) }}</BaseBadge>
      </template>
      <template #cell-satisfaction="{ value }">
        <BaseBadge :variant="value >= 4 ? 'green' : value >= 3 ? 'amber' : 'red'">
          {{ value }}/5
        </BaseBadge>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from '@/components/common/DataTable.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'

defineProps<{
  rows: any[]
}>()

const columns = [
  { key: 'time', title: '时间', width: '160px' },
  { key: 'tourist_id', title: '游客ID', width: '120px' },
  { key: 'question', title: '问题' },
  { key: 'sentiment', title: '情感', width: '80px' },
  { key: 'satisfaction', title: '满意度', width: '80px' },
]

function sentimentLabel(s: string): string {
  const map: Record<string, string> = { positive: '正面', neutral: '中性', negative: '负面' }
  return map[s] ?? s
}

function sentimentBadge(s: string): string {
  const map: Record<string, string> = { positive: 'green', neutral: 'amber', negative: 'red' }
  return map[s] ?? 'blue'
}
</script>
