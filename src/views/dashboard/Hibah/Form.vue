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
        <div class="editor-header__status">
          <span class="post-state" :class="f.status === 'draft' ? 'draft' : ''">{{ f.status === 'publish' ? 'Publish' : 'Draft' }}</span>
        </div>
      </div>
      <div class="editor-header__right">
        <WpButton v-if="editId" variant="tertiary" class="is-small" @click="previewDraft">Preview</WpButton>
        <WpButton variant="secondary" class="is-small" style="margin-left:8px" @click="showSettings = !showSettings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </WpButton>
        <WpButton variant="primary" class="is-small" style="margin-left:8px" :disabled="saving" @click="save">{{ saving ? 'Menyimpan...' : (editId ? 'Perbarui' : 'Terbitkan') }}</WpButton>
      </div>
    </div>

    <div v-if="err" class="components-notice is-error" style="margin:0;border-left:none;border-radius:0"><div class="components-notice__content">{{ err }}</div></div>

    <!-- Main area -->
    <div class="editor-body" :class="{ 'is-sidebar-opened': showSettings }">
      <!-- Editor -->
      <div class="editor-center">
        <div class="editor-styles">
          <div class="editor-post-title">
            <textarea
              v-model="f.title"
              class="editor-post-title__input"
              placeholder="Tambahkan judul"
              rows="1"
              @input="autoResize($event)"
            ></textarea>
          </div>

          <WpEditor v-model="f.content" placeholder="Mulai menulis atau tekan / untuk memilih blok..." />
        </div>

        <div class="editor-meta">
          <div class="editor-meta__section">
            <div class="components-base-control">
              <label class="components-base-control__label">Info Tambahan</label>
              <textarea class="components-text-control__input" v-model="f.info_tambahan" rows="3" placeholder="Satu informasi per baris..." style="min-height:70px"></textarea>
            </div>
          </div>
          <div class="editor-meta__section">
            <div class="components-base-control">
              <label class="components-base-control__label">Timeline</label>
              <div v-for="(t,i) in f.timeline_items" :key="i" style="display:flex;gap:8px;margin-bottom:6px;align-items:center">
                <input class="components-text-control__input" type="text" v-model="t.date" placeholder="01 Agu 2026" style="width:120px;flex-shrink:0" />
                <input class="components-text-control__input" type="text" v-model="t.label" placeholder="Deskripsi tahapan..." style="flex:1" />
                <WpButton variant="link" class="is-small" @click="f.timeline_items.splice(i,1)">Hapus</WpButton>
              </div>
              <WpButton variant="tertiary" class="is-small" @click="f.timeline_items.push({date:'',label:''})">+ Tambah Tahapan</WpButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings sidebar -->
      <div v-if="showSettings" class="editor-sidebar">
        <div class="components-panel">
          <div class="components-panel__header"><h2>Status & Visibilitas</h2></div>
          <div class="components-panel__body">
            <div class="components-base-control">
              <label class="components-base-control__label">Status</label>
              <select class="components-select-control__input" v-model="f.status">
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
            </div>
            <div class="components-base-control">
              <label class="components-base-control__label">Jenis Hibah</label>
              <select class="components-select-control__input" v-model="f.jenis_hibah">
                <option value="internal">Internal</option>
                <option value="eksternal">Eksternal</option>
              </select>
            </div>
            <div v-if="editId" style="font-size:12px;color:var(--wp-text-muted);margin-top:8px">ID: {{ editId }}</div>
          </div>
        </div>

        <div class="components-panel">
          <div class="components-panel__header"><h2>Kategori Hibah</h2></div>
          <div class="components-panel__body">
            <TagSelect :terms="kTerms" :selected="selKats" placeholder="Cari atau buat kategori..."
              @add="(t:any)=>selKats.push(t.id)" @remove="(id:number)=>selKats=selKats.filter(x=>x!==id)"
              @create="addTerm('kategori_hibah',$event,kTerms,selKats)" />
          </div>
        </div>

        <div class="components-panel">
          <div class="components-panel__header"><h2>Skema Hibah</h2></div>
          <div class="components-panel__body">
            <TagSelect :terms="sTerms" :selected="selSkms" placeholder="Cari atau buat skema..."
              @add="(t:any)=>selSkms.push(t.id)" @remove="(id:number)=>selSkms=selSkms.filter(x=>x!==id)"
              @create="addTerm('skema_hibah',$event,sTerms,selSkms)" />
          </div>
        </div>

        <div class="components-panel">
          <div class="components-panel__header"><h2>Deadline & Dana</h2></div>
          <div class="components-panel__body">
            <div class="components-base-control">
              <label class="components-base-control__label">Deadline</label>
              <input class="components-text-control__input" type="date" v-model="f.deadline" />
            </div>
            <div class="components-base-control">
              <label class="components-base-control__label">Dana Maks (Rp)</label>
              <input class="components-text-control__input" type="number" v-model.number="f.dana_maks_num" placeholder="35000000" />
            </div>
          </div>
        </div>

        <div class="components-panel">
          <div class="components-panel__header"><h2>Thumbnail</h2></div>
          <div class="components-panel__body">
            <ThumbnailPicker v-model:media-id="f.featured_media" v-model:preview-url="thumb" />
          </div>
        </div>

        <div class="components-panel">
          <div class="components-panel__header"><h2>Metadata</h2></div>
          <div class="components-panel__body">
            <div class="components-base-control">
              <label class="components-base-control__label">Eyebrow</label>
              <input class="components-text-control__input" type="text" v-model="f.event_eyebrow" placeholder="Event Aktif..." />
            </div>
            <div class="components-base-control">
              <label class="components-base-control__label">Link Panduan</label>
              <input class="components-text-control__input" type="url" v-model="f.link_panduan" placeholder="https://..." />
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
import WpButton from '@/components/WpButton.vue'
import WpEditor from '@/components/WpEditor.vue'
import ThumbnailPicker from '@/components/ThumbnailPicker.vue'
import TagSelect from '@/components/TagSelect.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute(), router = useRouter(), auth = useAuthStore()
const toast = useToast()
const editId = ref<number | null>(null), saving = ref(false), err = ref(''), thumb = ref(''), showSettings = ref(false)
const kTerms = ref<{ id: number; name: string }[]>([]), sTerms = ref<{ id: number; name: string }[]>([])
const selKats = ref<number[]>([]), selSkms = ref<number[]>([])
interface TL { date: string; label: string }
const f = reactive({ title: '', content: '', status: 'draft', jenis_hibah: 'internal', deadline: '', dana_maks_num: 0, event_eyebrow: '', info_tambahan: '', link_panduan: '', timeline_items: [] as TL[], featured_media: null as number | null })

function clean(s: string) { return new DOMParser().parseFromString(s, 'text/html').body.textContent || '' }
function autoResize(e: Event) { const el = e.target as HTMLTextAreaElement; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
async function loadTerms() { try { const [k, s] = await Promise.all([window.fetch(`${SITE.apiBase}/kategori_hibah?per_page=100`), window.fetch(`${SITE.apiBase}/skema_hibah?per_page=100`)]); if (k.ok) kTerms.value = await k.json(); if (s.ok) sTerms.value = await s.json() } catch {} }
async function loadItem(id: number) { try { const r = await window.fetch(`${SITE.apiBase}/hibah/${id}?_embed`); if (!r.ok) return; const p = await r.json(); editId.value = p.id; f.title = clean(p.title?.rendered || ''); f.content = p.content?.rendered || ''; f.status = p.status || 'draft'; f.jenis_hibah = p.jenis_hibah || 'internal'; f.deadline = p.deadline ? p.deadline.slice(0, 10) : ''; f.dana_maks_num = parseInt(p.dana_maks) || 0; f.event_eyebrow = p.event_eyebrow || ''; f.info_tambahan = p.info_tambahan || ''; f.link_panduan = p.link_panduan || ''; f.timeline_items = p.timeline_items || []; f.featured_media = p.featured_media || null; selKats.value = p.kategori_hibah || []; selSkms.value = p.skema_hibah || []; thumb.value = p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '' } catch {} }
async function addTerm(tax: string, name: string, arr: { id: number; name: string }[], sel: number[]) { err.value = ''; const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); try { const r = await window.fetch(`${SITE.apiBase}/${tax}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() }, body: JSON.stringify({ name, slug }) }); if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || 'Gagal'); const c = await r.json(); arr.push({ id: c.id, name: c.name }); sel.push(c.id) } catch (e: any) { err.value = 'Gagal: ' + e.message } }
function previewDraft() { if (editId.value) window.open(`https://itsi.ac.id/?p=${editId.value}&preview=true`, '_blank') }
async function save() { if (!f.title.trim()) { err.value = 'Judul wajib diisi.'; return }; saving.value = true; err.value = ''; const p: any = { title: f.title, content: f.content, status: f.status, jenis_hibah: f.jenis_hibah, deadline: f.deadline ? f.deadline + 'T23:59:59' : '', deadline_label: f.deadline ? new Date(f.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '', dana_maks: f.dana_maks_num ? String(f.dana_maks_num) : '', event_eyebrow: f.event_eyebrow, info_tambahan: f.info_tambahan, link_panduan: f.link_panduan, kategori_hibah: selKats.value, skema_hibah: selSkms.value, timeline_items: f.timeline_items }; if (f.featured_media) p.featured_media = f.featured_media; try { const url = editId.value ? `${SITE.apiBase}/hibah/${editId.value}` : `${SITE.apiBase}/hibah`; const r = await window.fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth.authHeaders() }, body: JSON.stringify(p) }); if (!r.ok) { const e = await r.json().catch(() => ({})); err.value = e.message || 'HTTP ' + r.status; toast.error(e.message || 'Gagal menyimpan'); saving.value = false; return }; const c = await r.json(); if (!editId.value) { editId.value = c.id; router.replace('/dashboard/hibah/' + c.id) }; saving.value = false; err.value = ''; toast.success(editId.value ? 'Hibah berhasil diperbarui!' : 'Hibah berhasil dibuat!') } catch (e: any) { err.value = e.message; saving.value = false } }
function resetForm() { Object.assign(f, { title: '', content: '', status: 'draft', jenis_hibah: 'internal', deadline: '', dana_maks_num: 0, event_eyebrow: '', info_tambahan: '', link_panduan: '', timeline_items: [], featured_media: null }); selKats.value = []; selSkms.value = []; thumb.value = ''; editId.value = null; err.value = ''; showSettings.value = false }
watch(() => route.params.id, (id) => { if (id) loadItem(parseInt(id as string)); else resetForm() })
onMounted(() => { loadTerms(); const id = route.params.id as string; if (id) loadItem(parseInt(id)); else resetForm() })
</script>

<style scoped>
/* ── Header ── */
.editor-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; background: #fff; border-bottom: 1px solid var(--wp-border-light);
  min-height: 48px;
}
.editor-header__left { display: flex; align-items: center; gap: 8px; }
.editor-header__title { font-size: 14px; font-weight: 500; }
.editor-header__center { display: flex; align-items: center; }
.editor-header__right { display: flex; align-items: center; }

/* ── Body ── */
.editor-body { display: flex; min-height: calc(100vh - 48px); background: var(--wp-bg); }
.editor-center { flex: 1; overflow-y: auto; padding: 40px 0 80px; }
.editor-styles { max-width: 840px; margin: 0 auto; padding: 0 40px; }

.editor-post-title { margin-bottom: 20px; }
.editor-post-title__input {
  display: block; width: 100%; font-size: 2em; font-weight: 600;
  line-height: 1.2; padding: 0; border: none; outline: none;
  background: transparent; color: var(--wp-text); font-family: inherit;
  resize: none; overflow: hidden;
}
.editor-post-title__input::placeholder { color: #757575; }

.editor-meta { max-width: 840px; margin: 24px auto 0; padding: 0 40px; }
.editor-meta__section { margin-bottom: 16px; }

/* ── Sidebar ── */
.editor-sidebar {
  width: 280px; flex-shrink: 0; overflow-y: auto;
  border-left: 1px solid var(--wp-border-light); background: #fff;
}
.editor-sidebar .components-panel { border: none; border-bottom: 1px solid #e0e0e0; margin: 0; border-radius: 0; }

@media (max-width: 900px) {
  .editor-body.is-sidebar-opened .editor-sidebar { display: none; }
  .editor-styles, .editor-meta { padding: 0 20px; }
}
</style>
