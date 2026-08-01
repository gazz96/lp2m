<template>
  <section style="padding-top:0">
    <div class="wrap">
      <RevealBlock class="cta-band">
        <div>
          <h3>{{ CTA.title }}</h3>
          <p>{{ CTA.desc }}</p>
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
import { CTA } from '@/data'
import RevealBlock from './RevealBlock.vue'
</script>

<style scoped>
.cta-outline {
  border-color: var(--green-900);
  color: var(--green-900);
}
</style>
