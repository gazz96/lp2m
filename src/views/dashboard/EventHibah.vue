<template>
  <div>
    <h1>📋 Event & Hibah</h1>
    <p class="subtitle">Event hibah internal & eksternal LP2M — sumber data: itsi.ac.id</p>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        :class="{ active: activeTab === tab.key }" class="tab-btn">
        {{ tab.label }}
      </button>
    </div>
    <!-- Loading / error -->
    <div v-if="loading" class="loading-text">Memuat data event...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>

    <!-- Event list -->
    <div v-else class="event-grid">
      <div v-for="post in filteredPosts" :key="post.id" class="event-card">
        <div class="event-header">
          <span class="event-cat">{{ post.kategori }}</span>
          <span class="event-date">{{ post.date }}</span>
        </div>
        <h4>{{ post.title }}</h4>
        <p>{{ post.excerpt }}</p>
        <a :href="post.link" target="_blank" class="btn btn-outline event-btn">Lihat Detail</a>
      </div>
      <div v-if="filteredPosts.length === 0" class="empty-text">
        Tidak ada event dalam kategori ini.
      </div>
    </div>

    <!-- Form pendaftaran hibah -->
    <div class="dash-card" style="margin-top:32px">
      <h3>📝 Form Pendaftaran Hibah</h3>
      <HibahFormEmbed :hibah-id="selectedHibahId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SITE } from '@/data'
import type { HibahEvent } from '@/types'
import HibahFormEmbed from '@/views/dashboard/HibahFormEmbed.vue'

interface EventPost {
  id: number
  title: string
  link: string
  date: string
  excerpt: string
  kategori: string
  catId: number
  tags: string[]
}

const posts = ref<EventPost[]>([])
const loading = ref(true)
const error = ref('')
const activeTab = ref('all')
const selectedHibahId = ref<number | null>(null)

const tabs = ref([{ key: 'all', label: 'Semua' }])

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const filteredPosts = computed(() => {
  if (activeTab.value === 'all') return posts.value
  return posts.value.filter(p => p.tags.includes(activeTab.value))
})

onMounted(async () => {
  try {
    const url = `${SITE.apiBase}/hibah?per_page=30&orderby=date&order=desc&_fields=id,title,link,date,kategori_hibah,jenis_hibah_names,model_hibah_names`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: HibahEvent[] = await res.json()
    if (data.length > 0) {
      selectedHibahId.value = data[0].id
    }
    posts.value = data.map((p: HibahEvent) => ({
      id: p.id,
      title: new DOMParser().parseFromString(p.title.rendered, 'text/html').body.textContent || '',
      link: p.link,
      date: formatDate(p.date),
      excerpt: p.kategori_hibah || p.model_hibah_names?.join(', ') || p.jenis_hibah_names?.join(', ') || '',
      kategori: p.jenis_hibah_names?.[0] || '',
      catId: p.id,
      tags: [...(p.jenis_hibah_names || []), ...(p.model_hibah_names || [])]
    }))
    // Build tabs from unique jenis_hibah_names
    const jenisSet = new Set<string>()
    data.forEach(p => (p.jenis_hibah_names || []).forEach(n => jenisSet.add(n)))
    tabs.value = [
      { key: 'all', label: 'Semua' },
      ...Array.from(jenisSet).map(n => ({ key: n, label: n }))
    ]
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
}
.tab-btn:hover { border-color: var(--gold); color: var(--green-800); }
.tab-btn.active { background: var(--green-700); color: #fff; border-color: var(--green-700); }

.event-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.event-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 22px;
  display: flex;
  flex-direction: column;
}
.event-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.event-cat {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gold-dark);
  background: var(--gold-soft);
  padding: 3px 8px;
  border-radius: 4px;
}
.event-date { font-size: 0.76rem; color: var(--ink-soft); }
.event-card h4 { font-size: 0.95rem; margin-bottom: 8px; line-height: 1.3; color: var(--green-800); }
.event-card p { font-size: 0.83rem; color: var(--ink-soft); flex: 1; margin-bottom: 14px; }
.event-btn { font-size: 0.82rem; padding: 8px 16px; align-self: flex-start; }

.loading-text, .empty-text { color: var(--ink-soft); font-size: 0.9rem; padding: 32px 0; }
.error-text { color: var(--rust); font-size: 0.9rem; padding: 16px 0; }

@media (max-width: 800px) {
  .event-grid { grid-template-columns: 1fr; }
}
</style>
