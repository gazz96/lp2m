import { ref, onMounted } from 'vue'
import { SITE } from '@/data'

export interface SiteSettings {
  logo_url: string
  favicon_url: string
  logo_is_override: boolean
  favicon_is_override: boolean
  nama: string
  nama_panjang: string
  email: string
  telepon: string
  alamat: string
}

const site = ref<SiteSettings | null>(null)
const loading = ref(true)
const error = ref('')
let fetched = false

const apiBase = SITE.apiBase.replace('/wp/v2', '')

async function fetchSiteSettings(force = false): Promise<SiteSettings | null> {
  if (fetched && !force) return site.value
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${apiBase}/lp2m/v1/settings/site`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    site.value = {
      logo_url: data.logo_url || '',
      favicon_url: data.favicon_url || '',
      logo_is_override: !!data.logo_is_override,
      favicon_is_override: !!data.favicon_is_override,
      nama: data.nama || SITE.name,
      nama_panjang: data.nama_panjang || SITE.fullName,
      email: data.email || SITE.email,
      telepon: data.telepon || SITE.phone,
      alamat: data.alamat || '',
    }
    fetched = true
    return site.value
  } catch (e: any) {
    error.value = e.message || 'Gagal ambil settings'
    return null
  } finally {
    loading.value = false
  }
}

// Apply favicon runtime: <link rel="icon"> dari settings API (override menang, fallback itsi, akhirnya default /favicon.svg).
function applyFavicon(url: string) {
  if (!url) return
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}

// Apply browser tab title dari settings (fallback ke SITE).
function applyTitle(nama: string, namaPanjang: string) {
  const parts = [nama, namaPanjang].filter(Boolean)
  if (!parts.length) return
  document.title = parts.join(' — ')
}

// Inisialisasi sekali di aplikasi (main.ts).
export async function initSiteBranding() {
  const s = await fetchSiteSettings()
  if (s?.favicon_url) applyFavicon(s.favicon_url)
  if (s) applyTitle(s.nama, s.nama_panjang)
}

export function useSiteSettings() {
  onMounted(() => {
    if (!fetched) fetchSiteSettings()
  })
  return { site, loading, error, fetchSiteSettings, applyFavicon }
}
