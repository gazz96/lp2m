<template>
  <div>
    <div class="page-head">
      <h1>Hibah</h1>
      <router-link to="/dashboard/hibah/tambah" class="btn btn-primary">+ Tambah Hibah</router-link>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" v-model="search" placeholder="Cari judul hibah..." class="search-inp" />
      </div>
      <select v-model="statusFilter" class="filter-sel">
        <option value="any">Semua Status</option>
        <option value="publish">Terbit</option>
        <option value="draft">Draft</option>
      </select>
      <span class="total-hint" v-if="total">{{ total }} hibah</span>
    </div>

    <div v-if="loading" class="loading-state">Memuat data...</div>

    <div v-else class="table-card">
      <table>
        <thead>
          <tr>
            <th class="sortable" @click="tsort('title')">
              Judul <span class="sort-arrow">{{ sl('title') }}</span>
            </th>
            <th>Kategori</th>
            <th>Skema</th>
            <th class="sortable" @click="tsort('date')">
              Tanggal <span class="sort-arrow">{{ sl('date') }}</span>
            </th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.id" :class="{ 'is-draft': row.status === 'draft' }">
            <td>
              <div class="td-title">{{ row._title || '(tanpa judul)' }}</div>
              <div class="td-actions">
                <router-link :to="'/dashboard/hibah/' + row.id">Edit</router-link>
                <span class="act-sep">·</span>
                <a :href="'https://itsi.ac.id/?p=' + row.id + '&preview=true'" target="_blank">Lihat</a>
              </div>
            </td>
            <td>
              <span v-if="row._cats.length" class="pill-list">
                <span v-for="c in row._cats" :key="c" class="pill">{{ c }}</span>
              </span>
              <span v-else class="empty-val">—</span>
            </td>
            <td>
              <span v-if="row._skms.length" class="pill-list">
                <span v-for="s in row._skms" :key="s" class="pill">{{ s }}</span>
              </span>
              <span v-else class="empty-val">—</span>
            </td>
            <td class="td-date">{{ row._date }}</td>
            <td>
              <span class="status-badge" :class="row.status">
                {{ row.status === 'publish' ? 'Terbit' : 'Draft' }}
              </span>
            </td>
            <td class="td-nav">
              <router-link :to="'/dashboard/hibah/' + row.id" class="nav-arrow">→</router-link>
            </td>
          </tr>
          <tr v-if="!filtered.length && !loading">
            <td colspan="6" class="empty-row">
              <div class="empty-title">Belum ada hibah</div>
              <div class="empty-sub">Klik "Tambah Hibah" untuk membuat event pertama.</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="total > perPage" class="pager">
        <button :disabled="page <= 1" @click="load(page - 1)" class="pg-btn">← Sebelumnya</button>
        <span class="pg-info">Halaman {{ page }} dari {{ Math.ceil(total / perPage) }}</span>
        <button :disabled="page * perPage >= total" @click="load(page + 1)" class="pg-btn">Selanjutnya →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SITE } from '@/data'
type Row = { id: number; slug: string; status: string; date: string; title: { rendered: string }; kategori_hibah: number[]; skema_hibah: number[]; _title: string; _date: string; _cats: string[]; _skms: string[] }
const items = ref<Row[]>([]), loading = ref(true), total = ref(0), page = ref(1), perPage = 20
const search = ref(''), statusFilter = ref('any')
const sk = ref<'title' | 'date'>('date'), sd = ref<'asc' | 'desc'>('desc')
const kTerms = ref<{ id: number; name: string }[]>([]), sTerms = ref<{ id: number; name: string }[]>([])

function clean(s: string) { return new DOMParser().parseFromString(s, 'text/html').body.textContent || '' }
function fmt(d: string) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
function tsort(k: 'title' | 'date') { if (sk.value === k) sd.value = sd.value === 'asc' ? 'desc' : 'asc'; else { sk.value = k; sd.value = 'desc' } }
function sl(k: string) { return sk.value === k ? (sd.value === 'asc' ? '↑' : '↓') : '↕' }

const filtered = computed(() => {
  let a = [...items.value]
  if (statusFilter.value !== 'any') a = a.filter(r => r.status === statusFilter.value)
  if (search.value.trim()) { const q = search.value.toLowerCase(); a = a.filter(r => r._title.toLowerCase().includes(q)) }
  a.sort((x, y) => { const vx = sk.value === 'title' ? x._title : x.date; const vy = sk.value === 'title' ? y._title : y.date; return sd.value === 'desc' ? vy.localeCompare(vx) : vx.localeCompare(vy) })
  return a
})

async function loadTerms() {
  try {
    const [k, s] = await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`), window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100`)])
    if (k.ok) kTerms.value = await k.json()
    if (s.ok) sTerms.value = await s.json()
  } catch { }
}

async function load(p = 1) {
  loading.value = true
  try {
    const r = await window.fetch(`${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=date&order=desc&_fields=id,slug,status,date,title,kategori_hibah,skema_hibah`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const raw = await r.json()
    items.value = raw.map((p: any) => ({ ...p, _title: clean(p.title?.rendered || ''), _date: fmt(p.date), _cats: (p.kategori_hibah || []).map((id: number) => kTerms.value.find(t => t.id === id)?.name || '').filter(Boolean), _skms: (p.skema_hibah || []).map((id: number) => sTerms.value.find(t => t.id === id)?.name || '').filter(Boolean) }))
    total.value = parseInt(r.headers.get('X-WP-Total') || '0')
    page.value = p
  } catch (e: any) { } finally { loading.value = false }
}

onMounted(async () => { await loadTerms(); load() })
</script>

<style scoped>
/* ── Header ── */
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-head h1 { font-size: 1.5rem; font-weight: 700; color: var(--ink); margin: 0; }
.btn { padding: 10px 22px; border-radius: 6px; border: none; font-size: 0.92rem; font-family: inherit; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-block; }
.btn-primary { background: var(--green-700); color: #fff; }
.btn-primary:hover { background: var(--green-800); }

/* ── Toolbar ── */
.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
.search-wrap { flex: 1; max-width: 360px; position: relative; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: var(--ink-soft); pointer-events: none; }
.search-inp { width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px 10px 40px; font-family: inherit; font-size: 0.95rem; color: var(--ink); outline: none; background: var(--card); }
.search-inp:focus { border-color: var(--green-600); box-shadow: 0 0 0 3px rgba(47,107,79,0.1); }
.filter-sel { border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; font-family: inherit; font-size: 0.92rem; color: var(--ink); background: var(--card); outline: none; cursor: pointer; }
.total-hint { font-size: 0.86rem; color: var(--ink-soft); white-space: nowrap; }

/* ── Table Card ── */
.table-card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 14px 20px; border-bottom: 2px solid var(--line); font-size: 0.84rem; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.04em; background: var(--paper-2); user-select: none; }
td { padding: 16px 20px; border-bottom: 1px solid var(--line); font-size: 0.94rem; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #f8faf8; }
tr.is-draft td { background: #fffdf5; }
tr.is-draft:hover td { background: #fef9e7; }

.sortable { cursor: pointer; }
.sortable:hover { color: var(--green-600); }
.sort-arrow { font-size: 0.7rem; margin-left: 3px; opacity: 0.5; }

/* ── Cells ── */
.td-title { font-size: 0.98rem; font-weight: 600; color: var(--green-800); margin-bottom: 5px; line-height: 1.3; }
.td-actions { display: flex; gap: 2px; align-items: center; font-size: 0.82rem; }
.td-actions a { color: var(--green-700); text-decoration: none; }
.td-actions a:hover { text-decoration: underline; }
.act-sep { color: var(--line); margin: 0 4px; }

.pill-list { display: flex; flex-wrap: wrap; gap: 4px; }
.pill { display: inline-block; padding: 3px 10px; background: #f0f4f0; color: var(--green-800); border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
.empty-val { color: var(--ink-soft); font-size: 0.85rem; }

.td-date { color: var(--ink-soft); font-size: 0.88rem; white-space: nowrap; }

.status-badge { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.status-badge.publish { background: #e8f5e9; color: #2e7d32; }
.status-badge.draft { background: #f5f5f5; color: #777; }

.td-nav { width: 40px; text-align: right; }
.nav-arrow { color: var(--line); text-decoration: none; font-size: 1.1rem; }
tr:hover .nav-arrow { color: var(--green-600); }

/* ── Empty ── */
.empty-row { text-align: center; }
.empty-row td { padding: 60px 20px; }
.empty-title { font-size: 1.1rem; font-weight: 600; color: var(--ink-soft); margin-bottom: 6px; }
.empty-sub { font-size: 0.92rem; color: var(--ink-soft); }

/* ── Pager ── */
.pager { display: flex; justify-content: center; align-items: center; gap: 20px; padding: 16px 20px; border-top: 1px solid var(--line); background: var(--paper-2); }
.pg-btn { padding: 8px 18px; border: 1px solid var(--line); border-radius: 6px; background: var(--card); color: var(--ink); font-family: inherit; font-size: 0.88rem; cursor: pointer; }
.pg-btn:hover:not(:disabled) { background: var(--paper-1); border-color: var(--green-600); }
.pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pg-info { font-size: 0.88rem; color: var(--ink-soft); }

/* ── Loading ── */
.loading-state { text-align: center; padding: 60px 20px; font-size: 1rem; color: var(--ink-soft); }
</style>
