<template>
  <button
    :class="['base-btn', `btn--${variant}`, `btn--${size}`]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String as () => 'primary' | 'outline' | 'danger' | 'ghost' | 'accent',
    default: 'primary',
  },
  size: {
    type: String as () => 'sm' | 'md' | 'lg',
    default: 'md',
  },
  disabled: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  font-family: inherit;
}
.base-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Sizes */
.btn--sm { padding: 5px 10px; font-size: 12px; }
.btn--md { padding: 8px 16px; font-size: 14px; }
.btn--lg { padding: 12px 24px; font-size: 15px; }

/* Variants */
.btn--primary { background: var(--primary); color: #fff; }
.btn--primary:hover:not(:disabled) { background: var(--primary-hover); }

.btn--outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}
.btn--outline:hover:not(:disabled) { background: var(--surface-hover); }

.btn--danger { background: var(--danger); color: #fff; }
.btn--danger:hover:not(:disabled) { background: #e05555; }

.btn--ghost {
  background: transparent;
  color: var(--muted);
}
.btn--ghost:hover:not(:disabled) { color: var(--text); background: var(--surface-hover); }

.btn--accent {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #021a1a;
  font-weight: 600;
}
.btn--accent:hover:not(:disabled) { filter: brightness(1.1); }
</style>
