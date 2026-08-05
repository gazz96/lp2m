<template>
  <div class="wrap" v-if="!loading">
    <h1>Pengaturan LP2M</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">Data disinkron dari WordPress ITSI (Settings → LP2M).</p>

    <div class="notice notice-info inline" v-if="!data"><p>Memuat data dari server ITSI...</p></div>

    <div v-if="data">
      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Identitas & Kontak</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th>Nama Lembaga</th><td>{{ data.site?.nama || 'LP2M ITSI' }}</td></tr>
            <tr><th>Nama Panjang</th><td>{{ data.site?.nama_panjang || '—' }}</td></tr>
            <tr><th>Email</th><td>{{ data.site?.email || '—' }}</td></tr>
            <tr><th>Telepon</th><td>{{ data.site?.telepon || '—' }}</td></tr>
            <tr><th>Alamat</th><td>{{ data.site?.alamat || '—' }}</td></tr>
            <tr><th>Logo</th><td><img v-if="data.site?.logo_url" :src="data.site.logo_url" style="max-height:60px" /> <span v-else>—</span></td></tr>
            <tr><th>Favicon</th><td><img v-if="data.site?.favicon_url" :src="data.site.favicon_url" style="max-height:32px" /> <span v-else>—</span></td></tr>
          </table>
        </div>
      </details>

      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Dokumen Default</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th>Panduan Penulisan</th><td><a v-if="data.dokumen?.panduan_url" :href="data.dokumen.panduan_url" target="_blank">Download PDF</a><span v-else>—</span></td></tr>
            <tr><th>Template Dokumen</th><td><a v-if="data.dokumen?.template_url" :href="data.dokumen.template_url" target="_blank">Download PDF</a><span v-else>—</span></td></tr>
          </table>
        </div>
      </details>

      <details class="wp-detail-group" open style="border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-surface);margin-bottom:12px">
        <summary class="wp-detail-group__title" style="background:var(--wp-alt-bg)">Homepage</summary>
        <div class="wp-detail-group__body">
          <table class="form-table" style="width:100%">
            <tr><th>Hero Headline</th><td>{{ data.hero?.headline || '—' }}</td></tr>
            <tr><th>Hero Title</th><td>{{ data.hero?.title || '—' }}</td></tr>
            <tr><th>Hero Caption</th><td>{{ data.hero?.caption || '—' }}</td></tr>
            <tr><th>Hero Button Primary</th><td>{{ data.hero?.btn_primary_text || '—' }} → {{ data.hero?.btn_primary_url || '—' }}</td></tr>
            <tr><th>Hero Button Secondary</th><td>{{ data.hero?.btn_secondary_text || '—' }} → {{ data.hero?.btn_secondary_url || '—' }}</td></tr>
            <tr><th>Hero Infografis</th><td><pre v-if="data.hero?.infografis?.length" style="margin:0;font-size:12px">{{ JSON.stringify(data.hero.infografis, null, 2) }}</pre><span v-else>—</span></td></tr>
            <tr><th>Tentang: Judul</th><td>{{ data.about?.title || '—' }}</td></tr>
            <tr><th>Tentang: Deskripsi</th><td>{{ data.about?.desc || '—' }}</td></tr>
            <tr><th>Tentang: Kutipan</th><td>{{ data.about?.quote || '—' }}</td></tr>
            <tr><th>Bidang: Judul</th><td>{{ data.homepage?.bidang_title || '—' }}</td></tr>
            <tr><th>Mitra: Judul</th><td>{{ data.homepage?.mitra_title || '—' }}</td></tr>
          </table>
        </div>
      </details>

      <div class="tablenav bottom" style="padding:0;border:none">
        <div class="displaying-num">Sumber: {{ apiUrl }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'

const loading=ref(true)
const data=ref<any>(null)
const apiUrl=SITE.apiBase.replace('/wp/v2','')+'/lp2m/v1/settings'

onMounted(async()=>{
  try{const r=await window.fetch(apiUrl);if(r.ok)data.value=await r.json();else data.value={error:'Gagal fetch: HTTP '+r.status}}catch(e:any){data.value={error:e.message}}finally{loading.value=false}
})
</script>
