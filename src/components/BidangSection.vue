<template>
  <section class="bidang-section" id="bidang">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow bidang-eyebrow">{{ d?.label || BIDANG.eyebrow }}</div>
          <h2>{{ d?.title || BIDANG.title }}</h2>
        </div>
        <p class="desc bidang-desc">{{ d?.desc || BIDANG.desc }}</p>
      </RevealBlock>

      <SkeletonBlock v-if="status === 'loading'" variant="card" :count="4" />
      <SkeletonBlock v-else-if="status === 'error'" variant="text" :count="2" />

      <RevealBlock v-else class="bidang-grid">
        <div v-for="item in items" :key="item.title" class="bidang-card">
          <div class="ico" v-html="iconSvg(item.icon)"></div>
          <h4>{{ item.title }}</h4>
          <p>{{ item.desc }}</p>
        </div>
      </RevealBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { BIDANG } from '@/data'
import { useSectionData } from '@/composables/useSectionData'
import RevealBlock from './RevealBlock.vue'
import SkeletonBlock from './SkeletonBlock.vue'

const { data: d, status, load } = useSectionData<any>('bidang', '/lp2m/v1/settings/bidang', () => BIDANG)
const items = computed(() => (d.value?.items?.length ? d.value.items : BIDANG.items))

const iconMap: Record<string, string> = {
  leaf: '<svg width="34" height="34" viewBox="0 0 34 34"><path d="M4 30 C4 18 10 6 30 4 C26 14 17 24 4 30Z" fill="none" stroke="#C99A3B" stroke-width="1.8"/></svg>',
  gear: '<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="13" fill="none" stroke="#C99A3B" stroke-width="1.8"/><path d="M17 8v9l7 4" stroke="#C99A3B" stroke-width="1.8" fill="none"/></svg>',
  cross: '<svg width="34" height="34" viewBox="0 0 34 34"><rect x="5" y="5" width="24" height="24" rx="3" fill="none" stroke="#C99A3B" stroke-width="1.8"/><path d="M11 17h12M17 11v12" stroke="#C99A3B" stroke-width="1.8"/></svg>',
  hexagon: '<svg width="34" height="34" viewBox="0 0 34 34"><path d="M17 4 L28 11 V23 L17 30 L6 23 V11 Z" fill="none" stroke="#C99A3B" stroke-width="1.8"/></svg>'
}

function iconSvg(name: string) { return iconMap[name] || iconMap.leaf }

onMounted(load)
</script>

<style scoped>
.bidang-eyebrow { color: var(--gold-soft); }
.bidang-eyebrow::before { background: var(--gold-soft); }
.bidang-desc { color: var(--green-100); }
</style>
