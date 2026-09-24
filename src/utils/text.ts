/** Nilai teks dari field backend, apa adanya (trim). */
export function asText(v: unknown): string {
  return v === null || v === undefined ? '' : String(v).trim()
}

/** true bila field benar-benar terisi (bukan kosong / "0"). */
export function hasText(v: unknown): boolean {
  const s = asText(v)
  return s !== '' && s !== '0'
}

/** Tampilkan "—" untuk field kosong, agar struktur tabel tetap terbaca. */
export function textOrDash(v: unknown): string {
  return hasText(v) ? asText(v) : '—'
}
