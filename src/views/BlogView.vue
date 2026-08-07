<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div class="blog-page">
      <!-- Header -->
      <div class="blog-hero">
        <div class="wrap">
          <div class="eyebrow">Publikasi &amp; Berita</div>
          <h1>Blog LP2M</h1>
          <p class="blog-sub">Kabar terbaru seputar penelitian, pengabdian, dan capaian civitas akademika ITSI.</p>
        </div>
      </div>

      <div class="wrap blog-wrap">
        <!-- Category filter -->
        <div class="blog-filters" v-if="categories.length">
          <button
            class="chip"
            :class="{ active: !activeCat }"
            @click="setCat(0)"
          >Semua</button>
          <button
            v-for="c in categories"
            :key="c.id"
            class="chip"
            :class="{ active: activeCat === c.id }"
            @click="setCat(c.id)"
          >{{ c.name }}</button>
        </div>

        <!-- Grid -->
        <div v-if="loading" class="pub-grid">
          <SkeletonBlock v-for="i in 9" :key="i" variant="card" style="margin-bottom:8px" />
        </div>
        <div v-else-if="error" class="blog-error">{{ error }}</div>
        <div v-else-if="!posts.length" class="blog-empty">Belum ada artikel pada kategori ini.</div>
        <div v-else class="pub-grid">
          <div v-for="post in posts" :key="post.id" class="pub-card">
            <router-link :to="`/artikel/${post.slug}`" class="pub-thumb" :style="thumbStyle(post)">
              <span class="cat">{{ categoryName(post) }}</span>
            </router-link>
            <div class="pub-body">
              <div class="date">{{ formatDate(post.date) }}</div>
              <h4>
                <router-link :to="`/artikel/${post.slug}`">{{ cleanTitle(post.title) }}</router-link>
              </h4>
              <p>{{ excerpt(post) }}</p>
              <router-link :to="`/artikel/${post.slug}`" class="rd">Baca selengkapnya &rarr;</router-link>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="blog-pagination">
          <button class="btn btn-outline is-small" :disabled="page <= 1" @click="goPage(page - 1)">&larr; Sebelumnya</button>
          <span class="page-info">Halaman {{ page }} dari {{ totalPages }}</span>
          <button class="btn btn-outline is-small" :disabled="page >= totalPages" @click="goPage(page + 1)">Berikutnya &rarr;</button>
        </div>
      </div>
    </div>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { SITE } from '@/data'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const base = SITE.apiBase.replace('/wp/v2', '')
const PER_PAGE = 9

const posts = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const activeCat = ref(0)
const categories = ref<{ id: number; name: string }[]>([])

const catMap: Record<number, string> = {
  16: 'Penelitian',
  17: 'Pengabdian',
  18: 'Pengabdian Masyarakat',
  10: 'Kerja Sama',
  4: 'Berita'
}

async function loadCategories() {
  try {
    const r = await fetch(`${base}/wp/v2/categories?per_page=100&_fields=id,name,count&hide_empty=true`)
    if (!r.ok) return
    const all = await r.json()
    const ids = new Set(SITE.newsCategoryIds)
    categories.value = (all as any[])
      .filter((c: any) => ids.has(c.id))
      .map((c: any) => ({ id: c.id, name: c.name }))
  } catch { /* keep empty */ }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const cats = activeCat.value ? String(activeCat.value) : SITE.newsCategoryIds.join(',')
    const fields = 'id,date,title,excerpt,slug,featured_media,categories'
    const r = await fetch(
      `${base}/wp/v2/posts?categories=${cats}&per_page=${PER_PAGE}&page=${page.value}&orderby=date&order=desc&_fields=${fields}`
    )
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    totalPages.value = Number(r.headers.get('X-WP-TotalPages') || '1')
    const raw = await r.json()

    // Batch resolve thumbnails
    const mediaIds = (raw as any[]).map((p: any) => p.featured_media).filter(Boolean)
    let mediaMap: Record<number, string> = {}
    if (mediaIds.length) {
      const mr = await fetch(`${base}/wp/v2/media?include=${mediaIds.join(',')}&per_page=100&_fields=id,source_url`)
      if (mr.ok) {
        const media = await mr.json()
        ;(media as any[]).forEach((m: any) => { mediaMap[m.id] = m.source_url })
      }
    }

    posts.value = (raw as any[]).map((p: any) => ({
      ...p,
      title: p.title?.rendered || '',
      excerpt: p.excerpt?.rendered || '',
      thumbnail: mediaMap[p.featured_media] || null
    }))
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat artikel.'
    posts.value = []
  } finally {
    loading.value = false
  }
}

function setCat(id: number) {
  if (activeCat.value === id) return
  activeCat.value = id
  page.value = 1
  load()
}

function goPage(n: number) {
  page.value = n
  load()
  window.scrollTo({ top: 300, behavior: 'smooth' })
}

function categoryName(post: any) {
  if (post.categories?.length) {
    const id = post.categories[0]
    return catMap[id] || categories.value.find((c: any) => c.id === id)?.name || 'Berita'
  }
  return 'Berita'
}

function cleanTitle(title: string) {
  const doc = new DOMParser().parseFromString(title || '', 'text/html')
  return doc.body.textContent || title || ''
}

function excerpt(post: any) {
  const doc = new DOMParser().parseFromString(post.excerpt || '', 'text/html')
  return (doc.body.textContent || '').slice(0, 160) + '…'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function thumbStyle(post: any) {
  if (post.thumbnail) {
    return { backgroundImage: `url(${post.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return {}
}

onMounted(() => {
  loadCategories()
  load()
})
</script>

<style scoped>
.blog-page { padding-bottom: 80px; }
.blog-hero {
  background: linear-gradient(135deg, var(--green-800), var(--green-900));
  color: #fff;
  padding: 72px 0 56px;
  margin-bottom: 40px;
}
.blog-hero .eyebrow { color: var(--gold-soft); }
.blog-hero .eyebrow::before { background: var(--gold-soft); }
.blog-hero h1 { color: #fff; font-size: 2.4rem; margin-bottom: 10px; }
.blog-sub { color: var(--green-100); max-width: 52ch; }

.blog-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
.chip {
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink-soft);
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}
.chip:hover { border-color: var(--green-700); color: var(--green-700); }
.chip.active { background: var(--green-700); border-color: var(--green-700); color: #fff; }

.blog-error, .blog-empty {
  text-align: center;
  padding: 60px 0;
  color: var(--ink-soft);
}
.blog-error { color: var(--rust); }

.blog-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 44px;
}
.page-info { font-size: 0.86rem; color: var(--ink-soft); }
.btn.is-small { padding: 9px 18px; font-size: 0.85rem; }
</style>
