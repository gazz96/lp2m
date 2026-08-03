<template>
  <div>
    <div class="page-head">
      <h1>📋 Kelola Hibah</h1>
      <button class="btn btn-primary" @click="openCreate">+ Event Baru</button>
    </div>
    <p class="subtitle">Buat, edit, dan hapus event hibah. Perubahan langsung tersimpan di WordPress.</p>

    <!-- Table / List -->
    <div v-if="store.loading" class="loading-text">Memuat...</div>
    <div v-else-if="store.error" class="error-text">{{ store.error }}</div>
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
            <tr v-for="item in store.items" :key="item.id">
              <td class="title-cell">
                <strong>{{ cleanTitle(item.title.rendered) }}</strong>
                <span class="skema">{{ item.skema || item.kategori_hibah || '' }}</span>
              </td>
              <td><span class="badge" :class="item.jenis_hibah">{{ labelJenis(item.jenis_hibah) }}</span></td>
              <td><span class="badge" :class="item.status_hibah">{{ labelStatus(item.status_hibah) }}</span></td>
              <td>{{ item.deadline_label || '-' }}</td>
              <td class="act-cell">
                <button class="btn-sm btn-edit" @click="openEdit(item)">Edit</button>
                <button class="btn-sm btn-del" @click="confirmDelete(item)">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="store.total > store.perPage" class="pager">
        <button :disabled="store.page <= 1" @click="store.fetchAll(store.page - 1)">← Prev</button>
        <span>Hal {{ store.page }} / {{ Math.ceil(store.total / store.perPage) }}</span>
        <button :disabled="store.page * store.perPage >= store.total" @click="store.fetchAll(store.page + 1)">Next →</button>
      </div>
    </div>

    <!-- Modal: Create / Edit -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingId ? 'Edit Event' : 'Event Baru' }}</h2>
        <form @submit.prevent="save" novalidate>
          <div class="form-grid">
            <div class="field full">
              <label>Judul Event *</label>
              <input type="text" v-model="form.title" placeholder="cth. Hibah Penelitian Dasar 2026/2027" />
            </div>
            <div class="field">
              <label>Jenis Hibah *</label>
              <select v-model="form.jenis_hibah">
                <option value="internal">Internal</option>
                <option value="eksternal">Eksternal</option>
              </select>
            </div>
            <div class="field">
              <label>Status Event *</label>
              <select v-model="form.status_hibah">
                <option value="aktif">Aktif</option>
                <option value="ditutup">Ditutup</option>
                <option value="arsip">Arsip</option>
              </select>
            </div>
            <div class="field">
              <label>Kategori</label>
              <input type="text" v-model="form.kategori_hibah" placeholder="Penelitian, Pengabdian..." />
            </div>
            <div class="field">
              <label>Skema Hibah</label>
              <input type="text" v-model="form.skema" placeholder="cth. Hibah Kompetitif Riset..." />
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
              <label>Konten / Deskripsi (HTML)</label>
              <textarea v-model="form.content" rows="6" placeholder="<p>Deskripsi event...</p>"></textarea>
            </div>
            <div class="field full">
              <label>Info Tambahan</label>
              <textarea v-model="form.info_tambahan" rows="3" placeholder="Satu info per baris"></textarea>
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
import { useHibahStore } from '@/stores/hibah'
import type { HibahEvent } from '@/types'

const store = useHibahStore()

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const modalError = ref('')

const emptyForm = () => ({
  title: '', content: '', status: 'publish',
  jenis_hibah: 'internal', status_hibah: 'aktif',
  deadline: '', deadline_label: '', skema: '', kategori_hibah: '',
  dana_maks: '', event_eyebrow: '', info_tambahan: ''
})

const form = reactive(emptyForm())

function cleanTitle(raw: string) {
  return new DOMParser().parseFromString(raw, 'text/html').body.textContent || raw
}

function labelJenis(v: string) {
  return { internal: 'Internal', eksternal: 'Eksternal' }[v] || v
}

function labelStatus(v: string) {
  return { aktif: 'Aktif', ditutup: 'Ditutup', arsip: 'Arsip' }[v] || v
}

function openCreate() {
  Object.assign(form, emptyForm())
  editingId.value = null
  modalError.value = ''
  showModal.value = true
}

function openEdit(item: HibahEvent) {
  editingId.value = item.id
  form.title = cleanTitle(item.title.rendered)
  form.content = item.content?.rendered || ''
  form.status = item.status || 'publish'
  form.jenis_hibah = item.jenis_hibah || 'internal'
  form.status_hibah = item.status_hibah || 'aktif'
  form.deadline = item.deadline || ''
  form.deadline_label = item.deadline_label || ''
  form.skema = item.skema || ''
  form.kategori_hibah = item.kategori_hibah || ''
  form.dana_maks = item.dana_maks || ''
  form.event_eyebrow = item.event_eyebrow || ''
  form.info_tambahan = item.info_tambahan || ''
  modalError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function save() {
  saving.value = true
  modalError.value = ''
  let result: { ok: boolean; error?: string }
  if (editingId.value) {
    result = await store.update(editingId.value, { ...form })
  } else {
    result = await store.create({ ...form })
  }
  saving.value = false
  if (result.ok) {
    closeModal()
  } else {
    modalError.value = result.error || 'Gagal menyimpan.'
  }
}

async function confirmDelete(item: HibahEvent) {
  if (!confirm(`Hapus "${cleanTitle(item.title.rendered)}"?\nIni permanen — data pendaftaran yang terkait tidak ikut terhapus.`)) return
  const r = await store.remove(item.id)
  if (!r.ok) alert('Gagal menghapus: ' + (r.error || 'unknown'))
}

onMounted(() => store.fetchAll())
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 12px; }
.page-head h1 { margin-bottom: 0; }
.table-wrap { overflow-x: auto; margin-top: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
th { text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--line); color: var(--ink-soft); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }
td { padding: 12px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
.title-cell { max-width: 300px; }
.title-cell strong { display: block; color: var(--green-800); margin-bottom: 4px; }
.title-cell .skema { font-size: 0.76rem; color: var(--ink-soft); }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.badge.internal { background: #e8f5e9; color: #2e7d32; }
.badge.eksternal { background: #e3f2fd; color: #1565c0; }
.badge.aktif { background: #e8f5e9; color: #2e7d32; }
.badge.ditutup { background: #fff3e0; color: #e65100; }
.badge.arsip { background: var(--paper-2); color: var(--ink-soft); }
.act-col { width: 130px; }
.act-cell { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-sm { padding: 5px 12px; font-size: 0.76rem; border-radius: 4px; border: 1px solid var(--line); cursor: pointer; font-family: inherit; background: var(--card); }
.btn-edit { color: var(--green-700); border-color: var(--green-600); }
.btn-edit:hover { background: var(--green-100); }
.btn-del { color: var(--rust); border-color: var(--rust); }
.btn-del:hover { background: #fff0ed; }
.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; font-size: 0.84rem; color: var(--ink-soft); }
.pager button { padding: 6px 14px; }

/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding-top: 40px; overflow-y: auto; }
.modal { background: var(--card); border-radius: 12px; padding: 32px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal h2 { margin-bottom: 20px; color: var(--green-800); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: 0.78rem; font-weight: 600; color: var(--green-800); }
.field input, .field select, .field textarea { border: 1px solid var(--line); background: #fff; border-radius: 5px; padding: 9px 11px; font-family: inherit; font-size: 0.84rem; color: var(--ink); outline: none; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--green-600); box-shadow: 0 0 0 3px rgba(47,107,79,0.12); }
.error-box { background: #fff0ed; color: var(--rust); padding: 10px 14px; border-radius: 6px; font-size: 0.82rem; margin-top: 16px; border: 1px solid var(--rust); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.loading-text, .error-text { color: var(--ink-soft); padding: 24px 0; }
</style>
