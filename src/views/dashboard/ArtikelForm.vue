<template>
  <div class="edit-post-layout">
    <div class="editor-header">
      <div class="editor-header__left">
        <WpButton variant="tertiary" to="/dashboard/artikel" class="is-small">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </WpButton>
        <span class="editor-header__title">{{ editId ? 'Edit Artikel' : 'Tambah Artikel' }}</span>
      </div>
      <div class="editor-header__center">
        <span class="post-state" :class="f.status==='draft'?'draft':''">{{ f.status==='publish'?'Publish':'Draft' }}</span>
      </div>
      <div class="editor-header__right">
        <WpButton v-if="editId" variant="tertiary" class="is-small" @click="preview">Preview</WpButton>
        <WpButton variant="primary" class="is-small" style="margin-left:8px" :disabled="saving" @click="save">{{ saving?'Menyimpan...':(editId?'Perbarui':'Terbitkan') }}</WpButton>
      </div>
    </div>

    <div v-if="err" class="components-notice is-error" style="margin:0;border-left:none;border-radius:0"><div class="components-notice__content">{{ err }}</div></div>

    <div class="editor-body">
      <div class="editor-center">
        <div class="editor-styles">
          <div class="editor-post-title">
            <textarea v-model="f.title" class="editor-post-title__input" placeholder="Tambahkan judul" rows="1" @input="autoResize($event)"></textarea>
          </div>
          <WpEditor v-model="f.content" placeholder="Mulai menulis..." />

          <details class="wp-detail-group" style="margin-top:32px;border:1px solid var(--wp-border-light);border-radius:2px;background:var(--wp-bg)">
            <summary class="wp-detail-group__title">Pengaturan Artikel</summary>
            <div class="wp-detail-group__body">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="components-base-control">
                  <label class="components-base-control__label">Status</label>
                  <select class="components-select-control__input" v-model="f.status"><option value="draft">Draft</option><option value="publish">Publish</option></select>
                </div>
                <div class="components-base-control">
                  <label class="components-base-control__label">Kategori</label>
                  <select class="components-select-control__input" v-model="f.category" @change="onCategoryChange">
                    <option :value="null">— Pilih Kategori —</option>
                    <option v-for="c in kTerms" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
              </div>
              <div class="components-base-control">
                <label class="components-base-control__label">Thumbnail</label>
                <ThumbnailPicker v-model:media-id="f.featured_media" v-model:preview-url="thumb" />
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpButton from '@/components/WpButton.vue'
import WpEditor from '@/components/WpEditor.vue'
import ThumbnailPicker from '@/components/ThumbnailPicker.vue'
import { useToast } from '@/composables/useToast'

const route=useRoute(),router=useRouter(),auth=useAuthStore()
const toast=useToast()
const editId=ref<number|null>(null),saving=ref(false),err=ref(''),thumb=ref('')
const kTerms=ref<{id:number;name:string}[]>([])
const f=reactive({title:'',content:'',status:'draft',category:null as number|null,featured_media:null as number|null})

function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}
function autoResize(e:Event){const el=e.target as HTMLTextAreaElement;el.style.height='auto';el.style.height=el.scrollHeight+'px'}
function preview(){if(editId.value)window.open(`https://itsi.ac.id/?p=${editId.value}&preview=true`,'_blank')}
function onCategoryChange(){}

async function loadCats(){try{const r=await window.fetch(`${SITE.apiBase}/categories?per_page=100&orderby=name&order=asc`);if(r.ok)kTerms.value=await r.json()}catch{}}
async function loadItem(id:number){try{const r=await window.fetch(`${SITE.apiBase}/posts/${id}?_embed`);if(!r.ok)return;const p=await r.json();editId.value=p.id;f.title=clean(p.title?.rendered||'');f.content=p.content?.rendered||'';f.status=p.status||'draft';f.category=p.categories?.[0]||null;f.featured_media=p.featured_media||null;thumb.value=p._embedded?.['wp:featuredmedia']?.[0]?.source_url||''}catch{}}

async function save(){if(!f.title.trim()){err.value='Judul wajib diisi.';return};saving.value=true;err.value='';const p:any={title:f.title,content:f.content,status:f.status};if(f.category)p.categories=[f.category];if(f.featured_media)p.featured_media=f.featured_media
  try{const url=editId.value?`${SITE.apiBase}/posts/${editId.value}`:`${SITE.apiBase}/posts`;const r=await window.fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify(p)});if(!r.ok){const e=await r.json().catch(()=>({}));err.value=e.message||'HTTP '+r.status;toast.error(e.message||'Gagal');saving.value=false;return};const c=await r.json();if(!editId.value){editId.value=c.id;router.replace('/dashboard/artikel/'+c.id)};saving.value=false;err.value='';toast.success(editId.value?'Artikel diperbarui!':'Artikel dibuat!')}catch(e:any){err.value=e.message;saving.value=false}}

function resetForm(){Object.assign(f,{title:'',content:'',status:'draft',category:null,featured_media:null});thumb.value='';editId.value=null;err.value=''}
watch(()=>route.params.id,(id)=>{if(id)loadItem(parseInt(id as string));else resetForm()})
onMounted(()=>{loadCats();const id=route.params.id as string;if(id)loadItem(parseInt(id));else resetForm()})
</script>

<style scoped>
.edit-post-layout{min-height:100vh}
.editor-header{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:#fff;border-bottom:1px solid var(--wp-border-light);min-height:48px}
.editor-header__left{display:flex;align-items:center;gap:8px}
.editor-header__title{font-size:14px;font-weight:500}
.editor-header__center{display:flex;align-items:center}
.editor-header__right{display:flex;align-items:center}
.editor-body{display:flex;min-height:calc(100vh - 48px);background:var(--wp-bg)}
.editor-center{flex:1;overflow-y:auto;padding:40px 0 80px;background:#fff}
.editor-styles{max-width:840px;margin:0 auto;padding:0 40px}
.editor-post-title{margin-bottom:20px}
.editor-post-title__input{display:block;width:100%;font-size:2em;font-weight:600;line-height:1.2;padding:0;border:none;outline:none;background:transparent;color:var(--wp-text);font-family:inherit;resize:none;overflow:hidden}
.editor-post-title__input::placeholder{color:#757575}
.wp-detail-group{border-bottom:1px solid #e0e0e0}
.wp-detail-group__title{display:flex;align-items:center;padding:12px 16px;font-size:13px;font-weight:500;color:var(--wp-text);cursor:pointer;user-select:none;list-style:none}
.wp-detail-group__title::-webkit-details-marker{display:none}
.wp-detail-group__title::before{content:"";display:inline-block;width:8px;height:8px;border-right:2px solid var(--wp-text-secondary);border-bottom:2px solid var(--wp-text-secondary);margin-right:8px;transform:rotate(-45deg);transition:transform .15s}
.wp-detail-group[open] .wp-detail-group__title::before{transform:rotate(45deg)}
.wp-detail-group__body{padding:0 16px 16px}
</style>
