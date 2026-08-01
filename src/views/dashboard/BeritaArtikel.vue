<template>
  <div>
    <h1>📰 Berita, Artikel, Kegiatan & Pengumuman</h1>
    <p class="subtitle">Kabar terbaru dari LP2M — langsung dari itsi.ac.id</p>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        :class="{ active: activeTab === tab.key }" class="tab-btn">
        {{ tab.label }} <span class="tab-count">{{ counts[tab.key] || 0 }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-text">Memuat dari itsi.ac.id...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>

    <!-- Post grid -->
    <div v-else class="post-grid">
      <div v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-thumb" :style="post.thumb ? { backgroundImage: `url(${post.thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
          <span class="post-cat">{{ post.kategori }}</span>
        </div>
        <div class="post-body">
          <div class="post-date">{{ post.date }}</div>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt }}</p>
          <a :href="post.link" target="_blank" class="rd">Baca selengkapnya →</a>
        </div>
      </div>
      <div v-if="filteredPosts.length === 0 && !loading" class="empty-text">
        Tidak ada konten dalam kategori ini.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SITE } from '@/data'

interface Post {
  id: number
  title: string
  link: string
  date: string
  excerpt: string
  kategori: string
  catId: number
  thumb: string | null
}

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref('')
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'berita', label: 'Berita' },
  { key: 'artikel', label: 'Artikel' },
  { key: 'kegiatan', label: 'Kegiatan' },
  { key: 'pengumuman', label: 'Pengumuman' }
]

const counts = ref<Record<string, number>>({})
const catNames: Record<number, string> = { 4: 'Berita', 3: 'Artikel', 8: 'Kegiatan', 19: 'Pengumuman', 5: 'Hot News' }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const filteredPosts = computed(() => {
  if (activeTab.value === 'all') return posts.value
  const keyMap: Record<string, number> = { berita: 4, artikel: 3, kegiatan: 8, pengumuman: 19 }
  return posts.value.filter(p => p.catId === keyMap[activeTab.value])
})

onMounted(async () => {
  try {
    const url = `${SITE.apiBase}/posts?categories=4,3,8,19,5&_embed=1&per_page=30&orderby=date&order=desc`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    const countMap: Record<string, number> = { all: data.length, berita: 0, artikel: 0, kegiatan: 0, pengumuman: 0 }

    posts.value = data.map((p: any) => {
      const cid = p.categories?.[0] || 0
      const cat = catNames[cid]
      if (cid === 4 || cid === 5) countMap.berita++
      if (cid === 3) countMap.artikel++
      if (cid === 8) countMap.kegiatan++
      if (cid === 19) countMap.pengumuman++

      const media = p._embedded?.['wp:featuredmedia']
      return {
        id: p.id,
        title: new DOMParser().parseFromString(p.title.rendered, 'text/html').body.textContent || p.title.rendered,
        link: p.link,
        date: formatDate(p.date),
        excerpt: new DOMParser().parseFromString(p.excerpt?.rendered || '', 'text/html').body.textContent?.slice(0, 130) + '…' || '',
        kategori: cat || 'Umum',
        catId: cid,
        thumb: media?.[0]?.source_url || null
      }
    })
    counts.value = countMap
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.filter-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.tab-btn {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: var(--card);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--ink-soft);
  transition: all 0.15s;
  font-family: inherit;
  display: flex; align-items: center; gap: 6px;
}
.tab-btn:hover { border-color: var(--gold); color: var(--green-800); }
.tab-btn.active { background: var(--green-700); color: #fff; border-color: var(--green-700); }
.tab-count { font-size: 0.72rem; opacity: 0.8; }

.post-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.post-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.post-thumb {
  height: 130px;
  background: linear-gradient(135deg, var(--green-600), var(--green-800));
  position: relative;
}
.post-cat {
  position: absolute; bottom: 10px; left: 12px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--gold-soft);
  background: rgba(0,0,0,0.35); padding: 2px 8px; border-radius: 3px;
}
.post-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
.post-date { font-size: 0.72rem; color: var(--ink-soft); margin-bottom: 8px; }
.post-body h4 { font-size: 0.92rem; margin-bottom: 8px; line-height: 1.3; color: var(--green-800); }
.post-body p { font-size: 0.8rem; color: var(--ink-soft); flex: 1; margin-bottom: 12px; }
.rd { font-size: 0.8rem; font-weight: 600; color: var(--green-700); text-decoration: none; }
.rd:hover { color: var(--green-500); }

.loading-text, .empty-text { color: var(--ink-soft); font-size: 0.9rem; padding: 40px 0; text-align: center; }
.error-text { color: var(--rust); font-size: 0.9rem; padding: 16px 0; }

@media (max-width: 900px) { .post-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .post-grid { grid-template-columns: 1fr; } }
</style>
