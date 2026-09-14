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
          <section v-if="result.history?.length" style="padding:20px 24px;border-top:1px solid var(--paper-2)">
            <h2 style="font-size:17px;margin:0 0 14px">Riwayat Tahap</h2>
            <ol style="margin:0;padding-left:20px"><li v-for="item in result.history" :key="item.date + item.status" style="margin:0 0 10px"><strong>{{ item.label }}</strong><br><small>{{ item.date }}</small></li></ol>
          </section>
          <section v-if="hasRevisionInfo" style="padding:20px 24px;border-top:1px solid var(--paper-2);background:#f8fafc">
            <h2 style="font-size:17px;margin:0 0 14px">Tahap Revisi</h2>
            <div v-for="note in revisionNotes" :key="note.label" v-show="note.value" style="margin:0 0 10px"><strong>{{ note.label }}</strong><p style="white-space:pre-wrap;margin:4px 0 0">{{ note.value }}</p></div>
            <p v-if="result.template_url"><a :href="result.template_url" target="_blank" rel="noopener" class="btn btn-primary">Download Template Surat Kesanggupan</a></p>
            <p v-if="result.surat_url" style="color:#16803c">✓ Surat Kesanggupan sudah dikirim.</p>
            <form v-if="revisionToken && !result.surat_url" @submit.prevent="submitRevision" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
              <input type="file" accept="application/pdf,.pdf" required @change="pickRevision" />
              <button type="submit" class="btn btn-primary" :disabled="revisionLoading">{{ revisionLoading ? 'Mengirim…' : 'Kirim Revisi' }}</button>
            </form>
            <p v-if="revisionMessage" style="margin:10px 0 0;color:#16803c">{{ revisionMessage }}</p>
          </section>
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
const result = ref<Record<string, any> | null>(null)
const loading = ref(false)
const error = ref('')
const revisionToken = ref('')
const revisionFile = ref<File | null>(null)
const revisionLoading = ref(false)
const revisionMessage = ref('')

const revisionNotes = computed(() => {
  const r = result.value || {}
  return [
    { label: 'Catatan Admin', value: r.catatan_admin },
    { label: 'Catatan Substansi Internal', value: r.catatan_substansi_internal },
    { label: 'Catatan Substansi Eksternal', value: r.catatan_substansi_eksternal },
  ]
})
const hasRevisionInfo = computed(() => Boolean(revisionToken.value || revisionNotes.value.some(n => n.value) || result.value?.template_url || result.value?.surat_url))

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
    { key: 'jenis_hibah', k: 'Jenis Hibah', v: all.jenis_hibah || '—' },
    { key: 'sdgs', k: 'SDGs', v: all.sdgs || '—' },
    { key: 'kk', k: 'Kelompok Keahlian', v: all.kelompok_keahlian || '—' },
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

function pickRevision(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] || null
  revisionFile.value = file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) && file.size <= 10 * 1024 * 1024 ? file : null
  if (!revisionFile.value) revisionMessage.value = 'File harus PDF dan maksimal 10 MB.'
}

async function loadRevision(token: string) {
  if (!token || !no.value) return
  revisionToken.value = token
  const base = SITE.apiBase.replace('/wp/v2', '')
  const r = await fetch(`${base}/lp2m/v1/pendaftaran/revisi?no=${encodeURIComponent(no.value)}&token=${encodeURIComponent(token)}`)
  const d = await r.json().catch(() => ({}))
  if (!r.ok) { revisionMessage.value = d.message || 'Link revisi tidak valid.'; return }
  result.value = { ...(result.value || {}), ...d.data }
}

async function submitRevision() {
  if (!revisionFile.value || !revisionToken.value) return
  revisionLoading.value = true; revisionMessage.value = ''
  const fd = new FormData(); fd.set('no', no.value); fd.set('token', revisionToken.value); fd.set('surat_kesanggupan', revisionFile.value)
  try {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const r = await fetch(`${base}/lp2m/v1/pendaftaran/revisi`, { method: 'POST', body: fd })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`)
    revisionMessage.value = d.message || 'Revisi berhasil dikirim.'
    if (result.value) result.value.status = 'revision_submitted'
    revisionFile.value = null
  } catch (e: any) { revisionMessage.value = e.message || 'Gagal mengirim revisi.' }
  finally { revisionLoading.value = false }
}

onMounted(() => {
  const route = useRoute()
  const fromPath = (route.params.no as string) || ''
  const q = new URL(location.href).searchParams.get('no') || ''
  const start = fromPath || q
  const token = new URL(location.href).searchParams.get('token') || ''
  if (start) { no.value = start; cek().then(() => { if (token) void loadRevision(token) }) }
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
