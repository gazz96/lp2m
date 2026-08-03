import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SITE } from '@/data'

export interface AuthUser {
  id: number
  name: string
  roles: string[]
}

const STORAGE_KEY = 'lp2m_auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => token.value !== null && user.value !== null)
  const isAdmin = computed(() => user.value?.roles?.includes('administrator') ?? false)
  const userInitials = computed(() => {
    if (!user.value?.name) return '?'
    return user.value.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  })

  // Restore from localStorage on init
  function restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        token.value = data.token || null
        user.value = data.user || null
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function persist() {
    if (token.value && user.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        token: token.value,
        user: user.value
      }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Login with WP Application Password.
   * username + application_password -> Basic Auth -> GET /wp/v2/users/me
   */
  async function login(username: string, appPassword: string): Promise<{ ok: boolean; error?: string }> {
    loading.value = true
    try {
      const basic = btoa(`${username}:${appPassword}`)
      const res = await fetch(`${SITE.apiBase}/users/me?_fields=id,name,roles`, {
        headers: {
          'Authorization': `Basic ${basic}`
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          return { ok: false, error: 'Username atau Application Password salah.' }
        }
        return { ok: false, error: `Gagal login (HTTP ${res.status}).` }
      }

      const data = await res.json()
      token.value = basic
      user.value = { id: data.id, name: data.name, roles: data.roles || [] }
      persist()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Returns Authorization header for fetch calls.
   */
  function authHeaders(): Record<string, string> {
    if (token.value) {
      return { 'Authorization': `Basic ${token.value}` }
    }
    return {}
  }

  // Restore on module load
  restore()

  return { token, user, loading, isLoggedIn, isAdmin, userInitials, login, logout, authHeaders, restore }
})
