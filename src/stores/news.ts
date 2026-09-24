import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { WpPost } from '@/types'

export interface NewsItem {
  id: number
  date: string
  title: string
  excerpt: string
  slug: string
  categories: number[]
  thumbnail: string | null
}

export const useNewsStore = defineStore('news', () => {
  const posts = ref<NewsItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pengumuman = ref<NewsItem[]>([])
  const pengumumanLoading = ref(false)
  const pengumumanError = ref<string | null>(null)

  async function fetchPosts(
    apiBase: string,
    categoryIds: number[],
    perPage: number
  ): Promise<NewsItem[]> {
    const cats = categoryIds.join(',')
    const fields = 'id,date,title,excerpt,slug,featured_media,categories'
    const postsRes = await fetch(
      `${apiBase}/posts?categories=${cats}&per_page=${perPage}&orderby=date&order=desc&_fields=${fields}`
    )
    if (!postsRes.ok) throw new Error(`HTTP ${postsRes.status}`)
    const rawPosts = await postsRes.json()

    // Resolve all featured images with one media request instead of _embed per post.
    const mediaIds = (rawPosts as any[]).map((p: any) => p.featured_media).filter(Boolean)
    const mediaMap: Record<number, string> = {}
    if (mediaIds.length) {
      const mediaRes = await fetch(
        `${apiBase}/media?include=${mediaIds.join(',')}&per_page=100&_fields=id,source_url`
      )
      if (mediaRes.ok) {
        const media = await mediaRes.json()
        ;(media as any[]).forEach((m: any) => { mediaMap[m.id] = m.source_url })
      }
    }

    return (rawPosts as any[]).map((p: any) => ({
      id: p.id,
      date: p.date,
      title: p.title?.rendered || '',
      excerpt: p.excerpt?.rendered || '',
      slug: p.slug || '',
      categories: p.categories || [],
      thumbnail: mediaMap[p.featured_media] || null
    }))
  }

  async function fetchNews(
    apiBase: string,
    categoryIds: number[],
    perPage: number = 6
  ) {
    if (posts.value.length > 0) return
    loading.value = true
    error.value = null

    try {
      posts.value = await fetchPosts(apiBase, categoryIds, perPage)
    } catch (e: any) {
      error.value = e.message || 'Gagal memuat berita'
      // Retry sekali setelah 3s (network transient).
      setTimeout(() => { if (!posts.value.length) fetchNews(apiBase, categoryIds, perPage) }, 3000)
    } finally {
      loading.value = false
    }
  }

  async function fetchPengumuman(
    apiBase: string,
    categoryId: number,
    perPage: number = 3
  ) {
    if (pengumuman.value.length > 0) return
    pengumumanLoading.value = true
    pengumumanError.value = null

    try {
      pengumuman.value = await fetchPosts(apiBase, [categoryId], perPage)
    } catch (e: any) {
      pengumumanError.value = e.message || 'Gagal memuat pengumuman'
      // Retry once after a transient network failure, matching the publication feed.
      setTimeout(() => {
        if (!pengumuman.value.length) fetchPengumuman(apiBase, categoryId, perPage)
      }, 3000)
    } finally {
      pengumumanLoading.value = false
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

  function getCategoryName(post: NewsItem, catMap: Record<number, string>): string {
    if (!post.categories?.length) return 'Berita'
    const id = post.categories[0]
    return catMap[id] || 'Berita'
  }

  function getThumbnail(post: NewsItem): string | null {
    return post.thumbnail
  }

  return {
    posts,
    loading,
    error,
    pengumuman,
    pengumumanLoading,
    pengumumanError,
    fetchNews,
    fetchPengumuman,
    stripHtml,
    formatDate,
    getCategoryName,
    getThumbnail
  }
})
