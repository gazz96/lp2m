<template>
  <div>
    <div class="page-head">
      <h1>⚙️ Kelola Hibah</h1>
      <button class="btn btn-primary" @click="openCreate">+ Event Baru</button>
    </div>
    <p class="subtitle">Buat dan edit event hibah. Perubahan langsung tersimpan di itsi.ac.id.</p>

    <div v-if="loading" class="loading-text">Memuat...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Judul</th>
              <th>Jenis</th>
              <th>Status</th>
              <th>Deadline</th>
              <th class="act-col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td class="title-cell">
                <strong>{{ cleanTitle(item.title.rendered) }}</strong>
                <span class="skema">{{ item.skema || item.kategori_hibah || '' }}</span>
              </td>
              <td><span class="badge" :class="item.jenis_hibah">{{ labelJenis(item.jenis_hibah) }}</span></td>
              <td><span class="badge" :class="item.status_hibah">{{ labelStatus(item.status_hibah) }}</span></td>
              <td>{{ item.deadline_label || '-' }}</td>
              <td class="act-cell">
                <button class="btn-sm btn-edit" @click="openEdit(item)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="total > perPage" class="pager">
        <button :disabled="page <= 1" @click="fetchAll(page - 1)">← Prev</button>
        <span>Hal {{ page }} / {{ Math.ceil(total / perPage) }}</span>
        <button :disabled="page * perPage >= total" @click="fetchAll(page + 1)">Next →</button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal modal-xl">
        <h2>{{ editingId ? 'Edit Event' : 'Event Baru' }}</h2>
        <form @submit.prevent="save" novalidate>
          <div class="form-grid">
            <div class="field full">
              <label>Judul Event *</label>
              <input type="text" v-model="form.title" placeholder="Judul event hibah..." />
            </div>

            <div class="field">
              <label>Jenis Hibah</label>
              <select v-model="form.jenis_hibah">
                <option value="internal">Internal</option>
                <option value="eksternal">Eksternal</option>
              </select>
            </div>
            <div class="field">
              <label>Status Event</label>
              <select v-model="form.status_hibah">
                <option value="aktif">Aktif</option>
                <option value="ditutup">Ditutup</option>
                <option value="arsip">Arsip</option>
              </select>
            </div>
            <div class="field">
              <label>Kategori</label>
              <input type="text" v-model="form.kategori_hibah" placeholder="Penelitian Dasar..." />
            </div>
            <div class="field">
              <label>Skema Hibah</label>
              <input type="text" v-model="form.skema" placeholder="Hibah Kompetitif..." />
            </div>
            <div class="field">
              <label>Deadline (ISO)</label>
              <input type="text" v-model="form.deadline" placeholder="2026-09-15T23:59:59" />
            </div>
            <div class="field">
              <label>Label Deadline</label>
              <input type="text" v-model="form.deadline_label" placeholder="15 September 2026" />
            </div>
            <div class="field">
              <label>Dana Maksimal</label>
              <input type="text" v-model="form.dana_maks" placeholder="Rp 35.000.000" />
            </div>
            <div class="field">
              <label>Eyebrow Banner</label>
              <input type="text" v-model="form.event_eyebrow" placeholder="Event Aktif · TA 2026/2027" />
            </div>
            <div class="field full">
              <label>Link Panduan (URL)</label>
              <input type="url" v-model="form.link_panduan" placeholder="https://drive.google.com/..." />
            </div>
            <div class="field full">
              <label>Info Tambahan (satu per baris)</label>
              <textarea v-model="form.info_tambahan" rows="3" placeholder="Maks. 3 anggota tim..."></textarea>
            </div>

            <!-- Kategori taxonomy -->
            <div class="field full">
              <label>Kategori (taxonomy)</label>
              <div class="checkbox-list" v-if="taxTerms.length">
                <label v-for="t in taxTerms" :key="t.id" class="cb-item">
                  <input type="checkbox" :value="t.id" v-model="form.categories" />
                  {{ t.name }}
                </label>
              </div>
              <span v-else class="hint">Belum ada kategori. Buat di WP Admin → Kategori Hibah.</span>
            </div>

            <!-- Timeline repeater -->
            <div class="field full">
              <label>Timeline</label>
              <div class="repeater">
                <div v-for="(t, i) in form.timeline_items" :key="i" class="r-row">
                  <input type="text" v-model="t.date" placeholder="01 Agu 2026" class="r-date" />
                  <input type="text" v-model="t.label" placeholder="Deskripsi..." class="r-label" />
                  <button type="button" class="r-remove" @click="form.timeline_items.splice(i, 1)" title="Hapus">✕</button>
                </div>
                <button type="button" class="btn-sm btn-outline" @click="form.timeline_items.push({ date: '', label: '' })">+ Tambah Timeline</button>
              </div>
            </div>

            <div class="field full">
              <label>Konten / Deskripsi</label>
              <HtmlEditor v-model="form.content" />
            </div>

            <div class="field full">
              <label>Thumbnail</label>
              <ThumbnailPicker v-model:media-id="form.featured_media" v-model:preview-url="thumbPreview" />
              <input type="hidden" v-model.number="form.featured_media" />
            </div>
          </div>

          <div v-if="modalError" class="error-box">{{ modalError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Buat Event') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import type { HibahEvent } from '@/types'
import HtmlEditor from '@/components/HtmlEditor.vue'
import ThumbnailPicker from '@/components/ThumbnailPicker.vue'

const auth = useAuthStore()

const items = ref<HibahEvent[]>([])
const loading = ref(true)
const error = ref('')
const total = ref(0)
const page = ref(1)
const perPage = 12

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const modalError = ref('')
const thumbPreview = ref('')
const taxTerms = ref<{ id: number; name: string }[]>([])

interface TimelineItem { date: string; label: string }
const emptyForm = () => ({
  title: '', content: '', status: 'publish',
  jenis_hibah: 'internal', status_hibah: 'aktif',
  deadline: '', deadline_label: '', skema: '', kategori_hibah: '',
  dana_maks: '', event_eyebrow: '', info_tambahan: '', link_panduan: '',
  categories: [] as number[],
  timeline_items: [] as TimelineItem[],
  featured_media: null as number | null
})

const form = reactive(emptyForm())

function cleanTitle(raw: string) { return new DOMParser().parseFromString(raw, 'text/html').body.textContent || raw }
function labelJenis(v: string) { return { internal: 'Internal', eksternal: 'Eksternal' }[v] || v }
function labelStatus(v: string) { return { aktif: 'Aktif', ditutup: 'Ditutup', arsip: 'Arsip' }[v] || v }

async function fetchTaxonomy() {
  try {
    const res = await fetch(`${SITE.apiBase}/kategori_hibah?per_page=50`)
    if (res.ok) taxTerms.value = await res.json()
  } catch { /* ignore */ }
}

async function fetchAll(p = 1) {
  loading.value = true; error.value = ''
  try {
    const fields = 'id,date,title,status,jenis_hibah,status_hibah,deadline,deadline_label,skema,kategori_hibah,content,categories,featured_media,meta,event_eyebrow,dana_maks,info_tambahan,link_panduan,timeline_items'
    const url = `${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=date&order=desc&_fields=${fields}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    items.value = await res.json()
    total.value = parseInt(res.headers.get('X-WP-Total') || '0')
    page.value = p
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

function openCreate() {
  Object.assign(form, emptyForm())
  editingId.value = null; modalError.value = ''; thumbPreview.value = ''
  showModal.value = true
}

function openEdit(item: HibahEvent) {
  editingId.value = item.id
  form.title = cleanTitle(item.title.rendered)
  form.content = item.content?.rendered || ''
  form.status = item.status || 'publish'
  form.jenis_hibah = (item as any).jenis_hibah || 'internal'
  form.status_hibah = (item as any).status_hibah || 'aktif'
  form.deadline = (item as any).deadline || ''
  form.deadline_label = (item as any).deadline_label || ''
  form.skema = item.skema || ''
  form.kategori_hibah = (item as any).kategori_hibah || ''
  form.dana_maks = (item as any).dana_maks || ''
  form.event_eyebrow = (item as any).event_eyebrow || ''
  form.info_tambahan = (item as any).info_tambahan || ''
  form.link_panduan = (item as any).link_panduan || ''
  form.categories = (item as any).categories || []
  form.timeline_items = (item as any).timeline_items || []
  form.featured_media = (item as any).featured_media || null
  thumbPreview.value = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
  modalError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function save() {
  if (!form.title.trim()) { modalError.value = 'Judul wajib diisi.'; return }
  saving.value = true; modalError.value = ''

  const payload: any = {
    title: form.title,
    content: form.content,
    status: form.status,
    jenis_hibah: form.jenis_hibah,
    status_hibah: form.status_hibah,
    deadline: form.deadline,
    deadline_label: form.deadline_label,
    skema: form.skema,
    kategori_hibah: form.kategori_hibah,
    dana_maks: form.dana_maks,
    event_eyebrow: form.event_eyebrow,
    info_tambahan: form.info_tambahan,
    link_panduan: form.link_panduan,
    categories: form.categories,
    timeline_items: form.timeline_items,
    featured_media: form.featured_media || undefined
  }

  try {
    let res: Response
    if (editingId.value) {
      // WP REST update = POST (not PUT for meta compat)
      res = await fetch(`${SITE.apiBase}/hibah/${editingId.value}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
        body: JSON.stringify(payload)
      })
    } else {
      res = await fetch(`${SITE.apiBase}/hibah`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
        body: JSON.stringify(payload)
      })
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      modalError.value = err.message || `HTTP ${res.status}`
      saving.value = false; return
    }
    saving.value = false
    closeModal()
    fetchAll(page.value)
  } catch (e: any) {
    modalError.value = e.message
    saving.value = false
  }
}

onMounted(() => { fetchAll(); fetchTaxonomy() })
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
.page-head h1 { margin-bottom: 0; }
.table-wrap { overflow-x: auto; margin-top: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
th { text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--line); color: var(--ink-soft); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; }
td { padding: 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
.title-cell strong { display: block; color: var(--green-800); margin-bottom: 4px; }
.title-cell .skema { font-size: 0.76rem; color: var(--ink-soft); }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; }
.badge.internal { background: #e8f5e9; color: #2e7d32; }
.badge.eksternal { background: #e3f2fd; color: #1565c0; }
.badge.aktif { background: #e8f5e9; color: #2e7d32; }
.badge.ditutup { background: #fff3e0; color: #e65100; }
.badge.arsip { background: var(--paper-2); color: var(--ink-soft); }
.act-col { width: 80px; }
.act-cell { display: flex; gap: 6px; }
.btn-sm { padding: 5px 12px; font-size: 0.76rem; border-radius: 4px; border: 1px solid var(--line); cursor: pointer; font-family: inherit; background: var(--card); }
.btn-edit { color: var(--green-700); border-color: var(--green-600); }
.btn-edit:hover { background: var(--green-100); }
.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; font-size: 0.84rem; }
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
.hint { font-size: 0.74rem; color: var(--ink-soft); }
.checkbox-list { display: flex; flex-wrap: wrap; gap: 8px; }
.cb-item { display: flex; align-items: center; gap: 4px; font-size: 0.82rem; cursor: pointer; }
.repeater { display: flex; flex-direction: column; gap: 8px; }
.r-row { display: flex; gap: 8px; align-items: center; }
.r-date { width: 130px; flex-shrink: 0; }
.r-label { flex: 1; }
.r-remove { width: 28px; height: 28px; border: 1px solid var(--rust); background: #fff; color: var(--rust); border-radius: 4px; cursor: pointer; font-size: 0.76rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.r-remove:hover { background: #fff0ed; }
.error-box { background: #fff0ed; color: var(--rust); padding: 10px 14px; border-radius: 6px; font-size: 0.82rem; margin-top: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.loading-text, .error-text { color: var(--ink-soft); padding: 24px 0; }
</style>
