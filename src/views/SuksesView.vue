<template>
  <div class="wrap">
    <TopBar />
    <SiteNav />
    <main>
      <div class="sukses-page">
        <div class="wrap-800">
          <div class="sukses-box">
            <div class="sukses-icon">✓</div>
            <h1>Pendaftaran Berhasil Dikirim</h1>
            <p class="sukses-desc">
              Terima kasih telah mengirimkan usulan. Nomor registrasi Anda adalah:
            </p>
            <div class="reg-box">
              <span class="reg-label">Nomor Registrasi</span>
              <span class="reg-number">{{ regNo }}</span>
            </div>
            <p class="sukses-desc">
              Simpan nomor ini sebagai bukti pendaftaran. Tim LP2M akan
              mengirimkan konfirmasi melalui email. Anda dapat memantau status
              melalui halaman Track Status.
            </p>
            <div class="sukses-actions">
              <router-link :to="'/daftar/status/'+regNo" class="btn btn-primary">
                Lihat Status Pendaftaran
              </router-link>
              <router-link to="/" class="btn btn-outline">Kembali ke Beranda</router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const regNo = (route.params.no as string) || '—'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import { useRoute } from 'vue-router'
</script>
