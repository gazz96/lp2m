<template>
  <span ref="el">{{ display }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  target: number
  decimals?: number
  suffix?: string
  duration?: number
}>(), {
  decimals: 0,
  suffix: '',
  duration: 1400
})

const el = ref<HTMLElement>()
const display = ref('0')

watch(() => props.target, () => animate(), { immediate: true })

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate()
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.4 })

  if (el.value) observer.observe(el.value)
})

function animate() {
  const start = performance.now()
  function tick(now: number) {
    const p = Math.min((now - start) / props.duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    const val = props.target * eased
    display.value = (props.decimals ? val.toFixed(props.decimals) : Math.round(val).toString()) + props.suffix
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
</script>
