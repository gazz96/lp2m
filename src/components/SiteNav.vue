<template>
  <header class="site">
    <div class="wrap">
      <nav class="main">
        <RouterLink to="/" class="brand" aria-label="Ke Beranda">
          <div class="brand-mark" v-if="!site?.logo_url">LP</div>
          <img v-else :src="site.logo_url" class="brand-logo" :alt="site?.nama || SITE.name" />
          <div class="brand-text">
            <div class="name">{{ site?.nama || SITE.name }}</div>
            <div class="sub">{{ site?.nama_panjang || SITE.institute }}</div>
          </div>
        </RouterLink>

        <div class="nav-links" :class="{ open: menuOpen }">
          <RouterLink to="/" @click="menuOpen = false">Beranda</RouterLink>

          <div
            v-for="dd in dropdowns"
            :key="dd.key"
            class="nav-item dropdown"
            :class="{ open: openKey === dd.key }"
            @mouseenter="openMenu(dd.key)"
            @mouseleave="closeMenu(dd.key)"
          >
            <RouterLink
              v-if="dd.to"
              :to="dd.to"
              class="drop-trigger"
              @click="onTriggerClick(dd)"
            >{{ dd.label }}</RouterLink>
            <button
              v-else
              type="button"
              class="drop-trigger"
              @click="onTriggerClick(dd)"
            >{{ dd.label }}</button>
            <div class="dropdown-menu">
              <RouterLink
                v-for="sub in dd.items"
                :key="sub.to"
                :to="sub.to"
                @click="onSubClick"
              >{{ sub.label }}</RouterLink>
            </div>
          </div>

          <RouterLink to="/#kontak" class="nav-contact" @click="menuOpen = false">Kontak</RouterLink>
          <RouterLink to="/daftar/status" class="only-mobile" @click="menuOpen = false">Cek Formulir</RouterLink>
        </div>

        <div class="nav-cta">
          <slot name="extra">
            <RouterLink to="/daftar/status" class="btn btn-outline nav-btn-cek only-desktop">Cek Formulir</RouterLink>
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

// Hierarki menu (Opsi A): 5 item level-atas, konten sekunder masuk dropdown.
interface NavItem { label: string; to: string }
interface Dropdown { key: string; label: string; to: string; items: NavItem[] }

const dropdowns: Dropdown[] = [
  {
    key: 'tentang',
    label: 'Tentang',
    to: '/#tentang',
    items: [
      { label: 'Tentang', to: '/#tentang' },
      { label: 'Bidang Unggulan', to: '/#bidang' },
    ],
  },
  {
    key: 'hibah',
    label: 'Hibah',
    to: '/#hibah',
    items: [
      { label: 'Jadwal', to: '/#jadwal' },
      { label: 'Publikasi', to: '/#publikasi' },
      { label: 'Infografis', to: '/#infografis' },
    ],
  },
  {
    key: 'informasi',
    label: 'Informasi',
    to: '',
    items: [
      { label: 'Pengumuman', to: '/pengumuman' },
      { label: 'Reward Jurnal', to: '/reward-jurnal' },
    ],
  },
]

const menuOpen = ref(false)
const openKey = ref('')

function openMenu(key: string) {
  openKey.value = key
}
function closeMenu(key: string) {
  if (openKey.value === key) openKey.value = ''
}

// Trigger dropdown: desktop → navigasi ke anchor target; mobile/tanpa target → toggle submenu.
function onTriggerClick(dd: Dropdown) {
  if (!dd.to || window.innerWidth <= 1023) {
    openKey.value = openKey.value === dd.key ? '' : dd.key
  } else {
    menuOpen.value = false
  }
}

function onSubClick() {
  menuOpen.value = false
  openKey.value = ''
}
</script>

<style scoped>
.nav-btn {
  padding: 9px 18px;
}
.nav-btn-cek {
  padding: 9px 18px;
  white-space: nowrap;
}
.brand-logo {
  height: 40px;
  width: auto;
  display: block;
  object-fit: contain;
}

/* Brand sebagai link ke beranda — buang style anchor default. */
a.brand { text-decoration: none; color: inherit; }
a.brand:hover { text-decoration: none; }

/* Trigger berbentuk <button> (dropdown tanpa halaman target) disamakan
   dengan link nav lainnya. */
button.drop-trigger {
  background: none;
  border: 0;
  padding: 6px 2px;
  font: inherit;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--ink-soft);
}
button.drop-trigger:hover { color: var(--green-800); }

/* ── Dropdown (desktop) ── */
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

/* Sembunyikan sub-teks brand saat header mulai sesak. */
@media (max-width: 1199px) {
  .brand-text .sub { display: none; }
}

/* Utility show/hide antara desktop & tablet. */
.only-mobile { display: none !important; }

/* ── Breakpoint tablet/mobile: burger di <1024px (sebelumnya 700px) ── */
@media (max-width: 1023px) {
  .only-desktop { display: none !important; }
  .only-mobile { display: block !important; }

  .nav-links { display: none; }
  .nav-links.open {
    display: flex;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--paper);
    flex-direction: column;
    align-items: stretch;
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
