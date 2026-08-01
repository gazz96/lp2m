<template>
  <svg viewBox="0 0 520 220" width="100%" height="220">
    <line :x1="padL" :y1="padT" :x2="padL" :y2="h - padB" stroke="#D8D3C0"/>
    <line :x1="padL" :y1="h - padB" :x2="w - 10" :y2="h - padB" stroke="#D8D3C0"/>
    <template v-for="yr in years" :key="yr">
      <rect :x="barX(yr, 0)" :y="barY(penelitian[yr])"
        :width="bw" :height="barH(penelitian[yr])"
        fill="#2A5F42" rx="1.5" ref="barsRef">
        <animate attributeName="height" from="0" :to="barH(penelitian[yr])" dur="0.9s" fill="freeze"/>
        <animate attributeName="y" :from="h - padB" :to="barY(penelitian[yr])" dur="0.9s" fill="freeze"/>
      </rect>
      <rect :x="barX(yr, 1)" :y="barY(pengabdian[yr])"
        :width="bw" :height="barH(pengabdian[yr])"
        fill="#C99A3B" rx="1.5">
        <animate attributeName="height" from="0" :to="barH(pengabdian[yr])" dur="0.9s" fill="freeze"/>
        <animate attributeName="y" :from="h - padB" :to="barY(pengabdian[yr])" dur="0.9s" fill="freeze"/>
      </rect>
      <text :x="barX(yr, 0) + bw" :y="h - 8" font-size="10" fill="#3E4C40"
        text-anchor="middle" font-family="IBM Plex Mono, monospace">{{ yr }}</text>
    </template>
  </svg>
</template>

<script setup lang="ts">
const w = 520, h = 220, padL = 30, padB = 26, padT = 10
const chartW = w - padL - 10, chartH = h - padB - padT
const maxVal = 100
const years = ['2022', '2023', '2024', '2025', '2026']
const penelitian: Record<string, number> = { '2022': 58, '2023': 66, '2024': 74, '2025': 85, '2026': 93 }
const pengabdian: Record<string, number> = { '2022': 34, '2023': 40, '2024': 47, '2025': 55, '2026': 63 }
const groupW = chartW / years.length
const bw = groupW * 0.28

function barX(yr: string, offset: number) {
  const i = years.indexOf(yr)
  return padL + i * groupW + groupW * 0.18 + offset * (bw + 6)
}
function barY(val: number) { return h - padB - barH(val) }
function barH(val: number) { return (val / maxVal) * chartH }
</script>
