<template>
  <div class="wp-app" style="padding:32px;min-height:100vh">
    <div class="wp-page-header">
      <h1 class="wp-page-title">Hibah</h1>
      <router-link to="/dashboard/hibah/tambah" class="wp-btn wp-btn-primary">Tambah Hibah</router-link>
    </div>

    <div class="wp-toolbar">
      <input type="text" v-model="search" placeholder="Cari judul..." style="width:240px" />
      <select v-model="statusFilter"><option value="any">Semua Status</option><option value="publish">Terbit</option><option value="draft">Draft</option></select>
      <span class="spacer"></span>
      <span style="font-size:13px;color:var(--wp-text-secondary)">{{ total }} hibah</span>
    </div>

    <div v-if="loading" class="wp-empty"><div class="wp-empty-title">Memuat...</div></div>
    <div v-else class="wp-table-wrap">
      <table class="wp-table">
        <thead>
          <tr>
            <th class="sort-col" @click="tsort('title')">Judul {{ sl('title') }}</th>
            <th>Kategori</th>
            <th>Skema</th>
            <th class="sort-col" @click="tsort('date')">Tanggal {{ sl('date') }}</th>
            <th>Status</th>
            <th style="width:60px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row,i) in filtered" :key="row.id" :class="{striped:i%2===1}">
            <td>
              <strong style="color:var(--wp-text)">{{ row._title || '(tanpa judul)' }}</strong>
              <div style="font-size:12px;color:var(--wp-text-muted);margin-top:3px">
                <router-link :to="'/dashboard/hibah/'+row.id" class="wp-btn-link">Edit</router-link> |
                <a :href="'https://itsi.ac.id/?p='+row.id+'&preview=true'" target="_blank" class="wp-btn-link">Lihat</a>
              </div>
            </td>
            <td><span v-if="row._cats.length" v-for="c in row._cats" :key="c" class="wp-tag">{{ c }}</span><span v-else style="color:var(--wp-text-muted)">—</span></td>
            <td><span v-if="row._skms.length" v-for="s in row._skms" :key="s" class="wp-tag">{{ s }}</span><span v-else style="color:var(--wp-text-muted)">—</span></td>
            <td style="font-size:13px;color:var(--wp-text-secondary)">{{ row._date }}</td>
            <td><span class="wp-badge" :class="row.status==='publish'?'wp-badge-success':'wp-badge-default'">{{ row.status==='publish'?'Terbit':'Draft' }}</span></td>
            <td><router-link :to="'/dashboard/hibah/'+row.id" class="wp-btn-link">Edit</router-link></td>
          </tr>
          <tr v-if="!filtered.length"><td colspan="6" class="wp-empty"><div class="wp-empty-title">Belum ada hibah</div><div class="wp-empty-sub">Klik "Tambah Hibah" untuk membuat event.</div></td></tr>
        </tbody>
      </table>
      <div v-if="total>perPage" class="wp-pager">
        <div class="pg-info">
          <button class="wp-btn wp-btn-sm" :disabled="page<=1" @click="load(page-1)">← Prev</button>
          <span>{{ page }} / {{ Math.ceil(total/perPage) }}</span>
          <button class="wp-btn wp-btn-sm" :disabled="page*perPage>=total" @click="load(page+1)">Next →</button>
        </div>
        <span>{{ (page-1)*perPage+1 }}–{{ Math.min(page*perPage,total) }} dari {{ total }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SITE } from '@/data'
type Row = { id: number; slug: string; status: string; date: string; title: { rendered: string }; kategori_hibah: number[]; skema_hibah: number[]; _title: string; _date: string; _cats: string[]; _skms: string[] }
const items = ref<Row[]>([]), loading = ref(true), total = ref(0), page = ref(1), perPage = 20
const search = ref(''), statusFilter = ref('any'), sk = ref<'title' | 'date'>('date'), sd = ref<'asc' | 'desc'>('desc')
const kTerms = ref<{ id: number; name: string }[]>([]), sTerms = ref<{ id: number; name: string }[]>([])
function clean(s: string) { return new DOMParser().parseFromString(s, 'text/html').body.textContent || '' }
function fmt(d: string) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
function tsort(k: 'title' | 'date') { if (sk.value === k) sd.value = sd.value === 'asc' ? 'desc' : 'asc'; else { sk.value = k; sd.value = 'desc' } }
function sl(k: string) { return sk.value === k ? (sd.value === 'asc' ? '↑' : '↓') : '' }
const filtered = computed(() => { let a = [...items.value]; if (statusFilter.value !== 'any') a = a.filter(r => r.status === statusFilter.value); if (search.value.trim()) { const q = search.value.toLowerCase(); a = a.filter(r => r._title.toLowerCase().includes(q)) } a.sort((x, y) => { const vx = sk.value === 'title' ? x._title : x.date; const vy = sk.value === 'title' ? y._title : y.date; return sd.value === 'desc' ? vy.localeCompare(vx) : vx.localeCompare(vy) }); return a })
async function loadTerms() { try { const [k, s] = await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`), window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100`)]); if (k.ok) kTerms.value = await k.json(); if (s.ok) sTerms.value = await s.json() } catch { } }
async function load(p = 1) { loading.value = true; try { const r = await window.fetch(`${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=date&order=desc&_fields=id,slug,status,date,title,kategori_hibah,skema_hibah`); if (!r.ok) throw new Error('HTTP ' + r.status);const raw = await r.json(); items.value = raw.map((p: any) => ({ ...p, _title: clean(p.title?.rendered || ''), _date: fmt(p.date), _cats: (p.kategori_hibah || []).map((id: number) => kTerms.value.find(t => t.id === id)?.name || '').filter(Boolean), _skms: (p.skema_hibah || []).map((id: number) => sTerms.value.find(t => t.id === id)?.name || '').filter(Boolean) })); total.value = parseInt(r.headers.get('X-WP-Total') || '0'); page.value = p } catch (e: any) { } finally { loading.value = false } }
onMounted(async () => { await loadTerms(); load() })
</script>
