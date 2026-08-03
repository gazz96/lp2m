<template>
  <div class="wrap">
    <h1>{{ editId ? 'Edit Hibah' : 'Tambah Hibah' }}
      <button v-if="editId" class="page-title-action" @click="previewDraft">Preview</button>
    </h1>

    <div class="notice" v-if="err"><p>{{ err }}</p></div>

    <div id="poststuff">
      <div id="post-body" class="columns-2">
        <!-- Main column -->
        <div id="post-body-content">
          <div class="postbox">
            <div class="postbox-header"><h2>Judul & Konten</h2></div>
            <div class="inside">
              <div style="margin-bottom:14px">
                <input type="text" v-model="f.title" placeholder="Tulis judul hibah..." style="width:100%;font-size:16px;padding:10px 12px" />
              </div>
              <HtmlEditor v-model="f.content" />
            </div>
          </div>

          <div class="postbox">
            <div class="postbox-header"><h2>Info Tambahan</h2></div>
            <div class="inside">
              <textarea v-model="f.info_tambahan" rows="4" placeholder="Satu informasi per baris..." style="width:100%"></textarea>
            </div>
          </div>

          <div class="postbox">
            <div class="postbox-header"><h2>Timeline</h2></div>
            <div class="inside">
              <div v-for="(t,i) in f.timeline_items" :key="i" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
                <input type="text" v-model="t.date" placeholder="01 Agu 2026" style="width:130px" />
                <input type="text" v-model="t.label" placeholder="Deskripsi tahapan..." style="flex:1" />
                <button type="button" class="button button-link delete" @click="f.timeline_items.splice(i,1)">Hapus</button>
              </div>
              <button type="button" class="button" @click="f.timeline_items.push({date:'',label:''})">+ Tambah Tahapan</button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div id="postbox-container-1" class="postbox-container">
          <div id="side-sortables">
            <div class="postbox" id="submitdiv">
              <div class="postbox-header"><h2>Terbitkan</h2></div>
              <div class="inside">
                <div style="margin-bottom:12px">
                  <label style="display:block;font-weight:600;margin-bottom:4px">Status</label>
                  <select v-model="f.status" style="width:100%"><option value="draft">Draft</option><option value="publish">Publish</option></select>
                </div>
                <div style="margin-bottom:12px">
                  <label style="display:block;font-weight:600;margin-bottom:4px">Jenis</label>
                  <select v-model="f.jenis_hibah" style="width:100%"><option value="internal">Internal</option><option value="eksternal">Eksternal</option></select>
                </div>
                <button class="button button-primary" style="width:100%" :disabled="saving" @click="save">{{ saving?'Menyimpan...':editId?'Perbarui':'Terbitkan' }}</button>
                <div v-if="editId" style="text-align:center;font-size:12px;color:var(--wp-text-muted);margin-top:8px">ID: {{ editId }}</div>
              </div>
            </div>

            <div class="postbox">
              <div class="postbox-header"><h2>Kategori Hibah</h2></div>
              <div class="inside">
                <TagSelect :terms="kTerms" :selected="selKats" placeholder="Cari atau buat kategori..."
                  @add="(t:any)=>selKats.push(t.id)" @remove="(id:number)=>selKats=selKats.filter(x=>x!==id)"
                  @create="addTerm('kategori_hibah',$event,kTerms,selKats)" />
              </div>
            </div>

            <div class="postbox">
              <div class="postbox-header"><h2>Skema Hibah</h2></div>
              <div class="inside">
                <TagSelect :terms="sTerms" :selected="selSkms" placeholder="Cari atau buat skema..."
                  @add="(t:any)=>selSkms.push(t.id)" @remove="(id:number)=>selSkms=selSkms.filter(x=>x!==id)"
                  @create="addTerm('skema_hibah',$event,sTerms,selSkms)" />
              </div>
            </div>

            <div class="postbox">
              <div class="postbox-header"><h2>Deadline & Dana</h2></div>
              <div class="inside">
                <div style="margin-bottom:12px">
                  <label style="display:block;font-weight:600;margin-bottom:4px">Deadline</label>
                  <input type="date" v-model="f.deadline" style="width:100%" />
                </div>
                <div>
                  <label style="display:block;font-weight:600;margin-bottom:4px">Dana Maks (Rp)</label>
                  <input type="number" v-model.number="f.dana_maks_num" placeholder="35000000" style="width:100%" />
                </div>
              </div>
            </div>

            <div class="postbox">
              <div class="postbox-header"><h2>Thumbnail</h2></div>
              <div class="inside">
                <ThumbnailPicker v-model:media-id="f.featured_media" v-model:preview-url="thumb" />
              </div>
            </div>

            <div class="postbox">
              <div class="postbox-header"><h2>Lainnya</h2></div>
              <div class="inside">
                <div style="margin-bottom:12px">
                  <label style="display:block;font-weight:600;margin-bottom:4px">Eyebrow</label>
                  <input type="text" v-model="f.event_eyebrow" placeholder="Event Aktif..." style="width:100%" />
                </div>
                <div>
                  <label style="display:block;font-weight:600;margin-bottom:4px">Link Panduan</label>
                  <input type="url" v-model="f.link_panduan" placeholder="https://..." style="width:100%" />
                </div>
              </div>
            </div>
          </div>
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
import HtmlEditor from '@/components/HtmlEditor.vue'
import ThumbnailPicker from '@/components/ThumbnailPicker.vue'
import TagSelect from '@/components/TagSelect.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute(), router = useRouter(), auth = useAuthStore()
const toast = useToast()
const editId = ref<number | null>(null), saving = ref(false), err = ref(''), thumb = ref('')
const kTerms = ref<{ id: number; name: string }[]>([]), sTerms = ref<{ id: number; name: string }[]>([])
const selKats = ref<number[]>([]), selSkms = ref<number[]>([])
interface TL { date: string; label: string }
const f = reactive({ title: '', content: '', status: 'draft', jenis_hibah: 'internal', deadline: '', dana_maks_num: 0, event_eyebrow: '', info_tambahan: '', link_panduan: '', timeline_items: [] as TL[], featured_media: null as number | null })

function clean(s: string) { return new DOMParser().parseFromString(s, 'text/html').body.textContent || '' }
async function loadTerms() { try { const [k, s] = await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`), window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100`)]); if (k.ok) kTerms.value = await k.json(); if (s.ok) sTerms.value = await s.json() } catch { } }
async function loadItem(id: number) { try { const r = await window.fetch(`${SITE.apiBase}/hibah/${id}?_embed`); if (!r.ok) return; const p = await r.json(); editId.value = p.id; f.title = clean(p.title?.rendered || ''); f.content = p.content?.rendered || ''; f.status = p.status || 'draft'; f.jenis_hibah = p.jenis_hibah || 'internal'; f.deadline = p.deadline ? p.deadline.slice(0, 10) : ''; f.dana_maks_num = parseInt(p.dana_maks) || 0; f.event_eyebrow = p.event_eyebrow || ''; f.info_tambahan = p.info_tambahan || ''; f.link_panduan = p.link_panduan || ''; f.timeline_items = p.timeline_items || []; f.featured_media = p.featured_media || null; selKats.value = p.kategori_hibah || []; selSkms.value = p.skema_hibah || []; thumb.value = p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '' } catch { } }
async function addTerm(tax: string, name: string, arr: { id: number; name: string }[], sel: number[]) { err.value = ''; const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); try { const r = await window.fetch(`${SITE.apiBase}/${tax}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() }, body: JSON.stringify({ name, slug }) }); if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal'); const c = await r.json(); arr.push({ id: c.id, name: c.name }); sel.push(c.id) } catch (e: any) { err.value = 'Gagal: ' + e.message } }
function previewDraft() { if (editId.value) window.open(`https://itsi.ac.id/?p=${editId.value}&preview=true`, '_blank') }
async function save() { if (!f.title.trim()) { err.value = 'Judul wajib diisi.'; return }; saving.value = true; err.value = ''; const p: any = { title: f.title, content: f.content, status: f.status, jenis_hibah: f.jenis_hibah, deadline: f.deadline ? f.deadline + 'T23:59:59' : '', deadline_label: f.deadline ? new Date(f.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '', dana_maks: f.dana_maks_num ? String(f.dana_maks_num) : '', event_eyebrow: f.event_eyebrow, info_tambahan: f.info_tambahan, link_panduan: f.link_panduan, kategori_hibah: selKats.value, skema_hibah: selSkms.value, timeline_items: f.timeline_items }; if (f.featured_media) p.featured_media = f.featured_media; try { const url = editId.value ? `${SITE.apiBase}/hibah/${editId.value}` : `${SITE.apiBase}/hibah`; const r = await window.fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() }, body: JSON.stringify(p) }); if (!r.ok) { const e = await r.json().catch(() => ({})); err.value = e.message || 'HTTP ' + r.status; toast.error(e.message || 'Gagal menyimpan'); saving.value = false; return }; const c = await r.json(); if (!editId.value) { editId.value = c.id; router.replace('/dashboard/hibah/' + c.id) }; saving.value = false; err.value = ''; toast.success(editId.value ? 'Hibah berhasil diperbarui!' : 'Hibah berhasil dibuat!') } catch (e: any) { err.value = e.message; saving.value = false } }
function resetForm() { Object.assign(f, { title: '', content: '', status: 'draft', jenis_hibah: 'internal', deadline: '', dana_maks_num: 0, event_eyebrow: '', info_tambahan: '', link_panduan: '', timeline_items: [], featured_media: null }); selKats.value = []; selSkms.value = []; thumb.value = ''; editId.value = null; err.value = '' }
watch(() => route.params.id, (id) => { if (id) loadItem(parseInt(id as string)); else resetForm() })
onMounted(() => { loadTerms(); const id = route.params.id as string; if (id) loadItem(parseInt(id)); else resetForm() })
</script>
