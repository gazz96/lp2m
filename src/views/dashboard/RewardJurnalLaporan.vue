<template>
  <div class="wrap reward-report-page">
    <div class="page-heading">
      <div>
        <span class="eyebrow">LP2M · Administrasi</span>
        <h1>Laporan Reward Jurnal</h1>
        <p>Rekap pengajuan reward publikasi dosen (artikel, buku, HAKI, seminar) dari form publik.</p>
      </div>
      <div class="heading-count"><strong>{{ total }}</strong><span>Total pengajuan</span></div>
    </div>

    <nav class="status-filters" aria-label="Filter jenis karya">
      <li><a :class="{current:jenisFilter===''}" @click.prevent="jenisFilter=''" href="#">Semua <span class="count">({{ items.length }})</span></a></li>
      <li v-for="j in JENIS_TABS" :key="j.value">
        <a :class="{current:jenisFilter===j.value}" @click.prevent="jenisFilter=j.value" href="#">{{ j.label }} <span class="count">({{ byJenis[j.value]||0 }})</span></a>
      </li>
    </nav>

    <!-- Toolbar: rentang tanggal + export PDF -->
    <section class="toolbar-card" aria-label="Filter periode dan export">
      <div class="toolbar-grid">
        <div class="field-group">
          <label>Dari Tanggal</label>
          <input type="date" class="components-text-control__input" v-model="exp.dari" />
        </div>
        <div class="field-group">
          <label>Sampai Tanggal</label>
          <input type="date" class="components-text-control__input" v-model="exp.sampai" />
        </div>
        <div class="field-group">
          <label>Filter Jenis (PDF)</label>
          <select class="components-select-control__input" v-model="exp.jenis">
            <option value="">Semua Jenis</option>
            <option v-for="j in JENIS_TABS" :key="j.value" :value="j.value">{{ j.label }}</option>
          </select>
        </div>
        <div class="export-action">
          <WpButton variant="primary" :disabled="exporting" @click="exportPdf">
            {{ exporting ? 'Membuat PDF...' : '⬇ Export ke PDF' }}
          </WpButton>
          <div v-if="expMsg" :style="{fontSize:'12px',marginTop:'6px',color: expOk ? '#16a34a' : '#dc2626'}">{{ expMsg }}</div>
        </div>
      </div>
    </section>

    <div class="search-row">
      <label for="reward-search">Cari pengajuan</label>
      <div class="search-control"><span>⌕</span><input id="reward-search" type="search" v-model="search" placeholder="Nama dosen, judul karya, atau nomor registrasi..." /></div>
      <span v-if="search || jenisFilter" class="result-count">{{ filtered.length }} hasil ditemukan</span>
    </div>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
    <div v-else-if="error" class="notice notice-error inline"><p>{{ error }}</p></div>

    <div v-else class="table-scroll">
      <WpTable
        :columns="columns"
        :rows="filtered"
        emptyTitle="Belum ada pengajuan reward."
        emptySub="Data akan muncul setelah ada dosen yang mengajukan via form publik."
        :showFooter="false"
      >
        <template #cell-karya="{ row }">
          <strong>{{ row.judul || '—' }}</strong>
          <div v-if="row.url" style="margin-top:2px">
            <a :href="row.url" target="_blank" rel="noopener" style="color:#2271b1;font-size:12px;word-break:break-all">{{ shortenUrl(row.url) }}</a>
          </div>
        </template>
        <template #cell-_jenis="{ row }">
          <span :style="jenisPillStyle(row.jenis)">{{ row.jenis_label || '-' }}</span>
        </template>
        <template #cell-_status="{ row }">
          <span :style="statusPillStyle(row.status)">{{ STATUS_LABEL[row.status] || row.status }}</span>
        </template>
      </WpTable>
    </div>
  </div>
</template>

<style>
.reward-report-page{max-width:1440px;margin:0 auto;padding-bottom:40px;color:#172033}
.reward-report-page .page-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin:8px 0 24px;padding-bottom:20px;border-bottom:1px solid #e5e7eb}
.reward-report-page .eyebrow{display:block;color:#0f766e;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
.reward-report-page .page-heading h1{margin:0;font-size:clamp(24px,3vw,34px);letter-spacing:-.035em;color:#172033}
.reward-report-page .page-heading p{margin:7px 0 0;color:#64748b;font-size:13px}
.reward-report-page .heading-count{display:grid;gap:2px;text-align:right;color:#64748b;font-size:11px}
.reward-report-page .heading-count strong{font-size:26px;line-height:1;color:#0f766e}
.reward-report-page .status-filters{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 18px;padding:0;list-style:none}
.reward-report-page .status-filters li{margin:0}
.reward-report-page .status-filters a{display:block;padding:7px 12px;border:1px solid #e2e8f0;border-radius:999px;background:#fff;color:#64748b;font-size:12px;text-decoration:none;transition:.18s ease}
.reward-report-page .status-filters a:hover{border-color:#99f6e4;color:#0f766e}
.reward-report-page .status-filters a.current{background:#0f766e;border-color:#0f766e;color:#fff;box-shadow:0 3px 10px #0f766e24}
.reward-report-page .status-filters .count{opacity:.75;font-size:11px}
.reward-report-page .toolbar-card{padding:16px;border:1px solid #dbe3ea;border-radius:12px;background:linear-gradient(135deg,#fff 0%,#f8fbfb 100%);box-shadow:0 4px 16px #17203308;margin-bottom:16px}
.reward-report-page .toolbar-grid{display:grid;grid-template-columns:minmax(150px,1fr) minmax(150px,1fr) minmax(170px,1fr) auto;gap:12px;align-items:end}
.reward-report-page .field-group label{display:block;margin-bottom:5px;color:#64748b;font-size:11px;font-weight:700}
.reward-report-page .field-group input,.reward-report-page .field-group select{width:100%;min-height:36px}
.reward-report-page .export-action{display:flex;align-items:flex-end}
.reward-report-page .export-action button{white-space:nowrap;min-height:36px}
.reward-report-page .search-row{display:flex;align-items:center;gap:12px;margin:20px 0 12px}
.reward-report-page .search-row>label{margin:0;white-space:nowrap;color:#64748b;font-size:11px;font-weight:700}
.reward-report-page .search-control{position:relative;max-width:460px;flex:1}
.reward-report-page .search-control span{position:absolute;left:11px;top:7px;color:#0f766e;font-size:19px}
.reward-report-page .search-control input{width:100%;height:38px;padding:0 12px 0 34px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}
.reward-report-page .result-count{color:#64748b;font-size:11px}
.reward-report-page .table-scroll{overflow-x:auto;border-radius:10px}
.reward-report-page .table-scroll table{min-width:920px}
@media(max-width:760px){
  .reward-report-page .heading-count{display:none}
  .reward-report-page .toolbar-grid{grid-template-columns:1fr 1fr}
  .reward-report-page .export-action{grid-column:1/-1}
  .reward-report-page .search-row{display:block}
  .reward-report-page .search-row>label{margin-bottom:6px}
  .reward-report-page .search-control{max-width:none}
}
@media(max-width:430px){.reward-report-page .toolbar-grid{grid-template-columns:1fr}}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpTable from '@/components/WpTable.vue'
import WpButton from '@/components/WpButton.vue'
import type { WpColumn } from '@/components/WpTable.vue'

const auth = useAuthStore()

interface RewardRow {
  id: number
  reg_no: string
  tanggal: string
  nama_dosen: string
  whatsapp: string
  jenis: string
  jenis_label: string
  kategori: string
  judul: string
  url: string
  status: string
}

const JENIS_TABS = [
  { value: 'artikel', label: 'Artikel/Jurnal' },
  { value: 'buku', label: 'Buku' },
  { value: 'haki', label: 'HAKI' },
  { value: 'seminar', label: 'Seminar' },
] as const

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  reviewed: 'Reviewed',
  approved: 'Approved',
  rejected: 'Rejected',
  done: 'Done',
}

const STATUS_COLOR: Record<string, string> = {
  submitted: '#64748b',
  under_review: '#d97706',
  reviewed: '#0284c7',
  approved: '#16a34a',
  rejected: '#dc2626',
  done: '#7c3aed',
}

const JENIS_COLOR: Record<string, string> = {
  artikel: '#2563eb',
  buku: '#7c3aed',
  haki: '#0d9488',
  seminar: '#d97706',
}

function statusPillStyle(s: string) {
  const c = STATUS_COLOR[s] || '#64748b'
  return { display: 'inline-block', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', color: '#fff', background: c }
}

function jenisPillStyle(j: string) {
  const c = JENIS_COLOR[j] || '#64748b'
  return { display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: c, background: c + '14' }
}

function shortenUrl(u: string) {
  try {
    const p = new URL(u)
    return p.host + (p.pathname.length > 28 ? p.pathname.slice(0, 28) + '…' : p.pathname)
  } catch {
    return u.length > 36 ? u.slice(0, 36) + '…' : u
  }
}

function fmtDate(d: string) {
  if (!d) return '—'
  const date = new Date(d.replace(' ', 'T'))
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const items = ref<RewardRow[]>([])
const loading = ref(true)
const error = ref('')
const total = ref(0)
const search = ref('')
const jenisFilter = ref('')

const columns: WpColumn[] = [
  {
    key: 'pengusul', label: 'Pengusul', primary: true, type: 'html', width: '24%',
    accessor: (r: any) => {
      const reg = r.reg_no ? `<code style="font-size:11px;background:#f1f5f9;padding:1px 5px;border-radius:4px">${r.reg_no}</code><br>` : ''
      const nama = String(r.nama_dosen || '—')
      const wa = r.whatsapp
        ? `<a href="tel:${String(r.whatsapp).replace(/[^0-9+]/g, '')}" style="color:#0ea5e9;text-decoration:none;font-size:12px">${r.whatsapp}</a>`
        : ''
      return `${reg}<strong>${nama}</strong>${wa ? `<br><span style="font-size:12px">${wa}</span>` : ''}`
    },
  },
  { key: 'karya', label: 'Karya', type: 'html', width: '30%', accessor: () => '' },
  { key: 'kategori', label: 'Kategori', type: 'text', width: '16%', accessor: (r: any) => r.kategori || '—' },
  { key: '_jenis', label: 'Jenis', type: 'html', width: '12%', accessor: () => '' },
  { key: 'tanggal', label: 'Tanggal', type: 'text', width: '12%', accessor: (r: any) => fmtDate(r.tanggal) },
  { key: '_status', label: 'Status', type: 'html', width: '10%', accessor: () => '' },
]

const filtered = computed(() => {
  let a = [...items.value]
  if (jenisFilter.value) a = a.filter(r => r.jenis === jenisFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    a = a.filter(r =>
      (r.nama_dosen || '').toLowerCase().includes(q) ||
      (r.judul || '').toLowerCase().includes(q) ||
      (r.reg_no || '').toLowerCase().includes(q)
    )
  }
  return a
})

const byJenis = computed(() => {
  const m: Record<string, number> = { artikel: 0, buku: 0, haki: 0, seminar: 0 }
  items.value.forEach(r => { if (r.jenis in m) m[r.jenis]++ })
  return m
})

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const r = await fetch(`${base}/lp2m/v1/reward-jurnal/report`, { headers: { ...auth.authHeaders() } })
    if (!r.ok) {
      const j: any = await r.json().catch(() => null)
      throw new Error(j?.message || 'HTTP ' + r.status)
    }
    const json = await r.json()
    if (!json.success) throw new Error(json.message || 'Gagal memuat laporan')
    items.value = json.data || []
    total.value = json.total || items.value.length
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat laporan'
  } finally {
    loading.value = false
  }
}

// ── Export PDF (server-side via FPDF, download sebagai blob) ──
const exporting = ref(false)
const expMsg = ref('')
const expOk = ref(false)
const exp = ref({ dari: '', sampai: '', jenis: '' })

async function exportPdf() {
  if (!auth.isLoggedIn) { expMsg.value = 'Sesi berakhir — login ulang dulu.'; expOk.value = false; return }
  exporting.value = true
  expMsg.value = ''
  try {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const url = new URL(`${base}/lp2m/v1/reward-jurnal/report/pdf`)
    if (exp.value.dari) url.searchParams.set('dari', exp.value.dari)
    if (exp.value.sampai) url.searchParams.set('sampai', exp.value.sampai)
    if (exp.value.jenis) url.searchParams.set('jenis', exp.value.jenis)
    const r = await fetch(url.toString(), { headers: { ...auth.authHeaders() } })
    const ct = r.headers.get('content-type') || ''
    if (!r.ok || !ct.includes('application/pdf')) {
      const j: any = await r.json().catch(() => null)
      throw new Error(j?.message || `Gagal membuat PDF (HTTP ${r.status})`)
    }
    const blob = await r.blob()
    if (blob.size < 100) throw new Error('PDF kosong — tidak ada data.')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'LP2M-Reward-Jurnal.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    expMsg.value = '✓ PDF laporan didownload'
    expOk.value = true
  } catch (e: any) {
    expMsg.value = e.message || 'Export PDF gagal'
    expOk.value = false
  } finally {
    exporting.value = false
  }
}

onMounted(() => fetchData())
</script>
