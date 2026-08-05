<template>
  <div class="wrap">
    <h1>Artikel <WpButton variant="primary" to="/dashboard/artikel/tambah">Tambah Artikel</WpButton></h1>

    <ul class="subsubsub">
      <li><a :class="{current:statusFilter==='any'}" @click.prevent="statusFilter='any'" href="#">Semua <span class="count">({{ total }})</span></a></li>
      <li><a :class="{current:statusFilter==='publish'}" @click.prevent="statusFilter='publish'" href="#">Publish</a></li>
      <li><a :class="{current:statusFilter==='draft'}" @click.prevent="statusFilter='draft'" href="#">Draft</a></li>
    </ul>

    <p class="search-box">
      <input type="search" class="components-text-control__input" v-model="search" placeholder="Cari artikel..." style="width:280px" />
    </p>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
    <div v-else-if="error" class="notice notice-error inline"><p>{{ error }}</p></div>

    <WpTable v-else
      :columns="columns"
      :rows="filtered"
      emptyTitle="Belum ada artikel."
      emptySub="Klik Tambah Artikel untuk membuat."
      :showFooter="false"
    />

    <div v-if="total>perPg" class="tablenav bottom">
      <div class="displaying-num">{{ total }} item</div>
      <div class="tablenav-pages"><span class="pagination-links">
        <a v-if="pg>1" @click.prevent="fetchPosts(pg-1)" href="#" class="prev-page">‹</a>
        <span v-if="pg>1" @click.prevent="fetchPosts(1)" href="#"><a>1</a></span>
        <span class="current">{{ pg }}</span>
        <a v-if="pg*perPg<total" @click.prevent="fetchPosts(pg+1)" href="#" class="next-page">›</a>
      </span></div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="wp-modal-backdrop" @click.self="closeModal">
      <div class="wp-modal">
        <div class="wp-modal-header">
          <h2>{{ editingId ? 'Edit Artikel' : 'Artikel Baru' }}</h2>
          <WpButton variant="tertiary" class="is-small" @click="closeModal">✕</WpButton>
        </div>
        <div class="wp-modal-body">
          <div class="components-base-control">
            <label class="components-base-control__label">Judul *</label>
            <input class="components-text-control__input" type="text" v-model="form.title" placeholder="Judul artikel..." />
          </div>
          <div class="components-base-control">
            <label class="components-base-control__label">Konten</label>
            <WpEditor v-model="form.content" placeholder="Tulis konten artikel..." />
          </div>
          <div style="display:flex;gap:16px">
            <div class="components-base-control" style="flex:1">
              <label class="components-base-control__label">Status</label>
              <select class="components-select-control__input" v-model="form.status"><option value="draft">Draft</option><option value="publish">Publish</option></select>
            </div>
            <div class="components-base-control" style="flex:1">
              <label class="components-base-control__label">Thumbnail</label>
              <ThumbnailPicker v-model:media-id="form.featured_media" v-model:preview-url="thumbPreview" />
            </div>
          </div>
          <div v-if="modalError" class="components-notice is-error" style="margin-top:12px"><div class="components-notice__content">{{ modalError }}</div></div>
        </div>
        <div class="wp-modal-footer">
          <WpButton variant="tertiary" @click="closeModal">Batal</WpButton>
          <WpButton variant="primary" :disabled="saving" @click="save">{{ saving?'Menyimpan...':(editingId?'Perbarui':'Buat') }}</WpButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpTable from '@/components/WpTable.vue'
import WpButton from '@/components/WpButton.vue'
import WpEditor from '@/components/WpEditor.vue'
import ThumbnailPicker from '@/components/ThumbnailPicker.vue'
import type { WpColumn } from '@/components/WpTable.vue'

const auth=useAuthStore()
type ExtendedPost={id:number;title:{rendered:string};status:string;date:string;author:number;featured_media:number;content?:{rendered:string};slug:string;_embedded?:{author?:{name:string}[];'wp:featuredmedia'?:{source_url:string}[]}}
const posts=ref<ExtendedPost[]>([]),loading=ref(true),error=ref(''),total=ref(0),pg=ref(1),perPg=20
const search=ref(''),statusFilter=ref('any')
const showModal=ref(false),editingId=ref<number|null>(null),saving=ref(false),modalError=ref(''),thumbPreview=ref('')
const form=reactive({title:'',content:'',status:'publish',featured_media:null as number|null})

function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}
function fmt(d:string){return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}
function isOwner(p:ExtendedPost){return auth.user?.id===p.author}

const columns=ref<WpColumn[]>([
  {key:'_title',label:'Judul',primary:true,accessor:(r)=>clean(r.title?.rendered||''),
    rowActions:(r)=>isOwner(r as any)?[
      {label:'Edit',className:'edit',to:'/dashboard/artikel/'+r.id},
      {label:'Lihat',className:'view',to:'/artikel/'+r.slug},
      {label:'Hapus',className:'trash',onClick:()=>confirmDelete(r as any)}
    ]:[]
  },
  {key:'_author',label:'Penulis',accessor:(r:any)=>r._embedded?.author?.[0]?.name||'—'},
  {key:'_date',label:'Tanggal',sortable:true,type:'date',accessor:(r:any)=>fmt(r.date)},
  {key:'status',label:'Status',type:'badge',accessor:(r)=>r.status==='publish'?'Publish':'Draft'},
])

const filtered=computed(()=>{let a=[...posts.value];if(statusFilter.value!=='any')a=a.filter((r:ExtendedPost)=>r.status===statusFilter.value);if(search.value.trim()){const q=search.value.toLowerCase();a=a.filter((r:ExtendedPost)=>clean(r.title?.rendered||'').toLowerCase().includes(q))};return a})

function onSort(){}

async function fetchPosts(p=1){loading.value=true;error.value=''
  try{const r=await fetch(`${SITE.apiBase}/posts?per_page=${perPg}&page=${p}&orderby=date&order=desc&_embed=author`);if(!r.ok)throw new Error('HTTP '+r.status);posts.value=await r.json();total.value=parseInt(r.headers.get('X-WP-Total')||'0');pg.value=p}catch(e:any){error.value=e.message}finally{loading.value=false}}
function openCreate(){form.title='';form.content='';form.status='publish';form.featured_media=null;editingId.value=null;modalError.value='';thumbPreview.value='';showModal.value=true}
function openEdit(p:ExtendedPost){if(!isOwner(p))return;editingId.value=p.id;form.title=clean(p.title.rendered);form.content=p.content?.rendered||'';form.status=p.status||'publish';form.featured_media=p.featured_media||null;thumbPreview.value=p._embedded?.['wp:featuredmedia']?.[0]?.source_url||'';modalError.value='';showModal.value=true}
function closeModal(){showModal.value=false}
async function save(){if(!form.title.trim()){modalError.value='Judul wajib diisi.';return};saving.value=true;modalError.value=''
  try{const url=editingId.value?`${SITE.apiBase}/posts/${editingId.value}`:`${SITE.apiBase}/posts`;const payload:any={title:form.title,content:form.content,status:form.status};if(form.featured_media)payload.featured_media=form.featured_media;const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify(payload)});if(!r.ok){const e=await r.json().catch(()=>({}));modalError.value=e.message||'HTTP '+r.status;saving.value=false;return};saving.value=false;closeModal();fetchPosts(pg.value)}catch(e:any){modalError.value=e.message;saving.value=false}}
async function confirmDelete(p:ExtendedPost){if(!isOwner(p))return;if(!confirm('Hapus "'+clean(p.title.rendered)+'"?'))return;try{const r=await fetch(`${SITE.apiBase}/posts/${p.id}?force=true`,{method:'DELETE',headers:{...auth.authHeaders()}});if(!r.ok)alert('Gagal.');else fetchPosts(pg.value)}catch{alert('Gagal.')}}
onMounted(()=>fetchPosts())
</script>
