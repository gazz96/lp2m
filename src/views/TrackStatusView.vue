<template>
  <div class="wrap">
    <TopBar />
    <SiteNav />
    <div class="track-page">
      <div class="wrap-800">
        <h1>Track Status Pendaftaran</h1>
        <p>Masukkan nomor registrasi untuk melihat status usulan Anda.</p>

        <form @submit.prevent="cek" class="track-form">
          <input v-model="no" class="track-input" placeholder="20260804001" />
          <button type="submit" class="btn btn-primary">Cek Status</button>
        </form>

        <div v-if="loading" style="text-align:center;padding:20px">Memuat...</div>

        <div v-else-if="result" class="track-result">
          <table class="track-table">
            <tr><th>Nomor Registrasi</th><td>{{ result.reg_no }}</td></tr>
            <tr><th>Nama</th><td>{{ result.nama }}</td></tr>
            <tr><th>Judul Usulan</th><td>{{ result.judul }}</td></tr>
            <tr><th>Email</th><td>{{ result.email }}</td></tr>
            <tr><th>Status</th><td><span class="badge" :class="result.status==='approved'?'publish':result.status==='rejected'?'trash':'draft'">{{ result.status.toUpperCase() }}</span></td></tr>
            <tr><th>Terdaftar</th><td>{{ result.tanggal }}</td></tr>
          </table>
        </div>

        <div v-else-if="error" class="error-msg">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'

const no = ref('')
const result = ref<Record<string,string>|null>(null)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  const u = new URL(location.href)
  const q = u.searchParams.get('no')
  if (q) { no.value = q; cek() }
})

async function cek() {
  if (!no.value.trim()) return
  loading.value = true
  error.value = ''
  result.value = null
  try {
    const r = await fetch(`${SITE.apiBase.replace('/wp/v2','')}/lp2m/v1/pendaftaran/status/${no.value.trim()}`)
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      error.value = d.message || 'Pendaftaran tidak ditemukan.'
      loading.value = false
      return
    }
    result.value = await r.json()
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat data.'
  } finally {
    loading.value = false
  }
}
</script>

<style>
.track-page { padding:60px 0 80px; }
.wrap-800 { max-width:800px; margin:0 auto; padding:0 16px; }
.track-form { display:flex; gap:8px; margin:24px 0; }
.track-input { flex:1; padding:10px 14px; border:1px solid var(--wp-border); border-radius:2px; font-size:15px; }
.track-result { margin-top:20px; }
.track-table { width:100%; border-collapse:collapse; }
.track-table th, .track-table td { padding:10px 12px; border:1px solid var(--wp-border); text-align:left; }
.track-table th { background:#f6f7f7; width:170px; font-weight:500; }
</style>
