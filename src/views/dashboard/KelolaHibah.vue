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
            <!-- Kategori taxonomy — searchable + create -->
            <div class="field full">
              <label>Kategori Hibah</label>
              <div class="tag-input">
                <div class="selected-tags" v-if="selectedCategories.length">
                  <span v-for="id in selectedCategories" :key="id" class="tag-chip">
                    {{ taxTermLabel(id) }}
                    <button type="button" class="tag-remove" @click="selectedCategories = selectedCategories.filter(x => x !== id)">✕</button>
                  </span>
                </div>
                <div class="search-row">
                  <input
                    type="text"
                    v-model="catSearch"
                    placeholder="Cari atau buat baru..."
                    class="search-input"
                    @focus="showCatDropdown = true"
                    @blur="hideCatDropdown"
                  />
                  <div class="search-dropdown" v-if="showCatDropdown && filteredCatOptions.length">
                    <button type="button" v-for="t in filteredCatOptions" :key="t.id"
                      class="drop-item"
                      @mousedown.prevent="addCategory(t)"
                    >{{ t.name }}</button>
                  </div>
                  <div class="search-dropdown" v-if="showCatDropdown && catSearch.trim() && !filteredCatOptions.length">
                    <button type="button" class="drop-item new" @mousedown.prevent="createCategory(catSearch.trim())">
                      + Buat "{{ catSearch.trim() }}"
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="catError" class="hint-error">{{ catError }}</div>
            </div>

            <!-- Skema — searchable from existing + type custom -->
            <div class="field">
              <label>Skema Hibah</label>
              <input
                type="text"
                v-model="form.skema"
                :list="'skema-datalist-' + _uid"
                placeholder="Pilih atau ketik..."
              />
              <datalist :id="'skema-datalist-' + _uid">
                <option v-for="s in existingSkema" :key="s" :value="s" />
              </datalist>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import type { HibahEvent } from '@/types'
import HtmlEditor from '@/components/HtmlEditor.vue'
import ThumbnailPicker from '@/components/ThumbnailPicker.vue'

const auth = useAuthStore()
const _uid = Math.random().toString(36).slice(2, 8)

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
const selectedCategories = ref<number[]>([])
const catSearch = ref('')
const showCatDropdown = ref(false)
const catError = ref('')
const existingSkema = ref<string[]>([])

const filteredCatOptions = computed(() => {
  if (!catSearch.value.trim()) return taxTerms.value.filter(t => !selectedCategories.value.includes(t.id))
  return taxTerms.value.filter(t =>
    !selectedCategories.value.includes(t.id) &&
    t.name.toLowerCase().includes(catSearch.value.toLowerCase())
  )
})

function taxTermLabel(id: number) { return taxTerms.value.find(t => t.id === id)?.name || String(id) }

function addCategory(t: { id: number; name: string }) {
  if (!selectedCategories.value.includes(t.id)) selectedCategories.value.push(t.id)
  catSearch.value = ''
}

function hideCatDropdown() { setTimeout(() => { showCatDropdown.value = false }, 150) }

async function createCategory(name: string) {
  catError.value = ''
  try {
    const res = await fetch(`${SITE.apiBase}/kategori_hibah`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    const created = await res.json()
    taxTerms.value.push({ id: created.id, name: created.name })
    selectedCategories.value.push(created.id)
    catSearch.value = ''
  } catch (e: any) { catError.value = 'Gagal buat kategori: ' + e.message }
}

interface TimelineItem { date: string; label: string }
const emptyForm = () => ({
  title: '', content: '', status: 'publish',
  jenis_hibah: 'internal', status_hibah: 'aktif',
  deadline: '', deadline_label: '', skema: '', kategori_hibah: '',
  dana_maks: '', event_eyebrow: '', info_tambahan: '', link_panduan: '',
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

async function fetchExistingSkema() {
  try {
    const res = await fetch(`${SITE.apiBase}/hibah?per_page=100&_fields=id,skema&status=publish`)
    if (res.ok) {
      const data: any[] = await res.json()
      const unique = new Set(data.map(p => (p.skema || '').trim()).filter(Boolean))
      existingSkema.value = Array.from(unique).sort()
    }
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
  selectedCategories.value = []
  editingId.value = null; modalError.value = ''; thumbPreview.value = ''; catSearch.value = '';
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
  form.timeline_items = (item as any).timeline_items || []
  form.featured_media = (item as any).featured_media || null
  selectedCategories.value = (item as any).categories || []
  thumbPreview.value = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
  modalError.value = ''; catSearch.value = ''
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
    categories: selectedCategories.value,
    timeline_items: form.timeline_items,
    featured_media: form.featured_media || undefined
  }

  try {
    let res: Response
    if (editingId.value) {
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
    fetchExistingSkema()
  } catch (e: any) {
    modalError.value = e.message
    saving.value = false
  }
}

onMounted(() => { fetchAll(); fetchTaxonomy(); fetchExistingSkema() })
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
/* Tag input styles */
.tag-input { border: 1px solid var(--line); border-radius: 5px; background: #fff; padding: 8px; }
.selected-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
.tag-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--green-100); color: var(--green-800); border-radius: 16px; font-size: 0.78rem; }
.tag-remove { width: 18px; height: 18px; border-radius: 50%; border: none; background: transparent; color: var(--green-600); cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; }
.tag-remove:hover { background: var(--green-200); }
.search-row { position: relative; }
.search-input { width: 100%; border: none !important; box-shadow: none !important; padding: 6px 8px !important; }
.search-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid var(--line); border-radius: 5px; max-height: 180px; overflow-y: auto; z-index: 50; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.drop-item { display: block; width: 100%; text-align: left; padding: 8px 12px; border: none; background: transparent; cursor: pointer; font-size: 0.82rem; font-family: inherit; }
.drop-item:hover { background: var(--paper-2); }
.drop-item.new { color: var(--green-700); font-style: italic; }
.hint-error { font-size: 0.72rem; color: var(--rust); margin-top: 4px; }
</style>
