<template>
  <section class="hibah-section" id="hibah">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">{{ HIBAH.eyebrow }}</div>
          <h2>{{ HIBAH.title }}</h2>
        </div>
        <p class="desc">{{ HIBAH.desc }}</p>
      </RevealBlock>

      <!-- Banner -->
      <RevealBlock class="hibah-banner">
        <div>
          <div class="eyebrow banner-eyebrow">{{ HIBAH.banner.eyebrow }}</div>
          <h2>{{ eventData.bannerTitle }}</h2>
          <p>{{ eventData.bannerDesc }}</p>
          <div class="timeline" id="jadwal">
            <div v-for="t in eventData.timeline" :key="t.date + t.label" class="t-row">
              <span class="date">{{ fmtTimelineDate(t.date) }}</span>
              <span>{{ t.label }}</span>
            </div>
          </div>
        </div>
        <div class="countdown-box">
          <div class="cd-label">Sisa waktu pendaftaran</div>
          <CountdownTimer :deadline="eventData.deadline" />
          <div class="cd-sub">hari menuju {{ eventData.deadlineLabel }}</div>
          <ul class="leaf-list mt-16">
            <li v-for="info in eventData.info" :key="info">
              <svg width="16" height="16" viewBox="0 0 18 18"><path d="M2 16 C2 9 6 2 16 2 C14 8 9 13 2 16 Z" fill="none" stroke="#C99A3B" stroke-width="1.6"/></svg>
              {{ info }}
            </li>
          </ul>
          <a href="#form-hibah" class="btn btn-gold full-width">Isi Formulir Sekarang</a>
        </div>
      </RevealBlock>

      <!-- Form -->
      <div id="form-hibah">
        <HibahForm :hibah-id="eventData.id" :file-panduan="eventData.filePanduan" :file-template="eventData.fileTemplate" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HIBAH } from '@/data'
import { useHibahEvent } from '@/composables/useHibahEvent'
import RevealBlock from './RevealBlock.vue'
import CountdownTimer from './CountdownTimer.vue'
import HibahForm from './HibahForm.vue'

const { event: eventData } = useHibahEvent()

function fmtTimelineDate(d: string) {
  if (!d) return ''
  // Terima YYYY-MM-DD atau "01 Agu 2026" (format lama) → tampilkan id-ID pendek.
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return d
}
</script>

<style scoped>
.banner-eyebrow { color: var(--gold-soft); }
.banner-eyebrow::before { background: var(--gold-soft); }
.mt-16 { margin-top: 16px; }
.mt-22 { margin-top: 22px; }
.full-width { width: 100%; justify-content: center; }
</style>
