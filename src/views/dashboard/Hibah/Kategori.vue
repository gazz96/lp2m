<template>
  <div class="wrap">
    <h1>Kategori Hibah</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">Kelola kategori untuk mengelompokkan event hibah.</p>

    <div class="components-panel" style="margin-bottom:20px">
      <div class="components-panel__body">
        <div style="display:flex;gap:12px;align-items:flex-end">
          <div style="flex:1">
            <label class="components-base-control__label">Nama Kategori</label>
            <input class="components-text-control__input" type="text" v-model="newName" placeholder="cth. Penelitian Dasar" @keyup.enter="addKat" />
          </div>
          <div style="flex:1">
            <label class="components-base-control__label">Slug <span style="font-weight:400;text-transform:none">(opsional)</span></label>
            <input class="components-text-control__input" type="text" v-model="newSlug" placeholder="penelitian-dasar" />
          </div>
          <WpButton variant="primary" @click="addKat" :disabled="!newName.trim()||adding">{{ adding?'Menyimpan...':'Tambah' }}</WpButton>
        </div>
        <div v-if="err" class="components-notice is-error" style="margin-top:12px;margin-bottom:0"><div class="components-notice__content">{{ err }}</div></div>
      </div>
    </div>

    <WpTable
      :columns="columns"
      :rows="terms"
      :emptyTitle="'Belum ada kategori.'"
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
const terms = ref<{ id: number; name: string; slug: string; count: number }[]>([])
const newName = ref(''), newSlug = ref(''), adding = ref(false), err = ref('')

const columns: WpColumn[] = [
  {
    key: 'name', label: 'Nama', primary: true,
    rowActions: (r: any) => [
      { label: 'Edit', className: 'edit', to: '/dashboard/hibah/kategori' },
      { label: 'Hapus', className: 'trash', onClick: () => deleteTerm(r) },
    ]
  },
  { key: 'slug', label: 'Slug' },
  { key: 'count', label: 'Jumlah', width: '80px' },
]

async function loadKat() { try { const r = await window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100&orderby=name&order=asc`); if (r.ok) terms.value = await r.json() } catch { } }

async function deleteTerm(t: { id: number; name: string; slug: string; count: number }) {
  if (!confirm(`Hapus kategori hibah "${t.name}"?`)) return
  try {
    const r = await window.fetch(`${SITE.apiBase}/kategori_hibah/${t.id}?force=true`, { method: 'DELETE', headers: auth.authHeaders() })
    if (!r.ok) { alert('Gagal menghapus: ' + ((await r.json().catch(() => ({}))).message || r.status)); return }
    loadKat()
  } catch (e: any) { alert('Gagal menghapus: ' + (e.message || '')) }
}
async function addKat() {
  const n = newName.value.trim(); if (!n) return; adding.value = true; err.value = ''
  const slug = newSlug.value.trim() || n.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  try {
    const r = await window.fetch(`${SITE.apiBase}/kategori_hibah`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() }, body: JSON.stringify({ name: n, slug }) })
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal')
    newName.value = ''; newSlug.value = ''; loadKat()
  } catch (e: any) { err.value = e.message } finally { adding.value = false }
}
onMounted(loadKat)
</script>
