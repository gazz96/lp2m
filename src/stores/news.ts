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
      const fields = 'id,date,title,excerpt,slug,featured_media'
      // 1) Posts: ringan, tanpa _embed (dulu 7.3s/135KB → sekarang 0.5s/5KB).
      const postsRes = await fetch(
        `${apiBase}/posts?categories=${cats}&per_page=${perPage}&orderby=date&order=desc&_fields=${fields}`
      )
      if (!postsRes.ok) throw new Error(`HTTP ${postsRes.status}`)
      const rawPosts = await postsRes.json()

      // 2) Thumbnail: batch resolve media ids (1 call).
      const mediaIds = (rawPosts as any[]).map((p: any) => p.featured_media).filter(Boolean)
      let mediaMap: Record<number, string> = {}
      if (mediaIds.length) {
        const mediaRes = await fetch(
          `${apiBase}/media?include=${mediaIds.join(',')}&per_page=100&_fields=id,source_url`
        )
        if (mediaRes.ok) {
          const media = await mediaRes.json()
          ;(media as any[]).forEach((m: any) => { mediaMap[m.id] = m.source_url })
        }
      }

      posts.value = (rawPosts as any[]).map((p: any) => ({
        id: p.id,
        date: p.date,
        title: p.title?.rendered || '',
        excerpt: p.excerpt?.rendered || '',
        slug: p.slug || '',
        categories: p.categories || [],
        thumbnail: mediaMap[p.featured_media] || null
      }))
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

  function getCategoryName(post: NewsItem, catMap: Record<number, string>): string {
    if (!post.categories?.length) return 'Berita'
    const id = post.categories[0]
    return catMap[id] || 'Berita'
  }

  function getThumbnail(post: NewsItem): string | null {
    return post.thumbnail
  }

  return { posts, loading, error, fetchNews, stripHtml, formatDate, getCategoryName, getThumbnail }
})
