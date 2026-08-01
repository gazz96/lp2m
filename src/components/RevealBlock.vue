<template>
  <div ref="el" class="reveal-block">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const el = ref<HTMLElement>()

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in')
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.15 })

  if (el.value) observer.observe(el.value)
})
</script>
