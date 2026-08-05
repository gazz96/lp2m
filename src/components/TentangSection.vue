<template>
  <section id="tentang">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">{{ d?.eyebrow || TENTANG.eyebrow }}</div>
          <h2>{{ d?.title || TENTANG.title }}</h2>
        </div>
        <p class="desc">{{ d?.desc || TENTANG.desc }}</p>
      </RevealBlock>

      <SkeletonBlock v-if="status === 'loading'" variant="grid" :count="3" style="margin-bottom:24px" />
      <SkeletonBlock v-else-if="status === 'error'" variant="text" :count="2" style="margin-bottom:24px" />

      <template v-else>
        <div class="about-grid">
          <RevealBlock>
            <p class="lead-quote">{{ d?.quote || TENTANG.quote }}</p>
            <p class="quote-body">{{ d?.quoteBody || TENTANG.quoteBody }}</p>
          </RevealBlock>
          <div class="pillar-list">
            <RevealBlock v-for="p in pillars" :key="p.num">
              <div class="pillar">
                <span class="num">{{ p.num }}</span>
                <div>
                  <h4>{{ p.title }}</h4>
                  <p>{{ p.desc }}</p>
                </div>
              </div>
            </RevealBlock>
          </div>
        </div>

        <RevealBlock class="leadership">
          <div v-for="l in leadership" :key="l.name" class="lead-card">
            <div class="role">{{ l.role }}</div>
            <h4>{{ l.name }}</h4>
            <div class="unit">{{ l.unit }}</div>
          </div>
        </RevealBlock>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { TENTANG } from '@/data'
import { useSectionData } from '@/composables/useSectionData'
import RevealBlock from './RevealBlock.vue'
import SkeletonBlock from './SkeletonBlock.vue'

const { data: d, status, load } = useSectionData<any>('about', '/lp2m/v1/settings/about', () => TENTANG)

const pillars = computed(() => (d.value?.pillars?.length ? d.value.pillars : TENTANG.pillars))
const leadership = computed(() => (d.value?.leadership?.length ? d.value.leadership : TENTANG.leadership))

onMounted(load)
</script>
