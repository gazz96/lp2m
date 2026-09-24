/** Peta status pendaftaran → gaya badge (warna latar, teks, dst). */
export type BadgeStyle = {
  background: string
  color: string
  padding: string
  borderRadius: string
  fontSize: string
  fontWeight: string
  textTransform: 'uppercase'
}

const BASE: Omit<BadgeStyle, 'background' | 'color'> = {
  padding: '4px 12px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase',
}

/** Warna hijau (approved/done), merah (rejected), sisanya kuning (in-progress). */
export function statusBadgeStyle(status = ''): BadgeStyle {
  const s = String(status || '')
  if (s === 'approved' || s === 'done') {
    return { ...BASE, background: '#d5f5e3', color: '#1e8449' }
  }
  if (s === 'rejected') {
    return { ...BASE, background: '#fdecea', color: '#c0392b' }
  }
  // Tahap lap (Lap. Kemajuan / Lap. Akhir) — peserta diminta memperbaiki.
  if (s === 'direvisi') {
    return { ...BASE, background: '#ffedd5', color: '#b45309' }
  }
  return { ...BASE, background: '#fef9e7', color: '#7d6608' }
}

/** Label manusiawi status tahap 1 (sinkron dengan STATUS_LABELS backend). */
export const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  reviewed: 'Reviewed — Revisi Diminta',
  revised: 'Revised',
  revision_submitted: 'Revisi Dikirim',
  approved: 'Disetujui',
  rejected: 'Rejected',
  done: 'Done',
}

export function statusLabel(status = ''): string {
  return STATUS_LABELS[String(status || '')] || (status || 'submitted')
}

/** Status tahap 2 (keputusan reviewer) — `_status_tahap2`. */
export const TAHAP2 = {
  PERBAIKAN: 'perbaiki_usulan',
  DITERIMA: 'diterima',
} as const

export type Tahap2 = '' | typeof TAHAP2.PERBAIKAN | typeof TAHAP2.DITERIMA
