<template>
  <select class="components-select-control__input" :value="modelValue" @change="$emit('update:modelValue', Number(($event.target as HTMLSelectElement).value) || 0)">
    <option value="0">— Tanpa induk —</option>
    <option v-for="p in parents" :key="p.id" :value="p.id">{{ p.name }}</option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  terms: Array<{ id: number; name: string; parent?: number }>
  excludeId?: number
}>()

defineEmits<{ 'update:modelValue': [v: number] }>()

// Hanya term yang bukan anak (tidak punya parent) boleh jadi induk,
// dan jangan tampilkan dirinya sendiri.
const parents = computed(() =>
  props.terms.filter(t => t.id !== props.excludeId && !(t.parent && t.parent > 0))
)
</script>
