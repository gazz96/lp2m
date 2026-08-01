<template>
  <div>
    <h1>Beranda Dashboard</h1>
    <p class="subtitle">Ringkasan aktivitas LP2M — data diambil dari itsi.ac.id</p>

    <!-- Stat ringkasan -->
    <div class="dash-grid-3" style="margin-bottom:24px">
      <div class="dash-stat">
        <div class="num">{{ stats.eventAktif }}</div>
        <div class="lbl">Event Hibah Aktif</div>
      </div>
      <div class="dash-stat">
        <div class="num">{{ stats.totalBerita }}</div>
        <div class="lbl">Berita & Artikel</div>
      </div>
      <div class="dash-stat">
        <div class="num">{{ stats.totalPanduan }}</div>
        <div class="lbl">Panduan & Template</div>
      </div>
    </div>

    <!-- Feed terbaru -->
    <div class="dash-grid-2">
      <!-- Event terbaru -->
      <div class="dash-card">
        <h3>📋 Event Hibah Terbaru</h3>
        <div v-if="loadingEvents" class="loading-text">Memuat...</div>
        <div v-else-if="eventError" class="error-text">{{ eventError }}</div>
        <div v-else class="feed-list">
          <div v-for="post in recentEvents" :key="post.id" class="feed-item">
            <span class="feed-cat">{{ post.kategori }}</span>
            <a :href="post.link" target="_blank" class="feed-title">{{ post.title }}</a>
            <span class="feed-date">{{ post.date }}</span>
          </div>
          <div v-if="recentEvents.length === 0" class="empty-text">Belum ada event.</div>
        </div>
      </div>

      <!-- Berita terbaru -->
      <div class="dash-card">
        <h3>📰 Berita & Pengumuman Terbaru</h3>
        <div v-if="loadingNews" class="loading-text">Memuat...</div>
        <div v-else-if="newsError" class="error-text">{{ newsError }}</div>
        <div v-else class="feed-list">
          <div v-for="post in recentNews" :key="post.id" class="feed-item">
            <span class="feed-cat">{{ post.kategori }}</span>
            <a :href="post.link" target="_blank" class="feed-title">{{ post.title }}</a>
            <span class="feed-date">{{ post.date }}</span>
          </div>
          <div v-if="recentNews.length === 0" class="empty-text">Belum ada berita.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'

interface FeedItem {
  id: number
  title: string
  link: string
  date: string
  kategori: string
}

const recentEvents = ref<FeedItem[]>([])
const recentNews = ref<FeedItem[]>([])
const loadingEvents = ref(true)
const loadingNews = ref(true)
const eventError = ref('')
const newsError = ref('')

const stats = ref({ eventAktif: 0, totalBerita: 0, totalPanduan: 3 })

// Category maps
const catNames: Record<number, string> = {
  27: 'Agenda', 4: 'Berita', 8: 'Kegiatan', 19: 'Pengumuman', 3: 'Artikel',
  6: 'Info Pendaftaran', 5: 'Hot News', 16: 'Penelitian', 17: 'Pengabdian'
}

function formatDate(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function fetchFeed(cats: number[], perPage: number): Promise<FeedItem[]> {
  const url = `${SITE.apiBase}/posts?categories=${cats.join(',')}&per_page=${perPage}&orderby=date&order=desc`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.map((p: any) => ({
    id: p.id,
    title: new DOMParser().parseFromString(p.title.rendered, 'text/html').body.textContent || p.title.rendered,
    link: p.link,
    date: formatDate(p.date),
    kategori: catNames[p.categories?.[0]] || 'Umum'
  }))
}

onMounted(async () => {
  try {
    const [events, news] = await Promise.all([
      fetchFeed([27, 6, 8], 5),     // Agenda + Info Pendaftaran + Kegiatan
      fetchFeed([4, 3, 19, 5], 5)   // Berita + Artikel + Pengumuman + Hot News
    ])
    recentEvents.value = events
    recentNews.value = news
    stats.value.eventAktif = events.length
    stats.value.totalBerita = news.length
  } catch (e: any) {
    eventError.value = e.message
    newsError.value = e.message
  } finally {
    loadingEvents.value = false
    loadingNews.value = false
  }
})
</script>

<style scoped>
.feed-list { display: flex; flex-direction: column; gap: 12px; }
.feed-item {
  display: flex; flex-direction: column; gap: 3px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}
.feed-item:last-child { border-bottom: none; padding-bottom: 0; }
.feed-cat {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gold-dark);
}
.feed-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--green-800);
  text-decoration: none;
  line-height: 1.3;
}
.feed-title:hover { color: var(--green-600); }
.feed-date { font-size: 0.74rem; color: var(--ink-soft); }
.loading-text, .empty-text, .error-text { color: var(--ink-soft); font-size: 0.88rem; padding: 16px 0; }
.error-text { color: var(--rust); }
</style>
