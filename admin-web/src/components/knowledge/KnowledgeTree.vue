<template>
  <div class="tree">
    <div class="tree-header">
      <h4>知识分类</h4>
    </div>
    <ul class="tree-list">
      <li v-for="cat in categories" :key="cat.key">
        <div class="tree-item" :class="{ active: activeKey === cat.key }">
          <button
            class="tree-toggle"
            v-if="cat.children && cat.children.length"
            @click="toggle(cat.key)"
          >
            {{ expanded.has(cat.key) ? '▾' : '▸' }}
          </button>
          <span v-else class="tree-toggle placeholder"></span>
          <button class="tree-btn" @click="select(cat.key)">
            <span class="tree-label">{{ cat.title }}</span>
            <span class="tree-count">{{ cat.count }}</span>
          </button>
        </div>
        <!-- 子分类 -->
        <ul v-if="cat.children && expanded.has(cat.key)" class="tree-children">
          <li v-for="child in cat.children" :key="child.key">
            <div class="tree-item sub" :class="{ active: activeKey === child.key }">
              <span class="tree-toggle placeholder"></span>
              <button class="tree-btn" @click="select(child.key)">
                <span class="tree-label">{{ child.title }}</span>
                <span class="tree-count">{{ child.count }}</span>
              </button>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface Category {
  key: string
  title: string
  count: number
  children?: Category[]
}

defineProps<{
  categories: Category[]
}>()

const emit = defineEmits<{
  select: [key: string]
}>()

const activeKey = ref('')
const expanded = ref(new Set<string>())

function toggle(key: string) {
  if (expanded.value.has(key)) {
    expanded.value.delete(key)
  } else {
    expanded.value.add(key)
  }
}

function select(key: string) {
  activeKey.value = key
  emit('select', key)
}
</script>

<style scoped>
.tree {
  padding: 4px 0;
}
.tree-header {
  margin-bottom: 10px;
}
.tree-header h4 {
  margin: 0;
  font-size: 14px;
  color: var(--text);
}
.tree-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tree-item {
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: var(--radius-sm);
  transition: background var(--transition);
}
.tree-item:hover { background: var(--surface-hover); }
.tree-item.active { background: rgba(79, 110, 246, 0.12); }
.tree-item.sub { padding-left: 12px; }

.tree-toggle {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 11px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}
.tree-toggle.placeholder { width: 18px; flex-shrink: 0; }

.tree-btn {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  color: var(--muted);
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: inherit;
}
.tree-item.active .tree-btn { color: var(--text); font-weight: 500; }
.tree-label { flex: 1; }
.tree-count {
  font-size: 11px;
  color: var(--text-tertiary);
  background: rgba(255,255,255,0.04);
  padding: 2px 7px;
  border-radius: var(--radius-full);
  min-width: 22px;
  text-align: center;
}
.tree-children {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
