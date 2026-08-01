<template>
  <section id="tentang">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">{{ TENTANG.eyebrow }}</div>
          <h2>{{ TENTANG.title }}</h2>
        </div>
        <p class="desc">{{ TENTANG.desc }}</p>
      </RevealBlock>

      <div class="about-grid">
        <RevealBlock>
          <p class="lead-quote">{{ TENTANG.quote }}</p>
          <p class="quote-body">{{ TENTANG.quoteBody }}</p>
        </RevealBlock>
        <div class="pillar-list">
          <RevealBlock v-for="p in TENTANG.pillars" :key="p.num">
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
        <div v-for="l in TENTANG.leadership" :key="l.name" class="lead-card">
          <div class="role">{{ l.role }}</div>
          <h4>{{ l.name }}</h4>
          <div class="unit">{{ l.unit }}</div>
        </div>
      </RevealBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
import { TENTANG } from '@/data'
import RevealBlock from './RevealBlock.vue'
</script>
