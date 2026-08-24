<template>
  <svg viewBox="0 0 200 200" width="180" height="180">
    <circle cx="100" cy="100" :r="r" fill="none" stroke="#EAEEDF" :stroke-width="sw"/>
    <template v-for="(seg, i) in segments" :key="i">
      <circle
        cx="100" cy="100" :r="r" fill="none"
        :stroke="seg.color" :stroke-width="sw"
        :stroke-dasharray="`${seg.dashLen} ${circ - seg.dashLen}`"
        :stroke-dashoffset="-offsetAt(i)"
        :class="{ clickable: drillable && seg.clickable }"
        @click="drillable && seg.clickable && $emit('select', seg)"
        transform="rotate(-90 100 100)"
        style="transition: stroke-dasharray 1s ease"
      />
    </template>
    <text x="100" y="99" text-anchor="middle" font-family="Fraunces, serif" font-weight="700" font-size="22" fill="#1B3E27">{{ centerValue }}</text>
    <text x="100" y="115" text-anchor="middle" font-family="Work Sans, sans-serif" font-size="9.5" fill="#3E4C40">{{ centerLabel }}</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: Array<{ val: number; color: string; label: string; clickable?: boolean }>
  centerValue?: number | string
  centerLabel?: string
  drillable?: boolean
}>(), {
  centerValue: 0,
  centerLabel: '',
  drillable: false,
})

const emit = defineEmits<{ (e: 'select', seg: { label: string }): void }>()

const r = 72, sw = 26, circ = 2 * Math.PI * r

const total = computed(() => props.data.reduce((acc, d) => acc + d.val, 0))

const segments = computed(() =>
  props.data.map(d => ({
    ...d,
    dashLen: ((total.value > 0 ? (d.val / total.value) * 100 : 0) / 100) * circ
  }))
)

const offsets = computed(() => {
  let off = 0
  const denom = total.value > 0 ? total.value : 100
  return props.data.map(d => { const o = off; off += (d.val / denom) * circ; return o })
})

function offsetAt(i: number) { return offsets.value[i] }
</script>

<style scoped>
circle.clickable { cursor: pointer; }
circle.clickable:hover { opacity: 0.85; }
</style>
