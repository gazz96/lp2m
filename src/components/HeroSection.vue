<template>
  <section class="hero" id="beranda">
    <div class="wrap">
      <div class="hero-copy reveal" ref="heroCopy">
        <div class="eyebrow">{{ HERO.eyebrow }}</div>
        <h1 v-html="HERO.titleHtml"></h1>
        <p class="lead">{{ HERO.lead }}</p>
        <div class="hero-cta">
          <a href="#form-hibah" class="btn btn-gold">Daftar Hibah Internal 2026</a>
          <a href="#tentang" class="btn btn-outline">Pelajari Tugas &amp; Fungsi LP2M</a>
        </div>
        <div class="hero-stats">
          <div v-for="s in HERO.stats" :key="s.label" class="stat">
            <AnimatedNumber :target="s.count" class="num" />
            <div class="lbl">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <div class="hero-visual reveal" ref="heroVisual">
        <div class="frond-panel">
          <span class="tag">Agenda Terdekat</span>
          <h3>{{ HERO.eventTitle }}</h3>
          <p>{{ HERO.eventDesc }}</p>
          <ul class="leaf-list">
            <li v-for="item in HERO.schedule" :key="item">
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 16 C2 9 6 2 16 2 C14 8 9 13 2 16 Z" fill="none" stroke="#C99A3B" stroke-width="1.6"/></svg>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { HERO } from '@/data'
import AnimatedNumber from './AnimatedNumber.vue'

const heroCopy = ref<HTMLElement>()
const heroVisual = ref<HTMLElement>()

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in')
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.15 })

  if (heroCopy.value) observer.observe(heroCopy.value)
  if (heroVisual.value) observer.observe(heroVisual.value)
})
</script>
