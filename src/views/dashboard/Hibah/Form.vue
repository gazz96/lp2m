<template>
  <div>
    <div class="wp-header"><h1>{{ editId ? 'Edit Hibah' : 'Tambah Hibah' }}</h1>
      <div class="hdr-acts"><button v-if="editId" class="btn btn-outline btn-sm" @click="previewDraft">Preview</button>
      <router-link to="/dashboard/hibah" class="btn btn-outline btn-sm">← Kembali</router-link></div>
    </div>
    <div class="wp-layout">
      <div class="wp-main">
        <div class="field full"><label>Judul</label><input type="text" v-model="f.title" placeholder="Tulis judul..." class="title-inp" /></div>
        <div class="field full" style="margin-top:16px"><label>Konten</label><HtmlEditor v-model="f.content" /></div>
        <div class="field full" style="margin-top:16px"><label>Info Tambahan</label><textarea v-model="f.info_tambahan" rows="3" placeholder="Satu per baris..."></textarea></div>
        <div class="field full" style="margin-top:16px"><label>Timeline</label>
          <div class="repeater"><div v-for="(t,i) in f.timeline_items" :key="i" class="r-row">
            <input type="text" v-model="t.date" placeholder="01 Agu 2026" style="width:110px" /><input type="text" v-model="t.label" placeholder="Deskripsi..." style="flex:1" />
            <button type="button" class="r-x" @click="f.timeline_items.splice(i,1)">✕</button></div>
            <button type="button" class="btn btn-sm btn-outline" @click="f.timeline_items.push({date:'',label:''})">+ Tambah</button></div>
        </div>
      </div>
      <div class="wp-side">
        <div class="mb"><div class="mb-t">Terbitkan</div><div class="mb-b">
          <div class="field"><label>Status</label><select v-model="f.status"><option value="draft">Draft</option><option value="publish">Publish</option></select></div>
          <div class="field" style="margin-top:10px"><label>Jenis</label><select v-model="f.jenis_hibah"><option value="internal">Internal</option><option value="eksternal">Eksternal</option></select></div>
          <div style="margin-top:12px"><button class="btn btn-primary" style="width:100%" :disabled="saving" @click="save">{{ saving?'Menyimpan...':editId?'Perbarui':'Terbitkan' }}</button></div>
          <div v-if="editId" style="text-align:center;font-size:.72rem;color:var(--ink-soft);margin-top:6px">ID: {{ editId }}</div>
          <div v-if="err" class="err">{{ err }}</div>
        </div></div>
        <div class="mb"><div class="mb-t">Kategori Hibah</div><div class="mb-b">
          <TagSelect :terms="kTerms" :selected="selKats" placeholder="Cari atau buat kategori..."
            @add="(t:any)=>selKats.push(t.id)" @remove="(id:number)=>selKats=selKats.filter(x=>x!==id)"
            @create="addTerm('kategori_hibah',$event,kTerms,selKats)" />
        </div></div>
        <div class="mb"><div class="mb-t">Skema Hibah</div><div class="mb-b">
          <TagSelect :terms="sTerms" :selected="selSkms" placeholder="Cari atau buat skema..."
            @add="(t:any)=>selSkms.push(t.id)" @remove="(id:number)=>selSkms=selSkms.filter(x=>x!==id)"
            @create="addTerm('skema_hibah',$event,sTerms,selSkms)" />
        </div></div>
        <div class="mb"><div class="mb-t">Deadline & Dana</div><div class="mb-b">
          <div class="field"><label>Deadline</label><input type="date" v-model="f.deadline" /></div>
          <div class="field" style="margin-top:10px"><label>Dana Maks (Rp)</label><input type="number" v-model.number="f.dana_maks_num" placeholder="35000000" /></div></div></div>
        <div class="mb"><div class="mb-t">Thumbnail</div><div class="mb-b"><ThumbnailPicker v-model:media-id="f.featured_media" v-model:preview-url="thumb" /></div></div>
        <div class="mb"><div class="mb-t">Lainnya</div><div class="mb-b">
          <div class="field"><label>Eyebrow</label><input type="text" v-model="f.event_eyebrow" placeholder="Event Aktif..." /></div>
          <div class="field" style="margin-top:10px"><label>Link Panduan</label><input type="url" v-model="f.link_panduan" placeholder="https://..." /></div></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import HtmlEditor from '@/components/HtmlEditor.vue'
import ThumbnailPicker from '@/components/ThumbnailPicker.vue'
import TagSelect from '@/components/TagSelect.vue'
import { useToast } from '@/composables/useToast'
const route=useRoute(),router=useRouter(),auth=useAuthStore()
const toast=useToast()
const editId=ref<number|null>(null),saving=ref(false),err=ref(''),thumb=ref('')
const kTerms=ref<{id:number;name:string}[]>([]),sTerms=ref<{id:number;name:string}[]>([])
const selKats=ref<number[]>([]),selSkms=ref<number[]>([])
interface TL{date:string;label:string}
const f=reactive({title:'',content:'',status:'draft',jenis_hibah:'internal',deadline:'',dana_maks_num:0,event_eyebrow:'',info_tambahan:'',link_panduan:'',timeline_items:[] as TL[],featured_media:null as number|null})
function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}
async function loadTerms(){
  try{const[k,s]=await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`),window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100`)])
  if(k.ok)kTerms.value=await k.json();if(s.ok)sTerms.value=await s.json()}catch{}}
async function loadItem(id:number){
  try{const r=await window.fetch(`${SITE.apiBase}/hibah/${id}?_embed`);if(!r.ok)return;const p=await r.json()
  editId.value=p.id;f.title=clean(p.title?.rendered||'');f.content=p.content?.rendered||'';f.status=p.status||'draft'
  f.jenis_hibah=p.jenis_hibah||'internal';f.deadline=p.deadline?p.deadline.slice(0,10):'';f.dana_maks_num=parseInt(p.dana_maks)||0
  f.event_eyebrow=p.event_eyebrow||'';f.info_tambahan=p.info_tambahan||'';f.link_panduan=p.link_panduan||''
  f.timeline_items=p.timeline_items||[];f.featured_media=p.featured_media||null
  selKats.value=p.kategori_hibah||[];selSkms.value=p.skema_hibah||[]
  thumb.value=p._embedded?.['wp:featuredmedia']?.[0]?.source_url||''}catch{}}
async function addTerm(tax:string,name:string,arr:{id:number;name:string}[],sel:number[]){
  err.value='';const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-')
  try{const r=await window.fetch(`${SITE.apiBase}/${tax}`,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({name,slug})})
  if(!r.ok)throw new Error((await r.json().catch(()=>({}))).message||'Gagal')
  const c=await r.json();arr.push({id:c.id,name:c.name});sel.push(c.id)}catch(e:any){err.value='Gagal: '+e.message}}
function previewDraft(){if(editId.value)window.open(`https://itsi.ac.id/?p=${editId.value}&preview=true`,'_blank')}
async function save(){
  if(!f.title.trim()){err.value='Judul wajib diisi.';return};saving.value=true;err.value=''
  const p:any={title:f.title,content:f.content,status:f.status,jenis_hibah:f.jenis_hibah,deadline:f.deadline?f.deadline+'T23:59:59':'',deadline_label:f.deadline?new Date(f.deadline).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):'',dana_maks:f.dana_maks_num?String(f.dana_maks_num):'',event_eyebrow:f.event_eyebrow,info_tambahan:f.info_tambahan,link_panduan:f.link_panduan,kategori_hibah:selKats.value,skema_hibah:selSkms.value,timeline_items:f.timeline_items}
  if(f.featured_media)p.featured_media=f.featured_media
  try{const url=editId.value?`${SITE.apiBase}/hibah/${editId.value}`:`${SITE.apiBase}/hibah`
    const r=await window.fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify(p)})
    if(!r.ok){const e=await r.json().catch(()=>({}));err.value=e.message||`HTTP ${r.status}`;toast.error(e.message||'Gagal menyimpan');saving.value=false;return}
    const c=await r.json();if(!editId.value){editId.value=c.id;router.replace('/dashboard/hibah/'+c.id)};saving.value=false;err.value='';toast.success(editId.value?'Hibah berhasil diperbarui!':'Hibah berhasil dibuat!')}catch(e:any){err.value=e.message;saving.value=false}}
onMounted(()=>{loadTerms();const id=route.params.id as string;if(id)loadItem(parseInt(id))})
</script>
<style scoped>
.wp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.wp-header h1{font-size:1.3rem;margin:0}.hdr-acts{display:flex;gap:8px}
.wp-layout{display:flex;gap:20px;align-items:flex-start}.wp-main{flex:1;min-width:0}.wp-side{width:300px;flex-shrink:0;display:flex;flex-direction:column;gap:12px}
.mb{background:var(--card);border:1px solid var(--line);border-radius:4px}.mb-t{padding:10px 14px;border-bottom:1px solid var(--line);font-size:.82rem;font-weight:600;background:var(--paper-2)}.mb-b{padding:14px}
.field{display:flex;flex-direction:column;gap:4px}.field label{font-size:.76rem;font-weight:600;color:var(--green-800)}
.field input,.field select,.field textarea{border:1px solid var(--line);background:#fff;border-radius:4px;padding:8px 10px;font-family:inherit;font-size:.84rem;color:var(--ink);outline:none}
.title-inp{font-size:1rem!important;padding:10px 12px!important}
.repeater{display:flex;flex-direction:column;gap:6px}.r-row{display:flex;gap:6px;align-items:center}.r-row input{border:1px solid var(--line);border-radius:4px;padding:6px 8px;font-size:.8rem;font-family:inherit;outline:none}
.r-x{width:24px;height:24px;border:1px solid var(--rust);background:#fff;color:var(--rust);border-radius:4px;cursor:pointer;font-size:.7rem;display:flex;align-items:center;justify-content:center}
.err{color:var(--rust);font-size:.78rem;margin-top:8px}.btn-sm{padding:5px 12px;font-size:.76rem}
@media(max-width:800px){.wp-layout{flex-direction:column}.wp-side{width:100%}}
</style>
