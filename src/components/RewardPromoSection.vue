<template>
  <section class="reward-promo">
    <div class="wrap reward-promo-wrap">
      <div class="reward-promo-icon">
        <span class="dashicons dashicons-awards"></span>
      </div>
      <div class="reward-promo-body">
        <div class="rp-eyebrow">Insentif Publikasi</div>
        <h2>Reward Publikasi Dosen ITSI 2026</h2>
        <p>Ajukan reward untuk dokumentasi publikasi artikel jurnal, buku, HAKI, dan seminar dari aktivitas penelitian &amp; pengabdian masyarakat Tahun 2026.</p>
      </div>
      <div class="reward-promo-cta">
        <div class="rp-cta-row">
          <router-link to="/reward-publikasi-dosenITSI-2026" class="btn rp-btn">Ajukan Sekarang</router-link>
          <a v-if="pengumumanUrl" :href="pengumumanUrl" class="btn rp-btn-dl" download>
            Pengumuman
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { SITE } from '@/data'

// File pengumuman pengusulan reward diatur admin di LP2M → Settings → Dokumen (lp2m_dok_pengumuman_id).
// Kalau belum diunggah, tombol download tidak dirender.
const pengumumanUrl = ref('')

onMounted(async () => {
  try {
    const res = await fetch(`${SITE.apiBase.replace('/wp/v2', '')}/lp2m/v1/settings/dokumen`)
    if (res.ok) {
      const data = await res.json()
      // Endpoint /settings/dokumen mengembalikan array FLAT (bukan nested dokumen).
      pengumumanUrl.value = data?.pengumuman_url || ''
    }
  } catch { /* tombol tetap tersembunyi */ }
})
</script>

<style scoped>
.reward-promo {
  background: linear-gradient(135deg, var(--green-800), var(--green-900));
  color: #fff;
  padding: 44px 0;
}
.reward-promo-wrap {
  display: flex;
  align-items: center;
  gap: 26px;
}
.reward-promo-icon {
  flex-shrink: 0;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.reward-promo-icon .dashicons {
  font-size: 42px;
  width: 42px;
  height: 42px;
  color: var(--gold-soft, #f0d99a);
}
.reward-promo-body { flex: 1; min-width: 0; }
.rp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--gold-soft, #f0d99a);
}
.rp-eyebrow::before {
  content: '';
  width: 22px;
  height: 2px;
  background: var(--gold-soft, #f0d99a);
}
.reward-promo-body h2 {
  color: #fff;
  margin: 6px 0 8px;
  font-size: 1.75rem;
  line-height: 1.2;
}
.reward-promo-body p {
  color: var(--green-100, #e2f0e6);
  margin: 0;
  max-width: 62ch;
  font-size: 0.97rem;
  line-height: 1.6;
}
.reward-promo-cta { flex-shrink: 0; }
.rp-cta-row { display: flex; flex-direction: row; gap: 10px; align-items: center; }
.rp-btn-dl {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: transparent; border: 1.5px solid var(--gold-soft, #f0d99a);
  color: var(--gold-soft, #f0d99a); font-weight: 600; white-space: nowrap;
}
.rp-btn-dl:hover { background: rgba(255, 255, 255, 0.12); color: #fff; border-color: #fff; }
.rp-btn {
  padding: 12px 24px;
  background: var(--gold, #d4a72c);
  border-color: var(--gold, #d4a72c);
  color: var(--green-900);
  font-weight: 700;
  white-space: nowrap;
}
.rp-btn:hover { background: #fff; border-color: #fff; color: var(--green-900); }

@media (max-width: 720px) {
  .reward-promo-wrap {
    flex-direction: column;
    text-align: center;
  }
  .reward-promo-body p { margin: 0 auto; }
  .rp-cta-row { flex-wrap: wrap; justify-content: center; }
  .rp-btn { width: auto; }
}
</style>