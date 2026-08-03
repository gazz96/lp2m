<template>
  <div>
    <div class="page-head"><h1>Skema Hibah</h1></div>
    <p class="page-sub">Kelola skema pendanaan untuk event hibah.</p>

    <div class="form-card">
      <div class="fc-row">
        <div class="fc-field">
          <label>Nama Skema</label>
          <input type="text" v-model="newName" placeholder="cth. Hibah Kompetitif Riset" @keyup.enter="addSkm" />
        </div>
        <div class="fc-field">
          <label>Slug <span class="opt">(opsional)</span></label>
          <input type="text" v-model="newSlug" placeholder="hibah-kompetitif-riset" />
        </div>
        <button class="btn btn-primary" @click="addSkm" :disabled="!newName.trim() || adding">
          {{ adding ? 'Menyimpan...' : 'Tambah Skema' }}
        </button>
      </div>
      <div v-if="err" class="err-msg">{{ err }}</div>
    </div>

    <div v-if="terms.length" class="table-card">
      <table>
        <thead>
          <tr>
            <th>Nama Skema</th>
            <th>Slug</th>
            <th class="num-col">Jumlah</th>
            <th class="act-col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in terms" :key="t.id">
            <td>
              <template v-if="editId === t.id">
                <div class="edit-row">
                  <input type="text" v-model="editName" class="ed-inp" />
                  <input type="text" v-model="editSlug" class="ed-inp" />
                  <button class="btn btn-sm btn-primary" @click="updateSkm(t.id)">Simpan</button>
                  <button class="btn btn-sm btn-ghost" @click="editId = null">Batal</button>
                </div>
              </template>
              <template v-else>
                <strong class="cat-name">{{ t.name }}</strong>
                <div class="row-acts">
                  <button class="lnk" @click="startEdit(t)">Edit</button>
                  <span class="sep">|</span>
                  <button class="lnk del" @click="removeSkm(t)">Hapus</button>
                </div>
              </template>
            </td>
            <td class="slug-cell">{{ t.slug }}</td>
            <td class="num-col">{{ t.count }}</td>
            <td class="act-col"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="!adding" class="empty-state">Belum ada skema. Gunakan form di atas untuk menambah.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const terms = ref<{id:number;name:string;slug:string;count:number}[]>([])
const newName = ref(''), newSlug = ref(''), adding = ref(false), err = ref('')
const editId = ref<number | null>(null), editName = ref(''), editSlug = ref('')

async function loadSkm() {
  try { const r = await window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100&orderby=name&order=asc`); if (r.ok) terms.value = await r.json() } catch {}
}
async function addSkm() {
  const n = newName.value.trim(); if (!n) return
  adding.value = true; err.value = ''
  const slug = newSlug.value.trim() || n.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  try {
    const r = await window.fetch(`${SITE.apiBase}/skema_hibah`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify({ name: n, slug })
    })
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal')
    newName.value = ''; newSlug.value = ''; loadSkm()
  } catch (e: any) { err.value = e.message }
  finally { adding.value = false }
}
function startEdit(t: typeof terms.value[0]) { editId.value = t.id; editName.value = t.name; editSlug.value = t.slug }
async function updateSkm(id: number) {
  try {
    const r = await window.fetch(`${SITE.apiBase}/skema_hibah/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify({ name: editName.value, slug: editSlug.value })
    })
    if (!r.ok) throw new Error('Gagal'); editId.value = null; loadSkm()
  } catch (e: any) { err.value = e.message }
}
async function removeSkm(t: typeof terms.value[0]) {
  if (!confirm(`Hapus "${t.name}"? Data event yang menggunakan skema ini tidak akan terhapus.`)) return
  try { const r = await window.fetch(`${SITE.apiBase}/skema_hibah/${t.id}?force=true`, { method: 'DELETE', headers: { ...auth.authHeaders() } }); if (!r.ok) throw new Error('Gagal'); loadSkm() }
  catch (e: any) { err.value = e.message }
}
onMounted(loadSkm)
</script>

<style scoped>
.page-head { margin-bottom: 4px; }
.page-head h1 { font-size: 1.4rem; font-weight: 600; color: var(--ink); }
.page-sub { font-size: 0.92rem; color: var(--ink-soft); margin-bottom: 20px; }

.form-card { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 20px 24px; margin-bottom: 20px; }
.fc-row { display: flex; gap: 12px; align-items: flex-end; }
.fc-field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.fc-field label { font-size: 0.82rem; font-weight: 600; color: var(--green-800); }
.fc-field .opt { font-weight: 400; font-size: 0.76rem; color: var(--ink-soft); }
.fc-field input { border: 1px solid var(--line); border-radius: 6px; padding: 10px 14px; font-family: inherit; font-size: 0.95rem; color: var(--ink); outline: none; }
.fc-field input:focus { border-color: var(--green-600); box-shadow: 0 0 0 3px rgba(47,107,79,0.1); }
.btn { padding: 10px 20px; border-radius: 6px; border: none; font-size: 0.9rem; font-family: inherit; cursor: pointer; font-weight: 600; white-space: nowrap; }
.btn-primary { background: var(--green-700); color: #fff; }
.btn-primary:hover { background: var(--green-800); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 6px 14px; font-size: 0.82rem; }
.btn-ghost { background: transparent; border: 1px solid var(--line); color: var(--ink-soft); }
.btn-ghost:hover { background: var(--paper-2); }

.err-msg { font-size: 0.84rem; color: var(--rust); margin-top: 10px; }

.table-card { background: var(--card); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 14px 20px; border-bottom: 2px solid var(--line); font-size: 0.82rem; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.04em; background: var(--paper-2); }
td { padding: 14px 20px; border-bottom: 1px solid var(--line); font-size: 0.95rem; vertical-align: top; }
tr:hover td { background: var(--paper-1); }
tr:last-child td { border-bottom: none; }

.cat-name { font-size: 1rem; font-weight: 600; color: var(--green-800); display: block; margin-bottom: 5px; }
.row-acts { display: flex; gap: 4px; align-items: center; }
.lnk { background: none; border: none; color: var(--green-700); cursor: pointer; font-size: 0.82rem; font-family: inherit; padding: 0; }
.lnk:hover { text-decoration: underline; }
.lnk.del { color: var(--rust); }
.sep { color: var(--line); font-size: 0.8rem; margin: 0 2px; }

.edit-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ed-inp { border: 1px solid var(--line); border-radius: 5px; padding: 7px 10px; font-size: 0.9rem; font-family: inherit; outline: none; }
.ed-inp:focus { border-color: var(--green-600); }

.slug-cell { font-family: 'IBM Plex Mono', monospace; font-size: 0.86rem; color: var(--ink-soft); }
.num-col { width: 80px; text-align: center; color: var(--ink-soft); }
.act-col { width: 10px; }
.empty-state { text-align: center; padding: 40px; color: var(--ink-soft); font-size: 0.92rem; }
</style>
