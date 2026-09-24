/**
 * Konfigurasi tahap form peserta "Lap. Kemajuan" & "Lap. Akhir".
 *
 * Satu sumber untuk dua sisi:
 *  - Dashboard admin (`LapStageAdminPanel.vue`) — semua field bisa diedit admin.
 *  - Halaman Track Status (`LapStageTrackPanel.vue`) — template tampil sebagai
 *    tautan unduh, berkas peserta diunggah lewat form bertoken.
 *
 * Key mengikuti meta backend tanpa garis bawah awal (`lapkem_ringkasan`,
 * `lapkem_laporan_url`, …) supaya payload `/pendaftaran/status/{no}` dan
 * `/pendaftaran/laporan?token=…&stage=…` bisa dipakai langsung tanpa pemetaan.
 * Nama `param` dipakai sebagai nama field multipart saat upload.
 */

export type LapFieldType = 'text' | 'textarea' | 'select' | 'keywords' | 'url'

/** Aturan format berkas — disamakan dengan `lap_ext_rules()` di backend. */
export type LapExt = 'pdf' | 'doc' | 'any'

export interface LapTextField {
  /** Meta backend & nama param REST (selaras endpoint status). */
  key: string
  label: string
  type: LapFieldType
  hint?: string
  placeholder?: string
  rows?: number
  options?: { label: string; value: string }[]
}

export interface LapFileField {
  /** Nama field multipart saat upload. */
  param: string
  /** Meta URL kanonik backend (untuk dibaca/ditampilkan). */
  urlKey: string
  label: string
  ext: LapExt
  /** `admin` = template (peserta hanya mengunduh); `peserta` = wajib diunggah peserta. */
  owner: 'admin' | 'peserta'
  /** Berkas wajib saat peserta mengirim form. */
  required?: boolean
  hint?: string
}

export interface LapStage {
  /** Nama tahap di backend (`stage=kemajuan|akhir`). */
  id: 'kemajuan' | 'akhir'
  /** ID tab `WorkflowStepper` (harus sama di dashboard & track status). */
  tabId: string
  label: string
  /** Prefix meta backend — dipakai untuk key status & waktu kirim. */
  prefix: string
  /** Meta select status tahap; dikirim sebagai param REST admin. */
  statusKey: string
  /** Meta waktu kirim peserta. */
  submittedKey: string
  eyebrow: string
  text: LapTextField[]
  files: LapFileField[]
}

/** Peta MIME per aturan format (nilai `accept` input file). */
export const LAP_ACCEPT: Record<LapExt, string> = {
  pdf: 'application/pdf,.pdf',
  doc: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  any:
    '.pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,application/msword,' +
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
    'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv',
}

/** Label format untuk pesan error/help. */
export const LAP_FORMAT_LABEL: Record<LapExt, string> = {
  pdf: 'PDF',
  doc: 'DOC/DOCX',
  any: 'PDF/DOC/DOCX/XLS/XLSX',
}

export const LAP_STATUS_OPTIONS = [
  { label: '— Belum dibuka —', value: '' },
  { label: 'Buka Form Peserta (kirim email)', value: 'dibuka' },
  { label: 'Sudah Dikirim Peserta', value: 'dikirim' },
]

export const LAP_STATUS_LABELS: Record<string, string> = {
  '': 'Belum Dibuka',
  dibuka: 'Form Dibuka',
  dikirim: 'Sudah Dikirim',
}

export const LAP_STATUS_ARTIKEL_OPTIONS = [
  { label: '— Belum dipilih —', value: '' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Accept', value: 'accept' },
  { label: 'Publish', value: 'publish' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sedang Direview', value: 'sedang_direview' },
]

export const LAP_STAGES: LapStage[] = [
  {
    id: 'kemajuan',
    tabId: 'progress',
    label: 'Laporan Kemajuan',
    prefix: 'lapkem',
    statusKey: 'lapkem_status',
    submittedKey: 'lapkem_submitted_at',
    eyebrow: 'Tahap 3',
    text: [
      {
        key: 'lapkem_ringkasan',
        label: 'Ringkasan',
        type: 'textarea',
        rows: 4,
        hint: 'Ringkasan pelaksanaan kegiatan sampai tahap ini.',
      },
      {
        key: 'lapkem_keywords',
        label: 'Keyword',
        type: 'keywords',
        placeholder: 'kata kunci 1, kata kunci 2, …',
        hint: 'Maksimal 5 kata kunci, dipisahkan koma. Kelebihan dipotong otomatis.',
      },
      {
        key: 'lapkem_status_artikel',
        label: 'Status Artikel',
        type: 'select',
        options: LAP_STATUS_ARTIKEL_OPTIONS,
      },
    ],
    files: [
      {
        param: 'lapkem_template',
        urlKey: 'lapkem_template_url',
        label: 'Template Laporan Kemajuan',
        ext: 'doc',
        owner: 'admin',
        hint: 'Template dari admin — unduh, isi, lalu unggah hasilnya di bawah.',
      },
      {
        param: 'lapkem_laporan',
        urlKey: 'lapkem_laporan_url',
        label: 'Laporan Kemajuan',
        ext: 'pdf',
        owner: 'peserta',
        required: true,
      },
      {
        param: 'lapkem_artikel',
        urlKey: 'lapkem_artikel_url',
        label: 'File Artikel',
        ext: 'pdf',
        owner: 'peserta',
      },
      {
        param: 'lapkem_sptb_template',
        urlKey: 'lapkem_sptb_template_url',
        label: 'Template SPTB',
        ext: 'doc',
        owner: 'admin',
      },
      {
        param: 'lapkem_sptb',
        urlKey: 'lapkem_sptb_url',
        label: 'SPTB',
        ext: 'pdf',
        owner: 'peserta',
      },
    ],
  },
  {
    id: 'akhir',
    tabId: 'final',
    label: 'Laporan Akhir',
    prefix: 'lapakhir',
    statusKey: 'lapakhir_status',
    submittedKey: 'lapakhir_submitted_at',
    eyebrow: 'Tahap 4',
    text: [
      {
        key: 'lapakhir_ringkasan',
        label: 'Ringkasan',
        type: 'textarea',
        rows: 4,
      },
      {
        key: 'lapakhir_video_url',
        label: 'Link Video (URL)',
        type: 'url',
        placeholder: 'https://youtube.com/watch?v=…',
        hint: 'URL lengkap video luaran. Kosongkan bila tidak ada.',
      },
      {
        key: 'lapakhir_media_massa',
        label: 'Media Massa',
        type: 'textarea',
        rows: 3,
        hint: 'Nama media / tautan publikasi (satu per baris bila lebih dari satu).',
      },
    ],
    files: [
      {
        param: 'lapakhir_template',
        urlKey: 'lapakhir_template_url',
        label: 'Template Laporan Akhir',
        ext: 'doc',
        owner: 'admin',
      },
      {
        param: 'lapakhir_laporan',
        urlKey: 'lapakhir_laporan_url',
        label: 'Laporan Akhir',
        ext: 'pdf',
        owner: 'peserta',
        required: true,
      },
      {
        param: 'lapakhir_artikel',
        urlKey: 'lapakhir_artikel_url',
        label: 'Artikel Jurnal',
        ext: 'pdf',
        owner: 'peserta',
      },
      {
        param: 'lapakhir_poster',
        urlKey: 'lapakhir_poster_url',
        label: 'Poster',
        ext: 'pdf',
        owner: 'peserta',
      },
      {
        param: 'lapakhir_hki',
        urlKey: 'lapakhir_hki_url',
        label: 'HKI',
        ext: 'any',
        owner: 'peserta',
      },
      {
        param: 'lapakhir_ba_template',
        urlKey: 'lapakhir_ba_template_url',
        label: 'Template Berita Acara',
        ext: 'doc',
        owner: 'admin',
      },
      {
        param: 'lapakhir_ba',
        urlKey: 'lapakhir_ba_url',
        label: 'Berita Acara',
        ext: 'pdf',
        owner: 'peserta',
      },
      {
        param: 'lapakhir_bpp_template',
        urlKey: 'lapakhir_bpp_template_url',
        label: 'Template Berita Penyelesaian Pekerjaan',
        ext: 'doc',
        owner: 'admin',
      },
      {
        param: 'lapakhir_bpp',
        urlKey: 'lapakhir_bpp_url',
        label: 'Berita Penyelesaian Pekerjaan',
        ext: 'pdf',
        owner: 'peserta',
      },
      {
        param: 'lapakhir_anggaran_template',
        urlKey: 'lapakhir_anggaran_template_url',
        label: 'Template Penggunaan Anggaran',
        ext: 'doc',
        owner: 'admin',
      },
      {
        param: 'lapakhir_anggaran',
        urlKey: 'lapakhir_anggaran_url',
        label: 'Penggunaan Anggaran',
        ext: 'any',
        owner: 'peserta',
      },
    ],
  },
]

/** Cari konfigurasi tahap berdasarkan `stage` backend. */
export function findLapStage(id: string): LapStage | undefined {
  return LAP_STAGES.find((s) => s.id === id)
}

/** Cari definisi berkas dari `param` multipart-nya (lintas tahap). */
export function findLapFile(param: string): LapFileField | undefined {
  for (const stage of LAP_STAGES) {
    const found = stage.files.find((f) => f.param === param)
    if (found) return found
  }
  return undefined
}

/** Semua definisi berkas dari seluruh tahap. */
export function allLapFiles(): LapFileField[] {
  const out: LapFileField[] = []
  for (const stage of LAP_STAGES) out.push(...stage.files)
  return out
}

/** Berkas yang wajib diunggah peserta pada sebuah tahap. */
export function lapRequiredFiles(stage: LapStage): LapFileField[] {
  return stage.files.filter((f) => f.owner === 'peserta' && f.required)
}

/** Berkas peserta (non-template) pada sebuah tahap. */
export function lapParticipantFiles(stage: LapStage): LapFileField[] {
  return stage.files.filter((f) => f.owner === 'peserta')
}

/** Template milik admin pada sebuah tahap. */
export function lapTemplateFiles(stage: LapStage): LapFileField[] {
  return stage.files.filter((f) => f.owner === 'admin')
}
