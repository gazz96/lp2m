<template>
  <div class="wrap" v-if="!loading">
    <h1>Pengaturan LP2M</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">Data disinkron dari WordPress ITSI (Settings → LP2M).</p>

    <div class="notice notice-info inline" v-if="!data"><p>Memuat data dari server ITSI...</p></div>

    <div v-if="data">
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
import { ref, reactive, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpButton from '@/components/WpButton.vue'

const auth = useAuthStore()
const loading=ref(true)
const data=ref<any>(null)
const apiUrl=SITE.apiBase.replace('/wp/v2','')+'/lp2m/v1/settings'
const brandApi=SITE.apiBase.replace('/wp/v2','')+'/lp2m/v1/settings/branding'
const brand=reactive({logoId:0,logoUrl:'',faviconId:0,faviconUrl:''})
const brandSaving=ref(false)
const brandMsg=ref('')
const brandErr=ref(false)

function syncBrand(site:any){
  brand.logoId=site?.logo_is_override?Number(site.logo_id||0):0
  brand.logoUrl=site?.logo_url||''
  brand.faviconId=site?.favicon_is_override?Number(site.favicon_id||0):0
  brand.faviconUrl=site?.favicon_url||''
}

onMounted(async()=>{
  try{const r=await window.fetch(apiUrl);if(r.ok){data.value=await r.json();syncBrand(data.value.site)}else data.value={error:'Gagal fetch: HTTP '+r.status}}catch(e:any){data.value={error:e.message}}finally{loading.value=false}
})

async function uploadImage(file:File):Promise<number|null>{
  const formData=new FormData();formData.append('file',file);formData.append('status','publish')
  try{
    const r=await window.fetch(`${SITE.apiBase}/media`,{method:'POST',headers:{...auth.authHeaders()},body:formData})
    if(!r.ok)throw new Error('Upload gagal')
    const m=await r.json();return m.id
  }catch{return null}
}

async function onLogoPick(e:Event){
  const f=(e.target as HTMLInputElement).files?.[0];if(!f)return
  const id=await uploadImage(f)
  if(id){brand.logoId=id;brand.logoUrl=URL.createObjectURL(f);brandMsg.value='Logo terpilih. Klik Simpan.';brandErr.value=false}else{brandMsg.value='Upload logo gagal';brandErr.value=true}
}
async function onFaviconPick(e:Event){
  const f=(e.target as HTMLInputElement).files?.[0];if(!f)return
  const id=await uploadImage(f)
  if(id){brand.faviconId=id;brand.faviconUrl=URL.createObjectURL(f);brandMsg.value='Favicon terpilih. Klik Simpan.';brandErr.value=false}else{brandMsg.value='Upload favicon gagal';brandErr.value=true}
}
function clearBrand(which:'logo'|'favicon'){
  if(which==='logo'){brand.logoId=0;brand.logoUrl=data.value?.site?.logo_url&&!data.value.site.logo_is_override?data.value.site.logo_url:''}
  else{brand.faviconId=0;brand.faviconUrl=data.value?.site?.favicon_url&&!data.value.site.favicon_is_override?data.value.site.favicon_url:''}
  brandMsg.value='';brandErr.value=false
}
async function saveBrand(){
  brandSaving.value=true;brandMsg.value='';brandErr.value=false
  try{
    const r=await window.fetch(brandApi,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({logo_id:brand.logoId,favicon_id:brand.faviconId})})
    const res=await r.json().catch(()=>({}))
    if(!r.ok){brandMsg.value=res.message||'Gagal menyimpan';brandErr.value=true;return}
    syncBrand(res.site);data.value.site=res.site
    brandMsg.value='Branding tersimpan. Logo & favicon tampil di seluruh halaman.';brandErr.value=false
  }catch(e:any){brandMsg.value=e.message;brandErr.value=true}
  finally{brandSaving.value=false}
}
</script>
