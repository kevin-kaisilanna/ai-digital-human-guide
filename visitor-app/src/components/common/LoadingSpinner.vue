<template>
  <div class="spinner-wrap" v-if="visible">
    <div class="spinner"></div>
    <p v-if="text" class="spinner-text">{{ text }}</p>
  </div>
</template>
<script setup lang="ts">
defineProps({ visible: { type: Boolean, default: true }, text: { type: String, default: '' } })
</script>
<style scoped>
.spinner-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 0; gap: 12px; }
.spinner {
  width: 32px; height: 32px; border: 3px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite;
}
.spinner-text { margin: 0; font-size: 13px; color: var(--muted); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
