<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div class="hibah-archive-page">
      <!-- Header -->
      <div class="blog-hero">
        <div class="wrap">
          <div class="eyebrow">Hibah &amp; Agenda</div>
          <h1>Hibah Internal</h1>
          <p class="blog-sub">Daftar skema hibah penelitian dan pengabdian yang dibuka LP2M ITSI.</p>
        </div>
      </div>

      <div class="wrap">
        <div v-if="loading" class="hibah-grid">
          <SkeletonBlock v-for="i in 6" :key="i" variant="card" style="margin-bottom:8px" />
        </div>
        <div v-else-if="error" class="hibah-error">{{ error }}</div>
        <div v-else-if="!hibahs.length" class="hibah-empty">Belum ada hibah yang dibuka. Silakan cek kembali nanti.</div>
        <div v-else class="hibah-grid">
          <router-link v-for="h in hibahs" :key="h.id" :to="`/hibah/${h.slug}`" class="hibah-card">
            <div class="hibah-thumb" :style="thumbStyle(h)">
              <span class="hibah-cat">{{ h.category_names?.join(', ') || 'Hibah' }}</span>
              <span v-if="statusBadge(h)" class="hibah-badge" :class="statusClass(h)">{{ statusLabel(h) }}</span>
            </div>
            <div class="hibah-body">
              <div class="date">{{ fmtDate(h.date) }}</div>
              <h4 v-html="cleanTitle(h.title?.rendered)"></h4>
              <div class="hibah-meta">
                <span v-if="h.deadline_label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Deadline: {{ h.deadline_label }}
                </span>
                <span v-if="h.dana_maks">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>
                  Dana maks: {{ fmtDana(h.dana_maks) }}
                </span>
              </div>
              <span class="rd">Lihat Detail &amp; Daftar &rarr;</span>
            </div>
          </router-link>
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
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const base = SITE.apiBase.replace('/wp/v2', '')
const PER_PAGE = 9

const hibahs = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const r = await fetch(
      `${base}/wp/v2/hibah?per_page=${PER_PAGE}&page=${page.value}&orderby=date&order=desc&_fields=id,date,title,slug,thumbnail_url,category_names,deadline_label,dana_maks,status_hibah`
    )
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    totalPages.value = Number(r.headers.get('X-WP-TotalPages') || '1')
    hibahs.value = await r.json()
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat daftar hibah.'
    hibahs.value = []
  } finally {
    loading.value = false
  }
}

function goPage(n: number) {
  page.value = n
  load()
  window.scrollTo({ top: 300, behavior: 'smooth' })
}

function fmtDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function cleanTitle(title: string) {
  const doc = new DOMParser().parseFromString(title || '', 'text/html')
  return doc.body.textContent || title || ''
}

function fmtDana(v: string | number) {
  const n = Number(v)
  if (!n) return ''
  return 'Rp ' + n.toLocaleString('id-ID')
}

function thumbStyle(h: any) {
  if (h.thumbnail_url) {
    return { backgroundImage: `url(${h.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return {}
}

const STATUS_LABEL: Record<string, string> = {
  open: 'Dibuka',
  closed: 'Ditutup',
  draft: 'Draft',
  announced: 'Diumumkan'
}

function statusBadge(h: any) {
  return h.status_hibah && h.status_hibah !== 'draft'
}

function statusLabel(h: any) {
  return STATUS_LABEL[h.status_hibah] || h.status_hibah
}

function statusClass(h: any) {
  return {
    'is-closed': h.status_hibah === 'closed',
    'is-announced': h.status_hibah === 'announced'
  }
}

onMounted(load)
</script>

<style scoped>
.hibah-archive-page { padding-bottom: 80px; }
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

.hibah-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.hibah-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.hibah-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.hibah-thumb {
  height: 170px;
  background: linear-gradient(135deg, var(--green-600), var(--green-800));
  position: relative;
}
.hibah-cat {
  position: absolute;
  bottom: 12px;
  left: 16px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold-soft);
}
.hibah-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--gold);
  color: var(--green-900);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.hibah-badge.is-closed { background: #b0b7b1; color: #fff; }
.hibah-badge.is-announced { background: var(--green-600); color: #fff; }

.hibah-body { padding: 20px 22px; flex: 1; display: flex; flex-direction: column; }
.hibah-body .date { font-size: 0.74rem; color: var(--ink-soft); margin-bottom: 8px; }
.hibah-body h4 { font-size: 1.02rem; margin-bottom: 12px; line-height: 1.35; }
.hibah-meta { display: grid; gap: 8px; margin-bottom: 16px; }
.hibah-meta span {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.hibah-meta svg { flex-shrink: 0; color: var(--gold-dark); }
.hibah-body .rd { font-size: 0.82rem; font-weight: 600; color: var(--green-700); margin-top: auto; }

.hibah-error, .hibah-empty { text-align: center; padding: 60px 0; color: var(--ink-soft); }
.hibah-error { color: var(--rust); }

.blog-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 44px;
}
.page-info { font-size: 0.86rem; color: var(--ink-soft); }
.btn.is-small { padding: 9px 18px; font-size: 0.85rem; }

@media (max-width: 980px) {
  .hibah-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .hibah-grid { grid-template-columns: 1fr; }
}
</style>
