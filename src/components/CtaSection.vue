<template>
  <section style="padding-top:0">
    <div class="wrap">
      <SkeletonBlock v-if="status === 'loading'" variant="text" :count="2" style="height:80px" />
      <SkeletonBlock v-else-if="status === 'error'" variant="text" :count="2" style="height:80px" />

      <RevealBlock v-else class="cta-band">
        <div>
          <h3>{{ d?.cta_title || CTA.title }}</h3>
          <p>{{ d?.cta_desc || CTA.desc }}</p>
        </div>
        <div class="cta-actions">
          <a href="#form-hibah" class="btn btn-primary">Daftar Sekarang</a>
          <a href="#kontak" class="btn btn-outline cta-outline">Hubungi Kami</a>
        </div>
      </RevealBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { CTA } from '@/data'
import { useSectionData } from '@/composables/useSectionData'
import RevealBlock from './RevealBlock.vue'
import SkeletonBlock from './SkeletonBlock.vue'

const { data: d, status, load } = useSectionData<any>('cta', '/lp2m/v1/settings/homepage', () => CTA)

onMounted(load)
</script>

<style scoped>
.cta-outline {
  border-color: var(--green-900);
  color: var(--green-900);
}
</style>
