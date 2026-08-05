<template>
  <section style="padding-top:0">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">{{ d?.label || MITRA.eyebrow }}</div>
          <h2>{{ d?.title || MITRA.title }}</h2>
        </div>
      </RevealBlock>

      <SkeletonBlock v-if="status === 'loading'" variant="chip" :count="5" />
      <SkeletonBlock v-else-if="status === 'error'" variant="text" :count="2" />

      <RevealBlock v-else class="mitra-strip">
        <div v-for="m in items" :key="m" class="mitra-chip">{{ m }}</div>
      </RevealBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { MITRA } from '@/data'
import { useSectionData } from '@/composables/useSectionData'
import RevealBlock from './RevealBlock.vue'
import SkeletonBlock from './SkeletonBlock.vue'

const { data: d, status, load } = useSectionData<any>('mitra', '/lp2m/v1/settings/mitra', () => MITRA)
const items = computed(() => {
  const raw = d.value?.items
  if (Array.isArray(raw)) {
    // items bisa [{nama}] (repeater) atau [string] (legacy)
    return raw.map((i: any) => (typeof i === 'string' ? i : i?.nama || '')).filter(Boolean)
  }
  return MITRA.items
})

onMounted(load)
</script>
