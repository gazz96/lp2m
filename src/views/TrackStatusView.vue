<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div id="primary" class="content-area">
      <div class="entry-content" style="max-width:760px;margin:0 auto;padding:80px 16px">

        <h1 style="font-size:32px;margin-bottom:8px">Track Status Pendaftaran</h1>
        <p style="color:var(--ink-soft);margin-bottom:32px">Masukkan nomor registrasi untuk melihat status usulan Anda.</p>

        <form @submit.prevent="cek" style="display:flex;gap:12px;margin-bottom:40px">
          <input
            v-model="no"
            class="track-input"
            placeholder="cth. 2026-00001"
            style="flex:1;padding:14px 18px;border:1px solid var(--wp-border);border-radius:4px;font-size:16px"
          />
          <button type="submit" class="btn btn-primary" style="padding:14px 28px;font-size:15px;white-space:nowrap">Cek Status</button>
        </form>

        <div v-if="loading" style="text-align:center;padding:40px;color:var(--ink-soft)">Memuat...</div>

        <div v-else-if="result" style="border:1px solid var(--paper-2);border-radius:8px;overflow:hidden">
          <div style="padding:20px 24px;background:var(--card);border-bottom:1px solid var(--paper-2);display:flex;align-items:center;gap:12px">
            <span style="font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:0.08em">Nomor Registrasi</span>
            <code style="font-size:15px;font-weight:700;color:var(--green-900)">{{ result.reg_no }}</code>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tr v-for="row in rows" :key="row.k" style="border-bottom:1px solid var(--paper-2)">
              <th style="width:200px;padding:14px 24px;background:var(--paper);text-align:left;font-weight:500;font-size:13px;color:var(--ink-soft);vertical-align:top">{{ row.k }}</th>
              <td style="padding:14px 24px;font-size:14px" :class="{ 'mono reg-num': row.key === 'reg_no' }">{{ row.v }}</td>
            </tr>
            <tr style="border-bottom:none">
              <th style="width:200px;padding:14px 24px;background:var(--paper);text-align:left;font-weight:500;font-size:13px;color:var(--ink-soft)">Status</th>
              <td style="padding:14px 24px">
                <span class="badge" :style="statusStyle(result.status)">{{ (result.status||'submitted').toUpperCase() }}</span>
              </td>
            </tr>
          </table>
        </div>

        <div v-else-if="error" style="padding:16px 20px;background:#fdecea;border:1px solid #f1948e;border-radius:4px;color:#c0392b;font-size:14px">{{ error }}</div>

      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '@/data'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const no = ref('')
const result = ref<Record<string, string> | null>(null)
const loading = ref(false)
const error = ref('')

const rows = computed(() => {
  if (!result.value) return []
  const all = result.value
  return [
    { key: 'nama', k: 'Nama Lengkap', v: all.nama || '—' },
    { key: 'nip', k: 'NIDN / NIDK', v: all.nip || '—' },
    { key: 'email', k: 'Email', v: all.email || '—' },
    { key: 'hp', k: 'WhatsApp', v: all.hp || '—' },
    { key: 'judul', k: 'Judul Usulan', v: all.judul || '—' },
    { key: 'prodi', k: 'Prodi / Unit', v: all.prodi || '—' },
    { key: 'skema', k: 'Model Hibah', v: all.skema || '—' },
    { key: 'jenis', k: 'Jenis Pengusul', v: all.jenis || '—' },
    { key: 'anggota', k: 'Anggota Tim', v: fmtAnggota(all.anggota_list) },
    { key: 'tanggal', k: 'Tanggal Daftar', v: all.tanggal || '—' },
  ]
})

function fmtAnggota(list: any) {
  const arr: any[] = Array.isArray(list) ? list : []
  if (!arr.length) return '—'
  return arr.map((m, i) =>
    `${i + 1}. ${m.nama || ''} (${m.tipe === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}` +
    `${m.tipe === 'mahasiswa' ? ' NIM ' + (m.nomor || '') : ' NIDN ' + (m.nomor || '')}` +
    `${m.tipe === 'mahasiswa' && m.prodi ? ', Prodi ' + m.prodi : ''})`
  ).join('; ')
}

function statusStyle(s = '') {
  if (s === 'approved') return { background: '#d5f5e3', color: '#1e8449', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' as const }
  if (s === 'rejected') return { background: '#fdecea', color: '#c0392b', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' as const }
  return { background: '#fef9e7', color: '#7d6608', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' as const }
}

onMounted(() => {
  const route = useRoute()
  const fromPath = (route.params.no as string) || ''
  const q = new URL(location.href).searchParams.get('no') || ''
  const start = fromPath || q
  if (start) { no.value = start; cek() }
})

async function cek() {
  if (!no.value.trim()) return
  loading.value = true; error.value = ''; result.value = null
  try {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const r = await fetch(`${base}/lp2m/v1/pendaftaran/status/${encodeURIComponent(no.value.trim())}`)
    const d = await r.json().catch(() => ({}))
    if (!r.ok) error.value = d.message || `HTTP ${r.status} — ${d.code || 'error'}`
    else result.value = d
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}
</script>
