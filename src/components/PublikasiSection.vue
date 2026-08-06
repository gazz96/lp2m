<template>
  <section id="publikasi">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">Publikasi &amp; Berita</div>
          <h2>Kabar Terbaru dari LP2M</h2>
        </div>
        <p class="desc">Sorotan kegiatan penelitian, pengabdian, dan capaian civitas akademika ITSI.</p>
      </RevealBlock>

      <div v-if="loading" class="pub-grid">
        <SkeletonBlock v-for="i in 6" :key="i" variant="card" style="margin-bottom:8px" />
      </div>
      <div v-else-if="error" class="pub-error">{{ error }}</div>
      <div v-else class="pub-grid">
        <div v-for="post in posts" :key="post.id" class="pub-card">
          <div class="pub-thumb" :style="thumbStyle(post)">
            <span class="cat">{{ categoryName(post) }}</span>
          </div>
          <div class="pub-body">
            <div class="date">{{ formatDate(post.date) }}</div>
            <h4>{{ cleanTitle(post.title) }}</h4>
            <p>{{ excerpt(post) }}</p>
            <router-link :to="`/artikel/${post.slug}`" class="rd">Baca selengkapnya &rarr;</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNewsStore } from '@/stores/news'
import { SITE } from '@/data'
import SkeletonBlock from './SkeletonBlock.vue'

const store = useNewsStore()

const { posts, loading, error } = storeToRefs(store)
const { fetchNews, stripHtml, formatDate, getCategoryName, getThumbnail } = store

// Category ID → name mapping from our API probe
const catMap: Record<number, string> = {
  16: 'Penelitian',
  17: 'Pengabdian',
  18: 'Pengabdian Masyarakat',
  10: 'Kerja Sama',
  4: 'Berita'
}

function categoryName(post: any) {
  return getCategoryName(post, catMap)
}

function cleanTitle(title: string) {
  const doc = new DOMParser().parseFromString(title, 'text/html')
  return doc.body.textContent || title
}

function excerpt(post: any) {
  if (post.excerpt) {
    return stripHtml(post.excerpt).slice(0, 160) + '…'
  }
  return ''
}

function thumbStyle(post: any) {
  const img = getThumbnail(post)
  if (img) {
    return { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return {}
}

onMounted(() => {
  fetchNews(SITE.apiBase, SITE.newsCategoryIds, SITE.newsPerPage)
})
</script>

<style scoped>
.pub-loading, .pub-error {
  text-align: center;
  padding: 40px;
  color: var(--ink-soft);
  font-size: 0.95rem;
}
.pub-error { color: var(--rust); }
</style>
