<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div id="primary" class="content-area article-page" :class="{ 'is-page': isPage }">
      <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
      <div v-else-if="notFound" class="nf" style="text-align:center;padding:40px;color:var(--ink-soft)">
        {{ isPage ? 'Halaman tidak ditemukan.' : 'Artikel tidak ditemukan.' }}
      </div>
      <article v-else-if="item">
        <nav class="breadcrumb" v-if="!isPage">
          <router-link to="/blog">Blog</router-link>
          <span class="sep">/</span>
          <span>{{ categoryLabel }}</span>
        </nav>

        <div class="meta-line">
          <span>{{ fmtDate(item.date) }}</span>
          <span v-if="!isPage && item._embedded?.author?.[0]" class="dot">•</span>
          <span v-if="!isPage && item._embedded?.author?.[0]">Oleh <strong>{{ item._embedded.author[0].name }}</strong></span>
        </div>

        <h1 class="article-title" v-html="item.title?.rendered"></h1>

        <div v-if="featured" class="featured-media">
          <img
            :src="featured.src"
            :srcset="featured.srcset"
            :sizes="featured.sizes"
            :alt="featured.alt"
            loading="lazy"
            decoding="async"
            width="1200"
            height="675"
          />
        </div>

        <!-- Category chips -->
        <div v-if="!isPage && termChips.length" class="term-chips">
          <router-link
            v-for="t in termChips"
            :key="t.id"
            :to="`/blog?cat=${t.id}`"
            class="term-chip"
          >{{ t.name }}</router-link>
        </div>

        <div class="entry-content" v-html="item.content?.rendered"></div>

        <!-- Share -->
        <div class="share-row">
          <span class="share-label">Bagikan:</span>
          <button class="share-btn" @click="share('wa')">WhatsApp</button>
          <button class="share-btn" @click="share('fb')">Facebook</button>
          <button class="share-btn" @click="share('copy')">Salin Tautan</button>
        </div>
      </article>
    </div>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '@/data'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const item = ref<Record<string, any> | null>(null)
const loading = ref(true)
const notFound = ref(false)
const isPage = ref(false)
const base = SITE.apiBase.replace('/wp/v2', '')

const catMap: Record<number, string> = {
  16: 'Penelitian',
  17: 'Pengabdian',
  18: 'Pengabdian Masyarakat',
  10: 'Kerja Sama',
  4: 'Berita'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Responsive featured image ──
const featured = computed(() => {
  const media = item.value?._embedded?.['wp:featuredmedia']?.[0]
  if (!media?.source_url) return null
  const sizes = media.media_details?.sizes || {}
  // Pilih ukuran medium_large (768px) atau large (1024px) → hemat bandwidth di mobile.
  const pick = sizes.medium_large || sizes.large || sizes.medium
  const src = pick?.source_url || media.source_url
  // srcset dari ukuran yang tersedia (tanpa full-size yang besar).
  const srcset = Object.values(sizes)
    .filter((s: any) => s?.source_url && s?.width)
    .sort((a: any, b: any) => a.width - b.width)
    .map((s: any) => `${s.source_url} ${s.width}w`)
    .join(', ')
  return {
    src,
    srcset: srcset || undefined,
    sizes: srcset ? '(max-width: 860px) 100vw, 860px' : undefined,
    alt: media.alt_text || (item.value?.title?.rendered ? new DOMParser().parseFromString(item.value.title.rendered, 'text/html').body.textContent : '') || ''
  }
})

// ── Category chips (dari _embedded wp:term) ──
const termChips = computed(() => {
  const terms: any[] = item.value?._embedded?.['wp:term']?.[0] || []
  return terms
    .filter((t: any) => t.taxonomy === 'category' && t.name)
    .map((t: any) => ({ id: t.id, name: t.name }))
})

const categoryLabel = computed(() => {
  const c = termChips.value[0]
  if (c) return c.name
  const cats: number[] = item.value?.categories || []
  return catMap[cats[0]] || 'Berita'
})

// ── Share ──
function share(platform: 'wa' | 'fb' | 'copy') {
  const url = location.href
  if (platform === 'wa') {
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank')
  } else if (platform === 'fb') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  } else {
    navigator.clipboard?.writeText(url)
    alert('Tautan disalin!')
  }
}

onMounted(async () => {
  const route = useRoute()
  const slug = route.params.slug as string
  // /halaman/:slug → Page WP; /artikel/:slug → Post WP.
  const endpoint = route.name === 'page-detail' ? 'pages' : 'posts'
  isPage.value = route.name === 'page-detail'
  try {
    const r = await fetch(`${base}/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&_embed=author,wp:featuredmedia,wp:term`)
    if (!r.ok) throw new Error('HTTP ' + r.status)
    const data = await r.json()
    if (data?.length) item.value = data[0]
    else notFound.value = true
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.article-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 60px 16px;
}
.article-page.is-page { max-width: 860px; }

.breadcrumb {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.82rem;
  color: var(--ink-soft);
  margin-bottom: 16px;
}
.breadcrumb a { color: var(--green-700); font-weight: 600; }
.breadcrumb .sep { opacity: 0.5; }

.meta-line {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.86rem;
  color: var(--ink-soft);
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.meta-line .dot { opacity: 0.5; }

.article-title {
  font-size: 2.2rem;
  line-height: 1.2;
  margin-bottom: 28px;
}

.featured-media { margin-bottom: 32px; }
.featured-media img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}

.term-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
.term-chip {
  background: var(--green-100);
  color: var(--green-800);
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 0.78rem;
  font-weight: 600;
}
.term-chip:hover { background: var(--green-700); color: #fff; }

.share-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}
.share-label { font-size: 0.84rem; color: var(--ink-soft); font-weight: 600; }
.share-btn {
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink-soft);
  border-radius: 4px;
  padding: 7px 16px;
  font-size: 0.82rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.share-btn:hover { border-color: var(--green-700); color: var(--green-700); }

@media (max-width: 700px) {
  .article-title { font-size: 1.7rem; }
}
</style>
