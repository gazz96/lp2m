<template>
  <div>
    <h1>📋 Lihat Hibah</h1>
    <p class="subtitle">Event hibah yang sudah dipublikasikan di itsi.ac.id.</p>

    <div v-if="loading" class="loading-text">Memuat...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else class="card-list">
      <div v-for="item in items" :key="item.id" class="event-card">
        <div class="ec-header">
          <span v-for="j in (item as any).jenis_hibah_names || []" :key="j" class="badge jenis">{{ j }}</span>
          <span class="badge" :class="(item as any).status_hibah">{{ labelStatus((item as any).status_hibah) }}</span>
        </div>
        <h4>{{ cleanTitle(item.title.rendered) }}</h4>
        <p class="ec-skema">{{ (item as any).model_hibah_names?.join(', ') || (item as any).kategori_hibah || '' }}</p>
        <div v-if="(item as any).sdgs_names?.length" class="ec-tags">
          <span v-for="s in (item as any).sdgs_names" :key="s" class="tag">{{ s }}</span>
        </div>
        <p class="ec-deadline" v-if="(item as any).deadline_label">
          🗓 Deadline: {{ (item as any).deadline_label }}
        </p>
        <a :href="'https://itsi.ac.id/hibah/' + item.slug" target="_blank" class="btn btn-outline btn-sm">
          Buka di ITSI →
        </a>
      </div>
      <div v-if="items.length === 0 && !loading" class="empty">Belum ada event hibah.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'

const items = ref<any[]>([])
const loading = ref(true)
const error = ref('')

function cleanTitle(raw: string) { return new DOMParser().parseFromString(raw, 'text/html').body.textContent || raw }
function labelStatus(v: string) { return { aktif: 'Aktif', ditutup: 'Ditutup', arsip: 'Arsip' }[v] || v }

onMounted(async () => {
  try {
    const res = await fetch(`${SITE.apiBase}/hibah?per_page=30&status=publish&orderby=date&order=desc`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    items.value = await res.json()
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
})
</script>

<style scoped>
.card-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
.event-card { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 20px; }
.ec-header { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; }
.badge.jenis { background: #e3f2fd; color: #1565c0; }
.badge.aktif { background: #e8f5e9; color: #2e7d32; }
.badge.ditutup { background: #fff3e0; color: #e65100; }
.badge.arsip { background: var(--paper-2); color: var(--ink-soft); }
.event-card h4 { font-size: 0.95rem; color: var(--green-800); margin-bottom: 8px; }
.ec-skema { font-size: 0.82rem; color: var(--ink-soft); margin-bottom: 8px; }
.ec-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
.ec-tags .tag { background: var(--gold-soft); color: var(--gold-dark); font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; }
.ec-deadline { font-size: 0.8rem; color: var(--ink-soft); margin-bottom: 12px; }
.btn-sm { padding: 6px 14px; font-size: 0.8rem; }
.empty { color: var(--ink-soft); padding: 24px 0; }
.loading-text, .error-text { padding: 24px 0; color: var(--ink-soft); }
@media (max-width: 700px) { .card-list { grid-template-columns: 1fr; } }
</style>
