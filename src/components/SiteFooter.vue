<template>
  <footer class="site" id="kontak">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="name">{{ SITE.name }}</div>
          <p>{{ FOOTER.tagline }}</p>
        </div>
        <div>
          <h5>Kontak</h5>
          <ul class="footer-links">
            <li>{{ SITE.address }}</li>
            <li>{{ SITE.address2 }}</li>
            <li>{{ SITE.address3 }}</li>
            <li class="mono">{{ SITE.email }}</li>
            <li class="mono">{{ SITE.phone }}</li>
          </ul>
        </div>
        <div>
          <h5>Tautan Cepat</h5>
          <ul class="footer-links">
            <li v-for="link in FOOTER.tautan" :key="link.label">
              <a :href="link.href">{{ link.label }}</a>
            </li>
          </ul>
        </div>
        <div>
          <h5>Layanan</h5>
          <ul class="footer-links">
            <li v-for="link in FOOTER.layanan" :key="link.label">
              <a :href="link.href" :target="link.href.startsWith('http') ? '_blank' : undefined"
                :rel="link.href.startsWith('http') ? 'noopener' : undefined">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span>&copy; 2026 LP2M — Institut Teknologi Sawit Indonesia. Seluruh hak cipta dilindungi.</span>
        <span>Dikelola oleh Pusat Data, Publikasi &amp; HKI LP2M</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { SITE, FOOTER } from '@/data'
</script>
