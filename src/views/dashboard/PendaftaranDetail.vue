<template>
  <div class="wrap">
    <h1>
      <WpButton variant="link" class="is-small" to="/dashboard/pendaftaran">‹ Kembali</WpButton>
      Detail Pendaftaran
      <span v-if="detail" style="color:var(--wp-text-muted);font-size:13px;font-weight:400;margin-left:8px">
        <code>{{ detail.reg_no }}</code>
      </span>
    </h1>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
    <div v-else-if="error" class="notice notice-error inline"><p>{{ error }}</p></div>
    <div v-else-if="detail" class="components-panel" style="max-width:860px">
      <div class="components-panel__body">

        <!-- Status -->
        <div style="margin-bottom:20px;padding:14px 16px;border-radius:8px;background:#f0f7ff;border-left:3px solid #2271b3">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <label style="font-weight:600;font-size:13px">Status</label>
            <select class="components-select-control__input" v-model="form.status" style="width:200px">
              <option value="submitted">Submitted (baru dikirim)</option>
              <option value="under_review">Under Review (sedang dinilai)</option>
              <option value="revised">Revised (revisi)</option>
              <option value="approved">Approved (diterima)</option>
              <option value="rejected">Rejected (ditolak)</option>
              <option value="done">Done (selesai)</option>
            </select>
            <WpButton variant="primary" :disabled="saving" @click="save">{{ saving ? 'Menyimpan...' : 'Simpan Status' }}</WpButton>
            <span v-if="saveMsg" style="font-size:12px;color:var(--green-700)">{{ saveMsg }}</span>
          </div>
        </div>

        <!-- Data (read-only + field inti bisa edit) -->
        <h2 style="font-size:14px;margin:0 0 12px">Data Pendaftar</h2>
        <table class="form-table" style="width:100%">
          <tr>
            <th style="width:180px">Reg No</th>
            <td><code>{{ detail.reg_no }}</code></td>
          </tr>
          <tr>
            <th>Event Hibah</th>
            <td>{{ detail.event || '—' }}</td>
          </tr>
          <tr>
            <th>Nama Lengkap & Gelar</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.nama" /></td>
          </tr>
          <tr>
            <th>NIP / NIDN</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.nip" /></td>
          </tr>
          <tr>
            <th>Jenis Pengusul</th>
            <td>
              <select class="components-select-control__input" v-model="form.jenis" style="width:220px">
                <option value="Dosen">Dosen</option>
                <option value="Mahasiswa">Mahasiswa</option>
                <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
              </select>
            </td>
          </tr>
          <tr>
            <th>Program Studi</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.prodi" /></td>
          </tr>
          <tr>
            <th>Model Hibah</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.skema" /></td>
          </tr>
          <tr v-if="form.jenis_hibah !== undefined">
            <th>Jenis Hibah</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.jenis_hibah" /></td>
          </tr>
          <tr v-if="form.sdgs">
            <th>SDGs</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.sdgs" /></td>
          </tr>
          <tr>
            <th>Kelompok Keahlian</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.kelompok_keahlian" placeholder="—" /></td>
          </tr>
          <tr>
            <th>Judul Usulan</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.judul" /></td>
          </tr>
          <tr>
            <th>Ringkasan Usulan</th>
            <td><textarea class="components-textarea-control__input" rows="5" style="width:100%" v-model="form.ringkasan"></textarea></td>
          </tr>
          <tr>
            <th>Anggota Tim</th>
            <td>
              <template v-if="detail.anggota_list && detail.anggota_list.length">
                <div v-for="(m, i) in detail.anggota_list" :key="i" style="margin-bottom:4px">
                  <strong>{{ i + 1 }}.</strong> {{ m.nama }} —
                  <span v-if="m.tipe === 'mahasiswa'">Mahasiswa (NIM: {{ m.nomor }}{{ m.prodi ? ', Prodi: ' + m.prodi : '' }})</span>
                  <span v-else>Dosen (NIDN: {{ m.nomor }})</span>
                </div>
              </template>
              <span v-else>—</span>
            </td>
          </tr>
          <tr>
            <th>Email</th>
            <td><input class="components-text-control__input" style="width:100%" type="email" v-model="form.email" /></td>
          </tr>
          <tr>
            <th>WhatsApp</th>
            <td><input class="components-text-control__input" style="width:100%" v-model="form.hp" /></td>
          </tr>
          <tr>
            <th>File Proposal</th>
            <td>
              <div v-if="detail.proposal_url" style="margin-bottom:10px">
                <a :href="detail.proposal_url" target="_blank" rel="noopener" class="components-button is-primary is-small" style="text-decoration:none">
                  ⬇ Download Proposal (PDF)
                </a>
                <span style="font-size:12px;color:var(--wp-text-muted);margin-left:8px">File saat ini</span>
              </div>
              <div v-else style="margin-bottom:10px;font-size:12px;color:var(--wp-text-muted)">Belum ada file proposal.</div>
              <label class="components-button is-secondary is-small" style="cursor:pointer">
                {{ proposalFile ? 'Ganti file: ' + proposalFile.name : 'Pilih file PDF baru (opsional)' }}
                <input type="file" accept="application/pdf,.pdf" style="display:none" @change="onProposalPick" />
              </label>
              <button v-if="proposalFile" type="button" class="components-button is-tertiary is-small" style="margin-left:8px" @click="proposalFile = null; proposalPickErr = ''">Batal</button>
              <p v-if="proposalPickErr" style="margin:6px 0 0;font-size:12px;color:#d63638">{{ proposalPickErr }}</p>
              <p style="margin:6px 0 0;font-size:12px;color:var(--wp-text-muted)">Hanya PDF, maksimal 10 MB. Kosongkan bila tidak ingin mengganti.</p>
              <span v-if="proposalUploadOk" style="display:inline-block;margin-top:6px;font-size:12px;color:#1a7f37">✓ Proposal akan diperbarui saat Simpan</span>
            </td>
          </tr>
          <tr>
            <th>Dikirim Pada</th>
            <td>{{ fmtDate(detail.created_at) }}</td>
          </tr>
        </table>

        <div style="margin-top:20px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <WpButton variant="primary" :disabled="saving" @click="save">{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</WpButton>
          <span v-if="saveMsg" style="font-size:12px;color:#1a7f37">{{ saveMsg }}</span>
          <span v-if="saveErr" style="font-size:12px;color:#d63638;max-width:520px">{{ saveErr }}</span>
          <WpButton variant="link" to="/dashboard/pendaftaran">Kembali ke Daftar</WpButton>
        </div>
        <p v-if="saveErrHint" style="font-size:12px;color:var(--wp-text-muted);margin:8px 0 0">{{ saveErrHint }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpButton from '@/components/WpButton.vue'

const route = useRoute()
const auth = useAuthStore()
const base = SITE.apiBase.replace('/wp/v2', '')
const id = Number(route.params.id)

const detail = ref<any>(null)
const form = ref<any>({})
const loading = ref(true)
const error = ref('')
const saving = ref(false)
const saveMsg = ref('')
const saveErr = ref('')
const saveErrHint = ref('')
const proposalFile = ref<File | null>(null)
const proposalPickErr = ref('')
const proposalUploadOk = ref(false)

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function onProposalPick(e: Event) {
  proposalPickErr.value = ''
  proposalUploadOk.value = false
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) { proposalFile.value = null; return }
  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    proposalPickErr.value = 'Hanya file PDF yang diperbolehkan.'
    proposalFile.value = null
    input.value = ''
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    proposalPickErr.value = 'Ukuran file maksimal 10 MB.'
    proposalFile.value = null
    input.value = ''
    return
  }
  if (file.size === 0) {
    proposalPickErr.value = 'File kosong.'
    proposalFile.value = null
    input.value = ''
    return
  }
  proposalFile.value = file
  proposalUploadOk.value = true
}

async function load() {
  loading.value = true; error.value = ''
  try {
    const r = await fetch(`${base}/lp2m/v1/hibah/${id}`)
    if (!r.ok) throw new Error('HTTP ' + r.status)
    const json = await r.json()
    if (!json.success) throw new Error(json.message || 'Data tidak ditemukan')
    detail.value = json.data
    form.value = {
      status: json.data.status || 'submitted',
      nama: json.data.nama || '', nip: json.data.nip || '',
      jenis: json.data.jenis || '', prodi: json.data.prodi || '',
      skema: json.data.skema || '', jenis_hibah: json.data.jenis_hibah || '',
      sdgs: json.data.sdgs || '', kelompok_keahlian: json.data.kelompok_keahlian || '',
      judul: json.data.judul || '', ringkasan: json.data.ringkasan || '',
      jml_tim: json.data.jml_tim || '', email: json.data.email || '', hp: json.data.hp || '',
    }
    // Event name → tampilkan dari hibah_id bila API tidak menyediakan 'event'
    if (!json.data.event && json.data.hibah_id) {
      try {
        const r2 = await fetch(`${SITE.apiBase}/hibah/${json.data.hibah_id}`)
        if (r2.ok) { const j = await r2.json(); detail.value.event = j.title?.rendered || '' }
      } catch { /* abaikan */ }
    }
  } catch (e: any) { error.value = e.message } finally { loading.value = false }
}

async function save() {
  saving.value = true; saveMsg.value = ''; saveErr.value = ''; saveErrHint.value = ''
  // Login mengilap (mis. ganti password / localStorage terhapus) → handler akan kirim tanpa Authorization → 401.
  // Lebih baik arahkan re-login daripada menampilkan error generik.
  if (!auth.isLoggedIn) {
    saveErr.value = 'Sesi login habis. Silakan login ulang.'
    saveErrHint.value = 'Buka Login LP2M dan masuk dengan username & password akun WP.'
    saving.value = false
    return
  }
  try {
    // Bila ada file proposal baru → kirim sebagai multipart/form-data (backend baca get_file_params()['proposal']).
    // Tanpa file → tetap JSON seperti sebelumnya.
    let r: Response
    if (proposalFile.value) {
      const fd = new FormData()
      fd.set('status', form.value.status)
      fd.set('nama', form.value.nama ?? '')
      fd.set('nip', form.value.nip ?? '')
      fd.set('jenis', form.value.jenis ?? '')
      fd.set('prodi', form.value.prodi ?? '')
      fd.set('skema', form.value.skema ?? '')
      fd.set('judul', form.value.judul ?? '')
      fd.set('ringkasan', form.value.ringkasan ?? '')
      fd.set('email', form.value.email ?? '')
      fd.set('hp', form.value.hp ?? '')
      for (const k of ['jenis_hibah', 'sdgs', 'kelompok_keahlian'] as const) {
        if (form.value[k] !== undefined && form.value[k] !== '') fd.set(k, String(form.value[k]))
      }
      fd.set('proposal', proposalFile.value, proposalFile.value.name)
      r = await fetch(`${base}/lp2m/v1/hibah/${id}`, {
        method: 'POST',
        headers: { ...auth.authHeaders() },
        body: fd,
      })
    } else {
      const body: Record<string, unknown> = {
        status: form.value.status,
        nama: form.value.nama, nip: form.value.nip, jenis: form.value.jenis,
        prodi: form.value.prodi, skema: form.value.skema,
        judul: form.value.judul, ringkasan: form.value.ringkasan,
        email: form.value.email, hp: form.value.hp,
      }
      for (const k of ['jenis_hibah', 'sdgs', 'kelompok_keahlian'] as const) {
        if (form.value[k] !== undefined && form.value[k] !== '') body[k] = form.value[k]
      }
      r = await fetch(`${base}/lp2m/v1/hibah/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
        body: JSON.stringify(body),
      })
    }
    let json: any = null
    try { json = await r.json() } catch { /* non-JSON */ }
    if (!r.ok) {
      const msg = json?.message || json?.code || `HTTP ${r.status}`
      const extra = json?.data?.status ? ` (status ${json.data.status})` : ''
      if (r.status === 401) {
        saveErr.value = `Gagal menyimpan: ${msg}${extra} — sesi login tidak terbaca server.`
        saveErrHint.value = 'Penyebab umum: header Authorization dibuang web server — hubungi admin hosting untuk aktifkan SetEnvIf Authorization / REDIRECT_HTTP_AUTHORIZATION.'
      } else if (r.status === 403) {
        saveErr.value = `Gagal menyimpan: ${msg}${extra} — akun Anda tidak punya izin edit.`
        saveErrHint.value = 'Pastikan akun ber-role Editor/Administrator.'
      } else if (r.status === 429) {
        saveErr.value = `Gagal menyimpan: ${msg}${extra}`
        saveErrHint.value = 'Tunggu beberapa menit lalu coba lagi.'
      } else {
        saveErr.value = `Gagal menyimpan: ${msg}${extra}`
      }
      return
    }
    if (json && json.success === false) throw new Error(json.message || 'Gagal menyimpan')
    const proposalErr = (json as any)?.errors?.proposal as string | undefined
    if (proposalErr) throw new Error(proposalErr)
    saveMsg.value = proposalFile.value ? '✓ Tersimpan & proposal diperbarui' : '✓ Tersimpan'
    if (detail.value) {
      detail.value.status = form.value.status
      const newUrl = (json as any)?.proposal_url
      if (newUrl) detail.value.proposal_url = newUrl
      const newId = (json as any)?.proposal_id
      if (newId !== undefined) detail.value.proposal_id = newId
    }
    if (proposalFile.value) { proposalFile.value = null; proposalUploadOk.value = false }
    setTimeout(() => { saveMsg.value = '' }, 2500)
  } catch (e: any) { saveErr.value = 'Gagal: ' + (e.message || '') } finally { saving.value = false }
}

onMounted(load)
</script>
