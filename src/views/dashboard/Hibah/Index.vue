<template>
  <div>
    <div class="wp-header"><h1>Hibah</h1><router-link to="/dashboard/hibah/tambah" class="btn btn-primary">Tambah Hibah</router-link></div>
    <div class="wp-toolbar">
      <input type="text" v-model="search" placeholder="Cari hibah..." class="srch" />
      <select v-model="statusFilter" class="flt"><option value="any">Semua</option><option value="publish">Publish</option><option value="draft">Draft</option></select>
    </div>
    <div v-if="loading" class="load">Memuat...</div>
    <div v-else class="wp-table-wrap">
      <table class="wp-table">
        <thead><tr><th class="sortable" @click="tsort('title')">Judul {{ sl('title') }}</th><th>Kategori</th><th>Skema</th><th class="sortable" @click="tsort('date')">Tanggal {{ sl('date') }}</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="row in filtered" :key="row.id" :class="{draft:row.status==='draft'}">
            <td><strong><a :href="'https://itsi.ac.id/?p='+row.id+'&preview=true'" target="_blank" class="row-link">{{ row._title||'(tanpa judul)' }}</a></strong>
              <div class="row-acts"><router-link :to="'/dashboard/hibah/'+row.id">Edit</router-link> | <router-link to="/dashboard/hibah">Lihat</router-link></div></td>
            <td><span class="tag-sm" v-for="c in row._cats" :key="c">{{ c }}</span></td>
            <td><span class="tag-sm" v-for="s in row._skms" :key="s">{{ s }}</span></td>
            <td class="date-cell">{{ row._date }}</td>
            <td><span class="badge" :class="row.status">{{ row.status==='publish'?'Terbit':'Draft' }}</span></td>
          </tr>
          <tr v-if="!filtered.length&&!loading"><td colspan="5" class="empty">Belum ada hibah.</td></tr>
        </tbody>
      </table>
      <div class="tablenav"><div class="tp">{{(page-1)*perPage+1}}–{{Math.min(page*perPage,total)}} dari {{total}}
        <button :disabled="page<=1" @click="load(page-1)" class="btn btn-sm">‹</button>
        <button :disabled="page*perPage>=total" @click="load(page+1)" class="btn btn-sm">›</button></div></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SITE } from '@/data'
type Row={id:number;slug:string;status:string;date:string;title:{rendered:string};categories:number[];skema_hibah:number[];_title:string;_date:string;_cats:string[];_skms:string[]}
const items=ref<Row[]>([]),loading=ref(true),total=ref(0),page=ref(1),perPage=20,search=ref(''),statusFilter=ref('any'),sk=ref<'title'|'date'>('date'),sd=ref<'asc'|'desc'>('desc')
const kTerms=ref<{id:number;name:string}[]>([]),sTerms=ref<{id:number;name:string}[]>([])
function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}
function fmt(d:string){return d?new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'-'}
function tsort(k:'title'|'date'){if(sk.value===k)sd.value=sd.value==='asc'?'desc':'asc';else{sk.value=k;sd.value='desc'}}
function sl(k:string){return sk.value===k?(sd.value==='asc'?'↑':'↓'):''}
const filtered=computed(()=>{let a=[...items.value];if(statusFilter.value!=='any')a=a.filter(r=>r.status===statusFilter.value);if(search.value.trim()){const q=search.value.toLowerCase();a=a.filter(r=>r._title.toLowerCase().includes(q))}a.sort((x,y)=>{const vx=sk.value==='title'?x._title:x.date;const vy=sk.value==='title'?y._title:y.date;return sd.value==='desc'?vy.localeCompare(vx):vx.localeCompare(vy)});return a})
async function loadTerms(){try{const[k,s]=await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`),window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100`)]);if(k.ok)kTerms.value=await k.json();if(s.ok)sTerms.value=await s.json()}catch{}}
async function load(p=1){loading.value=true;try{const r=await window.fetch(`${SITE.apiBase}/hibah?per_page=${perPage}&page=${p}&orderby=date&order=desc&_fields=id,slug,status,date,title,categories,skema_hibah`);if(!r.ok)throw new Error(`HTTP ${r.status}`);const raw=await r.json();items.value=raw.map((p:any)=>({...p,_title:clean(p.title?.rendered||''),_date:fmt(p.date),_cats:(p.categories||[]).map((id:number)=>kTerms.value.find(t=>t.id===id)?.name||'').filter(Boolean),_skms:(p.skema_hibah||[]).map((id:number)=>sTerms.value.find(t=>t.id===id)?.name||'').filter(Boolean)}));total.value=parseInt(r.headers.get('X-WP-Total')||'0');page.value=p}catch(e:any){}finally{loading.value=false}}
onMounted(()=>{loadTerms();load()})
</script>
<style scoped>
.wp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.wp-header h1{font-size:1.3rem;margin:0}
.wp-toolbar{display:flex;gap:8px;margin-bottom:12px}.srch{border:1px solid var(--line);border-radius:4px;padding:6px 10px;font-size:.84rem;font-family:inherit;width:220px;outline:none}.flt{border:1px solid var(--line);border-radius:4px;padding:6px 8px;font-size:.8rem}
.wp-table-wrap{background:var(--card);border:1px solid var(--line);border-radius:4px;overflow:hidden}
.wp-table{width:100%;border-collapse:collapse;font-size:.86rem}.wp-table th{text-align:left;padding:10px;border-bottom:1px solid var(--line);background:var(--paper-2);color:var(--ink-soft);font-weight:600;font-size:.78rem}.wp-table td{padding:10px;border-bottom:1px solid var(--line)}.wp-table tr.draft td{background:#fff9e6}.wp-table tr:hover td{background:var(--paper-2)}
.sortable{cursor:pointer;user-select:none}.sortable:hover{color:var(--green-600)}
.row-link{color:var(--green-800);text-decoration:none;font-weight:600}.row-link:hover{text-decoration:underline}
.row-acts{font-size:.72rem;color:var(--ink-soft);margin-top:4px}.row-acts a{color:var(--green-700);text-decoration:none}
.tag-sm{display:inline-block;padding:2px 8px;margin:2px;background:var(--paper-2);border-radius:10px;font-size:.72rem;color:var(--ink-soft)}
.date-cell{font-size:.82rem;color:var(--ink-soft);white-space:nowrap}
.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:.72rem;font-weight:600;text-transform:uppercase}.badge.publish{background:#e8f5e9;color:#2e7d32}.badge.draft{background:var(--paper-2);color:var(--ink-soft)}
.empty{text-align:center;padding:40px;color:var(--ink-soft)}.load{padding:24px 0;color:var(--ink-soft)}
.tablenav{display:flex;justify-content:flex-end;padding:10px 12px;border-top:1px solid var(--line);background:var(--paper-2)}.tp{font-size:.8rem;color:var(--ink-soft);display:flex;gap:8px;align-items:center}
.btn-sm{padding:5px 12px;font-size:.76rem}
</style>
