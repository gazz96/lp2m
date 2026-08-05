<template>
  <section class="hero" id="beranda">
    <div class="wrap">
      <SkeletonBlock v-if="!hero || loading" variant="text" :count="5" style="height:60px;max-width:560px" />
      <template v-else>
        <div class="hero-copy reveal" ref="heroCopy">
          <div class="eyebrow">{{ hero.eyebrow }}</div>
          <h1 v-html="hero.titleHtml"></h1>
          <p class="lead">{{ hero.lead }}</p>
          <div class="hero-cta">
            <a :href="hero.btnPrimaryUrl" class="btn btn-gold">{{ hero.btnPrimaryText }}</a>
            <a :href="hero.btnSecondaryUrl" class="btn btn-outline">{{ hero.btnSecondaryText }}</a>
          </div>
          <div class="hero-stats">
            <div v-for="s in hero.stats" :key="s.label" class="stat">
              <AnimatedNumber :target="s.count" class="num" />
              <div class="lbl">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <div class="hero-visual reveal" ref="heroVisual" v-if="hero.event">
          <div class="frond-panel">
            <span class="tag">Agenda Terdekat</span>
            <h3>{{ hero.event.title }}</h3>
            <p>{{ hero.event.desc }}</p>
            <ul class="leaf-list" v-if="hero.event.schedule.length">
              <li v-for="item in hero.event.schedule" :key="item">
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 16 C2 9 6 2 16 2 C14 8 9 13 2 16 Z" fill="none" stroke="#C99A3B" stroke-width="1.6"/></svg>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHero } from '@/composables/useHero'
import AnimatedNumber from './AnimatedNumber.vue'
import SkeletonBlock from './SkeletonBlock.vue'

const { hero, loading, error } = useHero()

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
