<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div id="primary" class="content-area">
      <div class="entry-content track-shell">

        <h1 class="track-title">Track Status Pendaftaran</h1>
        <p class="track-lead">
          Masukkan nomor registrasi untuk melihat status usulan Anda. Tautan revisi yang dikirim
          melalui email akan otomatis membuka <strong>mode edit</strong> pada tahap Revisi.
        </p>

        <TrackSearchForm v-model="no" @submit="cek" />

        <div v-if="loading" class="track-loading">Memuat…</div>

        <div v-else-if="error" class="track-alert">{{ error }}</div>

        <template v-else-if="result">
          <div class="track-head">
            <div>
              <span class="track-head__label">Nomor Registrasi</span>
              <code class="track-head__no">{{ result.reg_no }}</code>
            </div>
            <StatusBadge :status="result.status" />
          </div>

          <TrackAccessBanner
            :can-edit="canEdit"
            :approved="revisionApproved"
            :submitted="revisionSubmitted"
            :token-error="revisionTokenError"
          />

          <WorkflowStepper v-model="activeTab" :tabs="tabs">
            <template #pengajuan>
              <WfPanel eyebrow="Tahap 1" title="Data Pendaftaran">
                <div class="panel-status">
                  <span class="panel-status__label">Status Pendaftaran</span>
                  <StatusBadge :status="result.status" :text="statusLabel(result.status)" />
                </div>
                <TrackTable>
                  <TrackRow v-for="row in rows" :key="row.key" :label="row.k" :value="row.v" />
                  <TrackRow label="Status">
                    <StatusBadge :status="result.status" :text="statusLabel(result.status)" />
                  </TrackRow>
                </TrackTable>
              </WfPanel>

              <WfPanel v-if="result.history?.length" title="Riwayat Tahap" muted>
                <ol class="track-history">
                  <li v-for="item in result.history" :key="item.date + item.status">
                    <strong>{{ item.label }}</strong>
                    <small>{{ item.date }}</small>
                  </li>
                </ol>
              </WfPanel>
            </template>

            <template #revisi>
              <WfPanel eyebrow="Tahap 2" title="Tahap Usulan">
                <div class="panel-status">
                  <span class="panel-status__label">Status Usulan</span>
                  <StatusBadge :status="tahap2BadgeStatus" :text="tahap2Label" />
                </div>
                <template v-if="hasRevisionInfo">
                  <p v-if="revisionApproved" class="revision-stage is-done">
                    ✓ Usulan Anda <strong>Diterima</strong> — halaman ini hanya menampilkan data (mode baca),
                    tidak ada berkas revisi yang perlu diunggah.
                  </p>
                  <p v-else-if="revisionSubmitted" class="revision-stage is-done">
                    ✓ Revisi sudah dikirim{{ result.revision_submitted_at ? ' pada ' + result.revision_submitted_at : '' }} —
                    halaman ini hanya menampilkan data (mode baca) dan tautan revisi tidak dapat dipakai lagi.
                  </p>
                  <p v-else-if="revisionStageActive" class="revision-stage">
                    <template v-if="canEdit">✓ Tahap revisi dibuka — unggah <strong>Surat Kesanggupan</strong> dan <strong>Revisi File Pengajuan</strong> pada form di bawah.</template>
                    <template v-else>Tahap revisi sudah dibuka. Pelajari catatan reviewer, unduh template Surat Kesanggupan, lalu unggah berkas melalui tautan revisi yang dikirim ke email Anda.</template>
                  </p>

                  <!-- Seluruh data yang diisi admin pada tab Revisi (Dashboard → Detail
                       Pendaftaran) ditampilkan apa adanya, termasuk yang masih kosong
                       ("—"), supaya peserta tahu field mana yang sudah/belum diisi. -->
                  <RevisionNote
                    v-for="note in revisionNotes"
                    :key="note.label"
                    :label="note.label"
                    :value="note.value"
                  />

                  <TrackTable class="revision-table" variant="compact">
                    <TrackRow
                      v-for="f in fundRows"
                      :key="f.k"
                      :label="f.k"
                      :value="f.v"
                      :empty="f.empty"
                    />
                  </TrackTable>

                  <p v-if="result.template_url" class="revision-action">
                    <a :href="result.template_url" target="_blank" rel="noopener" class="btn btn-primary">Download Template Surat Kesanggupan</a>
                    <span class="revision-hint-inline">Unduh template dari event, isi, lalu unggah kembali di bawah.</span>
                  </p>
                  <RevisionStatus v-else variant="empty">
                    Template Surat Kesanggupan: — (belum diunggah admin pada event hibah ini)
                  </RevisionStatus>

                  <RevisionStatus v-if="result.proposal_url" text="📄 Proposal awal yang diajukan:" :href="result.proposal_url" />

                  <RevisionStatus
                    v-if="result.surat_url"
                    variant="ok"
                    text="✓ Surat Kesanggupan sudah diunggah."
                    :href="result.surat_url"
                  />
                  <RevisionStatus v-else variant="empty">
                    Surat Kesanggupan: — (belum ada berkas diunggah)
                  </RevisionStatus>

                  <RevisionStatus
                    v-if="result.revisi_proposal_url"
                    variant="ok"
                    text="✓ Revisi File Pengajuan sudah diunggah."
                    :href="result.revisi_proposal_url"
                  />
                  <RevisionStatus v-else variant="empty">
                    Revisi File Pengajuan: — (belum ada berkas diunggah)
                  </RevisionStatus>

                  <RevisionUploadForm
                    v-if="canEdit"
                    :files="{ surat: revisionFile, proposal: revisiProposalFile }"
                    :can-submit="canSubmitRevision"
                    :loading="revisionLoading"
                    @pick="pickRevisiFile"
                    @submit="submitRevision"
                  />

                  <p v-else-if="!revisionSubmitted && !revisionApproved" class="revision-hint is-locked">
                    🔒 Mode baca — unggah berkas hanya aktif bila Anda membuka tautan revisi dari email
                    (dan revisi belum pernah dikirim).
                  </p>

                  <p v-if="revisionMessage" class="revision-msg" :class="{ 'is-error': revisionError }">{{ revisionMessage }}</p>
                </template>

                <p v-else class="revision-hint">
                  Tahap revisi belum dimulai. Setelah reviewer menetapkan <strong>Status Tahap 2</strong>
                  menjadi “Perbaiki Usulan”, tautan edit akan dikirim ke email Anda.
                </p>
              </WfPanel>
            </template>

            <!-- Lap. Kemajuan & Lap. Akhir — panel generik dari `@/data/lapStages`.
                 Template admin tampil sebagai tautan unduh; form isian hanya aktif
                 bila dibuka lewat tautan bertoken dari email. -->
            <template v-for="stage in LAP_STAGES" :key="stage.id" #[stage.tabId]>
              <WfPanel :eyebrow="stage.eyebrow" :title="stage.label">
                <LapStageTrackPanel
                  :stage="stage"
                  :data="lapData(stage)"
                  :can-edit="lapCanEdit(stage)"
                  :model="lapForm"
                  :files="lapFiles"
                  :errors="lapErrors"
                  :loading="lapLoading"
                  :can-submit="lapRequiredPicked(stage, lapFiles)"
                  :message="lapMessageStage === stage.id ? lapMessage : ''"
                  :error="lapError"
                  @pick="(param, e) => pickLapFile(stage.id, param, e)"
                  @submit="submitLap(stage.id)"
                />
              </WfPanel>
            </template>
          </WorkflowStepper>
        </template>

      </div>
    </div>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '@/data'
import { asText, hasText, textOrDash } from '@/utils/text'
import { statusLabel } from '@/utils/status'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import WorkflowStepper, { type WorkflowTab } from '@/components/WorkflowStepper.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TrackTable from '@/components/TrackTable.vue'
import TrackRow from '@/components/TrackRow.vue'
import WfPanel from '@/components/WfPanel.vue'
import RevisionNote from '@/components/RevisionNote.vue'
import RevisionStatus from '@/components/RevisionStatus.vue'
import RevisionUploadForm, { type RevisionFieldKey } from '@/components/RevisionUploadForm.vue'
import TrackAccessBanner from '@/components/TrackAccessBanner.vue'
import TrackSearchForm from '@/components/TrackSearchForm.vue'
import LapStageTrackPanel from '@/components/LapStageTrackPanel.vue'
import { LAP_STAGES, findLapFile, type LapStage } from '@/data/lapStages'
import { lapFileError, lapRequiredPicked } from '@/utils/lap'

const route = useRoute()

const no = ref('')
const result = ref<Record<string, any> | null>(null)
const loading = ref(false)
const error = ref('')
const revisionToken = ref('')
/** Surat Kesanggupan yang sudah diisi peserta. */
const revisionFile = ref<File | null>(null)
/** Proposal yang diperbaiki sesuai catatan reviewer. */
const revisiProposalFile = ref<File | null>(null)
const revisionLoading = ref(false)
const revisionMessage = ref('')
const revisionError = ref(false)
/** true hanya bila token revisi diverifikasi backend (GET /pendaftaran/revisi). */
const revisionAccessOk = ref(false)
const revisionTokenError = ref('')

/* ── Tahap lap (Lap. Kemajuan & Lap. Akhir) ──
 * Token form dikirim lewat email: `?token=…&stage=kemajuan|akhir`. Satu token
 * berlaku untuk satu tahap & satu kali kirim — setelah dikirim form jadi baca. */

/** Token form yang sedang dipakai. */
const lapToken = ref('')
/** Tahap yang tokennya valid — hanya tahap ini yang menampilkan form isian. */
const lapAccessStage = ref('')
const lapAccessOk = ref(false)
const lapForm = ref<Record<string, any>>({})
const lapFiles = ref<Record<string, File | null>>({})
const lapErrors = ref<Record<string, string>>({})
const lapLoading = ref(false)
const lapMessage = ref('')
const lapMessageStage = ref('')
const lapError = ref(false)
/** Penambalan data tahap setelah aksi (token dibuka / form dikirim). */
const lapPatch = ref<{ stage: string; data: Record<string, any> }>({ stage: '', data: {} })

/** Data efektif satu tahap lap — dari payload status, ditimpa patch aksi terakhir. */
function lapData(stage: LapStage): Record<string, any> {
  const r = result.value || {}
  const d: Record<string, any> = {
    status: String(r[stage.statusKey] ?? ''),
    [stage.submittedKey]: String(r[stage.submittedKey] ?? ''),
  }
  for (const f of stage.text) d[f.key] = String(r[f.key] ?? '')
  for (const f of stage.files) d[f.urlKey] = String(r[f.urlKey] ?? '')
  return lapPatch.value.stage === stage.id ? { ...d, ...lapPatch.value.data } : d
}

/** Form tahap ini sudah pernah dikirim peserta → mode baca. */
function lapSubmitted(stage: LapStage): boolean {
  const d = lapData(stage)
  return String(d.status) === 'dikirim' || Boolean(String(d[stage.submittedKey] || '').trim())
}

/** Mode edit hanya saat token tahap ini valid dan form belum dikirim. */
function lapCanEdit(stage: LapStage): boolean {
  return lapAccessOk.value && lapAccessStage.value === stage.id && !lapSubmitted(stage)
}

/** Verifikasi token form sebuah tahap lalu siapkan isian form. */
async function loadLapStage(stageId: string, token: string) {
  if (!token || !no.value) return
  const stage = LAP_STAGES.find((s) => s.id === stageId)
  if (!stage) return

  lapToken.value = token
  lapAccessOk.value = false
  lapAccessStage.value = ''
  lapError.value = false
  lapMessage.value = ''
  lapMessageStage.value = stageId

  const base = SITE.apiBase.replace('/wp/v2', '')
  try {
    const r = await fetch(
      `${base}/lp2m/v1/pendaftaran/laporan?no=${encodeURIComponent(no.value)}` +
        `&token=${encodeURIComponent(token)}&stage=${encodeURIComponent(stageId)}`,
    )
    const d = await r.json().catch(() => ({}))
    if (!r.ok) {
      lapError.value = true
      lapMessage.value = d.message || 'Link form tidak valid atau sudah ditutup.'
      return
    }
    // Payload token memakai key yang sama dengan endpoint status → patch langsung.
    const patch: Record<string, any> = {}
    for (const [k, v] of Object.entries(d)) {
      if (k === 'success' || k === 'message' || k === 'can_edit' || k === 'stage') continue
      patch[k] = v
    }
    lapPatch.value = { stage: stageId, data: patch }

    const form: Record<string, any> = {}
    for (const f of stage.text) form[f.key] = patch[f.key] ?? ''
    lapForm.value = form

    lapAccessOk.value = true
    lapAccessStage.value = stageId
    activeTab.value = stage.tabId
  } catch (e: any) {
    lapError.value = true
    lapMessage.value = e?.message || 'Gagal memverifikasi tautan form.'
  }
}

/** Picker berkas tahap lap (validasi format/ukuran di util bersama). */
function pickLapFile(_stageId: string, param: string, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  lapErrors.value = { ...lapErrors.value, [param]: '' }
  if (!file) {
    lapFiles.value = { ...lapFiles.value, [param]: null }
    return
  }
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

/** Kirim form sebuah tahap lap (isian + berkas) memakai token sekali pakai. */
async function submitLap(stageId: string) {
  const stage = LAP_STAGES.find((s) => s.id === stageId)
  if (!stage || !lapAccessOk.value || lapAccessStage.value !== stageId || lapLoading.value) return
  if (!lapRequiredPicked(stage, lapFiles.value)) return

  lapLoading.value = true
  lapMessage.value = ''
  lapError.value = false
  lapMessageStage.value = stageId

  const fd = new FormData()
  fd.set('no', no.value)
  fd.set('token', lapToken.value)
  fd.set('stage', stageId)
  for (const f of stage.text) fd.set(f.key, String(lapForm.value[f.key] ?? ''))
  for (const f of stage.files) {
    const picked = lapFiles.value[f.param]
    if (picked) fd.set(f.param, picked, picked.name)
  }

  const base = SITE.apiBase.replace('/wp/v2', '')
  try {
    const r = await fetch(`${base}/lp2m/v1/pendaftaran/laporan`, { method: 'POST', body: fd })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`)

    lapError.value = false
    lapMessage.value = d.message || `Form ${stage.label} berhasil dikirim.`

    // Mode baca: status → dikirim, waktu kirim + URL berkas baru.
    const prev = lapPatch.value.stage === stageId ? lapPatch.value.data : {}
    lapPatch.value = {
      stage: stageId,
      data: {
        ...prev,
        [stage.statusKey]: 'dikirim',
        [stage.submittedKey]: d.submitted_at || '',
        ...((d.urls || {}) as Record<string, string>),
      },
    }

    // Token sekali pakai → form ditutup.
    lapAccessOk.value = false
    lapAccessStage.value = ''
    lapToken.value = ''
    lapFiles.value = {}

    // Segarkan payload status agar halaman baca konsisten (best-effort).
    try {
      const st = await fetch(`${base}/lp2m/v1/pendaftaran/status/${encodeURIComponent(no.value.trim())}`)
      const sj = await st.json().catch(() => ({}))
      if (st.ok) result.value = { ...sj }
    } catch {
      /* abaikan — patch lokal sudah cukup */
    }

    // Lanjut ke tahap berikutnya bila ada (Lap. Kemajuan → Lap. Akhir).
    const next = LAP_STAGES[LAP_STAGES.findIndex((s) => s.id === stageId) + 1]
    if (next) activeTab.value = next.tabId
  } catch (e: any) {
    lapError.value = true
    lapMessage.value = e.message || 'Gagal mengirim form.'
  } finally {
    lapLoading.value = false
  }
}

const activeTab = ref('pengajuan')

/** Sama dengan tab di Dashboard Pendaftaran Detail. */
const tabs: WorkflowTab[] = [
  { id: 'pengajuan', label: 'Pengajuan', step: '01' },
  { id: 'revisi', label: 'Usulan', step: '02' },
  { id: 'progress', label: 'Laporan Kemajuan', step: '03' },
  { id: 'final', label: 'Laporan Akhir', step: '04' },
  { id: 'capaian', label: 'Pengkinian Capaian', step: '05', enabled: false },
]

/** Nilai `_status_tahap2` dari backend: '' | 'perbaiki_usulan' | 'diterima'.
 *  Field INI (bukan `status` tahap 1) yang menggerakkan seluruh tab Revisi. */
const tahap2 = computed(() => String(result.value?.status_tahap2 || ''))

/** Admin membuka tahap revisi (Status Tahap 2 = Perbaiki Usulan) → peserta boleh mengunggah. */
const revisionStageActive = computed(() => tahap2.value === 'perbaiki_usulan')

/** Usulan diputuskan Diterima → halaman murni baca, tidak ada form revisi. */
const revisionApproved = computed(() => tahap2.value === 'diterima')

/** Revisi sudah dikirim PESERTA pada siklus ini.
 *
 *  Penandanya hanya dua: meta `_revision_submitted_at` (diisi backend saat submit)
 *  dan `status` tahap 1 = `revision_submitted` (legacy, ikut diisi backend).
 *  Status tahap 1 lain (`approved`, `rejected`, `done`) TIDAK boleh dipakai di sini:
 *  sejak tahap revisi digerakkan `_status_tahap2`, admin bisa menetapkan
 *  `status = approved` (usulan lolos) bersamaan dengan `status_tahap2 = perbaiki_usulan`
 *  — memasukkannya ke daftar ini membuat peserta terkunci di mode baca padahal
 *  revisi belum pernah dikirim. */
const revisionSubmitted = computed(
  () =>
    Boolean(String(result.value?.revision_submitted_at || '').trim()) ||
    String(result.value?.status || '') === 'revision_submitted',
)

/** Mode edit hanya aktif dengan token revisi valid (dikirim via email), tahap revisi
 *  sedang dibuka admin (`status_tahap2 = perbaiki_usulan`), dan belum tuntas. */
const canEdit = computed(
  () =>
    Boolean(revisionToken.value && revisionAccessOk.value) &&
    revisionStageActive.value &&
    !revisionSubmitted.value &&
    !revisionApproved.value,
)

/** Label manusiawi Status Usulan (tahap 2) untuk badge di panel. */
const tahap2Label = computed(() => {
  if (revisionApproved.value) return 'Diterima'
  if (revisionStageActive.value) return 'Perbaiki Usulan'
  return 'Belum Diputuskan'
})

/** Status warna badge tahap 2: hijau saat Diterima, kuning saat proses/belum diputuskan. */
const tahap2BadgeStatus = computed(() => (revisionApproved.value ? 'approved' : 'under_review'))

/** Tahap revisi butuh DUA berkas: Surat Kesanggupan + Revisi File Pengajuan. */
const canSubmitRevision = computed(() => Boolean(revisionFile.value && revisiProposalFile.value))

/** Field teks isian admin di tab Revisi — selalu ditampilkan lengkap (kosong → "—")
 *  agar peserta melihat persis data yang diinput reviewer di Dashboard.
 *  Helper `asText`/`hasText`/`textOrDash` diambil dari `@/utils/text`. */

const revisionNotes = computed(() => {
  const r = result.value || {}
  return [
    { label: 'Catatan Admin', value: textOrDash(r.catatan_admin), empty: !hasText(r.catatan_admin) },
    { label: 'Catatan Substansi Internal', value: textOrDash(r.catatan_substansi_internal), empty: !hasText(r.catatan_substansi_internal) },
    { label: 'Catatan Substansi Eksternal', value: textOrDash(r.catatan_substansi_eksternal), empty: !hasText(r.catatan_substansi_eksternal) },
  ]
})
/** Tab Revisi selalu menampilkan data Revisi lengkap (catatan, dana, template,
 *  surat) begitu pendaftaran terdeteksi — termasuk status yang sudah masuk tahap
 *  revisi (`reviewed`/`revised`/`revision_submitted`) maupun yang belum, supaya
 *  tidak lagi menampilkan "Tahap revisi belum dimulai" saat status sudah Reviewed. */
const hasRevisionInfo = computed(() => Boolean(result.value))

/** Hanya nilai dana yang diisi admin di tab Revisi yang ditampilkan (usulan +
 *  disetujui). Rincian komposisi (Honorarium 30/50/20/Publikasi) sengaja tidak
 *  ditampilkan di halaman peserta. Field kosong tetap tampil "—" supaya peserta
 *  tahu apa saja yang dinilai reviewer. */
const fundRows = computed(() => {
  const r = result.value || {}
  return [
    { k: 'Nilai Dana Usulan', v: hasText(r.nilai_dana_usulan) ? String(r.nilai_dana_usulan) : '—', empty: !hasText(r.nilai_dana_usulan) },
    { k: 'Nilai Dana Disetujui', v: hasText(r.nilai_dana_disetujui) ? String(r.nilai_dana_disetujui) : '—', empty: !hasText(r.nilai_dana_disetujui) },
  ]
})

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

/** PDF ≤10 MB saja yang lolos (validasi akhir tetap di backend). */
function isValidPdf(file: File | null): boolean {
  return Boolean(file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) && file.size <= 10 * 1024 * 1024)
}

/** Picker generik dua kolom upload tahap revisi (dipanggil `RevisionUploadForm`). */
function pickRevisiFile(target: RevisionFieldKey, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  const valid = isValidPdf(file)
  if (target === 'surat') revisionFile.value = valid ? file : null
  else revisiProposalFile.value = valid ? file : null
  revisionError.value = !valid && Boolean(file)
  if (!valid) {
    revisionMessage.value = file ? 'File harus PDF dan maksimal 10 MB.' : ''
    if (file) input.value = ''
  } else {
    revisionMessage.value = ''
  }
}

async function loadRevision(token: string) {
  if (!token || !no.value) return
  revisionToken.value = token
  revisionAccessOk.value = false
  revisionTokenError.value = ''
  const base = SITE.apiBase.replace('/wp/v2', '')
  try {
    const r = await fetch(`${base}/lp2m/v1/pendaftaran/revisi?no=${encodeURIComponent(no.value)}&token=${encodeURIComponent(token)}`)
    const d = await r.json().catch(() => ({}))
    if (!r.ok) {
      revisionTokenError.value = d.message || 'Link revisi tidak valid atau sudah ditutup.'
      return
    }
    result.value = { ...(result.value || {}), ...d.data }
    revisionAccessOk.value = true
    activeTab.value = 'revisi'
  } catch (e: any) {
    revisionTokenError.value = e?.message || 'Gagal memverifikasi token revisi.'
  }
}

async function submitRevision() {
  if (!canSubmitRevision.value || !revisionToken.value) return
  revisionLoading.value = true; revisionMessage.value = ''; revisionError.value = false
  const fd = new FormData()
  fd.set('no', no.value)
  fd.set('token', revisionToken.value)
  fd.set('surat_kesanggupan', revisionFile.value as File)
  fd.set('revisi_proposal', revisiProposalFile.value as File)
  try {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const r = await fetch(`${base}/lp2m/v1/pendaftaran/revisi`, { method: 'POST', body: fd })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`)
    revisionMessage.value = d.message || 'Revisi berhasil dikirim.'
    if (result.value) {
      result.value.status = 'revision_submitted'
      if (d.surat_url) result.value.surat_url = d.surat_url
      if (d.revisi_proposal_url) result.value.revisi_proposal_url = d.revisi_proposal_url
      if (d.revision_submitted_at) result.value.revision_submitted_at = d.revision_submitted_at
      try {
        const st = await fetch(`${base}/lp2m/v1/pendaftaran/status/${encodeURIComponent(no.value.trim())}`)
        const sj = await st.json().catch(() => ({}))
        if (st.ok) result.value = { ...result.value, ...sj }
      } catch { /* abaikan — status lokal sudah diperbarui */ }
    }
    revisionFile.value = null
    revisiProposalFile.value = null
    revisionAccessOk.value = false
    revisionTokenError.value = ''
  } catch (e: any) {
    revisionError.value = true
    revisionMessage.value = e.message || 'Gagal mengirim revisi.'
  } finally { revisionLoading.value = false }
}

onMounted(() => {
  const fromPath = (route.params.no as string) || ''
  const params = new URL(location.href).searchParams
  const q = params.get('no') || ''
  const start = fromPath || q
  const token = params.get('token') || ''
  const stage = params.get('stage') || ''
  if (start) {
    no.value = start
    cek().then(() => {
      if (!token) return
      // Token tahap lap (`stage`) vs token revisi (tanpa `stage`).
      if (stage) void loadLapStage(stage, token)
      else void loadRevision(token)
    })
  }
})

async function cek() {
  if (!no.value.trim()) return
  loading.value = true; error.value = ''; result.value = null
  revisionAccessOk.value = false; revisionTokenError.value = ''; revisionMessage.value = ''; revisionError.value = false
  revisionFile.value = null; revisiProposalFile.value = null
  // Reset status tahap lap — token tetap dibaca ulang bila ada di URL.
  lapAccessOk.value = false; lapAccessStage.value = ''; lapToken.value = ''
  lapFiles.value = {}; lapErrors.value = {}; lapPatch.value = { stage: '', data: {} }
  try {
    const base = SITE.apiBase.replace('/wp/v2', '')
    const r = await fetch(`${base}/lp2m/v1/pendaftaran/status/${encodeURIComponent(no.value.trim())}`)
    const d = await r.json().catch(() => ({}))
    if (!r.ok) error.value = d.message || `HTTP ${r.status} — ${d.code || 'error'}`
    else {
      result.value = d
      // Status Tahap 2 sudah diputuskan (Perbaiki Usulan / Diterima) → langsung buka
      // tab Revisi agar peserta melihat catatan/dana & mengunduh template tanpa klik manual.
      const t2 = String(d?.status_tahap2 || '')
      if (t2 === 'perbaiki_usulan' || t2 === 'diterima') { activeTab.value = 'revisi'; return }

      // Tahap lap yang sudah dibuka admin → buka tab pertama yang masih perlu diisi
      // supaya peserta melihat template & berkasnya tanpa klik manual.
      const openStage = LAP_STAGES.find(
        (s) => String(d?.[s.statusKey] || '') === 'dibuka' && !String(d?.[s.submittedKey] || '').trim(),
      )
      if (openStage) { activeTab.value = openStage.tabId; return }

      // Tidak ada yang perlu diisi, tapi ada tahap lap yang sudah dikirim → tampilkan.
      const sentStage = LAP_STAGES.find((s) => String(d?.[s.statusKey] || '') || String(d?.[s.submittedKey] || ''))
      if (sentStage) activeTab.value = sentStage.tabId
    }
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.track-shell{max-width:860px;margin:0 auto;padding:64px 16px 80px}
.track-title{font-size:32px;margin:0 0 8px}
.track-lead{color:var(--ink-soft);margin:0 0 28px;font-size:15px;line-height:1.6}
.track-loading{text-align:center;padding:40px;color:var(--ink-soft)}
.track-alert{padding:16px 20px;background:#fdecea;border:1px solid #f1948e;border-radius:4px;color:#c0392b;font-size:14px}

.track-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:18px 20px;background:var(--card);border:1px solid var(--paper-2);border-bottom:0;border-radius:8px 8px 0 0}
.track-head__label{display:block;font-size:11px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.08em}
.track-head__no{font-size:15px;font-weight:700;color:var(--green-900)}

.track-history{margin:0;padding-left:20px}
.track-history li{margin:0 0 10px;font-size:14px}
.track-history small{color:var(--ink-soft)}

.panel-status{display:flex;align-items:center;gap:10px;margin:0 0 16px;padding:10px 12px;background:#f8fafc;border:1px solid var(--paper-2);border-radius:6px}
.panel-status__label{font-size:12px;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.04em}

.revision-stage{margin:0 0 16px;padding:10px 12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;color:#065f46;font-size:13px}
.revision-stage.is-done{background:#f1f5f9;border-color:#cbd5e1;color:#334155}
.revision-table{margin-top:4px}
.revision-action{margin:16px 0 0}
.revision-hint-inline{display:block;margin-top:8px;font-size:12px;color:var(--ink-soft)}
.revision-hint{margin:0;font-size:12px;color:var(--ink-soft)}
.revision-hint.is-locked{margin-top:14px}
.revision-msg{margin:12px 0 0;font-size:13px;color:#16803c}
.revision-msg.is-error{color:#c0392b}

@media(max-width:640px){
  .track-shell{padding:40px 14px 60px}
}
</style>
