<template>
  <svg viewBox="0 0 520 220" width="100%" height="220">
    <line :x1="padL" :y1="padT" :x2="padL" :y2="h - padB" stroke="#D8D3C0"/>
    <line :x1="padL" :y1="h - padB" :x2="w - 10" :y2="h - padB" stroke="#D8D3C0"/>
    <template v-if="items.length">
      <template v-for="(item, i) in items" :key="item.label">
        <rect :x="barX(i)" :y="barY(item.count)"
          :width="bw" :height="barH(item.count)"
          :fill="barColor(item, i)" rx="1.5">
          <title>{{ item.label }}</title>
          <animate attributeName="height" from="0" :to="barH(item.count)" dur="0.9s" fill="freeze"/>
          <animate attributeName="y" :from="h - padB" :to="barY(item.count)" dur="0.9s" fill="freeze"/>
        </rect>
        <text :x="barX(i) + bw / 2" :y="h - 8" font-size="9" fill="#3E4C40"
          text-anchor="middle" font-family="IBM Plex Mono, monospace">{{ shortLabel(item.label) }}</text>
      </template>
    </template>
    <template v-else>
      <!-- fallback: data lama (penelitian/pengabdian per tahun) -->
      <template v-for="yr in legacyYears" :key="yr">
        <rect :x="barX(legacyYears.indexOf(yr), 0)" :y="barY(penelitian[yr])"
          :width="bw" :height="barH(penelitian[yr])"
          fill="#2A5F42" rx="1.5">
          <animate attributeName="height" from="0" :to="barH(penelitian[yr])" dur="0.9s" fill="freeze"/>
          <animate attributeName="y" :from="h - padB" :to="barY(penelitian[yr])" dur="0.9s" fill="freeze"/>
        </rect>
        <rect :x="barX(legacyYears.indexOf(yr), 1)" :y="barY(pengabdian[yr])"
          :width="bw" :height="barH(pengabdian[yr])"
          fill="#C99A3B" rx="1.5">
          <animate attributeName="height" from="0" :to="barH(pengabdian[yr])" dur="0.9s" fill="freeze"/>
          <animate attributeName="y" :from="h - padB" :to="barY(pengabdian[yr])" dur="0.9s" fill="freeze"/>
        </rect>
        <text :x="barX(legacyYears.indexOf(yr), 0) + bw" :y="h - 8" font-size="10" fill="#3E4C40"
          text-anchor="middle" font-family="IBM Plex Mono, monospace">{{ yr }}</text>
      </template>
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface BarItem {
  label: string
  count: number
  color?: string
}

const props = withDefaults(defineProps<{
  data?: BarItem[]
  maxVal?: number
}>(), {
  data: undefined,
  maxVal: 0,
})

const w = 520, h = 220, padL = 30, padB = 26, padT = 10
const chartW = w - padL - 10, chartH = h - padB - padT

// Data-driven (single series) kalau props.data ada.
const items = computed<BarItem[]>(() => props.data?.filter(d => d.count > 0) || [])

// Fallback legacy (tanpa props).
const legacyYears = ['2022', '2023', '2024', '2025', '2026']
const penelitian: Record<string, number> = { '2022': 58, '2023': 66, '2024': 74, '2025': 85, '2026': 93 }
const pengabdian: Record<string, number> = { '2022': 34, '2023': 40, '2024': 47, '2025': 55, '2026': 63 }

const maxVal = computed(() => {
  if (props.maxVal > 0) return props.maxVal
  const vals = props.data ? items.value.map(i => i.count) : [...Object.values(penelitian), ...Object.values(pengabdian)]
  const m = Math.max(0, ...vals)
  return m <= 0 ? 1 : m
})

// Jika data-driven → bar per item; legacy → grouped 2 bars per year.
const groupW = chartW / (items.value.length || legacyYears.length)
const bw = Math.max(10, groupW * (items.value.length ? 0.55 : 0.28))

// Palet warna yang kontras, diputar per index agar tiap bar beda warna.
const PALETTE = ['#2A5F42', '#C99A3B', '#4C6B8A', '#9B4224', '#7A4C9B', '#3B7A57', '#B0542F', '#1F4D36', '#8A6D3B', '#5B7C9E', '#A23B3B', '#2F6B4F', '#6B4F2A', '#43676B', '#8C4A6E', '#556B2F', '#B8860B']

function barColor(item: BarItem, i: number): string {
  return item.color || PALETTE[i % PALETTE.length]
}

// Label SDGs seperti "1 No Poverty" / "SDG 1 No Poverty" → "SDG 1";
// lainnya dipakai apa adanya.
function shortLabel(label: string): string {
  const m = label.match(/(?:^|\s)(?:SDG\s*)?(\d{1,2})\b/i)
  return m && /sdg|^\d{1,2}\s/i.test(label) ? `SDG ${m[1]}` : label
}

function barX(i: number, offset = 0) {
  if (items.value.length) {
    return padL + i * groupW + (groupW - bw) / 2
  }
  return padL + i * groupW + groupW * 0.18 + offset * (bw + 6)
}
function barY(val: number) { return h - padB - barH(val) }
function barH(val: number) { return (val / maxVal.value) * chartH }
</script>
