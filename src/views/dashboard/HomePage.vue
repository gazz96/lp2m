<template>
  <div class="wrap">
    <h1>Beranda</h1>

    <div class="welcome-panel">
      <h2>Selamat datang di Dashboard LP2M</h2>
      <p>Kelola hibah, artikel, dan data penelitian & pengabdian masyarakat dari sini.</p>
      <div class="welcome-panel-content">
        <div class="dash-grid-3">
          <div class="stat-box">
            <div class="stat-num">{{ stats.eventAktif }}</div>
            <div class="stat-label">Event Hibah Aktif</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">{{ stats.totalBerita }}</div>
            <div class="stat-label">Berita & Artikel</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">{{ stats.totalPanduan }}</div>
            <div class="stat-label">Panduan & Template</div>
          </div>
        </div>
      </div>
    </div>

    <div class="dash-grid-2">
      <div class="postbox">
        <div class="postbox-header"><h2>Event Hibah Terbaru</h2></div>
        <div class="inside">
          <div v-if="loadingEvents" style="text-align:center;padding:20px"><span class="spinner"></span></div>
          <div v-else-if="eventError" class="notice notice-error inline"><p>{{ eventError }}</p></div>
          <div v-else>
            <table class="wp-list-table widefat striped" v-if="recentEvents.length">
              <tbody>
                <tr v-for="post in recentEvents" :key="post.id">
                  <td>
                    <strong>{{ post.title }}</strong>
                    <span class="post-state" style="float:right">{{ post.kategori }}</span>
                  </td>
                  <td style="width:120px;text-align:right;color:var(--wp-text-muted);font-size:13px">{{ post.date }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else style="padding:20px;color:var(--wp-text-muted)">Belum ada event.</div>
          </div>
        </div>
      </div>

      <div class="postbox">
        <div class="postbox-header"><h2>Berita & Pengumuman Terbaru</h2></div>
        <div class="inside">
          <div v-if="loadingNews" style="text-align:center;padding:20px"><span class="spinner"></span></div>
          <div v-else-if="newsError" class="notice notice-error inline"><p>{{ newsError }}</p></div>
          <div v-else>
            <table class="wp-list-table widefat striped" v-if="recentNews.length">
              <tbody>
                <tr v-for="post in recentNews" :key="post.id">
                  <td>
                    <strong>{{ post.title }}</strong>
                    <span class="post-state" style="float:right">{{ post.kategori }}</span>
                  </td>
                  <td style="width:120px;text-align:right;color:var(--wp-text-muted);font-size:13px">{{ post.date }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else style="padding:20px;color:var(--wp-text-muted)">Belum ada berita.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'

interface FeedItem { id: number; title: string; link: string; date: string; kategori: string }

const recentEvents = ref<FeedItem[]>([]), recentNews = ref<FeedItem[]>([])
const loadingEvents = ref(true), loadingNews = ref(true), eventError = ref(''), newsError = ref('')
const stats = ref({ eventAktif: 0, totalBerita: 0, totalPanduan: 3 })

const catNames: Record<number, string> = { 27: 'Agenda', 4: 'Berita', 8: 'Kegiatan', 19: 'Pengumuman', 3: 'Artikel', 6: 'Info Pendaftaran', 5: 'Hot News', 16: 'Penelitian', 17: 'Pengabdian' }

function formatDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }

async function fetchFeed(cats: number[], perPage: number): Promise<FeedItem[]> {
  const url = `${SITE.apiBase}/posts?categories=${cats.join(',')}&per_page=${perPage}&orderby=date&order=desc`
  const res = await fetch(url)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const data = await res.json()
  return data.map((p: any) => ({ id: p.id, title: new DOMParser().parseFromString(p.title.rendered, 'text/html').body.textContent || p.title.rendered, link: p.link, date: formatDate(p.date), kategori: catNames[p.categories?.[0]] || 'Umum' }))
}

onMounted(async () => {
  try {
    const [events, news] = await Promise.all([fetchFeed([27, 6, 8], 5), fetchFeed([4, 3, 19, 5], 5)])
    recentEvents.value = events; recentNews.value = news
    stats.value.eventAktif = events.length; stats.value.totalBerita = news.length
  } catch (e: any) { eventError.value = e.message; newsError.value = e.message }
  finally { loadingEvents.value = false; loadingNews.value = false }
})
</script>

<style scoped>
.dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 4px; }
.dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }

.stat-box { text-align: center; padding: 20px 12px; }
.stat-num { font-size: 28px; font-weight: 700; color: var(--wp-primary); line-height: 1.2; }
.stat-label { font-size: 13px; color: var(--wp-text-secondary); margin-top: 4px; }

.notice.inline { margin: 12px 0 0; }

@media (max-width: 700px) { .dash-grid-3, .dash-grid-2 { grid-template-columns: 1fr; } }
</style>
