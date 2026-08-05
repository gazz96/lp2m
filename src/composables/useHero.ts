import { ref, onMounted } from 'vue'
import { SITE, HERO } from '@/data'

export interface HeroSettings {
  headline: string
  title: string
  caption: string
  btn_primary_text: string
  btn_primary_url: string
  btn_secondary_text: string
  btn_secondary_url: string
  infografis: Array<{ label: string; angka: string }>
}

export interface HibahEventData {
  id: number
  slug: string
  title: string
  excerpt: string
  permalink: string
  jenis_hibah: string
  deadline: string
  deadline_label: string
  event_eyebrow: string
  dana_maks: string
  jumlah_tim_maks: string
  info_tambahan: string
  link_panduan: string
  file_panduan: string[]
  file_template: string[]
  timeline_items: Array<{ date: string; label: string }>
  category_names: string[]
}

export interface HeroData {
  eyebrow: string
  titleHtml: string
  lead: string
  btnPrimaryText: string
  btnPrimaryUrl: string
  btnSecondaryText: string
  btnSecondaryUrl: string
  stats: Array<{ count: number; label: string }>
  event: {
    title: string
    desc: string
    schedule: string[]
    link: string
  } | null
}

export function fmtDate(d: string) {
  if (!d) return ''
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return d
}

const defaultHero: HeroData = {
  eyebrow: HERO.eyebrow,
  titleHtml: HERO.titleHtml,
  lead: HERO.lead,
  btnPrimaryText: 'Daftar Hibah Internal 2026',
  btnPrimaryUrl: '#form-hibah',
  btnSecondaryText: 'Pelajari Tugas & Fungsi LP2M',
  btnSecondaryUrl: '#tentang',
  stats: HERO.stats,
  event: {
    title: HERO.eventTitle,
    desc: HERO.eventDesc,
    schedule: HERO.schedule,
    link: '#hibah'
  }
}

export function useHero() {
  const hero = ref<HeroData>({ ...defaultHero })
  const loading = ref(true)
  const error = ref('')

  const apiBase = SITE.apiBase.replace('/wp/v2', '')

  async function fetchSettings(): Promise<HeroSettings | null> {
    try {
      const res = await fetch(`${apiBase}/lp2m/v1/settings/hero`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  async function fetchNearestEvent(): Promise<HibahEventData | null> {
    try {
      const res = await fetch(`${apiBase}/itsi/v1/hibah/nearest-deadline`)
      if (!res.ok) return null
      const json = await res.json()
      return json.found ? json.data : null
    } catch {
      return null
    }
  }

  function mergeData(settings: HeroSettings | null, event: HibahEventData | null) {
    const h = hero.value

    // Merge settings dari API
    if (settings) {
      if (settings.headline) h.titleHtml = settings.headline
      if (settings.title) h.eyebrow = settings.title
      if (settings.caption) h.lead = settings.caption
      if (settings.btn_primary_text) h.btnPrimaryText = settings.btn_primary_text
      if (settings.btn_primary_url) h.btnPrimaryUrl = settings.btn_primary_url
      if (settings.btn_secondary_text) h.btnSecondaryText = settings.btn_secondary_text
      if (settings.btn_secondary_url) h.btnSecondaryUrl = settings.btn_secondary_url
      if (settings.infografis?.length) {
        h.stats = settings.infografis.map(i => ({
          count: parseInt(i.angka) || 0,
          label: i.label
        }))
      }
    }

    // Merge event hibah dari API
    if (event) {
      const schedule: string[] = []
      if (event.timeline_items?.length) {
        event.timeline_items.forEach(t => {
          if (t.date && t.label) schedule.push(`${fmtDate(t.date)} — ${t.label}`)
        })
      }
      if (event.deadline_label) {
        schedule.push(event.deadline_label)
      } else if (event.deadline) {
        schedule.push(`Deadline: ${event.deadline}`)
      }

      h.event = {
        title: event.title,
        desc: event.excerpt || event.info_tambahan || HERO.eventDesc,
        schedule: schedule.length ? schedule : HERO.schedule,
        link: event.permalink || '#hibah'
      }
    }
  }

  onMounted(async () => {
    loading.value = true
    error.value = ''
    try {
      const [settings, event] = await Promise.all([
        fetchSettings(),
        fetchNearestEvent()
      ])
      mergeData(settings, event)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  })

  return { hero, loading, error }
}
