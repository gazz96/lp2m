<template>
  <div>
    <div class="page-head">
      <h1>⚙️ Kelola Hibah</h1>
      <button class="btn btn-primary" @click="openCreate">+ Event Baru</button>
    </div>
    <p class="subtitle">Buat dan edit event hibah. Perubahan langsung tersimpan di itsi.ac.id.</p>

    <!-- Search, filter, sort -->
    <div class="toolbar">
      <input type="text" v-model="search" placeholder="Cari judul..." class="search-input" />
      <select v-model="statusFilter" class="filter-select">
        <option value="any">Semua Status</option>
        <option value="publish">Publish</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    <div v-if="loading" class="loading-text">Memuat...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="sortable" @click="toggleSort('title')">
                Judul {{ sortLabel('title') }}
              </th>
              <th class="sortable" @click="toggleSort('date')">
                Tanggal {{ sortLabel('date') }}
              </th>
              <th>Status</th>
              <th>Kategori</th>
              <th class="act-col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.id">
              <td class="title-cell">
                <strong>{{ item._title }}</strong>
              </td>
              <td class="date-cell">{{ item._date }}</td>
              <td><span class="badge" :class="item.status">{{ item.status === 'publish' ? 'Terbit' : 'Draft' }}</span></td>
              <td>
                <span class="tag-sm" v-for="c in item._cats" :key="c">{{ c }}</span>
                <span v-if="!item._cats.length" class="hint">—</span>
              </td>
              <td class="act-cell">
                <button class="btn-sm btn-edit" @click="openEdit(item)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="total > perPage" class="pager">
        <button :disabled="page <= 1" @click="fetchAll(page - 1)">←</button>
        <span>{{ page }} / {{ Math.ceil(total / perPage) }}</span>
        <button :disabled="page * perPage >= total" @click="fetchAll(page + 1)">→</button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal modal-xl">
        <h2>{{ editingId ? 'Edit Event' : 'Event Baru' }}</h2>
        <form @submit.prevent="save" novalidate>
          <div class="form-grid">
            <!-- Judul -->
            <div class="field full">
              <label>Judul Event *</label>
              <input type="text" v-model="form.title" placeholder="Judul event hibah..." />
            </div>

            <!-- Status + Jenis -->
            <div class="field">
              <label>Status</label>
              <select v-model="form.status">
                <option value="publish">Publish</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div class="field">
              <label>Jenis Hibah</label>
              <select v-model="form.jenis_hibah">
                <option value="internal">Internal</option>
                <option value="eksternal">Eksternal</option>
              </select>
            </div>

            <!-- Kategori — taxonomy searchable -->
            <div class="field full">
              <label>Kategori Hibah</label>
              <TagSelect
                :terms="katTerms"
                :selected="selectedKats"
                placeholder="Cari atau buat kategori..."
                @add="(t: any) => selectedKats.push(t.id)"
                @remove="(id: number) => selectedKats = selectedKats.filter(x => x !== id)"
                @create="createTerm('kategori_hibah', $event, katTerms, selectedKats)"
              />
              <div v-if="terr" class="hint-error">{{ terr }}</div>
            </div>

            <!-- Skema — taxonomy searchable -->
            <div class="field full">
              <label>Skema Hibah</label>
              <TagSelect
                :terms="skmTerms"
                :selected="selectedSkms"
                placeholder="Cari atau buat skema..."
                @add="(t: any) => selectedSkms.push(t.id)"
                @remove="(id: number) => selectedSkms = selectedSkms.filter(x => x !== id)"
                @create="createTerm('skema_hibah', $event, skmTerms, selectedSkms)"
              />
            </div>

            <!-- Deadline (date) + Dana (number) -->
            <div class="field">
              <label>Deadline</label>
              <input type="date" v-model="form.deadline" />
            </div>
            <div class="field">
              <label>Dana Maksimal (Rp)</label>
              <input type="number" v-model.number="form.dana_maks_num" placeholder="35000000" min="0" />
            </div>

            <!-- Eyebrow + Link Panduan -->
            <div class="field">
              <label>Eyebrow Banner</label>
              <input type="text" v-model="form.event_eyebrow" placeholder="Event Aktif · TA 2026/2027" />
            </div>
            <div class="field">
              <label>Link Panduan</label>
              <input type="url" v-model="form.link_panduan" placeholder="https://drive.google.com/..." />
            </div>

            <!-- Info Tambahan -->
            <div class="field full">
              <label>Info Tambahan (satu per baris)</label>
              <textarea v-model="form.info_tambahan" rows="3" placeholder="Maks. 3 anggota tim..."></textarea>
            </div>

            <!-- Timeline repeater -->
            <div class="field full">
              <label>Timeline</label>
              <div class="repeater">
                <div v-for="(t, i) in form.timeline_items" :key="i" class="r-row">
                  <input type="text" v-model="t.date" placeholder="01 Agu 2026" class="r-date" />
                  <input type="text" v-model="t.label" placeholder="Deskripsi..." class="r-label" />
                  <button type="button" class="r-remove" @click="form.timeline_items.splice(i, 1)">✕</button>
                </div>
                <button type="button" class="btn-sm btn-outline" @click="form.timeline_items.push({date:'',label:''})">+ Tambah</button>
              </div>
            </div>

            <!-- WYSIWYG -->
            <div class="field full">
              <label>Konten / Deskripsi</label>
              <HtmlEditor v-model="form.content" />
            </div>

            <!-- Thumbnail -->
            <div class="field full">
              <label>Thumbnail</label>
              <ThumbnailPicker v-model:media-id="form.featured_media" v-model:preview-url="thumbPreview" />
            </div>
          </div>

          <div v-if="modalError" class="error-box">{{ modalError }}</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Menyimpan...' : (editingId ? 'Simpan' : 'Buat') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import HtmlEditor from '@/components/HtmlEditor.vue'
import ThumbnailPicker from '@/components/ThumbnailPicker.vue'
import TagSelect from '@/components/TagSelect.vue'

const auth = useAuthStore()

type RawHibah = {
  id: number; slug: string; status: string; date: string; featured_media: number
  title: { rendered: string }; content: { rendered: string }; excerpt: { rendered: string }
  categories: number[]; skema_hibah: number[]
  jenis_hibah: string; deadline: string; deadline_label: string
  event_eyebrow: string; dana_maks: string; info_tambahan: string; link_panduan: string
  timeline_items: Array<{date:string;label:string}>
  _embedded?: { 'wp:featuredmedia'?: Array<{ source_url: string }> }
}

type Row = RawHibah & { _title: string; _date: string; _cats: string[] }

const items = ref<Row[]>([])
const loading = ref(true)
const error = ref('')
const total = ref(0)
const page = ref(1)
const perPage = 20

// Filters
const search = ref('')
const statusFilter = ref('any')
const sortKey = ref<'title'|'date'>('date')
const sortDir = ref<'asc'|'desc'>('desc')

function clean(str: string) { return new DOMParser().parseFromString(str, 'text/html').body.textContent || '' }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'}) : '-' }

function toggleSort(k: 'title'|'date') {
  if (sortKey.value === k) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = k; sortDir.value = 'desc' }
}

function sortLabel(k: string) {
  if (sortKey.value !== k) return ''
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const filtered = computed(() => {
  let arr = [...items.value]
  if (statusFilter.value !== 'any') arr = arr.filter(p => p.status === statusFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    arr = arr.filter(p => p._title.toLowerCase().includes(q))
  }
  arr.sort((a, b) => {
    const va = sortKey.value === 'title' ? a._title : a.date
    const vb = sortKey.value === 'title' ? b._title : b.date
    return sortDir.value === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb)
  })
  return arr
})

const katTerms = ref<{id:number;name:string}[]>([])
const skmTerms = ref<{id:number;name:string}[]>([])

// Modal
const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const modalError = ref('')
const thumbPreview = ref('')
const selectedKats = ref<number[]>([])
const selectedSkms = ref<number[]>([])
const terr = ref('')

interface TLItem { date: string; label: string }
const emptyForm = () => ({
  title: '', content: '', status: 'draft', jenis_hibah: 'internal',
  deadline: '', event_eyebrow: '', dana_maks_num: 0, info_tambahan: '', link_panduan: '',
  timeline_items: [] as TLItem[], featured_media: null as number | null
})
const form = reactive(emptyForm())

async function fetchTerms(tax: string) {
  try {
    const res = await fetch(`${SITE.apiBase}/${tax}?per_page=100`)
    if (res.ok) {
      const data = await res.json()
      if (tax === 'kategori_hibah') katTerms.value = data
      else skmTerms.value = data
    }
  } catch {}
}

async function createTerm(tax: string, name: string, arr: {id:number;name:string}[], sel: number[]) {
  terr.value = ''
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
  try {
    const res = await fetch(`${SITE.apiBase}/${tax}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify({ name, slug })
    })
    if (!res.ok) throw new Error((await res.json().catch(()=>({}))).message || `HTTP ${res.status}`)
    const created = await res.json()
    arr.push({ id: created.id, name: created.name })
    sel.push(created.id)
  } catch (e: any) { terr.value = 'Gagal: ' + e.message }
}

async function fetchAll(p = 1) {
  loading.value = true; error.value = ''
  try {
    const fields = 'id,slug,status,date,title,content,categories,skema_hibah,jenis_hibah,deadline,deadline_label,event_eyebrow,dana_maks,info_tambahan,link_panduan,timeline_items,featured_media'
    const url = `${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=date&order=desc&_fields=${fields}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw: RawHibah[] = await res.json()
    items.value = raw.map(p => ({
      ...p,
      _title: clean(p.title.rendered),
      _date: fmtDate(p.date),
      _cats: (p.categories || []).map(id => katTerms.value.find(t => t.id === id)?.name || '').filter(Boolean)
    }))
    total.value = parseInt(res.headers.get('X-WP-Total') || '0')
    page.value = p
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

function openCreate() {
  Object.assign(form, emptyForm())
  editingId.value = null; modalError.value = ''; thumbPreview.value = ''
  selectedKats.value = []; selectedSkms.value = []
  showModal.value = true
}

function openEdit(p: Row) {
  editingId.value = p.id
  form.title = p._title
  form.content = p.content?.rendered || ''
  form.status = p.status
  form.jenis_hibah = p.jenis_hibah || 'internal'
  form.deadline = p.deadline ? p.deadline.slice(0, 10) : ''
  form.event_eyebrow = p.event_eyebrow || ''
  form.dana_maks_num = parseInt(p.dana_maks) || 0
  form.info_tambahan = p.info_tambahan || ''
  form.link_panduan = p.link_panduan || ''
  form.timeline_items = p.timeline_items || []
  form.featured_media = p.featured_media || null
  selectedKats.value = p.categories || []
  selectedSkms.value = p.skema_hibah || []
  thumbPreview.value = p._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
  modalError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function save() {
  if (!form.title.trim()) { modalError.value = 'Judul wajib diisi.'; return }
  saving.value = true; modalError.value = ''

  const payload: any = {
    title: form.title, content: form.content, status: form.status,
    jenis_hibah: form.jenis_hibah,
    deadline: form.deadline ? form.deadline + 'T23:59:59' : '',
    deadline_label: form.deadline ? new Date(form.deadline).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'}) : '',
    dana_maks: form.dana_maks_num ? String(form.dana_maks_num) : '',
    event_eyebrow: form.event_eyebrow,
    info_tambahan: form.info_tambahan,
    link_panduan: form.link_panduan,
    categories: selectedKats.value,
    skema_hibah: selectedSkms.value,
    timeline_items: form.timeline_items,
  }
  if (form.featured_media) payload.featured_media = form.featured_media

  try {
    const url = editingId.value
      ? `${SITE.apiBase}/hibah/${editingId.value}`
      : `${SITE.apiBase}/hibah`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      modalError.value = err.message || `HTTP ${res.status}`
      saving.value = false; return
    }
    saving.value = false
    closeModal()
    fetchAll(page.value)
  } catch (e: any) { modalError.value = e.message; saving.value = false }
}

onMounted(() => { fetchAll(); fetchTerms('kategori_hibah'); fetchTerms('skema_hibah') })

// Watch for re-filter
watch([search, statusFilter], () => {})
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
.page-head h1 { margin-bottom: 0; }
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.search-input { flex: 1; border: 1px solid var(--line); border-radius: 5px; padding: 9px 12px; font-family: inherit; font-size: 0.86rem; outline: none; }
.filter-select { border: 1px solid var(--line); border-radius: 5px; padding: 9px 12px; font-family: inherit; font-size: 0.86rem; width: 160px; background: #fff; }
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: var(--green-600); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
th { text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--line); color: var(--ink-soft); font-weight: 600; font-size: 0.76rem; text-transform: uppercase; }
td { padding: 10px 12px; border-bottom: 1px solid var(--line); }
.title-cell strong { color: var(--green-800); }
.date-cell { font-size: 0.82rem; color: var(--ink-soft); white-space: nowrap; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; }
.badge.publish { background: #e8f5e9; color: #2e7d32; }
.badge.draft { background: var(--paper-2); color: var(--ink-soft); }
.tag-sm { display: inline-block; padding: 2px 8px; margin: 2px; background: var(--paper-2); border-radius: 10px; font-size: 0.72rem; color: var(--ink-soft); }
.hint { font-size: 0.74rem; color: var(--ink-soft); }
.act-col { width: 70px; }
.act-cell { display: flex; gap: 6px; }
.btn-sm { padding: 5px 12px; font-size: 0.74rem; border-radius: 4px; border: 1px solid var(--line); cursor: pointer; font-family: inherit; background: var(--card); }
.btn-edit { color: var(--green-700); border-color: var(--green-600); }
.btn-edit:hover { background: var(--green-100); }
.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; font-size: 0.84rem; color: var(--ink-soft); }
.pager button { padding: 6px 14px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding: 30px; overflow-y: auto; }
.modal { background: var(--card); border-radius: 12px; padding: 32px; width: 100%; max-width: 800px; max-height: 92vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal h2 { margin-bottom: 20px; color: var(--green-800); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: 0.8rem; font-weight: 600; color: var(--green-800); }
.field input, .field select, .field textarea { border: 1px solid var(--line); background: #fff; border-radius: 5px; padding: 9px 11px; font-family: inherit; font-size: 0.84rem; color: var(--ink); outline: none; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--green-600); box-shadow: 0 0 0 3px rgba(47,107,79,0.12); }
.repeater { display: flex; flex-direction: column; gap: 8px; }
.r-row { display: flex; gap: 8px; align-items: center; }
.r-date { width: 130px; flex-shrink: 0; }
.r-label { flex: 1; }
.r-remove { width: 28px; height: 28px; border: 1px solid var(--rust); background: #fff; color: var(--rust); border-radius: 4px; cursor: pointer; font-size: 0.76rem; display: flex; align-items: center; justify-content: center; }
.r-remove:hover { background: #fff0ed; }
.error-box { background: #fff0ed; color: var(--rust); padding: 10px 14px; border-radius: 6px; font-size: 0.82rem; margin-top: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.loading-text, .error-text { color: var(--ink-soft); padding: 24px 0; }
.hint-error { font-size: 0.72rem; color: var(--rust); margin-top: 4px; }
</style>
