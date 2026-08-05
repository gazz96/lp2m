<template>
  <footer class="site" id="kontak">
    <div class="wrap">
      <SkeletonBlock v-if="status === 'loading'" variant="grid" :count="4" />
      <SkeletonBlock v-else-if="status === 'error'" variant="text" :count="3" />

      <div v-else class="footer-grid">
        <div class="footer-brand">
          <div class="name">{{ site?.nama || SITE.name }}</div>
          <p>{{ d?.tagline || FOOTER.tagline }}</p>
        </div>
        <div>
          <h5>Kontak</h5>
          <ul class="footer-links">
            <li v-for="line in alamat" :key="line">{{ line }}</li>
            <li class="mono">{{ site?.email || SITE.email }}</li>
            <li class="mono">{{ site?.telepon || SITE.phone }}</li>
          </ul>
        </div>
        <div>
          <h5>Tautan Cepat</h5>
          <ul class="footer-links">
            <li v-for="link in tautan" :key="link.label">
              <a :href="link.href">{{ link.label }}</a>
            </li>
          </ul>
        </div>
        <div>
          <h5>Layanan</h5>
          <ul class="footer-links">
            <li v-for="link in layanan" :key="link.label">
              <a :href="link.href" :target="link.href.startsWith('http') ? '_blank' : undefined"
                :rel="link.href.startsWith('http') ? 'noopener' : undefined">{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span>{{ d?.copyright || '&copy; 2026 LP2M — Institut Teknologi Sawit Indonesia. Seluruh hak cipta dilindungi.' }}</span>
        <span>{{ d?.credit || 'Dikelola oleh Pusat Data, Publikasi &amp; HKI LP2M' }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { SITE, FOOTER } from '@/data'
import { useSectionData } from '@/composables/useSectionData'
import SkeletonBlock from './SkeletonBlock.vue'

// Footer data dari /settings/footer; kontak dari /settings/site.
const footer = useSectionData<any>('footer', '/lp2m/v1/settings/footer', () => FOOTER)
const siteS = useSectionData<any>('site', '/lp2m/v1/settings/site', () => SITE)
const d = footer.data
const site = siteS.data
const status = computed(() => (footer.status.value === 'loading' || siteS.status.value === 'loading' ? 'loading' : footer.status.value === 'error' && siteS.status.value === 'error' ? 'error' : 'ready'))

const alamat = computed(() => {
  const a = site.value?.alamat || ''
  if (a) return a.split('\n').filter(Boolean)
  return [SITE.address, SITE.address2, SITE.address3]
})
const tautan = computed(() => {
  const t = d.value?.tautan
  if (Array.isArray(t) && t.length) return t
  return FOOTER.tautan
})
const layanan = computed(() => {
  const l = d.value?.layanan
  if (Array.isArray(l) && l.length) return l
  return FOOTER.layanan
})

onMounted(() => { footer.load(); siteS.load() })
</script>
