<template>
  <section style="padding-top:0">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">{{ MITRA.eyebrow }}</div>
          <h2>{{ MITRA.title }}</h2>
        </div>
      </RevealBlock>
      <RevealBlock class="mitra-strip">
        <div v-for="m in MITRA.items" :key="m" class="mitra-chip">{{ m }}</div>
      </RevealBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
import { MITRA } from '@/data'
import RevealBlock from './RevealBlock.vue'
</script>
