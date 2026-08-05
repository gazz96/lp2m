<template>
  <div class="wrap">
    <h1>Pendaftaran Hibah</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:10px">Data pendaftaran yang masuk dari form publik LP2M.</p>

    <ul class="subsubsub">
      <li><a :class="{current:statusFilter==='all'}" @click.prevent="statusFilter='all'" href="#">Semua <span class="count">({{ total }})</span></a></li>
      <li><a :class="{current:statusFilter==='submitted'}" @click.prevent="statusFilter='submitted'" href="#">Submitted <span class="count">({{ byStatus.submitted||0 }})</span></a></li>
      <li><a :class="{current:statusFilter==='reviewed'}" @click.prevent="statusFilter='reviewed'" href="#">Reviewed <span class="count">({{ byStatus.reviewed||0 }})</span></a></li>
      <li><a :class="{current:statusFilter==='approved'}" @click.prevent="statusFilter='approved'" href="#">Approved <span class="count">({{ byStatus.approved||0 }})</span></a></li>
      <li><a :class="{current:statusFilter==='rejected'}" @click.prevent="statusFilter='rejected'" href="#">Rejected <span class="count">({{ byStatus.rejected||0 }})</span></a></li>
    </ul>

    <p class="search-box">
      <input type="search" class="components-text-control__input" v-model="search" placeholder="Cari nama atau judul..." style="width:280px" />
    </p>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
    <div v-else-if="error" class="notice notice-error inline"><p>{{ error }}</p></div>

    <WpTable v-else
      :columns="columns"
      :rows="filtered"
      emptyTitle="Belum ada pendaftaran."
      emptySub="Data akan muncul setelah ada yang mendaftar via form publik."
      :showFooter="false"
    />

    <div v-if="total>perPg" class="tablenav bottom">
      <div class="displaying-num">{{ total }} item</div>
      <div class="tablenav-pages"><span class="pagination-links">
        <a v-if="pg>1" @click.prevent="fetchData(pg-1)" href="#" class="prev-page">‹</a>
        <a v-if="pg>1" @click.prevent="fetchData(1)" href="#">1</a>
        <span class="current">{{ pg }}</span>
        <a v-if="pg*perPg<total" @click.prevent="fetchData(pg+1)" href="#" class="next-page">›</a>
      </span></div>
    </div>

    <!-- Detail modal -->
    <div v-if="detail" class="wp-modal-backdrop" @click.self="detail=null">
      <div class="wp-modal">
        <div class="wp-modal-header">
          <h2>Detail Pendaftaran</h2>
          <WpButton variant="tertiary" class="is-small" @click="detail=null">✕</WpButton>
        </div>
        <div class="wp-modal-body">
          <table class="form-table" style="width:100%">
            <tr><th>Reg No</th><td><code>{{ detail.reg_no }}</code></td></tr>
            <tr><th>Nama</th><td>{{ detail.nama }}</td></tr>
            <tr><th>NIP/NIDN</th><td>{{ detail.nip }}</td></tr>
            <tr><th>Jenis</th><td>{{ detail.jenis }}</td></tr>
            <tr><th>Prodi</th><td>{{ detail.prodi }}</td></tr>
            <tr><th>Skema</th><td>{{ detail.skema }}</td></tr>
            <tr><th>Judul</th><td>{{ detail.judul }}</td></tr>
            <tr><th>Ringkasan</th><td>{{ detail.ringkasan }}</td></tr>
            <tr><th>Jml Tim</th><td>{{ detail.jml_tim || '—' }}</td></tr>
            <tr><th>Anggota</th><td>{{ detail.anggota || '—' }}</td></tr>
            <tr><th>Email</th><td>{{ detail.email }}</td></tr>
            <tr><th>HP</th><td>{{ detail.hp }}</td></tr>
            <tr><th>Tanggal</th><td>{{ fmtDate(detail.created_at) }}</td></tr>
            <tr><th>Status</th>
              <td>
                <select class="components-select-control__input" v-model="detailStatus" @change="updateStatus" style="width:160px">
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <span v-if="statusMsg" style="margin-left:8px;font-size:12px">{{ statusMsg }}</span>
              </td>
            </tr>
          </table>
        </div>
        <div class="wp-modal-footer">
          <WpButton variant="tertiary" @click="detail=null">Tutup</WpButton>
        </div>
      </div>
    </div>
    <!-- Export section -->
    <div style="border-top:1px solid var(--wp-border);margin-top:16px;padding-top:16px">
      <div style="display:flex;align-items:flex-end;flex-wrap:wrap;gap:12px">
        <div>
          <label style="font-size:11px;color:var(--wp-text-secondary);display:block;margin-bottom:4px">Dari Tanggal</label>
          <input type="date" class="components-text-control__input" v-model="exp.dari" />
        </div>
        <div>
          <label style="font-size:11px;color:var(--wp-text-secondary);display:block;margin-bottom:4px">Sampai Tanggal</label>
          <input type="date" class="components-text-control__input" v-model="exp.sampai" />
        </div>
        <div>
          <label style="font-size:11px;color:var(--wp-text-secondary);display:block;margin-bottom:4px">Filter Status</label>
          <select class="components-select-control__input" v-model="exp.status">
            <option value="">Semua Status</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div style="margin-left:auto">
          <WpButton variant="primary" :disabled="exporting" @click="doExport">
            {{ exporting ? 'Mempersiapkan...' : '⬇ Export ke Excel' }}
          </WpButton>
          <div v-if="expMsg" style="font-size:12px;color:var(--green-700);margin-top:6px;text-align:right">{{ expMsg }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as XLSX from 'xlsx'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpTable from '@/components/WpTable.vue'
import WpButton from '@/components/WpButton.vue'
import type { WpColumn } from '@/components/WpTable.vue'

const auth=useAuthStore()
interface Submission { id:number;reg_no:string;nama:string;nip:string;jenis:string;prodi:string;skema:string;judul:string;ringkasan:string;jml_tim:string;anggota:string;email:string;hp:string;hibah_id:number;created_at:string;status?:string }
const items=ref<Submission[]>([]),loading=ref(true),error=ref(''),total=ref(0),pg=ref(1),perPg=20
const search=ref(''),statusFilter=ref('all')
const detail=ref<Submission|null>(null),detailStatus=ref('submitted'),statusMsg=ref('')

function fmtDate(d:string){return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}

const columns:WpColumn[]=[
  {key:'reg_no',label:'Reg No',accessor:(r:any)=>r.reg_no},
  {key:'nama',label:'Nama',primary:true,rowActions:(r:any)=>[{label:'Detail',className:'edit',onClick:()=>showDetail(r)}]},
  {key:'jenis',label:'Jenis'},
  {key:'skema',label:'Skema'},
  {key:'_status',label:'Status',type:'badge',accessor:(r:any)=>r.status==='approved'?'Approved':r.status==='rejected'?'Rejected':r.status==='reviewed'?'Reviewed':'Submitted'},
  {key:'_date',label:'Tanggal',type:'date',accessor:(r:any)=>fmtDate(r.created_at)},
]

const filtered=computed(()=>{let a=[...items.value];if(statusFilter.value!=='all')a=a.filter(r=>(r.status||'submitted')===statusFilter.value);if(search.value.trim()){const q=search.value.toLowerCase();a=a.filter(r=>clean(r.nama).toLowerCase().includes(q)||clean(r.judul).toLowerCase().includes(q))};return a})

const byStatus=computed(()=>{const m:Record<string,number>={submitted:0,reviewed:0,approved:0,rejected:0};items.value.forEach(r=>{const s=r.status||'submitted';if(s in m)m[s]++});return m})

async function fetchData(p=1){loading.value=true;error.value=''
  try{const base=SITE.apiBase.replace('/wp/v2','');const r=await fetch(`${base}/lp2m/v1/hibah?per_page=${perPg}&page=${p}`);if(!r.ok)throw new Error('HTTP '+r.status);const json=await r.json()
  if(json.success){items.value=(json.data||[]).map((d:any)=>({...d,status:d.status||'submitted'}));total.value=json.total;pg.value=p}else{error.value=json.message||'Gagal'}}catch(e:any){error.value=e.message}finally{loading.value=false}}

async function showDetail(item:Submission){detail.value=item;detailStatus.value=item.status||'submitted';statusMsg.value=''
  try{const base=SITE.apiBase.replace('/wp/v2','');const r=await fetch(`${base}/lp2m/v1/hibah/${item.id}`);const json=await r.json();if(json.success)detail.value=json.data}catch{}}

 async function updateStatus(){if(!detail.value)return;statusMsg.value='Menyimpan...'
  try{const base=SITE.apiBase.replace('/wp/v2','');const r=await fetch(`${base}/lp2m/v1/hibah/${detail.value.id}`,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({status:detailStatus.value})});const json=await r.json()
  if(json.success){const idx=items.value.findIndex(i=>i.id===detail.value?.id);if(idx!==-1)items.value[idx].status=detailStatus.value;statusMsg.value='✓ Tersimpan';setTimeout(()=>statusMsg.value='',2000)}else{statusMsg.value='Gagal: '+json.message}}catch(e:any){statusMsg.value=e.message}}

// ── Export ──────────────────────────────
const exporting=ref(false), expMsg=ref('')
const exp=ref({ dari: new Date().toISOString().slice(0,7)+'-01', sampai: new Date().toISOString().slice(0,10), status:'' })

async function doExport(){
  if(!exp.value.dari||!exp.value.sampai){expMsg.value='Pilih rentang tanggal dulu.';return}
  exporting.value=true;expMsg.value=''
  try{
    const base=SITE.apiBase.replace('/wp/v2','')
    const url=new URL(`${base}/lp2m/v1/pendaftaran/export`)
    url.searchParams.set('dari',exp.value.dari)
    url.searchParams.set('sampai',exp.value.sampai)
    if(exp.value.status)url.searchParams.set('status',exp.value.status)
    const r=await fetch(url.toString())
    if(!r.ok)throw new Error((await r.json().catch(()=>({}))).message||'HTTP '+r.status)
    const data=await r.json()
    if(!data.length){expMsg.value='Tidak ada data untuk rentang ini.';return}
    const titlePart=exp.value.status?'_'+exp.value.status:''
    const ws=XLSX.utils.json_to_sheet(data.map((d:Record<string,unknown>)=>({
      'No':(d.reg_no as string)||'','Nama':(d.nama as string)||'','NIP/NIDN':(d.nip as string)||'',
      'Jenis':(d.jenis as string)||'','Prodi':(d.prodi as string)||'','Skema':(d.skema as string)||'',
      'Judul':(d.judul as string)||'','Ringkasan':(d.ringkasan as string)||'',
      'Jml Tim':(d.jml_tim as string)||'','Anggota':(d.anggota as string)||'',
      'Email':(d.email as string)||'','WhatsApp':(d.hp as string)||'',
      'Status':(d.status as string)||'','Tanggal':(d.tanggal as string)||''
    })),{header:['No','Nama','NIP/NIDN','Jenis','Prodi','Skema','Judul','Ringkasan','Jml Tim','Anggota','Email','WhatsApp','Status','Tanggal']})
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Pendaftaran Hibah LP2M')
    const fname='LP2M-Pendaftaran-Hibah_'+exp.value.dari.split('-').join('')+'_'+exp.value.sampai.split('-').join('')
    XLSX.writeFile(wb,(titlePart||'')+'.xlsx',{bookType:'xlsx'})
    expMsg.value=`✓ ${data.length} data didownload`
  }catch(e:any){expMsg.value=e.message||'Export gagal'}
  finally{exporting.value=false}
}

onMounted(()=>fetchData())
</script>
