import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import type { HibahEvent } from '@/types'
import { SITE } from '@/data'

export const useHibahStore = defineStore('hibahCRUD', () => {
  const items = ref<HibahEvent[]>([])
  const loading = ref(false)
  const error = ref('')
  const total = ref(0)
  const page = ref(1)
  const perPage = 12

  async function fetchAll(p = 1) {
    loading.value = true
    error.value = ''
    try {
      const url = `${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=date&order=desc&_fields=id,date,title,excerpt,status,jenis_hibah,status_hibah,deadline,deadline_label,kategori_hibah,model_hibah,sdgs,kelompok_keahlian,dana_maks,event_eyebrow,timeline_items,file_panduan,file_template,file_kelompok_keahlian,category_names,model_hibah_names,jenis_hibah_names,sdgs_names,kelompok_keahlian_names`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      items.value = await res.json()
      total.value = parseInt(res.headers.get('X-WP-Total') || '0')
      page.value = p
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(data: {
    title: string
    content: string
    status: string
    status_hibah: string
    deadline: string
    dana_maks: string
    event_eyebrow: string
    info_tambahan: string
    kategori_hibah: number[]
    model_hibah: number[]
    jenis_hibah: number[]
    sdgs: number[]
    kelompok_keahlian: number[]
  }): Promise<{ ok: boolean; id?: number; error?: string }> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${SITE.apiBase}/hibah`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: err.message || `HTTP ${res.status}` }
      }
      const created = await res.json()
      await fetchAll(page.value)
      return { ok: true, id: created.id }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async function update(id: number, data: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${SITE.apiBase}/hibah/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: err.message || `HTTP ${res.status}` }
      }
      await fetchAll(page.value)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  async function remove(id: number): Promise<{ ok: boolean; error?: string }> {
    const auth = useAuthStore()
    try {
      const res = await fetch(`${SITE.apiBase}/hibah/${id}?force=true`, {
        method: 'DELETE',
        headers: { ...auth.authHeaders() }
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: err.message || `HTTP ${res.status}` }
      }
      await fetchAll(page.value)
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message }
    }
  }

  return { items, loading, error, total, page, perPage, fetchAll, create, update, remove }
})
