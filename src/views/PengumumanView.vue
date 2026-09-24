<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div class="announcement-page">
      <div class="announcement-hero">
        <div class="wrap">
          <div class="eyebrow">Informasi Terkini</div>
          <h1>Pengumuman LP2M</h1>
          <p>Informasi resmi, jadwal, dan pemberitahuan terbaru dari LP2M ITSI.</p>
        </div>
      </div>

      <div class="wrap announcement-wrap">
        <div v-if="loading" class="pub-grid">
          <SkeletonBlock v-for="i in 9" :key="i" variant="card" style="margin-bottom:8px" />
        </div>
        <div v-else-if="error" class="archive-message archive-error">{{ error }}</div>
        <div v-else-if="!posts.length" class="archive-message">Belum ada pengumuman.</div>
        <div v-else class="pub-grid">
          <article v-for="post in posts" :key="post.id" class="pub-card">
            <router-link :to="`/artikel/${post.slug}`" class="pub-thumb" :style="thumbStyle(post)">
              <span class="cat">Pengumuman</span>
            </router-link>
            <div class="pub-body">
              <div class="date">{{ formatDate(post.date) }}</div>
              <h4><router-link :to="`/artikel/${post.slug}`">{{ cleanTitle(post.title) }}</router-link></h4>
              <p>{{ excerpt(post) }}</p>
              <router-link :to="`/artikel/${post.slug}`" class="rd">Baca selengkapnya &rarr;</router-link>
            </div>
          </article>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button class="btn btn-outline is-small" :disabled="page <= 1" @click="goPage(page - 1)">&larr; Sebelumnya</button>
          <span>Halaman {{ page }} dari {{ totalPages }}</span>
          <button class="btn btn-outline is-small" :disabled="page >= totalPages" @click="goPage(page + 1)">Berikutnya &rarr;</button>
        </div>
      </div>
    </div>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { SITE } from '@/data'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const base = SITE.apiBase.replace('/wp/v2', '')
const posts = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)

function cleanTitle(title: string) {
  const doc = new DOMParser().parseFromString(title || '', 'text/html')
  return doc.body.textContent || title || ''
}

function excerpt(post: any) {
  const doc = new DOMParser().parseFromString(post.excerpt || '', 'text/html')
  const text = doc.body.textContent || ''
  return text.length > 160 ? `${text.slice(0, 160)}…` : text
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function thumbStyle(post: any) {
  return post.thumbnail
    ? { backgroundImage: `url(${post.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const fields = 'id,date,title,excerpt,slug,featured_media,categories'
    const response = await fetch(
      `${base}/wp/v2/posts?categories=${SITE.pengumumanCategoryId}&per_page=9&page=${page.value}&orderby=date&order=desc&_fields=${fields}`
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    totalPages.value = Number(response.headers.get('X-WP-TotalPages') || '1')
    const raw = await response.json()

    const mediaIds = (raw as any[]).map((post: any) => post.featured_media).filter(Boolean)
    const mediaMap: Record<number, string> = {}
    if (mediaIds.length) {
      const mediaResponse = await fetch(`${base}/wp/v2/media?include=${mediaIds.join(',')}&per_page=100&_fields=id,source_url`)
      if (mediaResponse.ok) {
        const media = await mediaResponse.json()
        ;(media as any[]).forEach((item: any) => { mediaMap[item.id] = item.source_url })
      }
    }

    posts.value = (raw as any[]).map((post: any) => ({
      ...post,
      title: post.title?.rendered || '',
      excerpt: post.excerpt?.rendered || '',
      thumbnail: mediaMap[post.featured_media] || null
    }))
  } catch (e: any) {
    posts.value = []
    error.value = e.message || 'Gagal memuat pengumuman.'
  } finally {
    loading.value = false
  }
}

function goPage(nextPage: number) {
  page.value = nextPage
  load()
  window.scrollTo({ top: 300, behavior: 'smooth' })
}

onMounted(load)
</script>

<style scoped>
.announcement-page { padding-bottom: 80px; }
.announcement-hero {
  background: linear-gradient(135deg, var(--green-800), var(--green-900));
  color: #fff;
  padding: 72px 0 56px;
  margin-bottom: 40px;
}
.announcement-hero .eyebrow { color: var(--gold-soft); }
.announcement-hero .eyebrow::before { background: var(--gold-soft); }
.announcement-hero h1 { color: #fff; font-size: 2.4rem; margin-bottom: 10px; }
.announcement-hero p { color: var(--green-100); max-width: 52ch; }
.pub-thumb { display: block; }
.pub-body h4 a { color: inherit; }
.pub-body h4 a:hover { color: var(--green-700); }
.archive-message { text-align: center; padding: 60px 0; color: var(--ink-soft); }
.archive-error { color: var(--rust); }
.pagination { display: flex; justify-content: center; align-items: center; gap: 18px; margin-top: 44px; color: var(--ink-soft); font-size: .86rem; }
.btn.is-small { padding: 9px 18px; font-size: .85rem; }
</style>
