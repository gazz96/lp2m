<template>
  <div>
    <div class="page-head">
      <h1>📰 Kelola Artikel</h1>
      <button class="btn btn-primary" @click="openCreate">+ Artikel Baru</button>
    </div>
    <p class="subtitle">Buat, edit, dan hapus artikel. Tersimpan sebagai post di WordPress.</p>

    <div v-if="loading" class="loading-text">Memuat...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Judul</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th class="act-col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in posts" :key="p.id">
              <td class="title-cell">
                <strong>{{ cleanTitle(p.title.rendered) }}</strong>
              </td>
              <td><span class="badge" :class="p.status">{{ p.status }}</span></td>
              <td>{{ fmtDate(p.date) }}</td>
              <td class="act-cell">
                <button class="btn-sm btn-edit" @click="openEdit(p)">Edit</button>
                <button class="btn-sm btn-del" @click="confirmDelete(p)">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="total > perPg" class="pager">
        <button :disabled="pg <= 1" @click="fetchPosts(pg - 1)">← Prev</button>
        <span>Hal {{ pg }} / {{ Math.ceil(total / perPg) }}</span>
        <button :disabled="pg * perPg >= total" @click="fetchPosts(pg + 1)">Next →</button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingId ? 'Edit Artikel' : 'Artikel Baru' }}</h2>
        <form @submit.prevent="save">
          <div class="field">
            <label>Judul *</label>
            <input type="text" v-model="form.title" placeholder="Judul artikel..." />
          </div>
          <div class="field" style="margin-top:14px">
            <label>Konten</label>
            <textarea v-model="form.content" rows="10" placeholder="Isi artikel (HTML)..."></textarea>
          </div>
          <div class="field" style="margin-top:14px">
            <label>Status</label>
            <select v-model="form.status">
              <option value="publish">Publish</option>
              <option value="draft">Draft</option>
            </select>
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
import { ref, reactive, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import type { WpPost } from '@/types'

const auth = useAuthStore()

const posts = ref<WpPost[]>([])
const loading = ref(true)
const error = ref('')
const total = ref(0)
const pg = ref(1)
const perPg = 12

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const modalError = ref('')

const form = reactive({ title: '', content: '', status: 'publish' })

function cleanTitle(raw: string) { return new DOMParser().parseFromString(raw, 'text/html').body.textContent || raw }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('id-ID') }

async function fetchPosts(p = 1) {
  loading.value = true
  error.value = ''
  try {
    const url = `${SITE.apiBase}/posts?per_page=${perPg}&page=${p}&orderby=date&order=desc`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    posts.value = await res.json()
    total.value = parseInt(res.headers.get('X-WP-Total') || '0')
    pg.value = p
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

function openCreate() {
  form.title = ''; form.content = ''; form.status = 'publish'
  editingId.value = null; modalError.value = ''
  showModal.value = true
}

function openEdit(p: WpPost) {
  editingId.value = p.id
  form.title = cleanTitle(p.title.rendered)
  form.content = p.content?.rendered || ''
  form.status = p.status || 'publish'
  modalError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function save() {
  saving.value = true; modalError.value = ''
  try {
    const url = editingId.value ? `${SITE.apiBase}/posts/${editingId.value}` : `${SITE.apiBase}/posts`
    const res = await fetch(url, {
      method: editingId.value ? 'POST' : 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify({ ...form })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      modalError.value = err.message || `HTTP ${res.status}`
      saving.value = false; return
    }
    saving.value = false
    closeModal()
    fetchPosts(pg.value)
  } catch (e: any) {
    modalError.value = e.message
    saving.value = false
  }
}

async function confirmDelete(p: WpPost) {
  if (!confirm(`Hapus "${cleanTitle(p.title.rendered)}"?`)) return
  try {
    const res = await fetch(`${SITE.apiBase}/posts/${p.id}?force=true`, {
      method: 'DELETE', headers: { ...auth.authHeaders() }
    })
    if (!res.ok) alert('Gagal menghapus.')
    else fetchPosts(pg.value)
  } catch { alert('Gagal menghapus.') }
}

onMounted(() => fetchPosts())
</script>

<style scoped>
.page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 12px; }
.page-head h1 { margin-bottom: 0; }
.table-wrap { overflow-x: auto; margin-top: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
th { text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--line); color: var(--ink-soft); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; }
td { padding: 12px 12px; border-bottom: 1px solid var(--line); }
.title-cell strong { color: var(--green-800); }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; }
.badge.publish { background: #e8f5e9; color: #2e7d32; }
.badge.draft { background: var(--paper-2); color: var(--ink-soft); }
.act-col { width: 130px; }
.act-cell { display: flex; gap: 6px; }
.btn-sm { padding: 5px 12px; font-size: 0.76rem; border-radius: 4px; border: 1px solid var(--line); cursor: pointer; font-family: inherit; background: var(--card); }
.btn-edit { color: var(--green-700); border-color: var(--green-600); }
.btn-edit:hover { background: var(--green-100); }
.btn-del { color: var(--rust); border-color: var(--rust); }
.btn-del:hover { background: #fff0ed; }
.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; font-size: 0.84rem; color: var(--ink-soft); }
.pager button { padding: 6px 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 0.78rem; font-weight: 600; color: var(--green-800); }
.field input, .field select, .field textarea { border: 1px solid var(--line); background: #fff; border-radius: 5px; padding: 9px 11px; font-family: inherit; font-size: 0.84rem; color: var(--ink); outline: none; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--green-600); box-shadow: 0 0 0 3px rgba(47,107,79,0.12); }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding-top: 40px; overflow-y: auto; }
.modal { background: var(--card); border-radius: 12px; padding: 32px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal h2 { margin-bottom: 20px; color: var(--green-800); }
.error-box { background: #fff0ed; color: var(--rust); padding: 10px 14px; border-radius: 6px; font-size: 0.82rem; margin-top: 16px; border: 1px solid var(--rust); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.loading-text, .error-text { color: var(--ink-soft); padding: 24px 0; }
</style>
