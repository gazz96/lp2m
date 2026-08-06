<template>
  <div class="wrap">
    <h1>Jenis Hibah</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">Kelola jenis hibah (mis. Internal, Eksternal, Kerja Sama).</p>

    <div class="components-panel" style="margin-bottom:20px">
      <div class="components-panel__body">
        <div style="display:flex;gap:12px;align-items:flex-end">
          <div style="flex:1">
            <label class="components-base-control__label">Nama Jenis</label>
            <input class="components-text-control__input" type="text" v-model="newName" placeholder="cth. Internal LP2M" @keyup.enter="addTerm" />
          </div>
          <div style="flex:1">
            <label class="components-base-control__label">Induk <span style="font-weight:400;text-transform:none">(opsional)</span></label>
            <ParentTermSelect v-model="newParent" :terms="terms" />
          </div>
          <div style="flex:1">
            <label class="components-base-control__label">Slug <span style="font-weight:400;text-transform:none">(opsional)</span></label>
            <input class="components-text-control__input" type="text" v-model="newSlug" placeholder="internal-lp2m" />
          </div>
          <WpButton variant="primary" @click="addTerm" :disabled="!newName.trim()||adding">{{ adding?'Menyimpan...':'Tambah' }}</WpButton>
        </div>
        <div v-if="err" class="components-notice is-error" style="margin-top:12px;margin-bottom:0"><div class="components-notice__content">{{ err }}</div></div>
      </div>
    </div>

    <WpTable
      :columns="columns"
      :rows="terms"
      :emptyTitle="'Belum ada jenis hibah.'"
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
import ParentTermSelect from '@/components/ParentTermSelect.vue'
import type { WpColumn } from '@/components/WpTable.vue'

const auth = useAuthStore()
const tax = 'jenis_hibah'
type Term = { id: number; name: string; slug: string; count: number; parent?: number }
const terms = ref<Term[]>([])
const newName = ref(''), newSlug = ref(''), newParent = ref(0), adding = ref(false), err = ref('')

const parentOf = (id: number) => terms.value.find(t => t.id === id)?.name || ''

const columns: WpColumn[] = [
  {
    key: 'name', label: 'Nama', primary: true,
    rowActions: (r) => [
      { label: 'Edit', className: 'edit', to: '/dashboard/hibah/jenis' },
      { label: 'Hapus', className: 'trash', to: '/dashboard/hibah/jenis' },
    ]
  },
  { key: 'parent', label: 'Induk', accessor: (r) => parentOf(r.parent || 0) || '—' },
  { key: 'slug', label: 'Slug' },
  { key: 'count', label: 'Jumlah', width: '80px' },
]

async function loadTerm() { try { const r = await window.fetch(`${SITE.apiBase}/${tax}?per_page=100&orderby=name&order=asc`); if (r.ok) terms.value = await r.json() } catch { } }
async function addTerm() {
  const n = newName.value.trim(); if (!n) return; adding.value = true; err.value = ''
  const slug = newSlug.value.trim() || n.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  try {
    const body: Record<string, unknown> = { name: n, slug }
    if (newParent.value > 0) body.parent = newParent.value
    const r = await window.fetch(`${SITE.apiBase}/${tax}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() }, body: JSON.stringify(body) })
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal')
    newName.value = ''; newSlug.value = ''; newParent.value = 0; loadTerm()
  } catch (e: any) { err.value = e.message } finally { adding.value = false }
}
onMounted(loadTerm)
</script>
