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
  const username = ref<string>('')
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
        username.value = data.username || ''
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function persist() {
    if (token.value && user.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        token: token.value,
        user: user.value,
        username: username.value
      }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Login dengan username + password akun WP (Basic Auth → GET /wp/v2/users/me).
   * Server menerima password akun via fallback rest_authentication_errors;
   * application password juga tetap valid.
   */
  async function login(usernameInput: string, password: string): Promise<{ ok: boolean; error?: string }> {
    loading.value = true
    try {
      const basic = btoa(`${usernameInput}:${password}`)
      const res = await fetch(`${SITE.apiBase}/users/me?_fields=id,name,roles`, {
        headers: {
          'Authorization': `Basic ${basic}`
        }
      })

      if (!res.ok) {
        if (res.status === 401) {
          return { ok: false, error: 'Username atau Password salah.' }
        }
        return { ok: false, error: `Gagal login (HTTP ${res.status}).` }
      }

      const data = await res.json()
      token.value = basic
      user.value = { id: data.id, name: data.name, roles: data.roles || [] }
      username.value = usernameInput
      persist()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Tidak dapat terhubung ke server.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ganti kredensial tersimpan tanpa logout — dipakai setelah user mengganti
   * password di Profile (token lama langsung mati di server).
   */
  function setCredentials(usernameInput: string, password: string) {
    token.value = btoa(`${usernameInput}:${password}`)
    username.value = usernameInput
    persist()
  }

  function logout() {
    token.value = null
    user.value = null
    username.value = ''
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

  return { token, user, username, loading, isLoggedIn, isAdmin, userInitials, login, setCredentials, logout, authHeaders, restore }
})
