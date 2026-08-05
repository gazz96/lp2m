<template>
  <div ref="el" class="reveal-block">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const el = ref<HTMLElement>()

onMounted(() => {
  const node = el.value
  if (!node) return

  // Fallback: kalau sudah di viewport saat mount → langsung tampil (hindari opacity:0 stuck).
  const reveal = () => {
    node.classList.add('reveal-in')
    observer?.unobserve(node)
  }

  let observer: IntersectionObserver | null = null
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) reveal()
      })
    }, { threshold: 0.05, rootMargin: '0px 0px 100px 0px' })
    observer.observe(node)
  } else {
    reveal() // browser tanpa IO → tampil langsung
  }

  // Safety: kalau observer tak pernah fire dalam 2.5s (mis. fetch selesai lambat), tampilkan.
  setTimeout(reveal, 2500)
})
</script>
