<template>
  <div class="edit-post-layout">
    <!-- Header bar -->
    <div class="editor-header">
      <div class="editor-header__left">
        <WpButton variant="tertiary" to="/dashboard/hibah" class="is-small">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </WpButton>
        <span class="editor-header__title">{{ editId ? 'Edit Hibah' : 'Tambah Hibah' }}</span>
      </div>
      <div class="editor-header__center">
        <span class="post-state" :class="f.status==='draft'?'draft':''">{{ f.status==='publish'?'Publish':'Draft' }}</span>
      </div>
      <div class="editor-header__right">
        <WpButton v-if="editId" variant="tertiary" class="is-small" @click="previewDraft">Preview</WpButton>
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
          <WpEditor v-model="f.content" placeholder="Mulai menulis atau tekan / untuk memilih blok..." />

          <!-- Tabs -->
          <div class="editor-tabs">
            <div class="editor-tabs__nav">
              <button v-for="tab in tabs" :key="tab.id" class="editor-tabs__btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button>
            </div>

            <!-- Info Dasar -->
            <div class="editor-tabs__panel" v-if="activeTab === 'info'">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="components-base-control">
                  <label class="components-base-control__label">Deadline Tanggal</label>
                  <input class="components-text-control__input" type="date" v-model="f.deadline" />
                  <div class="components-base-control__help">Tanggal terakhir pendaftaran.</div>
                </div>
                <div class="components-base-control">
                  <label class="components-base-control__label">Deadline Jam</label>
                  <input class="components-text-control__input" type="time" v-model="f.deadline_time" />
                  <div class="components-base-control__help">Opsional. Kosongkan = 23:59:59.</div>
                </div>
                <div class="components-base-control">
                  <label class="components-base-control__label">Tahun Akademik</label>
                  <input class="components-text-control__input" type="text" v-model="f.event_eyebrow" placeholder="TA 2026/2027" />
                </div>
                <div class="components-base-control">
                  <label class="components-base-control__label">Dana Maks (Rp)</label>
                  <input class="components-text-control__input" type="number" v-model.number="f.dana_maks_num" placeholder="35000000" />
                </div>
                <div></div>
              </div>
              <div class="components-base-control" style="margin-top:4px">
                <label class="components-base-control__label">Info Tambahan</label>
                <textarea class="components-text-control__input" v-model="f.info_tambahan" rows="4" placeholder="Satu informasi per baris..." style="min-height:80px"></textarea>
              </div>
            </div>

            <!-- Timeline -->
            <div class="editor-tabs__panel" v-if="activeTab === 'timeline'">
              <div v-for="(t,i) in f.timeline_items" :key="i" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
                <input class="components-text-control__input" type="date" v-model="t.date" style="width:160px;flex-shrink:0" />
                <input class="components-text-control__input" type="text" v-model="t.label" placeholder="Deskripsi tahapan..." style="flex:1" />
                <WpButton variant="link" class="is-small" @click="f.timeline_items.splice(i,1)">Hapus</WpButton>
              </div>
              <WpButton variant="tertiary" class="is-small" @click="f.timeline_items.push({date:'',label:''})">+ Tambah Tahapan</WpButton>
            </div>

            <!-- Panduan & Dokumen -->
            <div class="editor-tabs__panel" v-if="activeTab === 'panduan'">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="components-base-control">
                  <label class="components-base-control__label">Panduan Penulisan (PDF)</label>
                  <input class="components-text-control__input" type="file" accept=".pdf" @change="handleFileUpload($event, 'panduan_penulisan')" />
                  <div class="components-base-control__help" v-if="f.panduan_penulisan_id">ID: {{ f.panduan_penulisan_id }}</div>
                </div>
                <div class="components-base-control">
                  <label class="components-base-control__label">Template Dokumen (PDF)</label>
                  <input class="components-text-control__input" type="file" accept=".pdf" @change="handleFileUpload($event, 'template_dokumen')" />
                  <div class="components-base-control__help" v-if="f.template_dokumen_id">ID: {{ f.template_dokumen_id }}</div>
                </div>
              </div>
              <div class="components-base-control" style="margin-top:4px">
                <label class="components-base-control__label">Eyebrow</label>
                <input class="components-text-control__input" type="text" v-model="f.event_eyebrow" placeholder="Event Aktif..." />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Always-visible sidebar -->
      <div class="editor-sidebar">
        <details class="wp-detail-group" open>
          <summary class="wp-detail-group__title">Status & Visibilitas</summary>
          <div class="wp-detail-group__body">
            <div class="components-base-control">
              <label class="components-base-control__label">Status</label>
              <select class="components-select-control__input" v-model="f.status"><option value="draft">Draft</option><option value="publish">Publish</option></select>
            </div>
            <div v-if="editId" style="font-size:12px;color:var(--wp-text-muted);margin-top:8px">ID: {{ editId }}</div>
          </div>
        </details>

        <details class="wp-detail-group" open>
          <summary class="wp-detail-group__title">Kategori Hibah</summary>
          <div class="wp-detail-group__body">
            <TagSelect :terms="kTerms" :selected="selKats" placeholder="Cari atau buat kategori..."
              @add="(t:any)=>selKats.push(t.id)" @remove="(id:number)=>selKats=selKats.filter(x=>x!==id)"
              @create="addTerm('kategori_hibah',$event,kTerms,selKats)" />
          </div>
        </details>

        <details class="wp-detail-group" open>
          <summary class="wp-detail-group__title">Skema Hibah</summary>
          <div class="wp-detail-group__body">
            <TagSelect :terms="sTerms" :selected="selSkms" placeholder="Cari atau buat skema..."
              @add="(t:any)=>selSkms.push(t.id)" @remove="(id:number)=>selSkms=selSkms.filter(x=>x!==id)"
              @create="addTerm('skema_hibah',$event,sTerms,selSkms)" />
          </div>
        </details>

        <details class="wp-detail-group" open>
          <summary class="wp-detail-group__title">Thumbnail</summary>
          <div class="wp-detail-group__body">
            <ThumbnailPicker v-model:media-id="f.featured_media" v-model:preview-url="thumb" />
          </div>
        </details>
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
import TagSelect from '@/components/TagSelect.vue'
import { useToast } from '@/composables/useToast'

const route=useRoute(),router=useRouter(),auth=useAuthStore()
const toast=useToast()
const editId=ref<number|null>(null),saving=ref(false),err=ref(''),thumb=ref('')
const kTerms=ref<{id:number;name:string}[]>([]),sTerms=ref<{id:number;name:string}[]>([])
const selKats=ref<number[]>([]),selSkms=ref<number[]>([])
const activeTab=ref('info')
const tabs=[{id:'info',label:'Info Dasar'},{id:'timeline',label:'Timeline'},{id:'panduan',label:'Panduan & Dokumen'}]
interface TL{date:string;label:string}
const f=reactive({title:'',content:'',status:'draft',deadline:'',deadline_time:'',dana_maks_num:0,event_eyebrow:'',info_tambahan:'',link_panduan:'',timeline_items:[] as TL[],featured_media:null as number|null,panduan_penulisan_id:null as number|null,template_dokumen_id:null as number|null})
function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}
function autoResize(e:Event){const el=e.target as HTMLTextAreaElement;el.style.height='auto';el.style.height=el.scrollHeight+'px'}

async function handleFileUpload(e:Event,key:'panduan_penulisan'|'template_dokumen'){
  const file=(e.target as HTMLInputElement).files?.[0];if(!file)return
  const formData=new FormData();formData.append('file',file)
  try{const r=await window.fetch(`${SITE.apiBase.replace('/wp/v2','')}/media`,{method:'POST',headers:{...auth.authHeaders()},body:formData})
    if(!r.ok)throw new Error('Upload gagal');const media=await r.json()
    if(key==='panduan_penulisan')f.panduan_penulisan_id=media.id;else f.template_dokumen_id=media.id
  }catch(e:any){err.value=e.message}
}

async function loadTerms(){try{const[k,s]=await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`),window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100`)]);if(k.ok)kTerms.value=await k.json();if(s.ok)sTerms.value=await s.json()}catch{}}
async function loadItem(id:number){try{const r=await window.fetch(`${SITE.apiBase}/hibah/${id}?_embed`);if(!r.ok)return;const p=await r.json();editId.value=p.id;f.title=clean(p.title?.rendered||'');f.content=p.content?.rendered||'';f.status=p.status||'draft';f.deadline=p.deadline?p.deadline.slice(0,10):'';f.deadline_time=p.deadline_time||'';f.dana_maks_num=parseInt(p.dana_maks)||0;f.event_eyebrow=p.event_eyebrow||'';f.info_tambahan=p.info_tambahan||'';f.link_panduan=p.link_panduan||'';f.timeline_items=p.timeline_items||[];f.featured_media=p.featured_media||null;f.panduan_penulisan_id=p.panduan_penulisan_id||null;f.template_dokumen_id=p.template_dokumen_id||null;selKats.value=p.kategori_hibah||[];selSkms.value=p.skema_hibah||[];thumb.value=p._embedded?.['wp:featuredmedia']?.[0]?.source_url||''}catch{}}
async function addTerm(tax:string,name:string,arr:{id:number;name:string}[],sel:number[]){err.value='';const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-');try{const r=await window.fetch(`${SITE.apiBase}/${tax}`,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({name,slug})});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).message||'Gagal');const c=await r.json();arr.push({id:c.id,name:c.name});sel.push(c.id)}catch(e:any){err.value='Gagal: '+e.message}}
function previewDraft(){if(editId.value)window.open(`https://itsi.ac.id/?p=${editId.value}&preview=true`,'_blank')}
async function save(){if(!f.title.trim()){err.value='Judul wajib diisi.';return};saving.value=true;err.value='';const p:any={title:f.title,content:f.content,status:f.status,deadline:f.deadline||'',deadline_time:f.deadline_time||'',dana_maks:f.dana_maks_num?String(f.dana_maks_num):'',event_eyebrow:f.event_eyebrow,info_tambahan:f.info_tambahan,link_panduan:f.link_panduan,kategori_hibah:selKats.value,skema_hibah:selSkms.value,timeline_items:f.timeline_items,panduan_penulisan_id:f.panduan_penulisan_id,template_dokumen_id:f.template_dokumen_id};if(f.featured_media)p.featured_media=f.featured_media;try{const url=editId.value?`${SITE.apiBase}/hibah/${editId.value}`:`${SITE.apiBase}/hibah`;const r=await window.fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify(p)});if(!r.ok){const e=await r.json().catch(()=>({}));err.value=e.message||'HTTP '+r.status;toast.error(e.message||'Gagal menyimpan');saving.value=false;return};const c=await r.json();if(!editId.value){editId.value=c.id;router.replace('/dashboard/hibah/'+c.id)};saving.value=false;err.value='';toast.success(editId.value?'Hibah berhasil diperbarui!':'Hibah berhasil dibuat!')}catch(e:any){err.value=e.message;saving.value=false}}
function resetForm(){Object.assign(f,{title:'',content:'',status:'draft',deadline:'',deadline_time:'',dana_maks_num:0,event_eyebrow:'',info_tambahan:'',link_panduan:'',timeline_items:[],featured_media:null,panduan_penulisan_id:null,template_dokumen_id:null});selKats.value=[];selSkms.value=[];thumb.value='';editId.value=null;err.value='';activeTab.value='info'}
watch(()=>route.params.id,(id)=>{if(id)loadItem(parseInt(id as string));else resetForm()})
onMounted(()=>{loadTerms();const id=route.params.id as string;if(id)loadItem(parseInt(id));else resetForm()})
</script>

<style scoped>
.edit-post-layout { min-height: 100vh; }

.editor-header { display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:#fff;border-bottom:1px solid var(--wp-border-light);min-height:48px; }
.editor-header__left { display:flex;align-items:center;gap:8px; }
.editor-header__title { font-size:14px;font-weight:500; }
.editor-header__center { display:flex;align-items:center; }
.editor-header__right { display:flex;align-items:center; }

.editor-body { display:flex; min-height:calc(100vh - 48px); background:var(--wp-bg); }
.editor-center { flex:1; overflow-y:auto; padding:40px 0 80px; background:#fff; }
.editor-styles { max-width:840px; margin:0 auto; padding:0 40px; }

.editor-post-title { margin-bottom:20px; }
.editor-post-title__input { display:block;width:100%;font-size:2em;font-weight:600;line-height:1.2;padding:0;border:none;outline:none;background:transparent;color:var(--wp-text);font-family:inherit;resize:none;overflow:hidden; }
.editor-post-title__input::placeholder { color:#757575; }

.editor-tabs { margin-top: 32px; border: 1px solid var(--wp-border-light); border-radius: 2px; background: var(--wp-bg); }
.editor-tabs__nav { display: flex; border-bottom: 1px solid var(--wp-border-light); background: #fff; }
.editor-tabs__btn { flex: 1; padding: 10px 16px; border: none; border-bottom: 2px solid transparent; background: transparent; font-family: inherit; font-size: 13px; font-weight: 500; color: var(--wp-text-secondary); cursor: pointer; text-align: center; }
.editor-tabs__btn:hover { color: var(--wp-primary); }
.editor-tabs__btn.active { color: var(--wp-primary); border-bottom-color: var(--wp-primary); font-weight: 600; }
.editor-tabs__panel { padding: 20px; }

.editor-sidebar { width:280px;flex-shrink:0;overflow-y:auto;border-left:1px solid var(--wp-border-light);background:#fff; }
.wp-detail-group { border-bottom: 1px solid #e0e0e0; }
.wp-detail-group__title { display:flex;align-items:center;padding:12px 16px;font-size:13px;font-weight:500;color:var(--wp-text);cursor:pointer;user-select:none;list-style:none; }
.wp-detail-group__title::-webkit-details-marker { display:none; }
.wp-detail-group__title::before { content:"";display:inline-block;width:8px;height:8px;border-right:2px solid var(--wp-text-secondary);border-bottom:2px solid var(--wp-text-secondary);margin-right:8px;transform:rotate(-45deg);transition:transform 0.15s; }
.wp-detail-group[open] .wp-detail-group__title::before { transform:rotate(45deg); }
.wp-detail-group__body { padding:0 16px 16px; }

@media(max-width:900px){ .editor-sidebar{display:none;} .editor-styles{padding:0 20px;} }
</style>
