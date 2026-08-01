export interface WpPost {
  id: number
  date: string
  date_gmt: string
  modified: string
  slug: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string; protected: boolean }
  content: { rendered: string; protected: boolean }
  categories: number[]
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text: string
      media_details: {
        sizes: Record<string, { source_url: string }>
      }
    }>
  }
}

export interface WpCategory {
  id: number
  name: string
  slug: string
  count: number
}

export interface HibahFormData {
  nama: string
  nip: string
  jenis: 'Dosen' | 'Mahasiswa' | 'Tenaga Kependidikan'
  prodi: string
  skema: string
  judul: string
  ringkasan: string
  jml_tim: string
  anggota: string
  email: string
  hp: string
  pernyataan: boolean
}

export interface BidangItem {
  icon: string
  title: string
  description: string
}

export interface PillarItem {
  num: string
  title: string
  desc: string
}

export interface LeadershipItem {
  role: string
  name: string
  unit: string
}

export interface RegionItem {
  name: string
  width: number
  val: number
}

export interface StatItem {
  count: number
  label: string
  decimals?: number
  suffix?: string
}

export interface TimelineItem {
  date: string
  label: string
}

export interface PubCardData {
  category: string
  date: string
  title: string
  excerpt: string
}
