<template>
  <div>
    <div class="wp-header"><h1>Skema Hibah</h1></div>
    <p class="sub">Skema yang tersedia untuk event hibah.</p>
    <div class="add-box">
      <input type="text" v-model="newName" placeholder="Nama skema..." class="add-input" @keyup.enter="addSkm" />
      <input type="text" v-model="newSlug" placeholder="slug" class="add-input slug" />
      <button class="btn btn-primary btn-sm" @click="addSkm" :disabled="!newName.trim() || adding">Tambah</button>
    </div>
    <div v-if="err" class="err">{{ err }}</div>
    <div class="wp-table-wrap" style="margin-top:16px">
      <table class="wp-table">
        <thead><tr><th>Nama</th><th>Slug</th><th>Count</th><th class="act-col"></th></tr></thead>
        <tbody>
          <tr v-for="t in terms" :key="t.id">
            <td>
              <template v-if="editId===t.id">
                <input type="text" v-model="editName" class="inline-input" /><input type="text" v-model="editSlug" class="inline-input slug" />
                <button class="btn btn-sm btn-primary" @click="updateSkm(t.id)">Simpan</button><button class="btn btn-sm" @click="editId=null">Batal</button>
              </template>
              <button v-else class="link-btn" @click="startEdit(t)">{{ t.name }}</button>
            </td>
            <td class="slug-cell">{{ t.slug }}</td><td>{{ t.count }}</td>
            <td><button v-if="editId!==t.id" class="btn btn-sm btn-del" @click="removeSkm(t)">Hapus</button></td>
          </tr>
          <tr v-if="!terms.length"><td colspan="4" class="empty">Belum ada skema.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const terms = ref<{id:number;name:string;slug:string;count:number}[]>([])
const newName=ref(''),newSlug=ref(''),adding=ref(false),err=ref(''),editId=ref<number|null>(null),editName=ref(''),editSlug=ref('')
async function loadSkm() { try { const r=await window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100&orderby=name&order=asc`); if(r.ok) terms.value=await r.json() } catch {} }
async function addSkm() { const n=newName.value.trim();if(!n)return; adding.value=true;err.value='';const slug=newSlug.value.trim()||n.toLowerCase().replace(/[^a-z0-9]+/g,'-')
  try { const r=await window.fetch(`${SITE.apiBase}/skema_hibah`,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({name:n,slug})})
    if(!r.ok) throw new Error((await r.json().catch(()=>({}))).message||'Gagal'); newName.value='';newSlug.value='';loadSkm() } catch(e:any){err.value=e.message} finally{adding.value=false} }
function startEdit(t:typeof terms.value[0]) { editId.value=t.id;editName.value=t.name;editSlug.value=t.slug }
async function updateSkm(id:number) { try { const r=await window.fetch(`${SITE.apiBase}/skema_hibah/${id}`,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({name:editName.value,slug:editSlug.value})})
    if(!r.ok) throw new Error('Gagal'); editId.value=null;loadSkm() } catch(e:any){err.value=e.message} }
async function removeSkm(t:typeof terms.value[0]) { if(!confirm(`Hapus "${t.name}"?`))return
  try { const r=await window.fetch(`${SITE.apiBase}/skema_hibah/${t.id}?force=true`,{method:'DELETE',headers:{...auth.authHeaders()}}); if(!r.ok)throw new Error('Gagal');loadSkm() } catch(e:any){err.value=e.message} }
onMounted(loadSkm)
</script>
<style scoped>
.wp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}.wp-header h1{font-size:1.3rem;margin:0}
.sub{font-size:.84rem;color:var(--ink-soft);margin-bottom:16px}
.add-box{display:flex;gap:6px;align-items:center}.add-input{border:1px solid var(--line);border-radius:4px;padding:6px 10px;font-size:.84rem;font-family:inherit;outline:none}.add-input.slug{width:160px}
.inline-input{border:1px solid var(--line);border-radius:4px;padding:4px 8px;font-size:.82rem;font-family:inherit;margin-right:6px}.inline-input.slug{width:120px}
.link-btn{background:none;border:none;color:var(--green-700);cursor:pointer;font-family:inherit;font-size:.86rem;font-weight:600;text-decoration:underline}.link-btn:hover{color:var(--green-600)}
.err{color:var(--rust);font-size:.78rem;margin-top:4px}
.wp-table-wrap{background:var(--card);border:1px solid var(--line);border-radius:4px}
.wp-table{width:100%;border-collapse:collapse;font-size:.86rem}.wp-table th{text-align:left;padding:10px;border-bottom:1px solid var(--line);background:var(--paper-2);color:var(--ink-soft);font-weight:600;font-size:.78rem}.wp-table td{padding:10px;border-bottom:1px solid var(--line)}
.slug-cell{font-family:'IBM Plex Mono',monospace;font-size:.8rem;color:var(--ink-soft)}
.empty{text-align:center;padding:30px;color:var(--ink-soft)}.act-col{width:90px}
.btn-sm{padding:5px 12px;font-size:.76rem}.btn-del{color:var(--rust);border-color:var(--rust)}.btn-del:hover{background:#fff0ed}
</style>
