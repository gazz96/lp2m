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
  /** Nama field multipart saat upload (hanya dipakai untuk berkas peserta). */
  param: string
  /** Kunci URL di payload REST (dipakai untuk membaca/menampilkan). */
  urlKey: string
  label: string
  ext: LapExt
  /**
   * `event` = template milik EVENT hibah: diunggah SEKALI di menu Hibah,
   * peserta hanya mengunduh (tidak ada upload per pendaftaran).
   * `peserta` = berkas yang wajib/opsional diunggah peserta.
   */
  owner: 'event' | 'peserta'
  /** Berkas wajib saat peserta mengirim form. */
  required?: boolean
  /** ID post hibah — diambil dari detail pendaftaran (dipakai tautan ke event). */
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

/** Status pembuka form (undangan pertama). */
export const LAP_STATUS_DIBUKA = 'dibuka'

/** Diisi otomatis saat peserta mengirim form — menunggu keputusan reviewer. */
export const LAP_STATUS_DIKIRIM = 'dikirim'

/** Keputusan akhir admin — laporan diterima, tautan form ditutup permanen. */
export const LAP_STATUS_DITERIMA = 'diterima'

/** Admin minta perbaikan — tautan baru + email, peserta boleh kirim ulang. */
export const LAP_STATUS_DIREVISI = 'direvisi'

/** Opsi status tahap lap di dashboard admin — urutannya mengikuti alur kerja. */
export const LAP_STATUS_OPTIONS = [
  { label: '— Belum dibuka —', value: '' },
  { label: 'Buka Form Peserta (kirim email)', value: LAP_STATUS_DIBUKA },
  { label: 'Sudah Dikirim Peserta', value: LAP_STATUS_DIKIRIM },
  { label: 'Diterima (tutup tautan)', value: LAP_STATUS_DITERIMA },
  { label: 'Direvisi (buka ulang + email)', value: LAP_STATUS_DIREVISI },
]

/** Sinkron dengan `LAP_STATUSES` / `LAP_STATUS_LABELS` di backend. */
export const LAP_STATUS_LABELS: Record<string, string> = {
  '': 'Belum Dibuka',
  dibuka: 'Form Dibuka',
  dikirim: 'Sudah Dikirim',
  diterima: 'Diterima',
  direvisi: 'Direvisi',
}

/** Status yang menghidupkan form peserta (token aktif). */
export const LAP_STATUS_OPEN = [LAP_STATUS_DIBUKA, LAP_STATUS_DIREVISI]

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
        owner: 'event',
        hint: 'Diunggah sekali di menu Hibah. Unduh, isi, lalu unggah hasilnya di bawah.',
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
        owner: 'event',
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
        owner: 'event',
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
        owner: 'event',
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
        owner: 'event',
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
        owner: 'event',
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

/** Berkas yang diunggah peserta pada sebuah tahap (non-template). */
export function lapParticipantFiles(stage: LapStage): LapFileField[] {
  return stage.files.filter((f) => f.owner === 'peserta')
}

/**
 * Template milik EVENT pada sebuah tahap — hanya tautan unduh, TIDAK pernah
 * diunggah dari sini. Diunggah sekali di menu Hibah → Panduan & Template.
 */
export function lapTemplateFiles(stage: LapStage): LapFileField[] {
  return stage.files.filter((f) => f.owner === 'event')
}
