<template>
  <span ref="el" class="cd-num">{{ days }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  deadline: string
}>()

const el = ref<HTMLElement>()
const days = ref<number>(0)

function update() {
  const dl = new Date(props.deadline)
  if (Number.isNaN(dl.getTime())) {
    days.value = 0
    return
  }
  days.value = Math.max(0, Math.ceil((dl.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}

onMounted(update)
watch(() => props.deadline, update)
</script>
