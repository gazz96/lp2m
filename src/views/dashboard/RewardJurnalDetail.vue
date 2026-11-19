<template>
  <div class="edit-post-layout">
    <div class="editor-header">
      <div class="editor-header__left">
        <WpButton variant="link" class="is-small" to="/dashboard/reward-jurnal">‹ Kembali</WpButton>
        <span class="editor-header__title">Detail Reward Jurnal</span>
      </div>
      <div class="editor-header__center">
        <span v-if="post" class="post-state"><code>{{ post.reg_no || ('#' + id) }}</code></span>
      </div>
      <div class="editor-header__right">
        <a v-if="editLink" :href="editLink" class="components-button is-secondary is-small" style="text-decoration:none">Edit di WP Admin</a>
      </div>
    </div>

    <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
    <div v-else-if="error" class="notice notice-error inline"><p>{{ error }}</p></div>

    <div v-else-if="post" class="editor-body">
      <div class="editor-center">
        <div class="editor-styles">

          <!-- Data Diri -->
          <div class="postbox">
            <div class="postbox-header"><h2>Data Diri</h2></div>
            <div class="inside">
              <table class="form-table" style="width:100%">
                <tr><th style="width:200px">No. Registrasi</th><td><code>{{ post.reg_no || '—' }}</code></td></tr>
                <tr><th>Nama Dosen</th><td>{{ post.nama_dosen || '—' }}</td></tr>
                <tr><th>WhatsApp</th><td>{{ post.no_whatsapp || '—' }}</td></tr>
                <tr><th>Jenis Karya</th><td>{{ jenisLabel(post.jenis_reward) }}</td></tr>
                <tr><th>Tanggal Pengajuan</th><td>{{ fmtDate(post.date) }}</td></tr>
                <tr><th>Status</th><td><span class="status-pill" :style="pillStyle(post.alur_status)">{{ statusLabel(post.alur_status) }}</span></td></tr>
              </table>
            </div>
          </div>

          <!-- Bagian per jenis (hanya yang relevan tampil) -->
          <div v-if="post.jenis_reward === 'artikel'" class="postbox">
            <div class="postbox-header"><h2>Artikel / Jurnal</h2></div>
            <div class="inside">
              <table class="form-table" style="width:100%">
                <tr><th style="width:200px">Judul Artikel</th><td>{{ post.judul_artikel || '—' }}</td></tr>
                <tr><th>URL Artikel</th><td><template v-for="l in linkOut(post.url_artikel)" :key="l.url"><a :href="l.url" target="_blank" rel="noopener" style="color:#2271b1;font-size:12px;word-break:break-all">{{ shortenUrl(l.url) }}</a></template><span v-if="!post.url_artikel">—</span></td></tr>
                <tr><th>Kategori Jurnal</th><td>{{ termsLabel(post.kategori_jurnal_names) }}</td></tr>
                <tr><th>File Artikel</th><td>{{ fileLinks(post.file_artikel) }}</td></tr>
                <tr><th>File Proposal</th><td>{{ fileLinks(post.file_proposal_artikel) }}</td></tr>
                <tr><th>Bukti Bayar</th><td>{{ fileLinks(post.bukti_bayar) }}</td></tr>
              </table>
            </div>
          </div>

          <div v-if="post.jenis_reward === 'buku'" class="postbox">
            <div class="postbox-header"><h2>Buku</h2></div>
            <div class="inside">
              <table class="form-table" style="width:100%">
                <tr><th style="width:200px">Judul Buku</th><td>{{ post.judul_buku || '—' }}</td></tr>
                <tr><th>URL Buku</th><td><template v-for="l in linkOut(post.url_buku)" :key="l.url"><a :href="l.url" target="_blank" rel="noopener" style="color:#2271b1;font-size:12px;word-break:break-all">{{ shortenUrl(l.url) }}</a></template><span v-if="!post.url_buku">—</span></td></tr>
                <tr><th>Kategori Buku</th><td>{{ termsLabel(post.kategori_buku_names) }}</td></tr>
                <tr><th>Cover Depan</th><td>{{ fileLinks(post.cover_depan_buku) }}</td></tr>
                <tr><th>Halaman ISBN</th><td>{{ fileLinks(post.halaman_isbn) }}</td></tr>
                <tr><th>Bukti Bayar Penerbitan</th><td>{{ fileLinks(post.bukti_bayar_buku) }}</td></tr>
              </table>
            </div>
          </div>

          <div v-if="post.jenis_reward === 'haki'" class="postbox">
            <div class="postbox-header"><h2>HAKI</h2></div>
            <div class="inside">
              <table class="form-table" style="width:100%">
                <tr><th style="width:200px">Judul HAKI</th><td>{{ post.judul_haki || '—' }}</td></tr>
                <tr><th>Nomor Dokumen</th><td>{{ post.nomor_dokumen_haki || '—' }}</td></tr>
                <tr><th>Kategori HAKI</th><td>{{ termsLabel(post.kategori_haki_names) }}</td></tr>
                <tr><th>Sertifikat</th><td>{{ fileLinks(post.sertifikat_haki) }}</td></tr>
                <tr><th>Bukti Bayar Penerbitan</th><td>{{ fileLinks(post.bukti_bayar_haki) }}</td></tr>
              </table>
            </div>
          </div>

          <div v-if="post.jenis_reward === 'seminar'" class="postbox">
            <div class="postbox-header"><h2>Seminar</h2></div>
            <div class="inside">
              <table class="form-table" style="width:100%">
                <tr><th style="width:200px">Penyelenggara</th><td>{{ post.penyelenggara_seminar || '—' }}</td></tr>
                <tr><th>Judul Paper</th><td>{{ post.judul_paper_seminar || '—' }}</td></tr>
                <tr><th>Kategori Seminar</th><td>{{ termsLabel(post.kategori_seminar_names) }}</td></tr>
                <tr><th>Sertifikat Pemateri</th><td>{{ fileLinks(post.sertifikat_pemateri) }}</td></tr>
                <tr><th>Dokumentasi</th><td>{{ fileLinks(post.dokumentasi_seminar) }}</td></tr>
              </table>
            </div>
          </div>

        </div>
      </div>

      <aside class="editor-sidebar">
        <details class="wp-detail-group" open>
          <summary class="wp-detail-group__title">Ringkasan</summary>
          <div class="wp-detail-group__body">
            <div class="sidebar-meta"><span>No. Registrasi</span><strong>{{ post.reg_no || '—' }}</strong></div>
            <div class="sidebar-meta"><span>Pengaju</span><strong>{{ post.nama_dosen || '—' }}</strong></div>
            <div class="sidebar-meta"><span>Jenis</span><strong>{{ jenisLabel(post.jenis_reward) }}</strong></div>
            <div class="sidebar-meta"><span>Status</span><strong>{{ statusLabel(post.alur_status) }}</strong></div>
          </div>
        </details>
        <details class="wp-detail-group" open>
          <summary class="wp-detail-group__title">Navigasi</summary>
          <div class="wp-detail-group__body">
            <WpButton variant="link" class="is-small" to="/dashboard/reward-jurnal">‹ Kembali ke Daftar Laporan</WpButton>
          </div>
        </details>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpButton from '@/components/WpButton.vue'

const route = useRoute()
const auth = useAuthStore()
const base = SITE.apiBase.replace('/wp/v2', '')
const id = Number(route.params.id)

const post = ref<any>(null)
const loading = ref(true)
const error = ref('')

const editLink = computed(() => {
  if (!post.value) return ''
  const wpRoot = base.replace(/\/wp-json$/, '')
  return `${wpRoot}/wp-admin/post.php?post=${id}&action=edit`
})

const JENIS_LABEL: Record<string, string> = {
  artikel: 'Artikel/Jurnal',
  buku: 'Buku',
  haki: 'HAKI',
  seminar: 'Seminar',
}
function jenisLabel(j: string): string {
  return JENIS_LABEL[j] || (j ? j : '—')
}

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  reviewed: 'Reviewed',
  approved: 'Approved',
  rejected: 'Rejected',
  done: 'Done',
}
const STATUS_COLOR: Record<string, string> = {
  submitted: '#64748b',
  under_review: '#d97706',
  reviewed: '#0284c7',
  approved: '#16a34a',
  rejected: '#dc2626',
  done: '#7c3aed',
}
function statusLabel(s: string): string {
  return STATUS_LABEL[s] || s || 'submitted'
}
function pillStyle(s: string) {
  const c = STATUS_COLOR[s] || '#64748b'
  return { display: 'inline-block', padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', color: '#fff', background: c }
}

function fmtDate(d: string): string {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function linkOut(u: string): Array<{ url: string }> {
  return u ? [{ url: u }] : []
}

function shortenUrl(v: string) {
  try {
    const p = new URL(v)
    return p.host + (p.pathname.length > 34 ? p.pathname.slice(0, 34) + '…' : p.pathname)
  } catch {
    return v.length > 40 ? v.slice(0, 40) + '…' : v
  }
}

function termsLabel(v: unknown): string {
  if (!Array.isArray(v) || !v.length) return '—'
  return v.join(', ')
}

/** Render daftar file sebagai tautan unduh (attachment URL array dari REST). */
function fileLinks(v: unknown): string {
  if (!Array.isArray(v) || !v.length) return '—'
  return v.map((u: any) => {
    const url = String(u || '')
    if (!url) return ''
    const name = url.split('/').pop() || url
    return `<a href="${url}" target="_blank" rel="noopener" style="color:#2271b1;font-size:12px;word-break:break-all">${name}</a>`
  }).filter(Boolean).join('<br>') || '—'
}

async function load() {
  loading.value = true; error.value = ''
  try {
    const fields = [
      'id,date,title,jenis_reward,nama_dosen,no_whatsapp,reg_no,alur_status',
      'judul_artikel,url_artikel,file_artikel,file_proposal_artikel,bukti_bayar',
      'judul_buku,url_buku,cover_depan_buku,halaman_isbn,bukti_bayar_buku',
      'judul_haki,nomor_dokumen_haki,sertifikat_haki,bukti_bayar_haki',
      'penyelenggara_seminar,judul_paper_seminar,sertifikat_pemateri,dokumentasi_seminar',
      'kategori_jurnal_names,kategori_buku_names,kategori_haki_names,kategori_seminar_names',
    ].join(',')
    const r = await fetch(`${SITE.apiBase}/reward_jurnal/${id}?context=view&_fields=${fields}`, { headers: { ...auth.authHeaders() } })
    if (!r.ok) {
      const j: any = await r.json().catch(() => null)
      throw new Error(j?.message || 'HTTP ' + r.status)
    }
    post.value = await r.json()
  } catch (e: any) {
    error.value = e.message || 'Gagal memuat detail'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.edit-post-layout{display:flex;flex-direction:column;min-height:100vh}
.editor-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 16px;background:#fff;border-bottom:1px solid var(--wp-border-light);min-height:48px}
.editor-header__left{display:flex;align-items:center;gap:8px}
.editor-header__title{font-size:14px;font-weight:500}
.editor-header__center{display:flex;align-items:center;min-width:0}
.editor-header__right{display:flex;align-items:center}
.editor-body{display:flex;align-items:flex-start;flex:1;background:var(--wp-bg)}
.editor-center{flex:1;min-width:0;padding:24px 0 60px}
.editor-styles{max-width:840px;margin:0 auto;padding:0 24px}
.editor-sidebar{width:280px;flex-shrink:0;align-self:stretch;border-left:1px solid var(--wp-border-light);background:#fff}

.postbox{border:1px solid #dcdcde;border-radius:4px;background:#fff;margin-bottom:16px;box-shadow:0 1px 1px rgba(0,0,0,.04)}
.postbox-header{padding:10px 14px;border-bottom:1px solid #dcdcde;background:#f6f7f7}
.postbox-header h2{margin:0;font-size:13px;font-weight:600;color:#1d2327}
.postbox .inside{padding:6px 14px 14px}
.postbox .form-table{margin:0}
.postbox .form-table th{font-weight:600;vertical-align:top;padding:10px 12px 10px 0;font-size:13px;color:#1d2327}
.postbox .form-table td{padding:10px 0;font-size:13px;color:#2c3338}

.wp-detail-group{border-bottom:1px solid #e0e0e0}
.wp-detail-group__title{display:flex;align-items:center;padding:12px 16px;font-size:13px;font-weight:500;color:var(--wp-text);cursor:pointer;user-select:none;list-style:none}
.wp-detail-group__title::-webkit-details-marker{display:none}
.wp-detail-group__title::before{content:"";display:inline-block;width:8px;height:8px;border-right:2px solid var(--wp-text-secondary);border-bottom:2px solid var(--wp-text-secondary);margin-right:8px;transform:rotate(-45deg);transition:transform .15s}
.wp-detail-group[open] .wp-detail-group__title::before{transform:rotate(45deg)}
.wp-detail-group__body{padding:0 16px 16px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.sidebar-meta{display:flex;flex-direction:column;gap:2px;width:100%}
.sidebar-meta span{font-size:11px;color:var(--wp-text-muted)}
.sidebar-meta strong{font-size:13px;font-weight:500;word-break:break-word}
.status-pill{white-space:nowrap}

@media(max-width:1024px){
  .editor-body{flex-direction:column}
  .editor-sidebar{width:100%;border-left:0;border-top:1px solid var(--wp-border-light)}
}
</style>
