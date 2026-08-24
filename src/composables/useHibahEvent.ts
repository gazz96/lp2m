import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import type { HibahEventData } from './useHero'

export interface HibahEventView {
  id: number | null
  bannerTitle: string
  bannerDesc: string
  deadline: string
  deadlineLabel: string
  timeline: Array<{ date: string; label: string }>
  info: string[]
  thumbnailUrl: string
  filePanduan: string[]
  fileTemplate: string[]
  fileKelompokKeahlian: string[]
}

const defaultEvent: HibahEventView = {
  id: null,
  bannerTitle: '',
  bannerDesc: '',
  deadline: '',
  deadlineLabel: '',
  timeline: [],
  info: [],
  thumbnailUrl: '',
  filePanduan: [],
  fileTemplate: [],
  fileKelompokKeahlian: [],
}

export function useHibahEvent() {
  const event = ref<HibahEventView>({ ...defaultEvent })
  const loading = ref(true)
  const error = ref('')

  const apiBase = SITE.apiBase.replace('/wp/v2', '')

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

  function mergeData(data: HibahEventData | null) {
    if (!data) {
      event.value = { ...defaultEvent }
      return
    }

    event.value = {
      id: data.id,
      bannerTitle: data.title || '',
      bannerDesc: data.excerpt || (Array.isArray(data.info_tambahan) ? data.info_tambahan.join(' ') : data.info_tambahan || '') || '',
      deadline: data.deadline || '',
      deadlineLabel: data.deadline_label || '',
      timeline: data.timeline_items?.length ? data.timeline_items : [],
      info: Array.isArray(data.info_tambahan)
        ? data.info_tambahan
        : (data.info_tambahan ? String(data.info_tambahan).split('\n').filter((l: string) => l.trim()) : []),
      thumbnailUrl: data.thumbnail_url || '',
      filePanduan: data.file_panduan || [],
      fileTemplate: data.file_template || [],
      fileKelompokKeahlian: data.file_kelompok_keahlian || [],
    }
  }

  onMounted(async () => {
    loading.value = true
    error.value = ''
    try {
      const data = await fetchNearestEvent()
      mergeData(data)
    } catch (e: any) {
      error.value = e.message
      event.value = { ...defaultEvent }
    } finally {
      loading.value = false
    }
  })

  return { event, loading, error }
}
