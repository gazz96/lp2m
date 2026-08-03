<template>
  <div class="wp-app" style="padding:32px;min-height:100vh">
    <div class="wp-page-header">
      <h1 class="wp-page-title">Skema Hibah</h1>
    </div>
    <p class="wp-page-subtitle">Kelola skema pendanaan untuk event hibah.</p>

    <div class="wp-card" style="margin-bottom:20px">
      <div class="wp-card-body">
        <div style="display:flex;gap:12px;align-items:flex-end">
          <div class="wp-field" style="flex:1;margin-bottom:0">
            <label>Nama Skema</label>
            <input type="text" v-model="newName" placeholder="cth. Hibah Kompetitif Riset" @keyup.enter="addSkm" />
          </div>
          <div class="wp-field" style="flex:1;margin-bottom:0">
            <label>Slug <span class="hint">(opsional)</span></label>
            <input type="text" v-model="newSlug" placeholder="hibah-kompetitif-riset" />
          </div>
          <button class="wp-btn wp-btn-primary" @click="addSkm" :disabled="!newName.trim()||adding">{{ adding?'Menyimpan...':'Tambah Skema' }}</button>
        </div>
        <div v-if="err" class="wp-notice wp-notice-error" style="margin-top:12px;margin-bottom:0">{{ err }}</div>
      </div>
    </div>

    <div v-if="terms.length" class="wp-table-wrap">
      <table class="wp-table">
        <thead><tr><th>Nama</th><th style="width:160px">Slug</th><th style="width:80px;text-align:center">Jumlah</th><th style="width:100px"></th></tr></thead>
        <tbody>
          <tr v-for="(t,i) in terms" :key="t.id" :class="{striped:i%2===1}">
            <td>
              <template v-if="editId===t.id">
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                  <input type="text" v-model="editName" class="wp-field" style="margin-bottom:0;width:180px" />
                  <input type="text" v-model="editSlug" class="wp-field" style="margin-bottom:0;width:140px" />
                  <button class="wp-btn wp-btn-primary wp-btn-sm" @click="updateSkm(t.id)">Simpan</button>
                  <button class="wp-btn wp-btn-sm" @click="editId=null">Batal</button>
                </div>
              </template>
              <template v-else>
                <strong style="display:block;margin-bottom:4px">{{ t.name }}</strong>
                <button class="wp-btn-link" @click="startEdit(t)">Edit</button>
                <button class="wp-btn-link danger" @click="removeSkm(t)">Hapus</button>
              </template>
            </td>
            <td style="font-family:monospace;font-size:13px;color:var(--wp-text-muted)">{{ t.slug }}</td>
            <td style="text-align:center;color:var(--wp-text-muted)">{{ t.count }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="wp-empty"><div class="wp-empty-title">Belum ada skema</div><div class="wp-empty-sub">Gunakan form di atas untuk menambah.</div></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const terms = ref<{id:number;name:string;slug:string;count:number}[]>([])
const newName=ref(''),newSlug=ref(''),adding=ref(false),err=ref(''),editId=ref<number|null>(null),editName=ref(''),editSlug=ref('')
async function loadSkm(){try{const r=await window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100&orderby=name&order=asc`);if(r.ok)terms.value=await r.json()}catch{}}
async function addSkm(){const n=newName.value.trim();if(!n)return;adding.value=true;err.value='';const s=newSlug.value.trim()||n.toLowerCase().replace(/[^a-z0-9]+/g,'-')
  try{const r=await window.fetch(`${SITE.apiBase}/skema_hibah`,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({name:n,slug:s})})
  if(!r.ok)throw new Error((await r.json().catch(()=>({}))).message||'Gagal');newName.value='';newSlug.value='';loadSkm()}catch(e:any){err.value=e.message}finally{adding.value=false}}
function startEdit(t:typeof terms.value[0]){editId.value=t.id;editName.value=t.name;editSlug.value=t.slug}
async function updateSkm(id:number){try{const r=await window.fetch(`${SITE.apiBase}/skema_hibah/${id}`,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({name:editName.value,slug:editSlug.value})});if(!r.ok)throw new Error('Gagal');editId.value=null;loadSkm()}catch(e:any){err.value=e.message}}
async function removeSkm(t:typeof terms.value[0]){if(!confirm('Hapus "'+t.name+'"? Data event tidak akan terhapus.'))return;try{const r=await window.fetch(`${SITE.apiBase}/skema_hibah/${t.id}?force=true`,{method:'DELETE',headers:{...auth.authHeaders()}});if(!r.ok)throw new Error('Gagal');loadSkm()}catch(e:any){err.value=e.message}}
onMounted(loadSkm)
</script>
