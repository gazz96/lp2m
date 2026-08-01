<template>
  <div>
    <h1>📘 Panduan & Template</h1>
    <p class="subtitle">Timeline, panduan penulisan proposal, dan template dokumen yang dapat diunduh.</p>

    <!-- Timeline -->
    <div class="dash-card">
      <h3>📅 Timeline Event Hibah Aktif</h3>
      <div v-if="loading" class="loading-text">Memuat timeline...</div>
      <div v-else-if="error" class="error-text">{{ error }}</div>
      <div v-else-if="timeline.length === 0" class="empty-text">Belum ada timeline. Silakan tambahkan melalui admin WordPress → Hibah LP2M.</div>
      <div v-else class="timeline-vert">
        <div v-for="(item, idx) in timeline" :key="idx" class="tl-item">
          <div class="tl-marker" :class="{ done: idx < 2 }">{{ idx + 1 }}</div>
          <div class="tl-content">
            <div class="tl-date">{{ item.date }}</div>
            <div class="tl-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panduan penulisan -->
    <div v-if="loading" class="loading-text" style="text-align:left">Memuat panduan...</div>
    <div v-else-if="panduan.length > 0">
      <div class="dash-grid-2" style="margin-top:20px">
        <div v-for="doc in panduan" :key="doc.title" class="dash-card doc-card">
        <div class="doc-icon">📄</div>
        <h4>{{ doc.title }}</h4>
        <p>{{ doc.desc }}</p>
        <a :href="doc.link" :download="doc.file" class="btn btn-primary doc-btn">
          ⬇ Unduh {{ doc.format }}
        </a>
      </div>
    </div>
    </div>

    <!-- Template proposal -->
    <div class="dash-card" style="margin-top:20px">
      <h3>📝 Template Dokumen</h3>
      <div class="template-list">
        <div v-for="tpl in templates" :key="tpl.title" class="tpl-row">
          <div>
            <strong>{{ tpl.title }}</strong>
            <p>{{ tpl.desc }}</p>
          </div>
          <a :href="tpl.link" :download="tpl.file" class="btn btn-outline tpl-btn">Unduh</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import type { HibahEvent } from '@/types'

const activeEvent = ref<HibahEvent | null>(null)
const loading = ref(true)
const error = ref('')

const panduan = ref<Array<{ title: string; desc: string; link: string; file: string; format: string }>>([])
const templates = ref<Array<{ title: string; desc: string; link: string; file: string }>>([])
const timeline = ref<Array<{ date: string; label: string }>>([])

onMounted(async () => {
  try {
    // Fetch event hibah terbaru
    const url = `${SITE.apiBase}/hibah?per_page=1&orderby=date&order=desc`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: HibahEvent[] = await res.json()
    if (data.length > 0) {
      activeEvent.value = data[0]
      timeline.value = data[0].timeline_items || []

      // Map file panduan
      if (data[0].file_panduan?.length) {
        panduan.value = data[0].file_panduan.map((url: string, i: number) => {
          const isDocx = url.toLowerCase().endsWith('.docx')
          return {
            title: `Panduan Penulisan Proposal ${i + 1}`,
            desc: 'Format, sistematika, dan ketentuan penulisan proposal hibah LP2M.',
            link: url,
            file: url.split('/').pop() || `panduan-${i + 1}.pdf`,
            format: isDocx ? 'DOCX' : 'PDF'
          }
        })
      }

      // Map file template
      if (data[0].file_template?.length) {
        templates.value = data[0].file_template.map((url: string, i: number) => ({
          title: `Template Proposal ${i + 1}`,
          desc: 'File template siap isi untuk proposal penelitian atau pengabdian.',
          link: url,
          file: url.split('/').pop() || `template-${i + 1}.docx`
        }))
      }

      // Link panduan alternatif
      if (data[0].link_panduan) {
        panduan.value.push({
          title: 'Link Panduan Eksternal',
          desc: 'Dokumen panduan hibah selengkapnya (Google Drive / portal).',
          link: data[0].link_panduan,
          file: 'panduan-eksternal',
          format: 'LINK'
        })
      }
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.timeline-vert { display: flex; flex-direction: column; gap: 0; }
.tl-item { display: flex; gap: 16px; padding: 14px 0; border-top: 1px solid var(--line); align-items: flex-start; }
.tl-item:first-child { border-top: none; }
.tl-marker {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--paper-2); color: var(--ink-soft);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}
.tl-marker.done { background: var(--green-600); color: #fff; }
.tl-date { font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; color: var(--gold-dark); margin-bottom: 2px; }
.tl-label { font-size: 0.88rem; color: var(--ink); }

.doc-card { text-align: left; }
.doc-icon { font-size: 1.8rem; margin-bottom: 10px; }
.doc-card h4 { font-size: 0.95rem; margin-bottom: 6px; }
.doc-card p { font-size: 0.82rem; color: var(--ink-soft); margin-bottom: 14px; }
.doc-btn { font-size: 0.85rem; padding: 10px 18px; }

.template-list { display: flex; flex-direction: column; gap: 14px; }
.tpl-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--line); }
.tpl-row:last-child { border-bottom: none; padding-bottom: 0; }
.tpl-row strong { font-size: 0.9rem; color: var(--green-800); }
.tpl-row p { font-size: 0.8rem; color: var(--ink-soft); margin: 2px 0 0; }
.tpl-btn { font-size: 0.82rem; padding: 8px 16px; white-space: nowrap; }
.loading-text, .empty-text, .error-text { color: var(--ink-soft); font-size: 0.88rem; padding: 16px 0; }
.error-text { color: var(--rust); }
</style>
