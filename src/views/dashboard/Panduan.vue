<template>
  <div>
    <h1>📘 Panduan & Template</h1>
    <p class="subtitle">Timeline, panduan penulisan proposal, dan template dokumen yang dapat diunduh.</p>

    <!-- Timeline -->
    <div class="dash-card">
      <h3>📅 Timeline Event Hibah Aktif</h3>
      <div class="timeline-vert">
        <div v-for="(item, idx) in HIBAH.banner.timeline" :key="idx" class="tl-item">
          <div class="tl-marker" :class="{ done: idx < 2 }">{{ idx + 1 }}</div>
          <div class="tl-content">
            <div class="tl-date">{{ item.date }}</div>
            <div class="tl-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panduan penulisan -->
    <div class="dash-grid-2">
      <div v-for="doc in panduan" :key="doc.title" class="dash-card doc-card">
        <div class="doc-icon">📄</div>
        <h4>{{ doc.title }}</h4>
        <p>{{ doc.desc }}</p>
        <a :href="doc.link" :download="doc.file" class="btn btn-primary doc-btn">
          ⬇ Unduh {{ doc.format }}
        </a>
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
import { HIBAH } from '@/data'

const panduan = [
  {
    title: 'Panduan Penulisan Proposal Penelitian',
    desc: 'Format, sistematika, dan ketentuan penulisan proposal penelitian hibah internal LP2M.',
    link: '#', file: 'panduan-proposal-penelitian.docx', format: 'DOCX'
  },
  {
    title: 'Panduan Penulisan Proposal Pengabdian',
    desc: 'Pedoman penyusunan proposal pengabdian masyarakat berbasis desa binaan.',
    link: '#', file: 'panduan-proposal-pengabdian.docx', format: 'DOCX'
  },
  {
    title: 'Buku Pedoman Hibah Internal 2026',
    desc: 'Dokumen lengkap skema, ketentuan, dan alur hibah internal LP2M ITSI.',
    link: '#', file: 'buku-pedoman-hibah-2026.pdf', format: 'PDF'
  },
  {
    title: 'Template RAB & Justifikasi Anggaran',
    desc: 'Template rencana anggaran biaya dan justifikasi untuk semua skema hibah.',
    link: '#', file: 'template-rab.xlsx', format: 'XLSX'
  }
]

const templates = [
  {
    title: 'Template Proposal Penelitian (.docx)',
    desc: 'File template siap isi untuk proposal penelitian.',
    link: '#', file: 'template-proposal-penelitian.docx'
  },
  {
    title: 'Template Proposal Pengabdian (.docx)',
    desc: 'File template siap isi untuk proposal pengabdian.',
    link: '#', file: 'template-proposal-pengabdian.docx'
  },
  {
    title: 'Template Laporan Kemajuan (.docx)',
    desc: 'Format laporan kemajuan penelitian dan pengabdian.',
    link: '#', file: 'template-laporan-kemajuan.docx'
  },
  {
    title: 'Template Laporan Akhir (.docx)',
    desc: 'Format laporan akhir untuk semua skema hibah.',
    link: '#', file: 'template-laporan-akhir.docx'
  }
]
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
</style>
