<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <div class="brand-mark">LP</div>
        <span>LP2M Dashboard</span>
      </div>

      <form @submit.prevent="doLogin" novalidate>
        <div class="field">
          <label for="username">Username</label>
          <input type="text" id="username" v-model="username" placeholder="input username" autocomplete="username" />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <div class="pass-wrap">
            <input :type="showPass ? 'text' : 'password'" id="password" v-model="appPassword" placeholder="input password" autocomplete="current-password" />
            <button type="button" class="btn-toggle" @click="showPass = !showPass" tabindex="-1">
              <span :class="'dashicons ' + (showPass ? 'dashicons-hidden' : 'dashicons-visibility')"></span>
            </button>
          </div>
        </div>

        <div v-if="error" class="notice notice-error inline"><p>{{ error }}</p></div>

        <p class="submit">
          <button type="submit" class="button button-primary button-large" style="width:100%" :disabled="loading">
            {{ loading ? 'Memeriksa...' : 'Masuk' }}
          </button>
        </p>
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
    error.value = 'Username dan Password wajib diisi.'
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
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--wp-bg);
  padding: 24px;
}

.login-card {
  background: var(--wp-surface);
  border: 1px solid var(--wp-border-light);
  border-radius: 4px;
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.login-logo {
  text-align: center;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.brand-mark {
  width: 44px; height: 44px;
  border-radius: 4px;
  background: var(--wp-primary);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 15px;
}
.login-logo span {
  font-size: 16px;
  font-weight: 600;
  color: var(--wp-text);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 16px;
}
.field label {
  font-size: 14px;
  font-weight: 600;
  color: var(--wp-text);
}
.field input,
.pass-wrap input {
  border: 1px solid #949494;
  border-radius: 2px;
  padding: 0 12px;
  min-height: 40px;
  font-family: inherit;
  font-size: 14px;
  color: var(--wp-text);
  outline: none;
  box-shadow: 0 0 0 transparent;
  width: 100%;
  box-sizing: border-box;
}
.field input:focus,
.pass-wrap input:focus {
  border-color: var(--wp-primary);
  box-shadow: 0 0 0 var(--wp-focus-width) var(--wp-primary);
  outline: 2px solid transparent;
}

.pass-wrap {
  display: flex;
  position: relative;
}
.pass-wrap input {
  flex: 1;
  padding-right: 40px;
}
.btn-toggle {
  position: absolute;
  right: 2px; top: 2px; bottom: 2px;
  width: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 2px;
}
.btn-toggle:hover { background: var(--wp-alt-bg); }
.btn-toggle .dashicons {
  font-size: 20px;
  width: 20px; height: 20px;
  color: var(--wp-text-muted);
}
.btn-toggle:hover .dashicons { color: var(--wp-text-secondary); }

.notice.inline { margin: 12px 0; }

p.submit { text-align: left; max-width: 100%; margin-top: 20px; padding-top: 10px; }
</style>
