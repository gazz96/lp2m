<template>
  <div class="wrap" v-if="!loading">
    <h1>Pengaturan LP2M</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">
      Data disinkron langsung ke WordPress ITSI (produksi) — perubahan tampil di situs publik tanpa hard refresh.
      <a :href="wpAdminUrl" target="_blank" rel="noopener" style="margin-left:8px">Buka editor WP Admin →</a>
    </p>

    <div class="notice notice-info inline" v-if="!data"><p>Memuat data dari server ITSI...</p></div>

    <div v-if="data">
      <!-- ══ Branding ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Branding — Logo & Favicon</summary>
        <div class="wp-detail-group__body">
          <p style="color:var(--wp-text-secondary);margin-top:0">Override logo/favicon LP2M. Kosongkan untuk memakai bawaan dari ITSI.</p>
          <div style="display:flex;gap:32px;flex-wrap:wrap;margin-bottom:16px">
            <div>
              <div style="font-weight:600;margin-bottom:8px">Logo</div>
              <img v-if="brand.logoUrl" :src="brand.logoUrl" style="max-height:64px;display:block;margin-bottom:8px" alt="Logo" />
              <span v-else style="color:var(--wp-text-muted)">— (pakai dari ITSI)</span>
              <div style="margin-top:8px">
                <input type="file" accept="image/*" @change="onLogoPick" />
                <button v-if="brand.logoId" class="button" style="margin-left:8px" @click="clearBrand('logo')">Reset</button>
              </div>
            </div>
            <div>
              <div style="font-weight:600;margin-bottom:8px">Favicon</div>
              <img v-if="brand.faviconUrl" :src="brand.faviconUrl" style="max-height:48px;display:block;margin-bottom:8px" alt="Favicon" />
              <span v-else style="color:var(--wp-text-muted)">— (pakai dari ITSI)</span>
              <div style="margin-top:8px">
                <input type="file" accept="image/*" @change="onFaviconPick" />
                <button v-if="brand.faviconId" class="button" style="margin-left:8px" @click="clearBrand('favicon')">Reset</button>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <WpButton variant="primary" :disabled="brandSaving" @click="saveBrand">{{ brandSaving ? 'Menyimpan...' : 'Simpan Branding' }}</WpButton>
            <span v-if="brandMsg" :class="brandErr ? 'components-notice is-error' : 'components-notice is-success'" style="margin:0">{{ brandMsg }}</span>
          </div>
        </div>
      </details>

      <!-- ══ Site ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Site — Identitas & Kontak</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th scope="row">Nama Lembaga</th><td><input v-model="form.site.nama" class="regular-text" placeholder="LP2M ITSI" /></td></tr>
            <tr><th scope="row">Nama Panjang</th><td><input v-model="form.site.nama_panjang" class="regular-text" placeholder="Lembaga Penelitian dan Pengabdian kepada Masyarakat" /></td></tr>
            <tr><th scope="row">Email</th><td><input v-model="form.site.email" type="email" class="regular-text" placeholder="lp2m@itsi.ac.id" /></td></tr>
            <tr><th scope="row">Telepon</th><td><input v-model="form.site.telepon" type="tel" class="regular-text" placeholder="(061) 663 7060" /></td></tr>
            <tr><th scope="row">Alamat</th><td><textarea v-model="form.site.alamat" class="large-text" rows="3"></textarea></td></tr>
            <tr><th scope="row">URL Situs Frontend (LP2M)</th><td><input v-model="form.site.frontend_url" type="url" class="regular-text" placeholder="https://lp2m.pages.dev" /></td></tr>
          </table>
          <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
            <WpButton variant="primary" :disabled="saving==='site'" @click="saveGroup('site')">{{ saving==='site' ? 'Menyimpan...' : 'Simpan Site' }}</WpButton>
          </div>
        </div>
      </details>

      <!-- ══ Hero ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Hero — Bagian Atas Beranda</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th scope="row">Headline (Baris Utama)</th><td><textarea v-model="form.hero.headline" class="large-text" rows="2"></textarea><p class="description">Kalimat besar di hero. Mendukung HTML sederhana.</p></td></tr>
            <tr><th scope="row">Judul</th><td><input v-model="form.hero.title" class="regular-text" /></td></tr>
            <tr><th scope="row">Deskripsi</th><td><textarea v-model="form.hero.caption" class="large-text" rows="3"></textarea></td></tr>
            <tr><th scope="row">Tombol Utama — Teks</th><td><input v-model="form.hero.btn_primary_text" class="regular-text" /></td></tr>
            <tr><th scope="row">Tombol Utama — URL</th><td><input v-model="form.hero.btn_primary_url" type="url" class="regular-text" placeholder="#hibah" /></td></tr>
            <tr><th scope="row">Tombol Kedua — Teks</th><td><input v-model="form.hero.btn_secondary_text" class="regular-text" /></td></tr>
            <tr><th scope="row">Tombol Kedua — URL</th><td><input v-model="form.hero.btn_secondary_url" type="url" class="regular-text" /></td></tr>
          </table>

          <h4 style="margin:16px 0 8px">Statistik (Infografis)</h4>
          <table class="wp-list-table widefat striped" style="width:100%">
            <thead><tr><th style="width:60%">Label</th><th>Angka</th><th style="width:48px"></th></tr></thead>
            <tbody>
              <tr v-for="(s, i) in form.hero.infografis" :key="i">
                <td><input v-model="s.label" class="widefat" placeholder="Mis. Dosen Aktif" /></td>
                <td><input v-model="s.angka" type="number" class="small-text" /></td>
                <td><button type="button" class="button-link" style="color:#b32d2e" @click="removeItem('hero','infografis',i)">Hapus</button></td>
              </tr>
              <tr v-if="!form.hero.infografis.length"><td colspan="3" style="color:var(--wp-text-muted)">Belum ada statistik.</td></tr>
            </tbody>
          </table>
          <button type="button" class="button" style="margin-top:8px" @click="addItem('hero','infografis')">+ Tambah Statistik</button>

          <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
            <WpButton variant="primary" :disabled="saving==='hero'" @click="saveGroup('hero')">{{ saving==='hero' ? 'Menyimpan...' : 'Simpan Hero' }}</WpButton>
          </div>
        </div>
      </details>

      <!-- ══ Tentang ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Tentang — Kedudukan, Tugas, dan Fungsi</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th scope="row">Label Kecil</th><td><input v-model="form.about.eyebrow" class="regular-text" placeholder="Tentang Kami" /></td></tr>
            <tr><th scope="row">Judul</th><td><input v-model="form.about.title" class="regular-text" /></td></tr>
            <tr><th scope="row">Deskripsi</th><td><textarea v-model="form.about.desc" class="large-text" rows="4"></textarea></td></tr>
            <tr><th scope="row">Kutipan Utama</th><td><textarea v-model="form.about.quote" class="large-text" rows="2"></textarea></td></tr>
            <tr><th scope="row">Isi Kutipan</th><td><textarea v-model="form.about.quote_body" class="large-text" rows="4"></textarea></td></tr>
          </table>

          <h4 style="margin:16px 0 8px">Pilar</h4>
          <table class="wp-list-table widefat striped" style="width:100%">
            <thead><tr><th style="width:64px">No</th><th>Judul</th><th>Deskripsi</th><th style="width:48px"></th></tr></thead>
            <tbody>
              <tr v-for="(p, i) in form.about.pillars" :key="i">
                <td><input v-model="p.num" class="small-text" placeholder="01" /></td>
                <td><input v-model="p.title" class="widefat" /></td>
                <td><textarea v-model="p.desc" class="widefat" rows="2"></textarea></td>
                <td><button type="button" class="button-link" style="color:#b32d2e" @click="removeItem('about','pillars',i)">Hapus</button></td>
              </tr>
              <tr v-if="!form.about.pillars.length"><td colspan="4" style="color:var(--wp-text-muted)">Belum ada pilar.</td></tr>
            </tbody>
          </table>
          <button type="button" class="button" style="margin-top:8px" @click="addItem('about','pillars')">+ Tambah Pilar</button>

          <h4 style="margin:16px 0 8px">Kepemimpinan</h4>
          <table class="wp-list-table widefat striped" style="width:100%">
            <thead><tr><th>Peran</th><th>Nama</th><th>Unit / Keterangan</th><th style="width:48px"></th></tr></thead>
            <tbody>
              <tr v-for="(l, i) in form.about.leadership" :key="i">
                <td><input v-model="l.role" class="widefat" /></td>
                <td><input v-model="l.name" class="widefat" /></td>
                <td><textarea v-model="l.unit" class="widefat" rows="2"></textarea></td>
                <td><button type="button" class="button-link" style="color:#b32d2e" @click="removeItem('about','leadership',i)">Hapus</button></td>
              </tr>
              <tr v-if="!form.about.leadership.length"><td colspan="4" style="color:var(--wp-text-muted)">Belum ada kepemimpinan.</td></tr>
            </tbody>
          </table>
          <button type="button" class="button" style="margin-top:8px" @click="addItem('about','leadership')">+ Tambah Kepemimpinan</button>

          <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
            <WpButton variant="primary" :disabled="saving==='about'" @click="saveGroup('about')">{{ saving==='about' ? 'Menyimpan...' : 'Simpan Tentang' }}</WpButton>
          </div>
        </div>
      </details>

      <!-- ══ Bidang ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Bidang — Fokus Riset</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th scope="row">Label Kecil</th><td><input v-model="form.bidang.label" class="regular-text" placeholder="Fokus Riset" /></td></tr>
            <tr><th scope="row">Judul</th><td><input v-model="form.bidang.title" class="regular-text" /></td></tr>
            <tr><th scope="row">Deskripsi</th><td><textarea v-model="form.bidang.desc" class="large-text" rows="3"></textarea></td></tr>
          </table>

          <h4 style="margin:16px 0 8px">Bidang Unggulan</h4>
          <table class="wp-list-table widefat striped" style="width:100%">
            <thead><tr><th style="width:120px">Ikon</th><th>Judul</th><th>Deskripsi</th><th style="width:48px"></th></tr></thead>
            <tbody>
              <tr v-for="(b, i) in form.bidang.items" :key="i">
                <td>
                  <select v-model="b.icon" class="widefat">
                    <option value="leaf">Daun (leaf)</option>
                    <option value="gear">Gigi (gear)</option>
                    <option value="cross">Plus (cross)</option>
                    <option value="hexagon">Segi enam (hexagon)</option>
                  </select>
                </td>
                <td><input v-model="b.title" class="widefat" /></td>
                <td><textarea v-model="b.desc" class="widefat" rows="2"></textarea></td>
                <td><button type="button" class="button-link" style="color:#b32d2e" @click="removeItem('bidang','items',i)">Hapus</button></td>
              </tr>
              <tr v-if="!form.bidang.items.length"><td colspan="4" style="color:var(--wp-text-muted)">Belum ada bidang.</td></tr>
            </tbody>
          </table>
          <button type="button" class="button" style="margin-top:8px" @click="addItem('bidang','items')">+ Tambah Bidang</button>

          <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
            <WpButton variant="primary" :disabled="saving==='bidang'" @click="saveGroup('bidang')">{{ saving==='bidang' ? 'Menyimpan...' : 'Simpan Bidang' }}</WpButton>
          </div>
        </div>
      </details>

      <!-- ══ Mitra ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Mitra — Kerja Sama</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th scope="row">Label Kecil</th><td><input v-model="form.mitra.label" class="regular-text" placeholder="Kemitraan" /></td></tr>
            <tr><th scope="row">Judul</th><td><input v-model="form.mitra.title" class="regular-text" /></td></tr>
          </table>

          <h4 style="margin:16px 0 8px">Mitra Kerja Sama</h4>
          <table class="wp-list-table widefat striped" style="width:100%">
            <thead><tr><th>Nama Mitra</th><th style="width:48px"></th></tr></thead>
            <tbody>
              <tr v-for="(m, i) in form.mitra.items" :key="i">
                <td><input v-model="m.nama" class="widefat" placeholder="Mis. BUMN Perkebunan" /></td>
                <td><button type="button" class="button-link" style="color:#b32d2e" @click="removeItem('mitra','items',i)">Hapus</button></td>
              </tr>
              <tr v-if="!form.mitra.items.length"><td colspan="2" style="color:var(--wp-text-muted)">Belum ada mitra.</td></tr>
            </tbody>
          </table>
          <button type="button" class="button" style="margin-top:8px" @click="addItem('mitra','items')">+ Tambah Mitra</button>

          <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
            <WpButton variant="primary" :disabled="saving==='mitra'" @click="saveGroup('mitra')">{{ saving==='mitra' ? 'Menyimpan...' : 'Simpan Mitra' }}</WpButton>
          </div>
        </div>
      </details>

      <!-- ══ Footer ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Footer</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th scope="row">Tagline</th><td><textarea v-model="form.footer.tagline" class="large-text" rows="2"></textarea></td></tr>
            <tr><th scope="row">Copyright</th><td><input v-model="form.footer.copyright" class="regular-text" /></td></tr>
            <tr><th scope="row">Credit</th><td><input v-model="form.footer.credit" class="regular-text" /></td></tr>
          </table>

          <h4 style="margin:16px 0 8px">Tautan Cepat</h4>
          <table class="wp-list-table widefat striped" style="width:100%">
            <thead><tr><th>Label</th><th>URL</th><th style="width:48px"></th></tr></thead>
            <tbody>
              <tr v-for="(t, i) in form.footer.tautan" :key="i">
                <td><input v-model="t.label" class="widefat" /></td>
                <td><input v-model="t.href" type="url" class="widefat" /></td>
                <td><button type="button" class="button-link" style="color:#b32d2e" @click="removeItem('footer','tautan',i)">Hapus</button></td>
              </tr>
              <tr v-if="!form.footer.tautan.length"><td colspan="3" style="color:var(--wp-text-muted)">Belum ada tautan.</td></tr>
            </tbody>
          </table>
          <button type="button" class="button" style="margin-top:8px" @click="addItem('footer','tautan')">+ Tambah Tautan</button>

          <h4 style="margin:16px 0 8px">Layanan</h4>
          <table class="wp-list-table widefat striped" style="width:100%">
            <thead><tr><th>Label</th><th>URL</th><th style="width:48px"></th></tr></thead>
            <tbody>
              <tr v-for="(l, i) in form.footer.layanan" :key="i">
                <td><input v-model="l.label" class="widefat" /></td>
                <td><input v-model="l.href" type="url" class="widefat" /></td>
                <td><button type="button" class="button-link" style="color:#b32d2e" @click="removeItem('footer','layanan',i)">Hapus</button></td>
              </tr>
              <tr v-if="!form.footer.layanan.length"><td colspan="3" style="color:var(--wp-text-muted)">Belum ada layanan.</td></tr>
            </tbody>
          </table>
          <button type="button" class="button" style="margin-top:8px" @click="addItem('footer','layanan')">+ Tambah Layanan</button>

          <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
            <WpButton variant="primary" :disabled="saving==='footer'" @click="saveGroup('footer')">{{ saving==='footer' ? 'Menyimpan...' : 'Simpan Footer' }}</WpButton>
          </div>
        </div>
      </details>

      <!-- ══ Homepage ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Homepage — Judul Section (Bidang, Mitra, CTA)</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th scope="row">Judul Bidang</th><td><input v-model="form.homepage.bidang_title" class="regular-text" /></td></tr>
            <tr><th scope="row">Deskripsi Bidang</th><td><textarea v-model="form.homepage.bidang_desc" class="large-text" rows="3"></textarea></td></tr>
            <tr><th scope="row">Judul Mitra</th><td><input v-model="form.homepage.mitra_title" class="regular-text" /></td></tr>
            <tr><th scope="row">Judul CTA</th><td><input v-model="form.homepage.cta_title" class="regular-text" /></td></tr>
            <tr><th scope="row">Deskripsi CTA</th><td><textarea v-model="form.homepage.cta_desc" class="large-text" rows="3"></textarea></td></tr>
            <tr><th scope="row">Tagline Footer</th><td><textarea v-model="form.homepage.footer_tagline" class="large-text" rows="2"></textarea></td></tr>
          </table>
          <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
            <WpButton variant="primary" :disabled="saving==='homepage'" @click="saveGroup('homepage')">{{ saving==='homepage' ? 'Menyimpan...' : 'Simpan Homepage' }}</WpButton>
          </div>
        </div>
      </details>

      <!-- ══ Dokumen ══ -->
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Dokumen Default (Panduan & Template)</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th>Panduan Penulisan</th><td><a v-if="data.dokumen?.panduan_url" :href="data.dokumen.panduan_url" target="_blank" rel="noopener">Download PDF</a><span v-else>— (belum diunggah)</span></td></tr>
            <tr><th>Template Dokumen</th><td><a v-if="data.dokumen?.template_url" :href="data.dokumen.template_url" target="_blank" rel="noopener">Download PDF</a><span v-else>— (belum diunggah)</span></td></tr>
          </table>
          <p class="description" style="margin-top:8px">Unggah dokumen dari WP Admin (tab Dokumen) — kredensial saat ini tidak cukup untuk upload media di sini.</p>
        </div>
      </details>

      <div v-if="msg" :class="err ? 'notice notice-error inline' : 'notice notice-success inline'" style="margin:12px 0">
        <p>{{ msg }}</p>
      </div>

      <div class="tablenav bottom" style="padding:0;border:none">
        <div class="displaying-num">Sumber: {{ apiUrl }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { clearSectionCache } from '@/composables/useSectionData'
import { clearHeroCache } from '@/composables/useHero'
import WpButton from '@/components/WpButton.vue'

const auth = useAuthStore()
const toast = useToast()

const loading = ref(true)
const data = ref<any>(null)
const saving = ref('') // group yang sedang disimpan
const msg = ref('')
const err = ref(false)

const apiUrl = SITE.apiBase.replace('/wp/v2', '') + '/lp2m/v1/settings'
const brandApi = SITE.apiBase.replace('/wp/v2', '') + '/lp2m/v1/settings/branding'
const wpAdminUrl = 'https://itsi.ac.id/wp-admin/admin.php?page=lp2m-settings'

// ── Form state per group (bound ke input) ──
const form = reactive({
  site: { nama: '', nama_panjang: '', email: '', telepon: '', alamat: '', frontend_url: '' },
  hero: {
    headline: '', title: '', caption: '',
    btn_primary_text: '', btn_primary_url: '', btn_secondary_text: '', btn_secondary_url: '',
    infografis: [] as Array<{ label: string; angka: string }>
  },
  about: {
    eyebrow: '', title: '', desc: '', quote: '', quote_body: '',
    pillars: [] as Array<{ num: string; title: string; desc: string }>,
    leadership: [] as Array<{ role: string; name: string; unit: string }>
  },
  bidang: {
    label: '', title: '', desc: '',
    items: [] as Array<{ icon: string; title: string; desc: string }>
  },
  mitra: {
    label: '', title: '',
    items: [] as Array<{ nama: string }>
  },
  footer: {
    tagline: '', copyright: '', credit: '',
    tautan: [] as Array<{ label: string; href: string }>,
    layanan: [] as Array<{ label: string; href: string }>
  },
  homepage: {
    bidang_title: '', bidang_desc: '', mitra_title: '', cta_title: '', cta_desc: '', footer_tagline: ''
  }
})

// ── Branding state ──
const brand = reactive({ logoId: 0, logoUrl: '', faviconId: 0, faviconUrl: '' })
const brandSaving = ref(false)
const brandMsg = ref('')
const brandErr = ref(false)

function syncBrand(site: any) {
  brand.logoId = site?.logo_is_override ? Number(site.logo_id || 0) : 0
  brand.logoUrl = site?.logo_url || ''
  brand.faviconId = site?.favicon_is_override ? Number(site.favicon_id || 0) : 0
  brand.faviconUrl = site?.favicon_url || ''
}

/** Isi form dari response GET /settings (deep copy agar tidak mutate data asli). */
function fillForm(raw: any) {
  const s = raw?.site || {}
  form.site = {
    nama: s.nama || '', nama_panjang: s.nama_panjang || '', email: s.email || '',
    telepon: s.telepon || '', alamat: s.alamat || '', frontend_url: s.frontend_url || ''
  }
  const h = raw?.hero || {}
  form.hero = {
    headline: h.headline || '', title: h.title || '', caption: h.caption || '',
    btn_primary_text: h.btn_primary_text || '', btn_primary_url: h.btn_primary_url || '',
    btn_secondary_text: h.btn_secondary_text || '', btn_secondary_url: h.btn_secondary_url || '',
    infografis: (h.infografis || []).map((i: any) => ({ label: i.label || '', angka: i.angka || '' }))
  }
  const a = raw?.about || {}
  form.about = {
    eyebrow: a.eyebrow || '', title: a.title || '', desc: a.desc || '',
    quote: a.quote || '', quote_body: a.quote_body || '',
    pillars: (a.pillars || []).map((p: any) => ({ num: p.num || '', title: p.title || '', desc: p.desc || '' })),
    leadership: (a.leadership || []).map((l: any) => ({ role: l.role || '', name: l.name || '', unit: l.unit || '' }))
  }
  const b = raw?.bidang || {}
  form.bidang = {
    label: b.label || '', title: b.title || '', desc: b.desc || '',
    items: (b.items || []).map((x: any) => ({ icon: x.icon || 'leaf', title: x.title || '', desc: x.desc || '' }))
  }
  const m = raw?.mitra || {}
  form.mitra = {
    label: m.label || '', title: m.title || '',
    items: (m.items || []).map((x: any) => ({ nama: x.nama || '' }))
  }
  const f = raw?.footer || {}
  form.footer = {
    tagline: f.tagline || '', copyright: f.copyright || '', credit: f.credit || '',
    tautan: (f.tautan || []).map((x: any) => ({ label: x.label || '', href: x.href || '' })),
    layanan: (f.layanan || []).map((x: any) => ({ label: x.label || '', href: x.href || '' }))
  }
  const hp = raw?.homepage || {}
  form.homepage = {
    bidang_title: hp.bidang_title || '', bidang_desc: hp.bidang_desc || '',
    mitra_title: hp.mitra_title || '', cta_title: hp.cta_title || '',
    cta_desc: hp.cta_desc || '', footer_tagline: hp.footer_tagline || ''
  }
}

async function load() {
  loading.value = true
  try {
    const r = await window.fetch(apiUrl)
    if (r.ok) {
      data.value = await r.json()
      fillForm(data.value)
      syncBrand(data.value.site)
    } else {
      data.value = { error: 'Gagal fetch: HTTP ' + r.status }
    }
  } catch (e: any) {
    data.value = { error: e.message }
  } finally {
    loading.value = false
  }
}

onMounted(load)

/** Simpan satu group via POST /settings/{group} — lalu clear cache agar tampil langsung. */
async function saveGroup(group: keyof typeof form) {
  saving.value = group
  msg.value = ''
  err.value = false
  try {
    const r = await window.fetch(`${apiUrl}/${group}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify(form[group])
    })
    const res = await r.json().catch(() => ({}))
    if (!r.ok) {
      msg.value = res?.message || 'Gagal menyimpan (HTTP ' + r.status + ')'
      err.value = true
      return
    }
    // Update data lokal + clear cache frontend agar homepage tampil tanpa hard refresh.
    if (data.value) {
      const fresh = res?.data
      if (fresh) data.value[group] = fresh
    }
    clearSectionCache(group)
    if (group === 'hero') clearHeroCache()
    if (group === 'site') { clearSectionCache('site'); clearSectionCache('footer') }
    if (group === 'homepage') { clearSectionCache('cta'); clearSectionCache('bidang'); clearSectionCache('mitra') }
    if (group === 'footer') { clearSectionCache('footer') }
    msg.value = 'Pengaturan tersimpan. Situs publik akan memperbarui segera.'
    err.value = false
    toast.success('Pengaturan ' + group + ' tersimpan')
  } catch (e: any) {
    msg.value = e.message || 'Terjadi kesalahan'
    err.value = true
  } finally {
    saving.value = ''
  }
}

// ── Repeater helpers ──
function addItem(group: keyof typeof form, key: string) {
  const list = (form[group] as any)[key] as any[]
  const blank: Record<string, any> = {}
  // Infer field names from an existing row, or use defaults per key.
  if (list.length) {
    Object.keys(list[0]).forEach(k => { blank[k] = '' })
  } else {
    if (key === 'infografis') { blank.label = ''; blank.angka = '' }
    else if (key === 'pillars') { blank.num = ''; blank.title = ''; blank.desc = '' }
    else if (key === 'leadership') { blank.role = ''; blank.name = ''; blank.unit = '' }
    else if (key === 'items') {
      if (group === 'bidang') { blank.icon = 'leaf'; blank.title = ''; blank.desc = '' }
      else if (group === 'mitra') { blank.nama = '' }
      else { blank.title = ''; blank.desc = '' }
    }
    else if (key === 'tautan' || key === 'layanan') { blank.label = ''; blank.href = '' }
  }
  list.push(blank)
}
function removeItem(group: keyof typeof form, key: string, i: number) {
  ;(form[group] as any)[key].splice(i, 1)
}

// ── Branding ──
async function uploadImage(file: File): Promise<number | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('status', 'publish')
  try {
    const r = await window.fetch(`${SITE.apiBase}/media`, { method: 'POST', headers: { ...auth.authHeaders() }, body: formData })
    if (!r.ok) throw new Error('Upload gagal')
    const m = await r.json()
    return m.id
  } catch { return null }
}

async function onLogoPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const id = await uploadImage(f)
  if (id) { brand.logoId = id; brand.logoUrl = URL.createObjectURL(f); brandMsg.value = 'Logo terpilih. Klik Simpan.'; brandErr.value = false }
  else { brandMsg.value = 'Upload logo gagal'; brandErr.value = true }
}
async function onFaviconPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const id = await uploadImage(f)
  if (id) { brand.faviconId = id; brand.faviconUrl = URL.createObjectURL(f); brandMsg.value = 'Favicon terpilih. Klik Simpan.'; brandErr.value = false }
  else { brandMsg.value = 'Upload favicon gagal'; brandErr.value = true }
}
function clearBrand(which: 'logo' | 'favicon') {
  if (which === 'logo') {
    brand.logoId = 0
    brand.logoUrl = data.value?.site?.logo_url && !data.value.site.logo_is_override ? data.value.site.logo_url : ''
  } else {
    brand.faviconId = 0
    brand.faviconUrl = data.value?.site?.favicon_url && !data.value.site.favicon_is_override ? data.value.site.favicon_url : ''
  }
  brandMsg.value = ''
  brandErr.value = false
}
async function saveBrand() {
  brandSaving.value = true
  brandMsg.value = ''
  brandErr.value = false
  try {
    const r = await window.fetch(brandApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify({ logo_id: brand.logoId, favicon_id: brand.faviconId })
    })
    const res = await r.json().catch(() => ({}))
    if (!r.ok) { brandMsg.value = res.message || 'Gagal menyimpan'; brandErr.value = true; return }
    syncBrand(res.site)
    if (data.value) data.value.site = res.site
    clearSectionCache('site')
    clearSectionCache('footer')
    brandMsg.value = 'Branding tersimpan. Logo & favicon tampil di seluruh halaman.'
    brandErr.value = false
  } catch (e: any) {
    brandMsg.value = e.message
    brandErr.value = true
  } finally {
    brandSaving.value = false
  }
}
</script>
