<template>
  <span ref="el" class="cd-num">{{ days }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  deadline: string
}>()

const el = ref<HTMLElement>()
const days = ref<number>(0)

onMounted(() => {
  const dl = new Date(props.deadline)
  function update() {
    days.value = Math.max(0, Math.ceil((dl.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  }
  update()
})
</script>
