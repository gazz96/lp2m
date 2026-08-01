import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { WpPost } from '@/types'

export const useNewsStore = defineStore('news', () => {
  const posts = ref<WpPost[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchNews(
    apiBase: string,
    categoryIds: number[],
    perPage: number = 6
  ) {
    if (posts.value.length > 0) return
    loading.value = true
    error.value = null

    try {
      const cats = categoryIds.join(',')
      const url = `${apiBase}/posts?categories=${cats}&_embed=1&per_page=${perPage}&orderby=date&order=desc`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      posts.value = await res.json()
    } catch (e: any) {
      error.value = e.message || 'Gagal memuat berita'
    } finally {
      loading.value = false
    }
  }

  function stripHtml(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  function getCategoryName(post: WpPost, catMap: Record<number, string>): string {
    if (!post.categories?.length) return 'Berita'
    const id = post.categories[0]
    return catMap[id] || 'Berita'
  }

  function getThumbnail(post: WpPost): string | null {
    const media = post._embedded?.['wp:featuredmedia']
    if (!media?.length) return null
    const sizes = media[0].media_details?.sizes
    return sizes?.medium?.source_url || sizes?.thumbnail?.source_url || media[0].source_url || null
  }

  return { posts, loading, error, fetchNews, stripHtml, formatDate, getCategoryName, getThumbnail }
})
