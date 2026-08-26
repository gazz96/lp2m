<template>
  <div class="wrap">
    <h1>Pendaftaran Hibah</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:10px">Data pendaftaran yang masuk dari form publik LP2M.</p>

    <ul class="subsubsub">
      <li><a :class="{current:statusFilter==='all'}" @click.prevent="statusFilter='all'" href="#">Semua <span class="count">({{ total }})</span></a></li>
      <li><a :class="{current:statusFilter==='submitted'}" @click.prevent="statusFilter='submitted'" href="#">Submitted <span class="count">({{ byStatus.submitted||0 }})</span></a></li>
      <li><a :class="{current:statusFilter==='under_review'}" @click.prevent="statusFilter='under_review'" href="#">Under Review <span class="count">({{ byStatus.under_review||0 }})</span></a></li>
      <li><a :class="{current:statusFilter==='approved'}" @click.prevent="statusFilter='approved'" href="#">Approved <span class="count">({{ byStatus.approved||0 }})</span></a></li>
      <li><a :class="{current:statusFilter==='rejected'}" @click.prevent="statusFilter='rejected'" href="#">Rejected <span class="count">({{ byStatus.rejected||0 }})</span></a></li>
    </ul>

    <!-- Export section — di atas tabel -->
    <div style="border:1px solid var(--wp-border);border-radius:8px;padding:14px 16px;margin-bottom:16px;background:#fff">
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
            <option value="under_review">Under Review</option>
            <option value="revised">Revised</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="done">Done</option>
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

    <p class="search-box">
      <input type="search" class="components-text-control__input" v-model="search" placeholder="Cari nama, judul, atau nomor registrasi..." style="width:320px" />
    </p>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
    <div v-else-if="error" class="notice notice-error inline"><p>{{ error }}</p></div>

    <WpTable v-else
      :columns="columns"
      :rows="filtered"
      emptyTitle="Belum ada pendaftaran."
      emptySub="Data akan muncul setelah ada yang mendaftar via form publik."
      :showFooter="false"
    >
      <template #cell-_status="{ row }">
        <button type="button" @click="openStatusModal(row as Submission)"
          :disabled="!!rowBusy[row.id]"
          :style="`display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;color:#fff;background:${STATUS_COLOR[row.status||'submitted']||'#64748b'};border:0;cursor:pointer;opacity:${rowBusy[row.id]==='status'?'0.7':1}`"
          :title="'Klik untuk ubah status — ' + (STATUS_LABEL[row.status||'submitted']||row.status)">
          <span v-if="rowBusy[row.id]==='status'" style="width:10px;height:10px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;display:inline-block;animation:lp2mSpin .6s linear infinite"></span>
          {{ STATUS_LABEL[row.status||'submitted']||row.status }}
        </button>
        <span v-if="rowMsg[row.id] && rowMsg[row.id]?.ok===false" style="display:block;font-size:10px;color:#dc2626;margin-top:4px">{{ rowMsg[row.id]?.text }}</span>
        <span v-else-if="rowMsg[row.id]" style="display:block;font-size:10px;color:#16a34a;margin-top:4px">{{ rowMsg[row.id]?.text }}</span>
      </template>
      <template #cell-aksi="{ row }">
        <div style="display:flex;flex-direction:column;gap:6px;min-width:180px">
          <label style="font-size:11px;font-weight:600;color:#475569">Kirim Email ke Pemohon</label>
          <input type="email" :value="rowEmail[row.id] ?? row.email" @input="(e:any)=> rowEmail[row.id]=(e.target as HTMLInputElement).value"
            :placeholder="row.email ? '' : 'Email belum ada — isi dulu'"
            style="width:100%;font-size:12px;padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px" />
          <button type="button" class="button button-primary"
            :disabled="!!rowBusy[row.id]"
            @click="sendEmail(row as Submission)"
            style="width:100%;justify-content:center;display:inline-flex;align-items:center;gap:6px;min-height:28px">
            <span v-if="rowBusy[row.id]==='email'" style="width:12px;height:12px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;display:inline-block;animation:lp2mSpin .6s linear infinite"></span>
            {{ rowBusy[row.id]==='email' ? 'Mengirim…' : '📧 Kirim Email' }}
          </button>
          <span v-if="rowMsg[row.id]" :style="{fontSize:'11px',color: rowMsg[row.id]?.ok ? '#16a34a' : '#dc2626'}">{{ rowMsg[row.id]?.text }}</span>
          <span style="font-size:10px;color:#94a3b8">Email di input tidak disimpan permanen; hanya untuk tujuan kirim.</span>
        </div>
      </template>
    </WpTable>

    <!-- Modal update status (dashboard) -->
    <div v-if="modalOpen" @click.self="closeStatusModal" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:100050">
      <div style="position:absolute;inset:0;background:rgba(15,23,42,.45)"></div>
      <div style="position:relative;background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.2);padding:20px;width:min(420px,92vw)">
        <h3 style="margin:0 0 6px;font-size:15px">Update Status</h3>
        <p style="margin:0 0 10px;color:#64748b;font-size:12px">Pendaftaran #{{ modalRow?.id }} — {{ modalRow?.reg_no || '' }} · {{ modalRow ? (STATUS_LABEL[modalRow.status||'submitted']||modalRow.status) : '' }}</p>
        <select v-model="modalSel" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px">
          <option v-for="o in STATUS_OPTS" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <div v-if="modalMsg" :style="{minHeight:'16px',marginTop:'8px',fontSize:'12px',color: modalMsg.ok ? '#16a34a' : '#dc2626'}">{{ modalMsg.text }}</div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
          <button type="button" class="button" @click="closeStatusModal" :disabled="modalBusy">Batal</button>
          <button type="button" class="button button-primary" @click="saveModalStatus" :disabled="modalBusy" style="min-width:96px;display:inline-flex;align-items:center;justify-content:center;gap:6px">
            <span v-if="modalBusy" style="width:12px;height:12px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;display:inline-block;animation:lp2mSpin .6s linear infinite"></span>
            {{ modalBusy ? 'Menyimpan…' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="total>perPg" class="tablenav bottom">
      <div class="displaying-num">{{ total }} item</div>
      <div class="tablenav-pages"><span class="pagination-links">
        <a v-if="pg>1" @click.prevent="fetchData(pg-1)" href="#" class="prev-page">‹</a>
        <a v-if="pg>1" @click.prevent="fetchData(1)" href="#">1</a>
        <span class="current">{{ pg }}</span>
        <a v-if="pg*perPg<total" @click.prevent="fetchData(pg+1)" href="#" class="next-page">›</a>
      </span></div>
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
interface Submission { id:number;reg_no:string;nama:string;nip:string;jenis:string;prodi:string;skema:string;jenis_hibah?:string;sdgs?:string;kelompok_keahlian?:string;judul:string;ringkasan:string;jml_tim?:string;anggota?:string;anggota_list?:{tipe:'dosen'|'mahasiswa';nomor:string;nama:string;prodi:string}[];email:string;hp:string;hibah_id:number;created_at:string;status?:string;proposal_id?:number|string;proposal_url?:string }
const items=ref<Submission[]>([]),loading=ref(true),error=ref(''),total=ref(0),pg=ref(1),perPg=20
const search=ref(''),statusFilter=ref('all')

const STATUS_LABEL: Record<string,string> = {
  submitted:'Submitted', under_review:'Under Review', revised:'Revised',
  approved:'Approved', rejected:'Rejected', done:'Done',
}

function fmtDate(d:string){return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}
function escHtml(s:string){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

const STATUS_COLOR: Record<string,string> = { submitted:'#64748b', under_review:'#d97706', revised:'#0284c7', approved:'#16a34a', rejected:'#dc2626', done:'#7c3aed' }
function statusPill(s:string){
  const label = STATUS_LABEL[s] || s
  const c = STATUS_COLOR[s] || '#64748b'
  return `<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;color:#fff;background:${c}">${escHtml(label)}</span>`
}

const STATUS_OPTS = [
  { value:'submitted', label:'Submitted' },
  { value:'under_review', label:'Under Review' },
  { value:'revised', label:'Revised' },
  { value:'approved', label:'Approved' },
  { value:'rejected', label:'Rejected' },
  { value:'done', label:'Done' },
] as const

const columns:WpColumn[]=[
  {key:'pengusul',label:'Pengusul',primary:true,type:'html',width:'20%',accessor:(r:any)=>{
    const reg = r.reg_no ? `<code style="font-size:11px;background:#f1f5f9;padding:1px 5px;border-radius:4px">${escHtml(r.reg_no)}</code><br>` : ''
    const nama = escHtml(clean(r.nama)||'—')
    const nip = r.nip ? escHtml(r.nip) : ''
    const prodi = r.prodi ? escHtml(clean(r.prodi)) : ''
    const jenis = r.jenis ? escHtml(r.jenis) : ''
    const meta = [nip, prodi, jenis].filter(Boolean).join(' · ')
    const hp = r.hp ? `<a href="tel:${escHtml(String(r.hp).replace(/[^0-9+]/g,''))}" style="color:#0ea5e9;text-decoration:none">📱 ${escHtml(String(r.hp))}</a>` : ''
    return `${reg}<strong>${nama}</strong>${meta?`<br><span style="color:#64748b;font-size:12px">${meta}</span>`:''}${hp?`<br><span style="font-size:12px">${hp}</span>`:''}`
  },rowActions:(r:any)=>[{label:'Lihat Detail',className:'edit',to:`/dashboard/pendaftaran/${r.id}`}]},
  {key:'hibah',label:'Hibah',type:'html',width:'14%',accessor:(r:any)=>{
    const parts = [r.skema, r.jenis_hibah].filter(Boolean).map((s:string)=>escHtml(clean(s)))
    const extra = [r.sdgs, r.kelompok_keahlian].filter(Boolean).map((s:string)=>escHtml(clean(s)))
    if(!parts.length && !extra.length) return '<span style="color:#9ca3af">—</span>'
    return `${parts.length?parts.join(' / '):'<span style="color:#9ca3af">—</span>'}${extra.length?`<br><span style="color:#64748b;font-size:12px">${extra.join(' · ')}</span>`:''}`
  }},
  {key:'usulan',label:'Usulan & Tim',type:'html',width:'26%',accessor:(r:any)=>{
    const judul = clean(r.judul)||'Tanpa judul'
    const short = judul.length>88? judul.slice(0,88)+'…': judul
    let h = `<span title="${escHtml(judul)}"><strong>${escHtml(short)}</strong></span>`
    const list: {tipe:string;nomor:string;nama:string}[] = r.anggota_list||[]
    if(list.length){
      const lines = list.map(m=> m.tipe==='mahasiswa' ? `Mhs: ${escHtml(m.nama)} (${escHtml(m.nomor)})` : `Dosen: ${escHtml(m.nama)} (${escHtml(m.nomor)})`).join('<br>')
      h += `<br><span style="color:#475569;font-size:12px">${lines}</span>`
    }
    return h
  }},
  {key:'_status',label:'Status',type:'html',width:'12%',accessor:(r:any)=>statusPill(r.status||'submitted')},
  {key:'aksi',label:'Aksi',type:'html',width:'28%',accessor:()=>''},
]

const filtered=computed(()=>{let a=[...items.value];if(statusFilter.value!=='all')a=a.filter(r=>(r.status||'submitted')===statusFilter.value);if(search.value.trim()){const q=search.value.toLowerCase();a=a.filter(r=>clean(r.nama).toLowerCase().includes(q)||clean(r.judul).toLowerCase().includes(q)||(r.reg_no||'').toLowerCase().includes(q))};return a})

const byStatus=computed(()=>{const m:Record<string,number>={submitted:0,under_review:0,revised:0,approved:0,rejected:0,done:0};items.value.forEach(r=>{const s=r.status||'submitted';if(s in m)m[s]++});return m})

async function fetchData(p=1){loading.value=true;error.value=''
  try{const base=SITE.apiBase.replace('/wp/v2','');const r=await fetch(`${base}/lp2m/v1/hibah?per_page=${perPg}&page=${p}`);if(!r.ok)throw new Error('HTTP '+r.status);const json=await r.json()
  if(json.success){items.value=(json.data||[]).map((d:any)=>({...d,status:d.status||'submitted'}));total.value=json.total;pg.value=p}else{error.value=json.message||'Gagal'}}catch(e:any){error.value=e.message}finally{loading.value=false}}

// ── Inline: email override + status modal (klik badge) ──
const rowBusy = ref<Record<number,''|'status'|'email'>>({})
const rowMsg = ref<Record<number,{text:string;ok:boolean}>>({})
const rowEmail = ref<Record<number,string>>({})
const modalOpen = ref(false)
const modalRow = ref<Submission|null>(null)
const modalSel = ref<string>('submitted')
const modalBusy = ref(false)
const modalMsg = ref<{text:string;ok:boolean}|null>(null)

function openStatusModal(row: Submission){
  modalRow.value = row
  modalSel.value = row.status || 'submitted'
  modalMsg.value = null
  modalOpen.value = true
}
function closeStatusModal(){ if(modalBusy.value) return; modalOpen.value = false; modalMsg.value=null }

async function saveModalStatus(){
  if(!modalRow.value) return
  const id = modalRow.value.id
  const next = modalSel.value
  modalBusy.value = true; modalMsg.value = null
  rowBusy.value[id]='status'
  try{
    const base=SITE.apiBase.replace('/wp/v2','')
    const fd=new FormData(); fd.set('status', next)
    const r=await fetch(`${base}/lp2m/v1/hibah/${id}`, { method:'POST', headers:{ ...auth.authHeaders() }, body: fd })
    const j:any=await r.json().catch(()=>null)
    if(!r.ok) throw new Error(j?.message || `HTTP ${r.status}`)
    if(j && j.success===false) throw new Error(j.message||'Gagal')
    modalRow.value.status = next
    const idx = items.value.findIndex(x=>x.id===id)
    if(idx>=0) items.value[idx].status = next
    const emailInfo = j?.email_sent===false ? ` (email gagal: ${j?.email_error||'—'})` : j?.email_sent ? ' & email terkirim ✓' : ''
    modalMsg.value = { text:`✓ ${STATUS_LABEL[next]||next} disimpan${emailInfo}`, ok: j?.email_sent!==false }
    rowMsg.value[id]={ text:`✓ ${STATUS_LABEL[next]||next} & email terkirim.`, ok:true }
    setTimeout(()=>{ modalOpen.value=false; modalMsg.value=null }, 900)
    setTimeout(()=>{ if(rowMsg.value[id]?.ok) delete rowMsg.value[id] }, 3500)
  }catch(e:any){ modalMsg.value={ text:`✕ ${e.message||'Gagal menyimpan'}`, ok:false } }
  finally{ modalBusy.value=false; rowBusy.value[id]='' }
}

async function sendEmail(row: Submission){
  const id=row.id as number
  const override = String(rowEmail.value[id] ?? row.email ?? '').trim()
  if(!override){ rowMsg.value[id]={text:'Isi email tujuan dulu.', ok:false}; return }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(override)){ rowMsg.value[id]={text:'Format email tidak valid.', ok:false}; return }
  rowBusy.value[id]='email'; if(rowMsg.value[id]) delete rowMsg.value[id]
  try{
    const base=SITE.apiBase.replace('/wp/v2','')
    const r=await fetch(`${base}/lp2m/v1/hibah/${id}/email`, { method:'POST', headers:{ 'Content-Type':'application/json', ...auth.authHeaders() }, body: JSON.stringify({ note: `Status: ${STATUS_LABEL[row.status||'submitted']||row.status}`, email: override }) })
    const j:any=await r.json().catch(()=>null)
    if(!r.ok) throw new Error(j?.message || `HTTP ${r.status}`)
    if(j && j.success===false) throw new Error(j.message||'Gagal')
    rowMsg.value[id]={ text:`✓ Email terkirim ke ${override}.`, ok:true }
    setTimeout(()=>{ if(rowMsg.value[id]?.ok) delete rowMsg.value[id] }, 3500)
  }catch(e:any){ rowMsg.value[id]={ text:`✕ ${e.message||'Gagal kirim email'}`, ok:false } }
  finally{ rowBusy.value[id]='' }
}

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
      'No':(d.reg_no as string)||'','Tanggal':(d.tanggal as string)||'','Nama':(d.nama as string)||'','NIP/NIDN':(d.nip as string)||'',
      'Jenis':(d.jenis as string)||'','Prodi':(d.prodi as string)||'','Model Hibah':(d.skema as string)||'',
      'Jenis Hibah':(d.jenis_hibah as string)||'','SDGs':(d.sdgs as string)||'','Kel. Keahlian':(d.kelompok_keahlian as string)||'',
      'Judul':(d.judul as string)||'','Ringkasan':(d.ringkasan as string)||'',
      'Anggota Tim':(typeof d.anggota==='string'?d.anggota:''),
      'Email':(d.email as string)||'','WhatsApp':(d.hp as string)||'',
      'Status':STATUS_LABEL[(d.status as string)||'submitted']||(d.status as string)||''
    })),{header:['No','Tanggal','Nama','NIP/NIDN','Jenis','Prodi','Model Hibah','Jenis Hibah','SDGs','Kel. Keahlian','Judul','Ringkasan','Anggota Tim','Email','WhatsApp','Status']})
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Pendaftaran Hibah LP2M')
    const fname=`LP2M-Pendaftaran-Hibah_${exp.value.dari.split('-').join('')}_${exp.value.sampai.split('-').join('')}${titlePart}.xlsx`
    XLSX.writeFile(wb,fname,{bookType:'xlsx'})
    expMsg.value=`✓ ${data.length} data didownload`
  }catch(e:any){expMsg.value=e.message||'Export gagal'}
  finally{exporting.value=false}
}

onMounted(()=>fetchData())
</script>
