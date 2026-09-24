import { LAP_FORMAT_LABEL, lapParticipantFiles, type LapExt, type LapStage } from '@/data/lapStages'

/** Ekstensi yang diterima per aturan format — disamakan dengan `lap_ext_rules()` backend. */
const LAP_EXT_ALLOWED: Record<LapExt, string[]> = {
  pdf: ['pdf'],
  doc: ['doc', 'docx'],
  any: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'],
}

/** Batas ukuran berkas tahap lap — sama dengan `MAX_UPLOAD_BYTES` backend. */
export const LAP_MAX_BYTES = 10 * 1024 * 1024

/**
 * Validasi berkas tahap lap di sisi klien (validasi akhir tetap di backend).
 * Mengembalikan pesan error, atau '' bila berkas lolos.
 */
export function lapFileError(file: File, ext: LapExt): string {
  const parts = file.name.toLowerCase().split('.')
  const suffix = parts.length > 1 ? parts[parts.length - 1] : ''
  if (!LAP_EXT_ALLOWED[ext].includes(suffix)) return `Format harus ${LAP_FORMAT_LABEL[ext]}.`
  if (file.size > LAP_MAX_BYTES) return 'Ukuran file maksimal 10 MB.'
  if (file.size === 0) return 'File kosong.'
  return ''
}

/** Semua berkas wajib sebuah tahap sudah dipilih? */
export function lapRequiredPicked(stage: LapStage, files: Record<string, File | null>): boolean {
  return lapParticipantFiles(stage)
    .filter((f) => f.required)
    .every((f) => Boolean(files[f.param]))
}
