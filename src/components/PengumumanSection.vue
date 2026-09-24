<template>
  <section id="pengumuman" class="announcement-section">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">Informasi Terkini</div>
          <h2>Pengumuman LP2M</h2>
        </div>
        <p class="desc">Informasi resmi, jadwal, dan pemberitahuan terbaru dari LP2M ITSI.</p>
      </RevealBlock>

      <div v-if="loading" class="pub-grid">
        <SkeletonBlock v-for="i in 3" :key="i" variant="card" style="margin-bottom:8px" />
      </div>
      <div v-else-if="error" class="pub-error">{{ error }}</div>
      <div v-else-if="!posts.length" class="announcement-empty">Belum ada pengumuman terbaru.</div>
      <div v-else class="pub-grid">
        <article v-for="post in posts" :key="post.id" class="pub-card">
          <router-link :to="`/artikel/${post.slug}`" class="pub-thumb" :style="thumbStyle(post)">
            <span class="cat">Pengumuman</span>
          </router-link>
          <div class="pub-body">
            <div class="date">{{ formatDate(post.date) }}</div>
            <h4>
              <router-link :to="`/artikel/${post.slug}`">{{ cleanTitle(post.title) }}</router-link>
            </h4>
            <p>{{ excerpt(post) }}</p>
            <router-link :to="`/artikel/${post.slug}`" class="rd">Baca selengkapnya &rarr;</router-link>
          </div>
        </article>
      </div>

      <div class="pub-more">
        <router-link to="/pengumuman" class="btn btn-outline">Semua Pengumuman &rarr;</router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'
import { SITE } from '@/data'
import RevealBlock from './RevealBlock.vue'
import SkeletonBlock from './SkeletonBlock.vue'

const store = useNewsStore()
const { pengumuman: posts, pengumumanLoading: loading, pengumumanError: error } = storeToRefs(store)
const { fetchPengumuman, stripHtml, formatDate, getThumbnail } = store

function cleanTitle(title: string) {
  const doc = new DOMParser().parseFromString(title || '', 'text/html')
  return doc.body.textContent || title || ''
}

function excerpt(post: { excerpt: string }) {
  const text = stripHtml(post.excerpt || '').trim()
  if (!text) return 'Lihat informasi selengkapnya pada halaman detail pengumuman.'
  return text.length > 160 ? `${text.slice(0, 160)}…` : text
}

function thumbStyle(post: any) {
  const img = getThumbnail(post)
  if (img) {
    return { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return {}
}

onMounted(() => {
  fetchPengumuman(SITE.apiBase, SITE.pengumumanCategoryId, SITE.pengumumanPerPage)
})
</script>

<style scoped>
.announcement-section {
  background: color-mix(in srgb, var(--green-100) 24%, transparent);
}
.announcement-empty {
  text-align: center;
  padding: 40px;
  color: var(--ink-soft);
  font-size: 0.95rem;
}
.announcement-section .pub-more {
  width: 100%;
  margin-top: 48px;
  text-align: center;
}
.pub-thumb { display: block; }
.pub-thumb:hover { opacity: 0.92; }
.pub-body h4 a { color: inherit; }
.pub-body h4 a:hover { color: var(--green-700); }
</style>
