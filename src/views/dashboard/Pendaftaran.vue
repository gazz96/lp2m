<template>
  <div>
    <div class="page-head">
      <h1>📬 Pendaftaran Hibah</h1>
    </div>
    <p class="subtitle">Data pendaftaran yang masuk dari form publik LP2M.</p>

    <div v-if="loading" class="loading-text">Memuat...</div>
    <div v-else-if="error" class="error-text">{{ error }}</div>
    <div v-else>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reg No</th>
              <th>Nama</th>
              <th>Jenis</th>
              <th>Skema</th>
              <th>Judul</th>
              <th>Tanggal</th>
              <th class="act-col">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td><code>{{ item.reg_no }}</code></td>
              <td>{{ item.nama }}</td>
              <td><span class="badge-sm">{{ item.jenis }}</span></td>
              <td>{{ item.skema }}</td>
              <td class="judul-cell">{{ item.judul }}</td>
              <td>{{ fmtDate(item.created_at) }}</td>
              <td>
                <button class="btn-sm btn-edit" @click="showDetail(item)">Lihat</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="total > perPg" class="pager">
        <button :disabled="pg <= 1" @click="fetchData(pg - 1)">← Prev</button>
        <span>Hal {{ pg }} / {{ Math.ceil(total / perPg) }}</span>
        <button :disabled="pg * perPg >= total" @click="fetchData(pg + 1)">Next →</button>
      </div>
    </div>

    <!-- Detail modal -->
    <div v-if="detail" class="modal-backdrop" @click.self="detail = null">
      <div class="modal">
        <h2>Detail Pendaftaran</h2>
        <div class="detail-grid">
          <div><strong>Reg No:</strong> {{ detail.reg_no }}</div>
          <div><strong>Nama:</strong> {{ detail.nama }}</div>
          <div><strong>NIP/NIDN:</strong> {{ detail.nip }}</div>
          <div><strong>Jenis:</strong> {{ detail.jenis }}</div>
          <div><strong>Prodi:</strong> {{ detail.prodi }}</div>
          <div><strong>Skema:</strong> {{ detail.skema }}</div>
          <div><strong>Judul:</strong> {{ detail.judul }}</div>
          <div><strong>Ringkasan:</strong> {{ detail.ringkasan }}</div>
          <div><strong>Jml Tim:</strong> {{ detail.jml_tim || '-' }}</div>
          <div><strong>Anggota:</strong> {{ detail.anggota || '-' }}</div>
          <div><strong>Email:</strong> {{ detail.email }}</div>
          <div><strong>HP:</strong> {{ detail.hp }}</div>
          <div><strong>Tanggal:</strong> {{ fmtDate(detail.created_at) }}</div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="detail = null">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'

interface Submission {
  id: number; reg_no: string; nama: string; nip: string; jenis: string
  prodi: string; skema: string; judul: string; ringkasan: string
  jml_tim: string; anggota: string; email: string; hp: string
  hibah_id: number; created_at: string
}

const items = ref<Submission[]>([])
const loading = ref(true)
const error = ref('')
const total = ref(0)
const pg = ref(1)
const perPg = 20
const detail = ref<Submission | null>(null)

function fmtDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }

async function fetchData(p = 1) {
  loading.value = true
  error.value = ''
  try {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const url = `${base}/lp2m/v1/hibah?per_page=${perPg}&page=${p}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.success) {
      items.value = json.data || []
      total.value = json.total
      pg.value = p
    } else {
      error.value = json.message || 'Gagal memuat data.'
    }
  } catch (e: any) { error.value = e.message }
  finally { loading.value = false }
}

async function showDetail(item: Submission) {
  try {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const res = await fetch(`${base}/lp2m/v1/hibah/${item.id}`)
    const json = await res.json()
    detail.value = json.success ? json.data : null
  } catch { detail.value = item }
}

onMounted(() => fetchData())
</script>

<style scoped>
.page-head h1 { margin-bottom: 8px; }
.table-wrap { overflow-x: auto; margin-top: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
th { text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--line); color: var(--ink-soft); font-weight: 600; font-size: 0.76rem; text-transform: uppercase; white-space: nowrap; }
td { padding: 10px 12px; border-bottom: 1px solid var(--line); }
.judul-cell { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
code { font-family: 'IBM Plex Mono', monospace; font-size: 0.76rem; background: var(--paper-2); padding: 2px 6px; border-radius: 3px; }
.badge-sm { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 600; background: var(--paper-2); color: var(--ink-soft); }
.act-col { width: 70px; }
.btn-sm { padding: 5px 12px; font-size: 0.74rem; border-radius: 4px; border: 1px solid var(--line); cursor: pointer; font-family: inherit; background: var(--card); }
.btn-edit { color: var(--green-700); border-color: var(--green-600); }
.pager { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; font-size: 0.84rem; color: var(--ink-soft); }
.pager button { padding: 6px 14px; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding-top: 60px; }
.modal { background: var(--card); border-radius: 12px; padding: 28px; width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal h2 { margin-bottom: 18px; color: var(--green-800); }
.detail-grid { display: grid; grid-template-columns: 1fr; gap: 10px; font-size: 0.87rem; }
.detail-grid div { display: flex; gap: 8px; }
.detail-grid strong { min-width: 110px; color: var(--green-800); }
.modal-actions { display: flex; justify-content: flex-end; margin-top: 20px; }
.loading-text, .error-text { color: var(--ink-soft); padding: 24px 0; }
</style>
