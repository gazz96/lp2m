import { ref, type Ref } from 'vue'
import { SITE } from '@/data'

export type SectionStatus = 'loading' | 'ready' | 'error'
export interface SectionState<T> {
  data: Ref<T | null>
  status: Ref<SectionStatus>
  error: Ref<string>
}

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

/** Hapus cache section tertentu (setelah settings disimpan dari dashboard). */
export function clearSectionCache(key: string) {
  try { localStorage.removeItem(CACHE_PREFIX + key) } catch { /* ignore */ }
}
/** Hapus SEMUA cache section (saat bulk edit / reset). */
export function clearAllSectionCache() {
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(CACHE_PREFIX)) toRemove.push(k)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  } catch { /* ignore */ }
}

/**
 * Cache-first section data loader.
 * - Cache fresh → ready langsung (cepat, tanpa flash).
 * - Tidak ada cache → loading → fetch → sukses simpan cache (ready) / gagal (error).
 * - Fallback content.json HANYA saat error (network down), via `fallback()`.
 * Status 'loading' → tampilkan skeleton (JANGAN fallback content.json — biar tidak ambigu).
 */
export function useSectionData<T>(key: string, endpoint: string, fallback?: () => T) {
  const data = ref<T | null>(readCache<T>(key))
  const status = ref<SectionStatus>(data.value ? 'ready' : 'loading')
  const error = ref('')

  async function load() {
    // Cache fresh → skip fetch.
    if (status.value === 'ready' && data.value) return
    status.value = 'loading'
    error.value = ''
    try {
      const base = SITE.apiBase.replace('/wp/v2', '')
      const res = await fetch(`${base}${endpoint}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      data.value = json as T
      writeCache(key, json)
      status.value = 'ready'
    } catch (e: any) {
      error.value = e?.message || 'Gagal memuat'
      // Fallback content.json HANYA saat error.
      if (fallback) { data.value = fallback() as T }
      status.value = 'error'
    }
  }

  return { data, status, error, load }
}
