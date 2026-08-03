<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="brand-mark-lg">LP</div>
        <span>LP2M Dashboard</span>
      </div>
      <h2>Login Dashboard</h2>
      <p class="sub">Gunakan <strong>Application Password</strong> WordPress —<br/>bukan password login biasa.</p>

      <form @submit.prevent="doLogin" novalidate>
        <div class="field">
          <label for="username">Username WordPress</label>
          <input type="text" id="username" v-model="username" placeholder="cth. lp2m_editor" autocomplete="username" />
        </div>
        <div class="field">
          <label for="appPass">Application Password</label>
          <div class="pass-wrapper">
            <input :type="showPass ? 'text' : 'password'" id="appPass" v-model="appPassword" placeholder="xxxx xxxx xxxx xxxx xxxx" autocomplete="current-password" />
            <button type="button" class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
              {{ showPass ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="hint">Dapat dibuat di: <code>WP Admin → Users → Profile → Application Passwords</code></div>
        </div>

        <div v-if="error" class="error-box">{{ error }}</div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Memeriksa...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const appPassword = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

async function doLogin() {
  if (!username.value.trim() || !appPassword.value.trim()) {
    error.value = 'Username dan Application Password wajib diisi.'
    return
  }

  loading.value = true
  error.value = ''

  const result = await auth.login(username.value.trim(), appPassword.value.trim())
  loading.value = false

  if (result.ok) {
    const redirect = (router.currentRoute.value.query.redirect as string) || '/dashboard'
    router.replace(redirect)
  } else {
    error.value = result.error || 'Login gagal.'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg, #f5f7f5);
  padding: 24px;
}
.login-card {
  background: var(--card, #fff);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
}
.login-logo {
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.brand-mark-lg {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--green-700);
  color: var(--gold-soft);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 1rem;
}
.login-logo span {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--green-800);
  font-family: 'Fraunces', serif;
}
.login-card h2 {
  text-align: center;
  font-size: 1.5rem;
  color: var(--green-800);
  margin-bottom: 6px;
}
.sub {
  text-align: center;
  font-size: 0.84rem;
  color: var(--ink-soft);
  margin-bottom: 28px;
  line-height: 1.5;
}
.sub strong { color: var(--ink); }
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}
.field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--green-800);
}
.field input {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 6px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--ink);
  outline: none;
}
.field input:focus { border-color: var(--green-600); box-shadow: 0 0 0 3px rgba(47,107,79,0.15); }
.pass-wrapper {
  display: flex;
  position: relative;
}
.pass-wrapper input {
  flex: 1;
  padding-right: 46px;
}
.toggle-pass {
  position: absolute;
  right: 4px;
  top: 4px;
  bottom: 4px;
  width: 38px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.1rem;
}
.hint {
  font-size: 0.72rem;
  color: var(--ink-soft);
  margin-top: 4px;
}
.hint code {
  background: var(--paper-2);
  padding: 1px 5px;
  border-radius: 3px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
}
.error-box {
  background: var(--rust-soft, #fff0ed);
  color: var(--rust);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.84rem;
  margin-bottom: 16px;
  border: 1px solid var(--rust);
}
.btn-login {
  width: 100%;
  padding: 13px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--green-700);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-login:hover { background: var(--green-800); }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
