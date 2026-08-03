<template>
  <div>
    <div class="page-head">
      <h1>Hibah</h1>
      <router-link to="/dashboard/hibah/tambah" class="btn btn-primary">+ Tambah Hibah</router-link>
    </div>

    <div class="toolbar">
      <input type="text" v-model="search" placeholder="Cari judul..." class="search-inp" />
      <select v-model="statusFilter" class="filter-sel">
        <option value="any">Semua Status</option>
        <option value="publish">Terbit</option>
        <option value="draft">Draft</option>
      </select>
      <span class="count" v-if="total">{{ total }} hibah</span>
    </div>

    <div v-if="loading" class="loading-text">Memuat...</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="sortable" @click="tsort('title')">Judul {{ sl('title') }}</th>
            <th>Kategori</th>
            <th>Skema</th>
            <th class="sortable" @click="tsort('date')">Tanggal {{ sl('date') }}</th>
            <th>Status</th>
            <th class="act-col">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.id" :class="{ draft: row.status === 'draft' }">
            <td class="title-cell">
              <strong>{{ row._title || '(tanpa judul)' }}</strong>
              <div class="row-acts">
                <router-link :to="'/dashboard/hibah/' + row.id">Edit</router-link>
                <span class="sep">|</span>
                <a :href="'https://itsi.ac.id/?p=' + row.id + '&preview=true'" target="_blank">Lihat</a>
              </div>
            </td>
            <td>
              <span v-if="row._cats.length" class="tag-sm" v-for="c in row._cats" :key="c">{{ c }}</span>
              <span v-else class="hint">—</span>
            </td>
            <td>
              <span v-if="row._skms.length" class="tag-sm" v-for="s in row._skms" :key="s">{{ s }}</span>
              <span v-else class="hint">—</span>
            </td>
            <td class="date-cell">{{ row._date }}</td>
            <td><span class="badge" :class="row.status">{{ row.status === 'publish' ? 'Terbit' : 'Draft' }}</span></td>
            <td class="act-cell">
              <router-link :to="'/dashboard/hibah/' + row.id" class="btn-sm btn-edit">Edit</router-link>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="6" class="empty">Belum ada hibah.</td>
          </tr>
        </tbody>
      </table>
      <div v-if="total > perPage" class="pager">
        <button :disabled="page <= 1" @click="load(page - 1)">← Prev</button>
        <span>Hal {{ page }} / {{ Math.ceil(total / perPage) }}</span>
        <button :disabled="page * perPage >= total" @click="load(page + 1)">Next →</button>
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
function sl(k: string) { return sk.value === k ? (sd.value === 'asc' ? '↑' : '↓') : '' }
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
    if (k.ok) kTerms.value = await k.json(); if (s.ok) sTerms.value = await s.json()
  } catch { }
}
async function load(p = 1) {
  loading.value = true
  try {
    const r = await window.fetch(`${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=date&order=desc&_fields=id,slug,status,date,title,kategori_hibah,skema_hibah`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const raw = await r.json()
    items.value = raw.map((p: any) => ({ ...p, _title: clean(p.title?.rendered || ''), _date: fmt(p.date), _cats: (p.kategori_hibah || []).map((id: number) => kTerms.value.find(t => t.id === id)?.name || '').filter(Boolean), _skms: (p.skema_hibah || []).map((id: number) => sTerms.value.find(t => t.id === id)?.name || '').filter(Boolean) }))
    total.value = parseInt(r.headers.get('X-WP-Total') || '0'); page.value = p
  } catch (e: any) { } finally { loading.value = false }
}
onMounted(async () => { await loadTerms(); load() })
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-head h1 { font-size: 1.3rem; margin: 0; }
.toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.search-inp { border: 1px solid var(--line); border-radius: 4px; padding: 6px 10px; font-size: .84rem; font-family: inherit; width: 220px; outline: none; }
.filter-sel { border: 1px solid var(--line); border-radius: 4px; padding: 6px 8px; font-size: .8rem; }
.count { font-size: .8rem; color: var(--ink-soft); }

.table-wrap { background: var(--card); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-top: 0; }
table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
th { text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--line); color: var(--ink-soft); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; }
td { padding: 12px; border-bottom: 1px solid var(--line); }
tr.draft td { background: #fff9e6; }
tr:hover td { background: var(--paper-2); }
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: var(--green-600); }

.title-cell strong { color: var(--green-800); display: block; }
.row-acts { font-size: .72rem; color: var(--ink-soft); margin-top: 4px; }
.row-acts a { color: var(--green-700); text-decoration: none; }
.row-acts a:hover { text-decoration: underline; }
.sep { color: var(--line); margin: 0 3px; }
.tag-sm { display: inline-block; padding: 2px 8px; margin: 2px; background: var(--paper-2); border-radius: 10px; font-size: .72rem; color: var(--ink-soft); }
.hint { font-size: .8rem; color: var(--ink-soft); }
.date-cell { font-size: .82rem; color: var(--ink-soft); white-space: nowrap; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: .72rem; font-weight: 600; text-transform: uppercase; }
.badge.publish { background: #e8f5e9; color: #2e7d32; }
.badge.draft { background: var(--paper-2); color: var(--ink-soft); }
.act-col { width: 70px; }
.act-cell { display: flex; gap: 6px; }
.btn-sm { padding: 5px 12px; font-size: .76rem; border-radius: 4px; border: 1px solid var(--line); cursor: pointer; font-family: inherit; background: var(--card); }
.btn-edit { color: var(--green-700); border-color: var(--green-600); text-decoration: none; }
.btn-edit:hover { background: var(--green-100); }
.empty { text-align: center; padding: 30px; color: var(--ink-soft); }
.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; padding: 10px 12px; border-top: 1px solid var(--line); font-size: .84rem; color: var(--ink-soft); background: var(--paper-2); }
.pager button { padding: 6px 14px; }
.loading-text { color: var(--ink-soft); padding: 24px 0; }
</style>
