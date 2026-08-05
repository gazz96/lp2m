<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div id="primary" class="content-area">
      <div class="entry-content" style="min-height:60vh;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:80px 16px;text-align:center">

        <div v-if="regNo!=='—'" style="max-width:560px">
          <div style="font-size:64px;line-height:1;margin-bottom:24px" class="sukses-icon">✓</div>
          <h1 style="font-size:42px;margin-bottom:16px">Pendaftaran Berhasil!</h1>
          <p style="font-size:16px;color:var(--ink-soft);margin-bottom:32px">Terima kasih telah mengirimkan usulan.</p>

          <div style="background:var(--card);border:1px solid var(--paper-2);padding:28px;border-radius:8px;margin-bottom:32px">
            <div style="font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">Nomor Registrasi</div>
            <div style="font-size:36px;font-weight:700;color:var(--green-900);letter-spacing:0.04em;font-family:'IBM Plex Mono',monospace">{{ regNo }}</div>
          </div>

          <p style="font-size:14px;color:var(--ink-soft);margin-bottom:32px">
            Simpan nomor ini. Tim LP2M akan menghubungi Anda dalam 1x24 jam kerja.
          </p>

          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            <router-link :to="'/daftar/status/'+regNo" class="btn btn-primary">Lihat Status Pendaftaran</router-link>
            <router-link to="/" class="btn btn-outline">Beranda</router-link>
          </div>
        </div>

        <div v-else style="max-width:560px">
          <div style="font-size:64px;line-height:1;margin-bottom:24px">⚠️</div>
          <h1 style="font-size:32px;margin-bottom:16px">Nomor Tidak Ditemukan</h1>
          <p style="color:var(--ink-soft)">Nomor registrasi tidak valid. <router-link to="/">Kembali ke Beranda</router-link></p>
        </div>

      </div>
    </div>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const regNo = computed(() => {
  const n = (useRoute().params.no as string) || '—'
  return n === '—' ? '—' : n
})
</script>
