<template>
  <div class="wrap">
    <h1>Hibah <a href="/dashboard/hibah/tambah" class="page-title-action">Tambah Hibah</a></h1>

    <ul class="subsubsub">
      <li><a :class="{current:statusFilter==='any'}" @click.prevent="statusFilter='any'" href="#">Semua <span class="count">({{ total }})</span></a></li>
      <li><a :class="{current:statusFilter==='publish'}" @click.prevent="statusFilter='publish'" href="#">Terbit</a></li>
      <li><a :class="{current:statusFilter==='draft'}" @click.prevent="statusFilter='draft'" href="#">Draft</a></li>
    </ul>

    <p class="search-box">
      <input type="search" v-model="search" placeholder="Cari hibah..." />
    </p>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>

    <table v-else class="wp-list-table widefat striped fixed">
      <thead>
        <tr>
          <th scope="col" class="sortable column-title" @click="tsort('title')"><span>Judul</span><span class="sorting-indicator">{{ sl('title') }}</span></th>
          <th scope="col">Kategori</th>
          <th scope="col">Skema</th>
          <th scope="col" class="sortable column-date" @click="tsort('date')"><span>Tanggal</span><span class="sorting-indicator">{{ sl('date') }}</span></th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in filtered" :key="row.id">
          <td class="title column-title">
            <strong>{{ row._title || '(tanpa judul)' }}</strong>
            <div class="row-actions">
              <span><router-link :to="'/dashboard/hibah/'+row.id">Edit</router-link></span>
              <span> | </span>
              <span><a :href="'https://itsi.ac.id/?p='+row.id+'&preview=true'" target="_blank">Lihat</a></span>
            </div>
          </td>
          <td>
            <span v-if="row._cats.length" v-for="c in row._cats" :key="c" style="display:inline-block;padding:1px 6px;margin:1px;background:#f0f0f1;border-radius:3px;font-size:12px">{{ c }}</span>
            <span v-else style="color:var(--wp-text-muted)">—</span>
          </td>
          <td>
            <span v-if="row._skms.length" v-for="s in row._skms" :key="s" style="display:inline-block;padding:1px 6px;margin:1px;background:#f0f0f1;border-radius:3px;font-size:12px">{{ s }}</span>
            <span v-else style="color:var(--wp-text-muted)">—</span>
          </td>
          <td>{{ row._date }}</td>
          <td><span class="post-state" :class="row.status==='draft'?'draft':''">{{ row.status==='publish'?'Terbit':'Draft' }}</span></td>
        </tr>
        <tr v-if="!filtered.length"><td colspan="5" style="text-align:center;padding:48px;color:var(--wp-text-muted)"><strong>Belum ada hibah.</strong><br>Klik "Tambah Hibah" untuk membuat.</td></tr>
      </tbody>
      <tfoot>
        <tr><td colspan="5">
          <div class="tablenav">
            <div class="displaying-num">{{ total }} item</div>
            <div class="tablenav-pages" v-if="total>perPage">
              <a v-if="page>1" @click.prevent="load(page-1)" href="#" class="prev-page">‹</a>
              <span v-for="p in pageNumbers" :key="p">
                <a v-if="p!==page" @click.prevent="load(p)" href="#">{{ p }}</a>
                <span v-else class="current">{{ p }}</span>
              </span>
              <a v-if="page*perPage<total" @click.prevent="load(page+1)" href="#" class="next-page">›</a>
            </div>
          </div>
        </td></tr>
      </tfoot>
    </table>
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
const pageNumbers = computed(() => { const tp = Math.ceil(total.value / perPage); const nums: number[] = []; for (let i = Math.max(1, page.value - 2); i <= Math.min(tp, page.value + 2); i++) nums.push(i); return nums })
async function loadTerms() { try { const [k, s] = await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`), window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100`)]); if (k.ok) kTerms.value = await k.json(); if (s.ok) sTerms.value = await s.json() } catch { } }
async function load(p = 1) { loading.value = true; try { const r = await window.fetch(`${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=date&order=desc&_fields=id,slug,status,date,title,kategori_hibah,skema_hibah`); if (!r.ok) throw new Error('HTTP ' + r.status); const raw = await r.json(); items.value = raw.map((p: any) => ({ ...p, _title: clean(p.title?.rendered || ''), _date: fmt(p.date), _cats: (p.kategori_hibah || []).map((id: number) => kTerms.value.find(t => t.id === id)?.name || '').filter(Boolean), _skms: (p.skema_hibah || []).map((id: number) => sTerms.value.find(t => t.id === id)?.name || '').filter(Boolean) })); total.value = parseInt(r.headers.get('X-WP-Total') || '0'); page.value = p } catch (e: any) { } finally { loading.value = false } }
onMounted(async () => { await loadTerms(); load() })
</script>
