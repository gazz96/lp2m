<template>
  <header class="site">
    <div class="wrap">
      <nav class="main">
        <div class="brand">
          <div class="brand-mark" v-if="!site?.logo_url">LP</div>
          <img v-else :src="site.logo_url" class="brand-logo" :alt="site?.nama || SITE.name" />
          <div class="brand-text">
            <div class="name">{{ site?.nama || SITE.name }}</div>
            <div class="sub">{{ site?.nama_panjang || SITE.institute }}</div>
          </div>
        </div>

        <div class="nav-links" :class="{ open: menuOpen }">
          <a v-for="link in links" :key="link.href" :href="link.href" @click="menuOpen = false">{{ link.label }}</a>
          <div
            class="nav-item dropdown"
            :class="{ open: hibahOpen }"
            @mouseenter="hibahOpen = true"
            @mouseleave="hibahOpen = false"
          >
            <a href="#hibah" class="drop-trigger" @click="onHibahClick">Hibah</a>
            <div class="dropdown-menu">
              <a v-for="sub in hibahSubs" :key="sub.href" :href="sub.href" @click="menuOpen = false">{{ sub.label }}</a>
            </div>
          </div>
          <a href="#kontak" class="nav-contact" @click="menuOpen = false">Kontak</a>
          <a href="/daftar/status" @click="menuOpen = false">Cek Formulir</a>
        </div>

        <div class="nav-cta">
          <slot name="extra">
            <a href="#form-hibah" class="btn btn-primary nav-btn">Daftar Hibah</a>
          </slot>
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
import { useSiteSettings } from '@/composables/useSiteSettings'

const { site } = useSiteSettings()

const links = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Bidang Unggulan', href: '#bidang' }
]

const hibahSubs = [
  { label: 'Jadwal', href: '#jadwal' },
  { label: 'Publikasi', href: '#publikasi' },
  { label: 'Infografis', href: '#infografis' }
]

const menuOpen = ref(false)
const hibahOpen = ref(false)

function onHibahClick() {
  // Mobile: klik trigger membuka/tutup submenu. Desktop: navigasi ke #hibah.
  if (window.innerWidth <= 700) {
    hibahOpen.value = !hibahOpen.value
  } else {
    menuOpen.value = false
  }
}
</script>

<style scoped>
.nav-btn {
  padding: 9px 18px;
}
.brand-logo {
  height: 40px;
  width: auto;
  display: block;
  object-fit: contain;
}

/* ── Dropdown Hibah ── */
.nav-item.dropdown { position: relative; }
.drop-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.drop-trigger::after {
  content: "";
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid currentColor;
  margin-top: 2px;
  opacity: 0.6;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
  z-index: 60;
}
.nav-item.dropdown:hover .dropdown-menu,
.nav-item.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.dropdown-menu a {
  display: block;
  padding: 9px 16px;
  font-size: 0.9rem;
  color: var(--ink-soft);
  border-bottom: none !important;
  white-space: nowrap;
}
.dropdown-menu a:hover {
  background: var(--paper-2);
  color: var(--green-800);
  border-bottom: none !important;
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
  .nav-item.dropdown { position: static; }
  .dropdown-menu {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    padding: 0 0 4px 14px;
    min-width: 0;
  }
  .dropdown-menu a { padding: 8px 12px; }
  .nav-item.dropdown:not(.open) .dropdown-menu { display: none; }
  .burger { display: block; }
}
</style>
