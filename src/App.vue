<template>
  <router-view />
  <div class="toast-container" v-if="toasts.length">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type" @click="remove(t.id)">
      <span class="toast-icon">{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ' }}</span>
      {{ t.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
const { toasts, remove } = useToast()
</script>

<style>
.toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; max-width: 380px; }
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 8px; font-size: 0.86rem; color: #fff; cursor: pointer; animation: toastIn 0.25s ease; box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
.toast.success { background: #2e7d32; }
.toast.error { background: #c62828; }
.toast.info { background: #1565c0; }
.toast-icon { font-weight: 700; font-size: 1rem; width: 20px; text-align: center; }
@keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
</style>
