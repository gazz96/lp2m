<template>
  <div class="wrap">
    <h1>Profile</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">Data diambil dari WordPress ITSI.</p>

    <div class="components-panel" style="margin-bottom:16px">
      <div class="components-panel__body">
        <table class="form-table" style="width:100%">
          <tr><th>Nama</th><td>{{ auth.user?.name || '—' }}</td></tr>
          <tr><th>Username</th><td>{{ auth.username || auth.user?.name || '—' }}</td></tr>
          <tr><th>Role</th><td>{{ auth.isAdmin ? 'Administrator' : 'Editor' }}</td></tr>
          <tr><th>User ID</th><td>{{ auth.user?.id || '—' }}</td></tr>
        </table>
      </div>
    </div>

    <!-- ══ Ganti Password ══ -->
    <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:16px">
      <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Ganti Password</summary>
      <div class="wp-detail-group__body">
        <p style="color:var(--wp-text-secondary);margin-top:0">
          Mengganti password akun WordPress Anda. Sesudah diganti, token login diperbarui otomatis — Anda tetap login.
        </p>

        <table class="form-table" style="width:100%;max-width:480px">
          <tr>
            <th scope="row"><label for="pw-current">Password Lama</label></th>
            <td>
              <div class="pass-wrap">
                <input :type="showCurrent ? 'text' : 'password'" id="pw-current" v-model="currentPassword" autocomplete="current-password" />
                <button type="button" class="btn-toggle" @click="showCurrent = !showCurrent" tabindex="-1" aria-label="Tampilkan password">
                  <span :class="'dashicons ' + (showCurrent ? 'dashicons-hidden' : 'dashicons-visibility')"></span>
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row"><label for="pw-new">Password Baru</label></th>
            <td>
              <div class="pass-wrap">
                <input :type="showNew ? 'text' : 'password'" id="pw-new" v-model="newPassword" autocomplete="new-password" />
                <button type="button" class="btn-toggle" @click="showNew = !showNew" tabindex="-1" aria-label="Tampilkan password">
                  <span :class="'dashicons ' + (showNew ? 'dashicons-hidden' : 'dashicons-visibility')"></span>
                </button>
              </div>
              <p class="description">Minimal 8 karakter.</p>
            </td>
          </tr>
          <tr>
            <th scope="row"><label for="pw-confirm">Konfirmasi Password Baru</label></th>
            <td>
              <div class="pass-wrap">
                <input :type="showConfirm ? 'text' : 'password'" id="pw-confirm" v-model="confirmPassword" autocomplete="new-password" />
                <button type="button" class="btn-toggle" @click="showConfirm = !showConfirm" tabindex="-1" aria-label="Tampilkan password">
                  <span :class="'dashicons ' + (showConfirm ? 'dashicons-hidden' : 'dashicons-visibility')"></span>
                </button>
              </div>
            </td>
          </tr>
        </table>

        <div v-if="pwMsg" :class="pwErr ? 'notice notice-error inline' : 'notice notice-success inline'">
          <p>{{ pwMsg }}</p>
        </div>

        <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
          <WpButton variant="primary" :disabled="saving" @click="doChangePassword">
            {{ saving ? 'Menyimpan...' : 'Ganti Password' }}
          </WpButton>
        </div>
      </div>
    </details>

    <WpButton variant="destructive" @click="doLogout">Keluar / Logout</WpButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { SITE } from '@/data'
import { useToast } from '@/composables/useToast'
import WpButton from '@/components/WpButton.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

function doLogout() { auth.logout(); router.push('/') }

// ── Ganti password ──
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const saving = ref(false)
const pwMsg = ref('')
const pwErr = ref(false)

const apiBase = SITE.apiBase.replace('/wp/v2', '')

async function doChangePassword() {
  pwMsg.value = ''
  pwErr.value = false

  if (!currentPassword.value) {
    pwMsg.value = 'Password lama wajib diisi.'
    pwErr.value = true
    return
  }
  if (newPassword.value.length < 8) {
    pwMsg.value = 'Password baru minimal 8 karakter.'
    pwErr.value = true
    return
  }
  if (newPassword.value === currentPassword.value) {
    pwMsg.value = 'Password baru tidak boleh sama dengan password lama.'
    pwErr.value = true
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    pwMsg.value = 'Konfirmasi password tidak cocok.'
    pwErr.value = true
    return
  }

  saving.value = true
  try {
    const res = await fetch(`${apiBase}/lp2m/v1/me/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify({
        current_password: currentPassword.value,
        new_password: newPassword.value
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data?.message || data?.data?.message || `Gagal mengganti password (HTTP ${res.status})`
      pwMsg.value = msg
      pwErr.value = true
      return
    }

    // Token lama sudah mati di server — langsung pakai password baru agar tetap login.
    auth.setCredentials(auth.username, newPassword.value)
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    pwMsg.value = '✓ Password berhasil diganti.'
    pwErr.value = false
    toast.success('Password berhasil diganti')
  } catch (e: any) {
    pwMsg.value = e?.message || 'Tidak dapat terhubung ke server.'
    pwErr.value = true
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.pass-wrap {
  display: flex;
  position: relative;
  max-width: 320px;
}
.pass-wrap input {
  flex: 1;
  width: 100%;
  border: 1px solid #949494;
  border-radius: 2px;
  padding: 0 40px 0 12px;
  min-height: 32px;
  line-height: 32px;
  font-family: inherit;
  font-size: 14px;
  color: var(--wp-text);
  outline: none;
  box-sizing: border-box;
}
.pass-wrap input:focus {
  border-color: var(--wp-primary);
  box-shadow: 0 0 0 var(--wp-focus-width) var(--wp-primary);
  outline: 2px solid transparent;
}
.btn-toggle {
  position: absolute;
  right: 2px; top: 2px; bottom: 2px;
  width: 34px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 2px;
}
.btn-toggle:hover { background: var(--wp-alt-bg); }
.btn-toggle .dashicons {
  font-size: 18px;
  width: 18px; height: 18px;
  color: var(--wp-text-muted);
}
.btn-toggle:hover .dashicons { color: var(--wp-text-secondary); }
.notice.inline { margin: 12px 0; }
</style>
