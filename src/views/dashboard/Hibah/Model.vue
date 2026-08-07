<template>
  <div class="wrap">
    <h1>Model Hibah</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">Kelola model pendanaan untuk event hibah (menggantikan "Skema Hibah").</p>

    <div class="components-panel" style="margin-bottom:20px">
      <div class="components-panel__body">
        <div style="display:flex;gap:12px;align-items:flex-end">
          <div style="flex:1">
            <label class="components-base-control__label">Nama Model</label>
            <input class="components-text-control__input" type="text" v-model="newName" placeholder="cth. Hibah Kompetitif Riset" @keyup.enter="addTerm" />
          </div>
          <div style="flex:1">
            <label class="components-base-control__label">Slug <span style="font-weight:400;text-transform:none">(opsional)</span></label>
            <input class="components-text-control__input" type="text" v-model="newSlug" placeholder="hibah-kompetitif-riset" />
          </div>
          <WpButton variant="primary" @click="editingId ? saveTerm() : addTerm()" :disabled="!newName.trim()||adding">{{ adding?'Menyimpan...':(editingId?'Perbarui':'Tambah') }}</WpButton>
          <WpButton v-if="editingId" variant="tertiary" @click="cancelEdit">Batal</WpButton>
        </div>
        <div v-if="err" class="components-notice is-error" style="margin-top:12px;margin-bottom:0"><div class="components-notice__content">{{ err }}</div></div>
      </div>
    </div>

    <WpTable
      :columns="columns"
      :rows="terms"
      :emptyTitle="'Belum ada model hibah.'"
      :emptySub="'Gunakan form di atas untuk menambah.'"
      :showFooter="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpTable from '@/components/WpTable.vue'
import WpButton from '@/components/WpButton.vue'
import type { WpColumn } from '@/components/WpTable.vue'

const auth = useAuthStore()
const tax = 'model_hibah'
const terms = ref<{ id: number; name: string; slug: string; count: number }[]>([])
const newName = ref(''), newSlug = ref(''), adding = ref(false), err = ref('')
const editingId = ref<number | null>(null)

const columns: WpColumn[] = [
  {
    key: 'name', label: 'Nama', primary: true,
    rowActions: (r: any) => [
      { label: 'Edit', className: 'edit', onClick: () => startEdit(r) },
      { label: 'Hapus', className: 'trash', onClick: () => deleteTerm(r) },
    ]
  },
  { key: 'slug', label: 'Slug' },
  { key: 'count', label: 'Jumlah', width: '80px' },
]

function startEdit(t: { id: number; name: string; slug: string }) {
  editingId.value = t.id
  newName.value = t.name
  newSlug.value = t.slug || ''
  err.value = ''
}

function cancelEdit() {
  editingId.value = null
  newName.value = ''
  newSlug.value = ''
  err.value = ''
}

async function loadTerm() { try { const r = await window.fetch(`${SITE.apiBase}/${tax}?per_page=100&orderby=name&order=asc`); if (r.ok) terms.value = await r.json() } catch { } }

async function deleteTerm(t: { id: number; name: string; slug: string; count: number }) {
  if (!confirm(`Hapus model hibah "${t.name}"?`)) return
  try {
    const r = await window.fetch(`${SITE.apiBase}/${tax}/${t.id}?force=true`, { method: 'DELETE', headers: auth.authHeaders() })
    if (!r.ok) { alert('Gagal menghapus: ' + ((await r.json().catch(() => ({}))).message || r.status)); return }
    if (editingId.value === t.id) cancelEdit()
    loadTerm()
  } catch (e: any) { alert('Gagal menghapus: ' + (e.message || '')) }
}
async function addTerm() {
  const n = newName.value.trim(); if (!n) return; adding.value = true; err.value = ''
  const slug = newSlug.value.trim() || n.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  try {
    const r = await window.fetch(`${SITE.apiBase}/${tax}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() }, body: JSON.stringify({ name: n, slug }) })
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal')
    newName.value = ''; newSlug.value = ''; loadTerm()
  } catch (e: any) { err.value = e.message } finally { adding.value = false }
}
async function saveTerm() {
  if (!editingId.value || !newName.value.trim()) return
  adding.value = true; err.value = ''
  try {
    const r = await window.fetch(`${SITE.apiBase}/${tax}/${editingId.value}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() }, body: JSON.stringify({ name: newName.value.trim(), slug: newSlug.value.trim() || undefined }) })
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal')
    cancelEdit(); loadTerm()
  } catch (e: any) { err.value = e.message } finally { adding.value = false }
}
onMounted(loadTerm)
</script>
