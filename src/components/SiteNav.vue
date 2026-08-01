<template>
  <header class="site">
    <div class="wrap">
      <nav class="main">
        <div class="brand">
          <div class="brand-mark">LP</div>
          <div class="brand-text">
            <div class="name">{{ SITE.name }}</div>
            <div class="sub">{{ SITE.institute }}</div>
          </div>
        </div>

        <div class="nav-links" :class="{ open: menuOpen }" ref="navLinksRef">
          <a v-for="link in links" :key="link.href" :href="link.href" @click="menuOpen = false">{{ link.label }}</a>
        </div>

        <div class="nav-cta">
          <a href="#hibah" class="btn btn-outline nav-btn">Jadwal Hibah</a>
          <a href="#form-hibah" class="btn btn-primary nav-btn">Daftar Hibah</a>
          <button class="burger" @click="menuOpen = !menuOpen" aria-label="Buka menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SITE } from '@/data'

const links = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Bidang Unggulan', href: '#bidang' },
  { label: 'Infografis', href: '#infografis' },
  { label: 'Hibah & Event', href: '#hibah' },
  { label: 'Publikasi', href: '#publikasi' },
  { label: 'Kontak', href: '#kontak' }
]

const menuOpen = ref(false)
const navLinksRef = ref<HTMLElement>()
</script>

<style scoped>
.nav-btn {
  padding: 9px 18px;
}
@media (max-width: 700px) {
  .nav-links { display: none; }
  .nav-links.open {
    display: flex;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--paper);
    flex-direction: column;
    padding: 20px 24px;
    border-bottom: 1px solid var(--line);
    gap: 14px;
    z-index: 100;
  }
  .nav-btn.btn-outline { display: none; }
  .burger { display: block; }
}
</style>
