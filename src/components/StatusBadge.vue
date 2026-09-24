<template>
  <span class="badge" :style="style">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { statusBadgeStyle } from '@/utils/status'

const props = withDefaults(defineProps<{
  /** Nilai status mentah, mis. `approved`, `revision_submitted`. */
  status?: string
  /** Teks badge; bila kosong → `status` di-uppercase (fallback `submitted`). */
  text?: string
}>(), {
  status: '',
})

const label = computed(() => props.text ?? (props.status || 'submitted').toUpperCase())
const style = computed(() => statusBadgeStyle(props.status))
</script>
