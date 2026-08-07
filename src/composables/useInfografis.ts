import { ref, computed, type Ref } from 'vue'
import { SITE, INFOGRAFIS } from '@/data'
import type { InfografisStats, InfografisDatum } from '@/types'

export type InfografisStatus = 'loading' | 'ready' | 'error'

const CACHE_TTL = 10 * 60 * 1000 // 10 menit
const CACHE_PREFIX = 'lp2m_cache_'

interface CacheEntry { v: unknown; t: number }

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const e: CacheEntry = JSON.parse(raw)
    if (!e || typeof e.t !== 'number') return null
    if (Date.now() - e.t > CACHE_TTL) { localStorage.removeItem(CACHE_PREFIX + key); return null }
    return e.v as T
  } catch { return null }
}
function writeCache(key: string, v: unknown) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v, t: Date.now() }))
  } catch { /* quota — ignore */ }
}

/** Fallback statis dari content.json (hanya saat network error). */
function fallbackStats(tahun: string): InfografisStats {
  const ledger = INFOGRAFIS.ledger.map((l) => ({ label: l.label, count: l.count }))
  return {
    total_usulan: ledger[0]?.count ?? 0,
    dosen_unik: ledger[1]?.count ?? 0,
    mahasiswa_unik: ledger[2]?.count ?? 0,
    jumlah_skema: ledger[3]?.count ?? 0,
    skema_distribusi: INFOGRAFIS.donutData.map((d) => ({
      label: d.label.replace(/\s*\(\d+%\)\s*$/, ''),
      count: Math.round((d.val / 100) * (ledger[0]?.count || 100)),
    })),
    sdgs_trend: [],
    tahun_tersedia: [tahun],
    tahun,
  }
}

/**
 * Statistik infografis (cache-first, pola useSectionData).
 * - `tahun` ref bisa diubah → fetch otomatis (per tahun).
 * - Cache per (key, tahun) TTL 10 menit.
 */
export function useInfografis() {
  const tahun = ref('')
  const data = ref<InfografisStats | null>(null)
  const status = ref<InfografisStatus>('loading')
  const error = ref('')

  const years = computed<string[]>(() => data.value?.tahun_tersedia || [])

  async function load(targetTahun?: string) {
    const t = targetTahun ?? tahun.value
    if (!t) return
    const cacheKey = `infografis_${t}`
    const cached = readCache<InfografisStats>(cacheKey)
    if (cached && cached.tahun === t) {
      data.value = cached
      status.value = 'ready'
      return
    }
    status.value = 'loading'
    error.value = ''
    try {
      const base = SITE.apiBase.replace('/wp/v2', '')
      const res = await fetch(`${base}/lp2m/v1/statistik?tahun=${encodeURIComponent(t)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as InfografisStats
      // Setahun tanpa data → tetap pakai response (counts 0), tapi jangan cache kosong permanen.
      data.value = json
      tahun.value = t
      writeCache(cacheKey, json)
      status.value = 'ready'
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat'
      data.value = fallbackStats(t)
      status.value = 'error'
    }
  }

  /** Pilih tahun default: tahun berjalan kalau ada di data, else tahun terbaru. */
  function pickDefaultYear(list: string[]): string {
    const now = new Date().getFullYear().toString()
    if (list.includes(now)) return now
    return list[0] || now
  }

  /** Muat daftar tahun dulu (tanpa filter), lalu pilih default & load datanya. */
  async function init() {
    status.value = 'loading'
    try {
      const base = SITE.apiBase.replace('/wp/v2', '')
      const res = await fetch(`${base}/lp2m/v1/statistik`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as InfografisStats
      const t = pickDefaultYear(json.tahun_tersedia || [])
      tahun.value = t
      json.tahun = t
      data.value = json
      writeCache(`infografis_${t}`, json)
      status.value = 'ready'
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat'
      const now = new Date().getFullYear().toString()
      tahun.value = now
      data.value = fallbackStats(now)
      status.value = 'error'
    }
  }

  function setYear(t: string) {
    if (t === tahun.value) return
    tahun.value = t
    load(t)
  }

  return { tahun, data, status, error, years, load, init, setYear }
}

export type { InfografisDatum }
