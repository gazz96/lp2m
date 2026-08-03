<template>
  <div>
    <h1>📰 Lihat Artikel</h1>
    <p class="subtitle">Artikel yang sudah dipublikasikan di itsi.ac.id.</p>

    <div v-if="loading" class="loading-text">Memuat...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else class="card-list">
      <div v-for="item in items" :key="item.id" class="art-card">
        <h4>{{ cleanTitle(item.title.rendered) }}</h4>
        <p class="art-date">{{ fmtDate(item.date) }}</p>
        <p class="art-excerpt" v-html="excerpt(item)"></p>
        <a :href="item.link" target="_blank" class="btn btn-outline btn-sm">
          Buka di ITSI →
        </a>
      </div>
      <div v-if="items.length === 0 && !loading" class="empty">Belum ada artikel.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import type { WpPost } from '@/types'

const items = ref<WpPost[]>([])
const loading = ref(true)
const error = ref('')

function cleanTitle(raw: string) { return new DOMParser().parseFromString(raw, 'text/html').body.textContent || raw }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }
function excerpt(item: WpPost) { return item.excerpt?.rendered || '' }

onMounted(async () => {
  try {
    const res = await fetch(`${SITE.apiBase}/posts?per_page=30&status=publish&orderby=date&order=desc`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    items.value = await res.json()
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<style scoped>
.card-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
.art-card { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 20px; }
.art-card h4 { font-size: 0.95rem; color: var(--green-800); margin-bottom: 6px; }
.art-date { font-size: 0.76rem; color: var(--ink-soft); margin-bottom: 8px; }
.art-excerpt { font-size: 0.84rem; color: var(--ink-soft); line-height: 1.5; margin-bottom: 12px; }
.btn-sm { padding: 6px 14px; font-size: 0.8rem; }
.empty { color: var(--ink-soft); padding: 24px 0; }
.loading-text, .error-text { padding: 24px 0; color: var(--ink-soft); }
@media (max-width: 700px) { .card-list { grid-template-columns: 1fr; } }
</style>
