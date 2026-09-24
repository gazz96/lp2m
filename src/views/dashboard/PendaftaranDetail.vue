<template>
  <div class="edit-post-layout">
    <div class="editor-header">
      <div class="editor-header__left">
        <WpButton variant="link" class="is-small" to="/dashboard/pendaftaran">‹ Kembali</WpButton>
        <span class="editor-header__title">Detail Pendaftaran</span>
      </div>
      <div class="editor-header__center">
        <span v-if="detail" class="post-state"><code>{{ detail.reg_no }}</code></span>
      </div>
      <div class="editor-header__right">
        <WpButton variant="primary" class="is-small" :disabled="saving || !detail" @click="save">{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</WpButton>
      </div>
    </div>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
    <div v-else-if="error" class="notice notice-error inline"><p>{{ error }}</p></div>
    <div v-else-if="detail" class="editor-body">
      <div class="editor-center">
        <div class="editor-styles">

        <!-- Card 1: Alur Pelaporan (STEP/WIZARD) — section tersendiri -->
        <div class="postbox">
          <div class="postbox-header"><h2>Alur Pelaporan</h2></div>
          <div class="inside" style="padding:0">
            <WorkflowStepper v-model="activeWorkflowTab" :tabs="workflowTabs">
              <template #review>
                <section class="review-panel">
                  <SelectField
                    v-model="form.status_tahap2"
                    label="Status Tahap 2 — Keputusan Reviewer"
                    empty-label="— Belum diputuskan —"
                    :options="tahap2Options"
                  />
                  <p class="field-note">Pilih <strong>Perbaiki Usulan</strong> untuk membuka tautan revisi &amp; mengirim email berisi catatan reviewer ke peserta (sekali per siklus). <strong>Diterima</strong> = usulan disetujui tanpa form revisi. Kosongkan bila belum diputuskan.</p>

                  <TextareaField v-model="form.catatan_admin" label="Catatan Admin" :rows="3" />
                  <TextareaField v-model="form.catatan_substansi_internal" label="Catatan Substansi Internal" :rows="3" />
                  <TextareaField v-model="form.catatan_substansi_eksternal" label="Catatan Substansi Eksternal" :rows="3" />

                  <TextField
                    v-model="form.nilai_dana_usulan"
                    label="Nilai Dana Usulan"
                    inputmode="decimal"
                  />

                  <fieldset class="fund-group">
                    <legend>Nilai Dana Disetujui</legend>
                    <TextField
                      v-model="form.nilai_dana_disetujui"
                      label="Total Dana Disetujui"
                      inputmode="decimal"
                      placeholder="cth. 15.000.000"
                      @blur="normalizeDana"
                    />
                    <p class="field-note">Cukup satu nilai total yang disetujui. Peserta hanya melihat Nilai Dana Usulan &amp; Nilai Dana Disetujui — tanpa rincian per komponen.</p>
                  </fieldset>

                  <div class="template-note">
                    <span class="template-note__label">Template Surat Kesanggupan</span>
                    <template v-if="detail.surat_kesanggupan_template_url">
                      <a :href="detail.surat_kesanggupan_template_url" target="_blank" rel="noopener">Download template saat ini ↗</a>
                      <span class="template-note__hint">Template milik event hibah. Peserta mengunduh sendiri di halaman revisi — tidak perlu upload ulang per pendaftaran.</span>
                    </template>
                    <span v-else class="template-note__hint is-warn">Belum ada template untuk event hibah ini. Unggah <strong>sekali</strong> di menu <strong>Hibah → Panduan &amp; Dokumen</strong> agar semua peserta dapat mengunduhnya.</span>
                  </div>

                  <FileField
                    label="File Upload Surat Kesanggupan"
                    accept="application/pdf,.pdf"
                    :error="suratPickErr"
                    @change="onSuratPick"
                  />
                  <div class="field-status">
                    <template v-if="suratFile">
                      <span class="field-status__badge is-pending">● Akan diunggah saat Simpan</span>
                      <span class="field-status__name">{{ suratFile.name }}</span>
                    </template>
                    <template v-else-if="detail.surat_kesanggupan_url">
                      <a :href="detail.surat_kesanggupan_url" target="_blank" rel="noopener" class="field-status__badge is-ok">✓ File sudah diunggah — Download Surat Kesanggupan</a>
                    </template>
                    <span v-else class="field-status__badge is-empty">○ Belum ada file surat kesanggupan</span>
                  </div>
                  <p class="field-note">Hanya PDF, maksimal 10 MB. Boleh diunggah admin maupun peserta melalui halaman revisi. Kosongkan bila tidak ingin mengganti.</p>

                  <FileField
                    label="File Upload Revisi File Pengajuan"
                    accept="application/pdf,.pdf"
                    :error="revisiProposalPickErr"
                    @change="onRevisiProposalPick"
                  />
                  <div class="field-status">
                    <template v-if="revisiProposalFile">
                      <span class="field-status__badge is-pending">● Akan diunggah saat Simpan</span>
                      <span class="field-status__name">{{ revisiProposalFile.name }}</span>
                    </template>
                    <template v-else-if="detail.revisi_proposal_url">
                      <a :href="detail.revisi_proposal_url" target="_blank" rel="noopener" class="field-status__badge is-ok">✓ File sudah diunggah — Download Revisi File Pengajuan</a>
                    </template>
                    <span v-else class="field-status__badge is-empty">○ Belum ada revisi file pengajuan</span>
                  </div>
                  <p class="field-note">Proposal yang sudah diperbaiki peserta sesuai catatan reviewer. Hanya PDF, maksimal 10 MB. Kosongkan bila tidak ingin mengganti.</p>
                </section>
              </template>

              <!-- Tab Pengajuan (dulu card "Data Pendaftar") -->
              <template #pengajuan>
                <section class="pengajuan-panel">
        <table class="form-table" style="width:100%">
          <tr>
            <th style="width:180px">Reg No</th>
            <td>
              <TextField v-model="form.reg_no" input-class="components-text-control__input" style="width:240px" placeholder="LP2M-2026-00001" />
              <p style="font-size:11px;color:var(--wp-text-muted);margin:5px 0 0">Format: LP2M-YYYY-NNNNN. Nomor wajib unik.</p>
            </td>
          </tr>
          <tr>
            <th>Status Pendaftaran</th>
            <td>
              <SelectField v-model="form.status" input-class="components-select-control__input" style="width:240px" :options="statusOptions" />
            </td>
          </tr>
          <tr>
            <th>Event Hibah</th>
            <td>{{ detail.event || '—' }}</td>
          </tr>
          <tr>
            <th>Nama Lengkap & Gelar</th>
            <td><TextField v-model="form.nama" input-class="components-text-control__input" /></td>
          </tr>
          <tr>
            <th>NIP / NIDN</th>
            <td><TextField v-model="form.nip" input-class="components-text-control__input" /></td>
          </tr>
          <tr>
            <th>Jenis Pengusul</th>
            <td>
              <SelectField v-model="form.jenis" input-class="components-select-control__input" style="width:220px" :options="jenisPengusulOptions" />
            </td>
          </tr>
          <tr>
            <th>Program Studi</th>
            <td><TextField v-model="form.prodi" input-class="components-text-control__input" /></td>
          </tr>
          <tr>
            <th>Model Hibah</th>
            <td><TextField v-model="form.skema" input-class="components-text-control__input" /></td>
          </tr>
          <tr v-if="form.jenis_hibah !== undefined">
            <th>Jenis Hibah</th>
            <td><TextField v-model="form.jenis_hibah" input-class="components-text-control__input" /></td>
          </tr>
          <tr v-if="form.sdgs">
            <th>SDGs</th>
            <td><TextField v-model="form.sdgs" input-class="components-text-control__input" /></td>
          </tr>
          <tr>
            <th>Kelompok Keahlian</th>
            <td><TextField v-model="form.kelompok_keahlian" input-class="components-text-control__input" placeholder="—" /></td>
          </tr>
          <tr>
            <th>Judul Usulan</th>
            <td><TextField v-model="form.judul" input-class="components-text-control__input" /></td>
          </tr>
          <tr>
            <th>Ringkasan Usulan</th>
            <td><TextareaField v-model="form.ringkasan" input-class="components-textarea-control__input" :rows="5" /></td>
          </tr>
          <tr>
            <th>Anggota Tim<br><span style="font-weight:400;font-size:11px;color:var(--wp-text-muted)">maks 2 Dosen + 2 Mahasiswa</span></th>
            <td>
              <div v-if="form.anggota_list && form.anggota_list.length" style="display:flex;flex-direction:column;gap:10px">
                <div v-for="(m, idx) in form.anggota_list" :key="idx" style="display:grid;grid-template-columns:110px 1fr 1fr auto;gap:8px;align-items:end;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
                  <SelectField v-model="m.tipe" label="Tipe" input-class="components-select-control__input" :options="anggotaTipeOptions" />
                  <TextField v-model="m.nomor" :label="m.tipe === 'mahasiswa' ? 'NIM' : 'NIDN'" input-class="components-text-control__input" :placeholder="m.tipe === 'mahasiswa' ? 'NIM' : 'NIDN'" />
                  <TextField v-model="m.nama" label="Nama Lengkap" input-class="components-text-control__input" placeholder="Nama anggota" />
                  <button type="button" class="components-button is-tertiary is-small has-icon" style="color:#d63638" @click="removeAnggota(Number(idx))" title="Hapus anggota">✕</button>
                  <TextField v-if="m.tipe === 'mahasiswa'" v-model="m.prodi" label="Prodi Mahasiswa" input-class="components-text-control__input" placeholder="Prodi" class="anggota-prodi" />
                </div>
              </div>
              <div v-else style="padding:10px;color:var(--wp-text-muted);font-size:13px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;margin-bottom:10px">Belum ada anggota tim.</div>
              <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
                <button type="button" class="components-button is-secondary is-small" :disabled="dosenCount >= 2" @click="addAnggota('dosen')">+ Tambah Dosen {{ dosenCount }}/2</button>
                <button type="button" class="components-button is-secondary is-small" :disabled="mhsCount >= 2" @click="addAnggota('mahasiswa')">+ Tambah Mahasiswa {{ mhsCount }}/2</button>
                <span style="font-size:11px;color:var(--wp-text-muted);align-self:center">Baris kosong tanpa NIDN/NIM + nama akan diabaikan saat simpan.</span>
              </div>
            </td>
          </tr>
          <tr>
            <th>Email</th>
            <td><TextField v-model="form.email" type="email" input-class="components-text-control__input" /></td>
          </tr>
          <tr>
            <th>WhatsApp</th>
            <td><TextField v-model="form.hp" input-class="components-text-control__input" /></td>
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
              <FileField
                :label="proposalFile ? 'Ganti file: ' + proposalFile.name : 'Pilih file PDF baru (opsional)'"
                button-label="Pilih file PDF"
                hidden
                accept="application/pdf,.pdf"
                :error="proposalPickErr"
                empty-label="○ Belum ada file dipilih"
                @change="onProposalPick"
              />
              <button v-if="proposalFile" type="button" class="components-button is-tertiary is-small" style="margin-left:8px" @click="proposalFile = null; proposalPickErr = ''">Batal</button>
              <p style="margin:6px 0 0;font-size:12px;color:var(--wp-text-muted)">Hanya PDF, maksimal 10 MB. Kosongkan bila tidak ingin mengganti.</p>
              <span v-if="proposalUploadOk" style="display:inline-block;margin-top:6px;font-size:12px;color:#1a7f37">✓ Proposal akan diperbarui saat Simpan</span>
            </td>
          </tr>
          <tr>
            <th>Dikirim Pada</th>
            <td>{{ fmtDate(detail.created_at) }}</td>
          </tr>
        </table>
                </section>
              </template>

              <!-- Tab Lap. Kemajuan & Lap. Akhir — panel generik dari konfigurasi
                   `@/data/lapStages` (field teks + template + berkas hasil). -->
              <template v-for="stage in LAP_STAGES" :key="stage.id" #[stage.tabId]>
                <LapStageAdminPanel
                  :stage="stage"
                  :detail="detail"
                  :model="form"
                  :files="lapFiles"
                  :errors="lapErrors"
                  @pick="pickLapFile"
                  @clear="clearLapFile"
                />
              </template>
            </WorkflowStepper>
          </div>
        </div>

        </div>
      </div>

      <!-- Sidebar: status & simpan -->
      <aside class="editor-sidebar">
        <details class="wp-detail-group" open>
          <summary class="wp-detail-group__title">Status &amp; Simpan</summary>
          <div class="wp-detail-group__body">
            <WpButton variant="primary" class="is-small sidebar-save" :disabled="saving" @click="save">{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</WpButton>
            <p v-if="saveMsg" class="sidebar-msg is-ok">{{ saveMsg }}</p>
            <p v-if="saveErr" class="sidebar-msg is-err">{{ saveErr }}</p>
            <p v-if="saveErrHint" class="sidebar-hint">{{ saveErrHint }}</p>
            <WpButton variant="link" class="is-small" to="/dashboard/pendaftaran">‹ Kembali ke Daftar</WpButton>
          </div>
        </details>

        <details class="wp-detail-group" open>
          <summary class="wp-detail-group__title">Ringkasan</summary>
          <div class="wp-detail-group__body">
            <div class="sidebar-meta"><span>Reg No</span><strong>{{ form.reg_no || '—' }}</strong></div>
            <div class="sidebar-meta"><span>Pengusul</span><strong>{{ form.nama || '—' }}</strong></div>
            <div class="sidebar-meta"><span>Event</span><strong>{{ detail.event || '—' }}</strong></div>
            <div class="sidebar-meta"><span>Dikirim</span><strong>{{ detail.created_at ? fmtDate(detail.created_at) : '—' }}</strong></div>
          </div>
        </details>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpButton from '@/components/WpButton.vue'
import WorkflowStepper from '@/components/WorkflowStepper.vue'
import TextField from '@/components/TextField.vue'
import SelectField from '@/components/SelectField.vue'
import TextareaField from '@/components/TextareaField.vue'
import FileField from '@/components/FileField.vue'
import LapStageAdminPanel from '@/components/LapStageAdminPanel.vue'
import { LAP_STAGES, findLapFile } from '@/data/lapStages'
import { lapFileError } from '@/utils/lap'

const jenisPengusulOptions = ['Dosen', 'Mahasiswa', 'Tenaga Kependidikan']
const anggotaTipeOptions = [
  { label: 'Dosen (NIDN)', value: 'dosen' },
  { label: 'Mahasiswa (NIM)', value: 'mahasiswa' },
]
const tahap2Options = [
  { label: 'Perbaiki Usulan', value: 'perbaiki_usulan' },
  { label: 'Diterima', value: 'diterima' },
]
const statusOptions = [
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
]

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
const suratFile = ref<File | null>(null)
const suratPickErr = ref('')
/** Proposal hasil perbaikan peserta sesuai catatan reviewer. */
const revisiProposalFile = ref<File | null>(null)
const revisiProposalPickErr = ref('')
const activeWorkflowTab = ref('pengajuan')

const workflowTabs = [
  { id: 'pengajuan', label: 'Pengajuan', step: '01' },
  { id: 'review', label: 'Usulan', step: '02' },
  { id: 'progress', label: 'Laporan Kemajuan', step: '03' },
  { id: 'final', label: 'Laporan Akhir', step: '04' },
  { id: 'outcomes', label: 'Pengkinian Capaian', step: '05', enabled: false },
]

/** Berkas tahap lap yang dipilih admin, keyed by `param` (lihat `@/data/lapStages`). */
const lapFiles = ref<Record<string, File | null>>({})
/** Pesan error validasi berkas tahap lap per `param`. */
const lapErrors = ref<Record<string, string>>({})

/** Picker berkas tahap lap — dipakai kedua tab (Lap. Kemajuan & Lap. Akhir). */
function pickLapFile(param: string, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  lapErrors.value = { ...lapErrors.value, [param]: '' }
  if (!file) { lapFiles.value = { ...lapFiles.value, [param]: null }; return }

  const field = findLapFile(param)
  const err = field ? lapFileError(file, field.ext) : ''
  if (err) {
    lapErrors.value = { ...lapErrors.value, [param]: err }
    lapFiles.value = { ...lapFiles.value, [param]: null }
    input.value = ''
    return
  }
  lapFiles.value = { ...lapFiles.value, [param]: file }
}

function clearLapFile(param: string) {
  lapFiles.value = { ...lapFiles.value, [param]: null }
  lapErrors.value = { ...lapErrors.value, [param]: '' }
}

/** Nilai dana disetujui = 1 input tunggal; komposisi 30/50/20 hanya rincian hitung (bukan field tersimpan). */
function parseAmount(v: unknown): number {
  if (v === null || v === undefined || v === '') return 0
  const digits = String(v).replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

/** Format angka ke "1.500.000" (tanpa desimal) — dibiarkan kosong bila 0. */
function formatAmount(n: number): string {
  return n > 0 ? new Intl.NumberFormat('id-ID').format(n) : ''
}

/** Rapikan input dana saat blur: "1500000" → "1.500.000". */
function normalizeDana() {
  const n = parseAmount(form.value.nilai_dana_disetujui)
  form.value.nilai_dana_disetujui = formatAmount(n)
}

const dosenCount = computed(() => (form.value.anggota_list || []).filter((m: any) => m.tipe !== 'mahasiswa').length)
const mhsCount = computed(() => (form.value.anggota_list || []).filter((m: any) => m.tipe === 'mahasiswa').length)
function addAnggota(tipe: 'dosen' | 'mahasiswa') {
  if (!form.value.anggota_list) form.value.anggota_list = []
  if (tipe === 'dosen' && dosenCount.value >= 2) return
  if (tipe === 'mahasiswa' && mhsCount.value >= 2) return
  form.value.anggota_list.push({ tipe, nomor: '', nama: '', prodi: '' })
}
function removeAnggota(idx: number) {
  form.value.anggota_list.splice(idx, 1)
}

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

function onSuratPick(e: Event) {
  suratPickErr.value = ''
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) { suratFile.value = null; return }
  if ((file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    suratPickErr.value = 'Surat Kesanggupan harus berupa PDF.'
    suratFile.value = null
    input.value = ''
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    suratPickErr.value = 'Ukuran file maksimal 10 MB.'
    suratFile.value = null
    input.value = ''
    return
  }
  if (file.size === 0) {
    suratPickErr.value = 'File kosong.'
    suratFile.value = null
    input.value = ''
    return
  }
  suratFile.value = file
}

/** Picker Revisi File Pengajuan — aturan sama dengan Surat Kesanggupan (PDF ≤10 MB). */
function onRevisiProposalPick(e: Event) {
  revisiProposalPickErr.value = ''
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) { revisiProposalFile.value = null; return }
  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    revisiProposalPickErr.value = 'Revisi File Pengajuan harus berupa PDF.'
    revisiProposalFile.value = null
    input.value = ''
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    revisiProposalPickErr.value = 'Ukuran file maksimal 10 MB.'
    revisiProposalFile.value = null
    input.value = ''
    return
  }
  if (file.size === 0) {
    revisiProposalPickErr.value = 'File kosong.'
    revisiProposalFile.value = null
    input.value = ''
    return
  }
  revisiProposalFile.value = file
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
	  reg_no: json.data.reg_no || '',
      status: json.data.status || 'submitted',      // Status Tahap 2 = keputusan reviewer: '' | 'perbaiki_usulan' | 'diterima'.
      status_tahap2: json.data.status_tahap2 || '',      nama: json.data.nama || '', nip: json.data.nip || '',
      jenis: json.data.jenis || '', prodi: json.data.prodi || '',
      skema: json.data.skema || '', jenis_hibah: json.data.jenis_hibah || '',
      sdgs: json.data.sdgs || '', kelompok_keahlian: json.data.kelompok_keahlian || '',
      judul: json.data.judul || '', ringkasan: json.data.ringkasan || '',
      jml_tim: json.data.jml_tim || '', email: json.data.email || '', hp: json.data.hp || '',
      anggota_list: Array.isArray(json.data.anggota_list) ? json.data.anggota_list.map((m: any) => ({
        tipe: m.tipe === 'mahasiswa' ? 'mahasiswa' : 'dosen',
        nomor: String(m.nomor ?? ''), nama: String(m.nama ?? ''), prodi: String(m.prodi ?? ''),
      })) : [],
      catatan_admin: json.data.catatan_admin || '', catatan_substansi_internal: json.data.catatan_substansi_internal || '',
      catatan_substansi_eksternal: json.data.catatan_substansi_eksternal || '', nilai_dana_usulan: json.data.nilai_dana_usulan || '',
      nilai_dana_disetujui: json.data.nilai_dana_disetujui || '',
      surat_kesanggupan_template_url: json.data.surat_kesanggupan_template_url || '',
    }
    // Tahap lap (Lap. Kemajuan / Lap. Akhir): field teks + status tahap. Key-nya
    // sama dengan meta backend tanpa garis bawah awal (lihat `@/data/lapStages`).
    for (const stage of LAP_STAGES) {
      for (const f of stage.text) form.value[f.key] = json.data[f.key] || ''
      form.value[stage.statusKey] = json.data[stage.statusKey] || ''
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
    // — selalu kirim sebagai FormData agar anggota_list (JSON) + proposal (file opsional) konsisten —
    // backend sanitize_input sudah menangani FormData JSON string maupun array JSON.
    const list = Array.isArray(form.value.anggota_list) ? form.value.anggota_list : []
    let r: Response
    const fd = new FormData()
    fd.set('status', form.value.status)
	  fd.set('reg_no', form.value.reg_no ?? '')
    // Selalu dikirim (boleh string kosong) supaya admin bisa mengosongkan keputusan tahap 2.
    fd.set('status_tahap2', String(form.value.status_tahap2 ?? ''))
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
    for (const k of ['catatan_admin', 'catatan_substansi_internal', 'catatan_substansi_eksternal', 'nilai_dana_usulan', 'nilai_dana_disetujui'] as const) fd.set(k, String(form.value[k] ?? ''))
    fd.set('anggota_list', JSON.stringify(list))
    if (proposalFile.value) fd.set('proposal', proposalFile.value, proposalFile.value.name)
    if (suratFile.value) fd.set('surat_kesanggupan', suratFile.value, suratFile.value.name)
    if (revisiProposalFile.value) fd.set('revisi_proposal', revisiProposalFile.value, revisiProposalFile.value.name)
    // Tahap lap: field teks + status tahap + berkas (template maupun hasil peserta).
    for (const stage of LAP_STAGES) {
      for (const f of stage.text) fd.set(f.key, String(form.value[f.key] ?? ''))
      fd.set(stage.statusKey, String(form.value[stage.statusKey] ?? ''))
      for (const file of stage.files) {
        const picked = lapFiles.value[file.param]
        if (picked) fd.set(file.param, picked, picked.name)
      }
    }
    r = await fetch(`${base}/lp2m/v1/hibah/${id}`, {
      method: 'POST',
      headers: { ...auth.authHeaders() },
      body: fd,
    })
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
    const suratErr = (json as any)?.errors?.surat_kesanggupan as string | undefined
    if (suratErr) throw new Error(suratErr)
    const revisiErr = (json as any)?.errors?.revisi_proposal as string | undefined
    if (revisiErr) throw new Error(revisiErr)
    // Error validasi berkas tahap lap — key = `param` (mis. `lapkem_laporan`).
    const lapErrEntry = Object.entries(((json as any)?.errors || {}) as Record<string, string>).find(
      ([k]) => k.startsWith('lapkem_') || k.startsWith('lapakhir_'),
    )
    if (lapErrEntry) {
      lapErrors.value = { ...lapErrors.value, [lapErrEntry[0]]: lapErrEntry[1] }
      throw new Error(lapErrEntry[1])
    }
    saveMsg.value = proposalFile.value ? '✓ Tersimpan & proposal diperbarui' : '✓ Tersimpan'
    // Status / Status Tahap 2 berubah → backend otomatis mengirim email ke pemohon.
    // Tampilkan hasilnya agar admin tahu bila email (termasuk tautan revisi) gagal terkirim.
    const isPerbaikan = String(form.value.status_tahap2 || '') === 'perbaiki_usulan'
    if ((json as any)?.email_sent === false) {
      saveMsg.value = ''
      saveErr.value = `Tersimpan, tetapi email ke pemohon GAGAL terkirim${(json as any)?.email_error ? ': ' + (json as any).email_error : '.'}`
      saveErrHint.value = isPerbaikan
        ? 'Karena email gagal, peserta belum menerima tautan revisi. Perbaiki SMTP/email pemohon lalu gunakan tombol "Kirim Email" pada kolom list.'
        : 'Periksa konfigurasi SMTP di LP2M → Settings dan pastikan email pemohon valid.'
    } else if ((json as any)?.email_sent === true) {
      saveMsg.value = (proposalFile.value ? '✓ Tersimpan & proposal diperbarui' : '✓ Tersimpan') + ' & email terkirim ke pemohon'
      if (isPerbaikan) saveMsg.value += ' (berisi tautan revisi)'
    } else if (isPerbaikan) {
      saveMsg.value = (proposalFile.value ? '✓ Tersimpan & proposal diperbarui' : '✓ Tersimpan')
        + ' — Status Tahap 2 tidak berubah, jadi email tidak dikirim ulang. Pakai tombol “Kirim Email” di daftar pendaftaran bila perlu mengirim ulang tautan revisi.'
    }
    // Hasil email undangan tahap lap (hanya terisi saat status tahap diset "dibuka").
    const lapEmail = ((json as any)?.lap_email || {}) as Record<string, { sent: boolean; error?: string }>
    for (const stage of LAP_STAGES) {
      const res = lapEmail[stage.id]
      if (!res) continue
      if (res.sent) {
        saveMsg.value = `✓ Tersimpan & email form ${stage.label} terkirim ke pemohon`
      } else {
        saveMsg.value = ''
        saveErr.value = `Tersimpan, tetapi email form ${stage.label} GAGAL terkirim${res.error ? ': ' + res.error : '.'}`
        saveErrHint.value = 'Peserta belum menerima tautan form. Perbaiki SMTP/email pemohon lalu simpan ulang (status "Buka Form Peserta") untuk mengirim ulang.'
      }
    }
    if (detail.value) {
	      detail.value.reg_no = form.value.reg_no
      detail.value.status = form.value.status
      detail.value.status_tahap2 = String(form.value.status_tahap2 ?? '')
      const newUrl = (json as any)?.proposal_url
      if (newUrl) detail.value.proposal_url = newUrl
      const newId = (json as any)?.proposal_id
      if (newId !== undefined) detail.value.proposal_id = newId
      const newTemplateUrl = (json as any)?.surat_kesanggupan_template_url
      if (newTemplateUrl) detail.value.surat_kesanggupan_template_url = newTemplateUrl
      const newSuratUrl = (json as any)?.surat_kesanggupan_url
      if (newSuratUrl) detail.value.surat_kesanggupan_url = newSuratUrl
      const newRevisiUrl = (json as any)?.revisi_proposal_url
      if (newRevisiUrl) detail.value.revisi_proposal_url = newRevisiUrl
      const newRevisiId = (json as any)?.revisi_proposal_id
      if (newRevisiId !== undefined) detail.value.revisi_proposal_id = newRevisiId
      const newList = (json as any)?.anggota_list
      if (Array.isArray(newList)) detail.value.anggota_list = newList
      else detail.value.anggota_list = [...(form.value.anggota_list || [])]
      // Status tahap lap + waktu kirim peserta ikut disinkronkan ke `detail`.
      const lapStatus = ((json as any)?.lap_status || {}) as Record<string, string>
      for (const stage of LAP_STAGES) {
        if (lapStatus[stage.id] !== undefined) detail.value[stage.statusKey] = lapStatus[stage.id]
      }
      // Berkas tahap lap yang baru diunggah → perbarui tautan unduh.
      const lapUrls = ((json as any)?.lap_urls || {}) as Record<string, string>
      for (const [k, v] of Object.entries(lapUrls)) detail.value[k] = v
    }
    if (proposalFile.value) { proposalFile.value = null; proposalUploadOk.value = false }
    if (suratFile.value) suratFile.value = null
    if (revisiProposalFile.value) revisiProposalFile.value = null
    // Berkas tahap lap sudah terkirim → bersihkan pilihan & error.
    lapFiles.value = {}
    lapErrors.value = {}
    setTimeout(() => { saveMsg.value = '' }, 2500)
  } catch (e: any) { saveErr.value = 'Gagal: ' + (e.message || '') } finally { saving.value = false }
}

onMounted(load)
</script>

<style scoped>
/* ── Layout: konten + sidebar ── */
.edit-post-layout{display:flex;flex-direction:column;min-height:100vh}
.editor-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 16px;background:#fff;border-bottom:1px solid var(--wp-border-light);min-height:48px}
.editor-header__left{display:flex;align-items:center;gap:8px}
.editor-header__title{font-size:14px;font-weight:500}
.editor-header__center{display:flex;align-items:center;min-width:0}
.editor-header__right{display:flex;align-items:center}
.editor-body{display:flex;align-items:flex-start;flex:1;background:var(--wp-bg)}
.editor-center{flex:1;min-width:0;padding:24px 0 60px}
.editor-styles{max-width:840px;margin:0 auto;padding:0 24px}
.editor-sidebar{width:280px;flex-shrink:0;align-self:stretch;border-left:1px solid var(--wp-border-light);background:#fff}

/* ── Sidebar groups ── */
.wp-detail-group{border-bottom:1px solid #e0e0e0}
.wp-detail-group__title{display:flex;align-items:center;padding:12px 16px;font-size:13px;font-weight:500;color:var(--wp-text);cursor:pointer;user-select:none;list-style:none}
.wp-detail-group__title::-webkit-details-marker{display:none}
.wp-detail-group__title::before{content:"";display:inline-block;width:8px;height:8px;border-right:2px solid var(--wp-text-secondary);border-bottom:2px solid var(--wp-text-secondary);margin-right:8px;transform:rotate(-45deg);transition:transform .15s}
.wp-detail-group[open] .wp-detail-group__title::before{transform:rotate(45deg)}
.wp-detail-group__body{padding:0 16px 16px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.sidebar-label{font-size:12px;font-weight:600}
.sidebar-save{width:100%;justify-content:center;margin-top:4px}
.sidebar-msg{margin:0;font-size:12px}
.sidebar-msg.is-ok{color:#1a7f37}
.sidebar-msg.is-err{color:#d63638}
.sidebar-hint{margin:0;font-size:11px;color:var(--wp-text-muted)}
.sidebar-meta{display:flex;flex-direction:column;gap:2px;width:100%}
.sidebar-meta span{font-size:11px;color:var(--wp-text-muted)}
.sidebar-meta strong{font-size:13px;font-weight:500;word-break:break-word}

/* ── Workflow content ── */
.pengajuan-panel{padding:14px 18px 18px}
.pengajuan-panel .form-table{margin:0}
.pengajuan-panel .form-table th{font-weight:600;vertical-align:top;padding:12px 12px 12px 0}
.pengajuan-panel .form-table td{padding:10px 0}
.review-panel{padding:16px;display:grid;gap:12px;background:#f8fbff}
.review-panel .field-note{font-weight:400}
.workflow-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}
.workflow-heading h2{margin:0;font-size:15px}
.eyebrow{margin:0 0 3px;color:#2271b3;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.workflow-status{padding:4px 8px;border-radius:999px;background:#dcfce7;color:#166534;font-size:11px;font-weight:600}
.review-money{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field-note{margin:0;font-size:11px;font-weight:400;color:var(--wp-text-muted);line-height:1.5}
.field-status{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.field-status__badge{display:inline-block;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:600;text-decoration:none}
.field-status__badge.is-ok{background:#dcfce7;color:#166534}
.field-status__badge.is-ok:hover{background:#bbf7d0;text-decoration:underline}
.field-status__badge.is-pending{background:#fef3c7;color:#92400e}
.field-status__badge.is-empty{background:#f1f5f9;color:#64748b}
.field-status__name{font-size:11px;color:var(--wp-text-muted);word-break:break-all}

/* ── Dana disetujui (satu input) ── */
.fund-group{margin:0;padding:12px 14px 14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff}
.fund-group legend{padding:0 6px;font-size:12px;font-weight:700;color:var(--wp-text)}
.fund-group .field-note{margin-top:8px}

/* Field Prodi mahasiswa membentang 3 kolom grid anggota. */
.anggota-prodi{grid-column:1 / span 3}

/* ── Template Surat Kesanggupan (milik event hibah, read-only di sini) ── */
.template-note{display:grid;gap:4px;padding:10px 12px;border:1px dashed #c3d9ef;border-radius:8px;background:#f0f6fc}
.template-note__label{font-size:12px;font-weight:700;color:var(--wp-text)}
.template-note a{font-size:12px;font-weight:600;color:#2271b3;text-decoration:none}
.template-note a:hover{text-decoration:underline}
.template-note__hint{font-size:11px;font-weight:400;color:var(--wp-text-muted);line-height:1.5}
.template-note__hint.is-warn{color:#92400e}

@media(max-width:1024px){
  .editor-body{flex-direction:column}
  .editor-sidebar{width:100%;border-left:0;border-top:1px solid var(--wp-border-light)}
}
@media(max-width:640px){
  .review-money{grid-template-columns:1fr}
  .editor-styles{padding:0 12px}
}
</style>
