<template>
  <svg viewBox="0 0 200 200" width="180" height="180">
    <circle cx="100" cy="100" :r="r" fill="none" stroke="#EAEEDF" :stroke-width="sw"/>
    <template v-for="(seg, i) in segments" :key="i">
      <circle
        cx="100" cy="100" :r="r" fill="none"
        :stroke="seg.color" :stroke-width="sw"
        :stroke-dasharray="`${seg.dashLen} ${circ - seg.dashLen}`"
        :stroke-dashoffset="-offsetAt(i)"
        transform="rotate(-90 100 100)"
        style="transition: stroke-dasharray 1s ease"
      />
    </template>
    <text x="100" y="99" text-anchor="middle" font-family="Fraunces, serif" font-weight="700" font-size="22" fill="#1B3E27">148</text>
    <text x="100" y="115" text-anchor="middle" font-family="Work Sans, sans-serif" font-size="9.5" fill="#3E4C40">usulan 2025</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: Array<{ val: number; color: string; label: string }>
}>()

const r = 72, sw = 26, circ = 2 * Math.PI * r

const segments = computed(() =>
  props.data.map(d => ({
    ...d,
    dashLen: (d.val / 100) * circ
  }))
)

const offsets = computed(() => {
  let off = 0
  return props.data.map(d => { const o = off; off += (d.val / 100) * circ; return o })
})

function offsetAt(i: number) { return offsets.value[i] }
</script>
