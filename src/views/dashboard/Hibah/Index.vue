<template>
  <div class="wrap">
    <h1>Hibah <WpButton variant="primary" to="/dashboard/hibah/tambah">Tambah Hibah</WpButton></h1>

    <ul class="subsubsub">
      <li><a :class="{current:statusFilter==='any'}" @click.prevent="statusFilter='any'" href="#">Semua <span class="count">({{ total }})</span></a></li>
      <li><a :class="{current:statusFilter==='publish'}" @click.prevent="statusFilter='publish'" href="#">Terbit</a></li>
      <li><a :class="{current:statusFilter==='draft'}" @click.prevent="statusFilter='draft'" href="#">Draft</a></li>
    </ul>

    <p class="search-box">
      <input type="search" class="components-text-control__input" v-model="search" placeholder="Cari hibah..." style="width:280px" />
    </p>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>

    <WpTable
      v-else
      :columns="tableColumns"
      :rows="filtered"
      :emptyTitle="'Belum ada hibah.'"
      :emptySub="'Klik Tambah Hibah untuk membuat event pertama.'"
      :showFooter="true"
      :initialSortCol="'date'"
      :initialSortDir="'desc'"
      @sort="onSort"
    />

    <div v-if="total>perPage" class="tablenav bottom">
      <div class="displaying-num">{{ total }} item</div>
      <div class="tablenav-pages">
        <span class="pagination-links">
          <a v-if="page>1" @click.prevent="load(page-1)" href="#" class="prev-page">‹</a>
          <span v-for="p in pageNumbers" :key="p">
            <a v-if="p!==page" @click.prevent="load(p)" href="#">{{ p }}</a>
            <span v-else class="current">{{ p }}</span>
          </span>
          <a v-if="page*perPage<total" @click.prevent="load(page+1)" href="#" class="next-page">›</a>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SITE } from '@/data'
import WpTable from '@/components/WpTable.vue'
import WpButton from '@/components/WpButton.vue'
import type { WpColumn } from '@/components/WpTable.vue'

type Row = { id: number; slug: string; status: string; date: string; title: { rendered: string }; kategori_hibah: number[]; model_hibah: number[]; jenis_hibah: number[]; sdgs: number[]; kelompok_keahlian: number[]; _title: string; _date: string; _cats: string[]; _skms: string[]; _jenis: string[]; _sdgs: string[]; _kk: string[]; _status: string; _editLink: string }
const items = ref<Row[]>([]), loading = ref(true), total = ref(0), page = ref(1), perPage = 20
const search = ref(''), statusFilter = ref('any'), sortCol = ref('date'), sortDir = ref<'asc' | 'desc'>('desc')
const kTerms = ref<{ id: number; name: string }[]>([]), sTerms = ref<{ id: number; name: string }[]>([])
const jTerms = ref<{ id: number; name: string }[]>([]), sgTerms = ref<{ id: number; name: string }[]>([]), kkTerms = ref<{ id: number; name: string }[]>([])

function clean(s: string) { return new DOMParser().parseFromString(s, 'text/html').body.textContent || '' }
function fmt(d: string) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }

const filtered = computed(() => {
  let a = [...items.value]
  if (statusFilter.value !== 'any') a = a.filter(r => r.status === statusFilter.value)
  if (search.value.trim()) { const q = search.value.toLowerCase(); a = a.filter(r => r._title.toLowerCase().includes(q)) }
  a.sort((x, y) => {
    const vx = sortCol.value === 'title' ? x._title : x.date
    const vy = sortCol.value === 'title' ? y._title : y.date
    return sortDir.value === 'desc' ? vy.localeCompare(vx) : vx.localeCompare(vy)
  })
  return a
})

const tableColumns = computed<WpColumn[]>(() => [
  {
    key: '_title', label: 'Judul', primary: true, sortable: true,
    accessor: (r) => r._title || '(tanpa judul)',
    rowActions:(r)=>[
      {label:'Edit',className:'edit',to:'/dashboard/hibah/'+r.id},
      {label:'Lihat',className:'view',to:'/hibah/'+r.slug},
    ]
  },
  { key: '_cats', label: 'Kategori', type: 'tags' },
  { key: '_skms', label: 'Model', type: 'tags' },
  { key: '_jenis', label: 'Jenis', type: 'tags' },
  { key: '_sdgs', label: 'SDGs', type: 'tags' },
  { key: '_kk', label: 'Kel. Keahlian', type: 'tags' },
  { key: '_date', label: 'Tanggal', sortable: true, type: 'date', accessor: (r) => r._date },
  { key: '_status', label: 'Status', type: 'badge', accessor: (r) => r.status === 'publish' ? 'Publish' : r.status === 'draft' ? 'Draft' : r.status },
])

function onSort(col: string, dir: 'asc' | 'desc') { sortCol.value = col; sortDir.value = dir }

const pageNumbers = computed(() => { const tp = Math.ceil(total.value / perPage); const n: number[] = []; for (let i = Math.max(1, page.value - 2); i <= Math.min(tp, page.value + 2); i++) n.push(i); return n })

async function loadTerms() { try { const [k, s, j, sg, kk] = await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`), window.fetch(`${SITE.apiBase}/model_hibah?per_page=100`), window.fetch(`${SITE.apiBase}/jenis_hibah?per_page=100`), window.fetch(`${SITE.apiBase}/sdgs?per_page=100`), window.fetch(`${SITE.apiBase}/kelompok_keahlian?per_page=100`)]); if (k.ok) kTerms.value = await k.json(); if (s.ok) sTerms.value = await s.json(); if (j.ok) jTerms.value = await j.json(); if (sg.ok) sgTerms.value = await sg.json(); if (kk.ok) kkTerms.value = await kk.json() } catch { } }

async function load(p = 1) {
  loading.value = true
  try {
    const url = `${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=${sortCol.value === 'date' ? 'date' : 'title'}&order=${sortDir.value}&_fields=id,slug,status,date,title,kategori_hibah,model_hibah,jenis_hibah,sdgs,kelompok_keahlian`
    const r = await window.fetch(url)
    if (!r.ok) throw new Error('HTTP ' + r.status)
    const raw = await r.json()
    items.value = raw.map((p: any) => ({
      ...p,
      _title: clean(p.title?.rendered || ''),
      _date: fmt(p.date),
      _cats: (p.kategori_hibah || []).map((id: number) => kTerms.value.find(t => t.id === id)?.name || '').filter(Boolean),
      _skms: (p.model_hibah || p.skema_hibah || []).map((id: number) => sTerms.value.find(t => t.id === id)?.name || '').filter(Boolean),
      _jenis: (p.jenis_hibah || []).map((id: number) => jTerms.value.find(t => t.id === id)?.name || '').filter(Boolean),
      _sdgs: (p.sdgs || []).map((id: number) => sgTerms.value.find(t => t.id === id)?.name || '').filter(Boolean),
      _kk: (p.kelompok_keahlian || []).map((id: number) => kkTerms.value.find(t => t.id === id)?.name || '').filter(Boolean),
      _status: p.status,
      _editLink: '/dashboard/hibah/' + p.id,
    }))
    total.value = parseInt(r.headers.get('X-WP-Total') || '0')
    page.value = p
  } catch (e: any) { } finally { loading.value = false }
}

onMounted(async () => { await loadTerms(); load() })
</script>
