<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div class="reward-page">
      <div class="reward-hero">
        <div class="wrap">
          <div class="eyebrow">Insentif Publikasi</div>
          <h1>Reward Jurnal</h1>
          <p>Ajukan reward (insentif) untuk publikasi jurnal, buku, HAKI, dan seminar Anda secara online.</p>
        </div>
      </div>

      <div class="wrap reward-wrap">
        <div id="primary" class="content-area">
          <div class="entry-content reward-shell">

            <!-- ══ Kata Pengantar ══ -->
            <div class="rw-intro">
              <p>Yth. Bpk/Ibu Dosen Institut Teknologi Sawit Indonesia.</p>
              <p>Berikut formulir Dokumentasi Publikasi Artikel, Buku, HAKI, dan Seminar dari aktivitas Penelitian dan atau Pengabdian Kepada Masyarakat yang dipublikasi atau diperoleh pada Tahun 2026. Publikasi yang diisi pada formulir ini telah sudah disubmit atau disinkron di platform SINTA. Publikasi berupa Buku mohon menyerahkan hardcopy kepada LPPM ITSI. Terima kasih.</p>
            </div>

            <!-- ══ Status periode pengajuan ══ -->
            <div v-if="periodLoading" class="rw-card rw-center">Memuat status pengajuan…</div>
            <div v-else-if="!periodOpen" class="rw-card rw-closed">
              <div class="rw-closed-icon">⏳</div>
              <h2>Pengajuan Ditutup</h2>
              <p>{{ periodMsg }}</p>
            </div>

            <!-- ══ Stepper ══ -->
            <template v-else>
            <ol class="rw-steps">
              <li v-for="(s, i) in stepLabels" :key="s" :class="{ active: i === step, done: i < step }">
                <span class="rw-step-num">{{ i < step ? '✓' : i + 1 }}</span>
                <span class="rw-step-label">{{ s }}</span>
              </li>
            </ol>

            <!-- ══ Success ══ -->
            <div v-if="success" class="rw-card rw-success">
              <div class="rw-success-icon">✓</div>
              <h2>Pengajuan Berhasil Dikirim</h2>
              <p>
                Terima kasih. Pengajuan Reward Jurnal Anda telah kami terima.
                Tim LP2M akan melakukan verifikasi dan menghubungi Anda melalui WhatsApp.
              </p>
              <button class="btn btn-primary" @click="resetAll">Ajukan Karya Lain</button>
            </div>

            <!-- ══ Form wizard ══ -->
            <div v-else class="rw-card">
              <!-- STEP 0: Data Diri -->
              <div v-if="step === 0">
                <h2 class="rw-title">Data Diri</h2>
                <p class="rw-sub">Lengkapi identitas pengusul. Kolom bertanda <span style="color:var(--rust)">*</span> wajib diisi.</p>
                <div class="form-grid">
                  <TextField id="rw-nama" v-model="form.nama_dosen" label="Nama Dosen" placeholder="Dr. Nama Lengkap, M.Pd." required :error="stepErrors.nama_dosen" :invalid="!!stepErrors.nama_dosen" />
                  <TextField id="rw-wa" v-model="form.no_whatsapp" type="tel" label="Nomor HP / WhatsApp" placeholder="08xxxxxxxxxx" required :error="stepErrors.no_whatsapp" :invalid="!!stepErrors.no_whatsapp" />
                </div>
              </div>

              <!-- STEP 1: Artikel / Jurnal -->
              <div v-else-if="step === 1">
                <h2 class="rw-title">Artikel / Jurnal</h2>
                <p class="rw-sub">Lengkapi data artikel jurnal Anda. Kolom bertanda <span style="color:var(--rust)">*</span> wajib diisi.</p>
                <div class="form-grid">
                  <TextField id="rw-judul-artikel" v-model="form.judul_artikel" label="Judul Artikel" placeholder="Judul lengkap artikel" full required :error="stepErrors.judul_artikel" :invalid="!!stepErrors.judul_artikel" />
                  <TextField id="rw-url-artikel" v-model="form.url_artikel" type="url" label="URL Artikel" placeholder="https://doi.org/..." full required :error="stepErrors.url_artikel" :invalid="!!stepErrors.url_artikel" />
                  <SelectField id="rw-kat-jurnal" v-model="form.kategori_jurnal_id" label="Kategori Jurnal" empty-label="Pilih kategori jurnal" :options="catOptions('kategori_jurnal')" numeric full required :error="stepErrors.kategori_jurnal_id" :invalid="!!stepErrors.kategori_jurnal_id" />
                  <FileField id="rw-file-artikel" label="File Artikel" hint="PDF, maks 5 file, 10 MB per file." accept=".pdf,application/pdf" multiple full required :error="stepErrors.file_artikel" :invalid="!!stepErrors.file_artikel" @change="(e) => onFiles(e, 'file_artikel', 5, 'pdf')" />
                  <FileField id="rw-file-proposal" label="File Proposal Penelitian dari Artikel" hint="PDF, sampai 5 file, 10 MB per file." accept=".pdf,application/pdf" multiple full required :error="stepErrors.file_proposal_artikel" :invalid="!!stepErrors.file_proposal_artikel" @change="(e) => onFiles(e, 'file_proposal_artikel', 5, 'pdf')" />
                  <FileField id="rw-bukti-bayar" label="Bukti Bayar (jika bayar)" hint="PDF/gambar, maks 10 MB (opsional)." accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" full :error="stepErrors.bukti_bayar" :invalid="!!stepErrors.bukti_bayar" @change="(e) => onSingle(e, 'bukti_bayar', 'any')" />
                </div>
              </div>

              <!-- STEP 2: Buku -->
              <div v-else-if="step === 2">
                <h2 class="rw-title">Buku</h2>
                <p class="rw-sub">Lengkapi data buku Anda. Kolom bertanda <span style="color:var(--rust)">*</span> wajib diisi.</p>
                <div class="form-grid">
                  <TextField id="rw-judul-buku" v-model="form.judul_buku" label="Judul Buku" placeholder="Judul lengkap buku" full required :error="stepErrors.judul_buku" :invalid="!!stepErrors.judul_buku" />
                  <TextField id="rw-url-buku" v-model="form.url_buku" type="url" label="URL Buku" placeholder="https://..." full required :error="stepErrors.url_buku" :invalid="!!stepErrors.url_buku" />
                  <SelectField id="rw-kat-buku" v-model="form.kategori_buku_id" label="Kategori Buku" empty-label="Pilih kategori buku" :options="catOptions('kategori_buku')" numeric full required :error="stepErrors.kategori_buku_id" :invalid="!!stepErrors.kategori_buku_id" />
                  <FileField id="rw-cover" label="Cover Depan Buku" hint="1 file PDF, maks 10 MB." accept=".pdf,application/pdf" full required :error="stepErrors.cover_depan_buku" :invalid="!!stepErrors.cover_depan_buku" @change="(e) => onSingle(e, 'cover_depan_buku', 'pdf')" />
                  <FileField id="rw-isbn" label="Halaman ISBN" hint="1 file PDF/gambar, maks 10 MB." accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" full required :error="stepErrors.halaman_isbn" :invalid="!!stepErrors.halaman_isbn" @change="(e) => onSingle(e, 'halaman_isbn', 'any')" />
                  <FileField id="rw-bayar-buku" label="Bukti Bayar Biaya Penerbitan Buku" hint="PDF/gambar, maks 10 MB (opsional)." accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" full :error="stepErrors.bukti_bayar_buku" :invalid="!!stepErrors.bukti_bayar_buku" @change="(e) => onSingle(e, 'bukti_bayar_buku', 'any')" />
                </div>
              </div>

              <!-- STEP 3: HAKI -->
              <div v-else-if="step === 3">
                <h2 class="rw-title">HAKI</h2>
                <p class="rw-sub">Lengkapi data HAKI Anda. Kolom bertanda <span style="color:var(--rust)">*</span> wajib diisi.</p>
                <div class="form-grid">
                  <TextField id="rw-judul-haki" v-model="form.judul_haki" label="Judul HAKI (lengkap)" placeholder="Tulis judul pada HAKI secara lengkap" full required :error="stepErrors.judul_haki" :invalid="!!stepErrors.judul_haki" />
                  <TextField id="rw-no-haki" v-model="form.nomor_dokumen_haki" label="Nomor Dokumen / Sertifikat HAKI" placeholder="EC00xxxxxxxx" full required :error="stepErrors.nomor_dokumen_haki" :invalid="!!stepErrors.nomor_dokumen_haki" />
                  <SelectField id="rw-kat-haki" v-model="form.kategori_haki_id" label="Kategori HAKI" empty-label="Pilih kategori HAKI" :options="catOptions('kategori_haki')" numeric full required :error="stepErrors.kategori_haki_id" :invalid="!!stepErrors.kategori_haki_id" />
                  <FileField id="rw-sert-haki" label="Sertifikat HAKI" hint="PDF/gambar, maks 10 MB." accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" full required :error="stepErrors.sertifikat_haki" :invalid="!!stepErrors.sertifikat_haki" @change="(e) => onSingle(e, 'sertifikat_haki', 'any')" />
                  <FileField id="rw-bayar-haki" label="Bukti Pembayaran Biaya Penerbitan HAKI" hint="PDF/gambar, maks 10 MB (opsional)." accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" full :error="stepErrors.bukti_bayar_haki" :invalid="!!stepErrors.bukti_bayar_haki" @change="(e) => onSingle(e, 'bukti_bayar_haki', 'any')" />
                </div>
              </div>

              <!-- STEP 4: Seminar -->
              <div v-else-if="step === 4">
                <h2 class="rw-title">Seminar</h2>
                <p class="rw-sub">Opsional. Isi bila Anda memiliki riwayat sebagai pemateri seminar.</p>
                <div class="form-grid">
                  <TextField id="rw-penyelenggara" v-model="form.penyelenggara_seminar" label="Penyelenggara Seminar" placeholder="Nama penyelenggara" full :error="stepErrors.penyelenggara_seminar" :invalid="!!stepErrors.penyelenggara_seminar" />
                  <TextField id="rw-judul-paper" v-model="form.judul_paper_seminar" label="Judul Paper Seminar" placeholder="Judul paper/makalah" full :error="stepErrors.judul_paper_seminar" :invalid="!!stepErrors.judul_paper_seminar" />
                  <SelectField id="rw-kat-seminar" v-model="form.kategori_seminar_id" label="Kategori Seminar" empty-label="Pilih kategori seminar" :options="catOptions('kategori_seminar')" numeric full :error="stepErrors.kategori_seminar_id" :invalid="!!stepErrors.kategori_seminar_id" />
                  <FileField id="rw-sert-pemateri" label="Sertifikat sebagai Pemateri Seminar" hint="PDF/gambar, maks 10 MB." accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" full :error="stepErrors.sertifikat_pemateri" :invalid="!!stepErrors.sertifikat_pemateri" @change="(e) => onSingle(e, 'sertifikat_pemateri', 'any')" />
                  <FileField id="rw-dokumentasi" label="Dokumentasi Seminar" hint="PDF/gambar, maks 10 MB." accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" full :error="stepErrors.dokumentasi_seminar" :invalid="!!stepErrors.dokumentasi_seminar" @change="(e) => onSingle(e, 'dokumentasi_seminar', 'any')" />
                </div>
              </div>

              <!-- STEP 5: Review -->
              <div v-else-if="step === 5">
                <h2 class="rw-title">Periksa Kembali</h2>
                <p class="rw-sub">Pastikan data yang sudah Anda isi benar sebelum dikirim.</p>
                <dl class="rw-review">
                  <div><dt>Nama Dosen</dt><dd>{{ form.nama_dosen || '—' }}</dd></div>
                  <div><dt>No. WhatsApp</dt><dd>{{ form.no_whatsapp || '—' }}</dd></div>

                  <div class="rw-review-sec">Artikel / Jurnal</div>
                  <div><dt>Judul Artikel</dt><dd>{{ form.judul_artikel || '—' }}</dd></div>
                  <div><dt>URL</dt><dd>{{ form.url_artikel || '—' }}</dd></div>
                  <div><dt>Kategori</dt><dd>{{ catName('kategori_jurnal', form.kategori_jurnal_id) }}</dd></div>
                  <div><dt>File Artikel</dt><dd>{{ fileCount('file_artikel') }} file</dd></div>
                  <div><dt>File Proposal</dt><dd>{{ fileCount('file_proposal_artikel') }} file</dd></div>
                  <div v-if="form.bukti_bayar"><dt>Bukti Bayar</dt><dd>{{ form.bukti_bayar.name }}</dd></div>

                  <div class="rw-review-sec">Buku</div>
                  <div><dt>Judul Buku</dt><dd>{{ form.judul_buku || '—' }}</dd></div>
                  <div><dt>URL</dt><dd>{{ form.url_buku || '—' }}</dd></div>
                  <div><dt>Kategori</dt><dd>{{ catName('kategori_buku', form.kategori_buku_id) }}</dd></div>
                  <div><dt>Cover</dt><dd>{{ form.cover_depan_buku ? form.cover_depan_buku.name : '—' }}</dd></div>
                  <div><dt>Halaman ISBN</dt><dd>{{ form.halaman_isbn ? form.halaman_isbn.name : '—' }}</dd></div>
                  <div v-if="form.bukti_bayar_buku"><dt>Bukti Bayar</dt><dd>{{ form.bukti_bayar_buku.name }}</dd></div>

                  <div class="rw-review-sec">HAKI</div>
                  <div><dt>Judul HAKI</dt><dd>{{ form.judul_haki || '—' }}</dd></div>
                  <div><dt>No. Dokumen</dt><dd>{{ form.nomor_dokumen_haki || '—' }}</dd></div>
                  <div><dt>Kategori</dt><dd>{{ catName('kategori_haki', form.kategori_haki_id) }}</dd></div>
                  <div><dt>Sertifikat</dt><dd>{{ form.sertifikat_haki ? form.sertifikat_haki.name : '—' }}</dd></div>
                  <div v-if="form.bukti_bayar_haki"><dt>Bukti Bayar HAKI</dt><dd>{{ form.bukti_bayar_haki.name }}</dd></div>

                  <template v-if="hasSeminar">
                    <div class="rw-review-sec">Seminar</div>
                    <div v-if="form.penyelenggara_seminar"><dt>Penyelenggara</dt><dd>{{ form.penyelenggara_seminar }}</dd></div>
                    <div v-if="form.judul_paper_seminar"><dt>Judul Paper</dt><dd>{{ form.judul_paper_seminar }}</dd></div>
                    <div v-if="form.kategori_seminar_id !== ''"><dt>Kategori</dt><dd>{{ catName('kategori_seminar', form.kategori_seminar_id) }}</dd></div>
                    <div v-if="form.sertifikat_pemateri"><dt>Sertifikat</dt><dd>{{ form.sertifikat_pemateri.name }}</dd></div>
                    <div v-if="form.dokumentasi_seminar"><dt>Dokumentasi</dt><dd>{{ form.dokumentasi_seminar.name }}</dd></div>
                  </template>
                </dl>
                <div v-if="submitError" class="rw-error">{{ submitError }}</div>
              </div>

              <!-- ══ Nav buttons ══ -->
              <div class="rw-nav">
                <button v-if="step > 0" type="button" class="btn btn-outline" @click="prevStep">← Sebelumnya</button>
                <span v-else></span>
                <button v-if="step < 5" type="button" class="btn btn-primary" @click="nextStep">Berikutnya →</button>
                <button v-else type="button" class="btn btn-primary" :disabled="submitting" @click="submit">
                  {{ submitting ? 'Mengirim...' : 'Kirim Pengajuan' }}
                </button>
              </div>
            </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { SITE } from '@/data'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import TextField from '@/components/TextField.vue'
import SelectField from '@/components/SelectField.vue'
import FileField from '@/components/FileField.vue'

const base = SITE.apiBase.replace('/wp/v2', '')

const stepLabels = ['Data Diri', 'Artikel / Jurnal', 'Buku', 'HAKI', 'Seminar', 'Review']
const step = ref(0)

const form = reactive({
  nama_dosen: '',
  no_whatsapp: '',
  judul_artikel: '',
  url_artikel: '',
  kategori_jurnal_id: '' as number | '',
  judul_buku: '',
  url_buku: '',
  kategori_buku_id: '' as number | '',
  judul_haki: '',
  nomor_dokumen_haki: '',
  kategori_haki_id: '' as number | '',
  penyelenggara_seminar: '',
  judul_paper_seminar: '',
  kategori_seminar_id: '' as number | '',
  // files
  file_artikel: [] as File[],
  file_proposal_artikel: [] as File[],
  bukti_bayar: null as File | null,
  cover_depan_buku: null as File | null,
  halaman_isbn: null as File | null,
  bukti_bayar_buku: null as File | null,
  sertifikat_haki: null as File | null,
  bukti_bayar_haki: null as File | null,
  sertifikat_pemateri: null as File | null,
  dokumentasi_seminar: null as File | null,
})

const stepErrors = reactive<Record<string, string>>({})
const submitError = ref('')
const submitting = ref(false)
const success = ref(false)
const loadingCats = ref(true)
const periodOpen = ref(true)
const periodMsg = ref('')
const periodLoading = ref(true)

const hasSeminar = computed(() => !!(form.penyelenggara_seminar || form.judul_paper_seminar || form.kategori_seminar_id !== '' || form.sertifikat_pemateri || form.dokumentasi_seminar))

// ── Kategori dinamis dari taxonomy ──
const categories = reactive<Record<string, { id: number; name: string; slug: string }[]>>({
  kategori_jurnal: [],
  kategori_buku: [],
  kategori_haki: [],
  kategori_seminar: [],
})

function catOptions(tax: string) {
  return (categories[tax] || []).map((t) => ({ label: t.name, value: t.id }))
}
function catName(tax: string, id: number | '') {
  if (id === '') return '—'
  const t = (categories[tax] || []).find((x) => x.id === id)
  return t ? t.name : '—'
}

async function loadCategories() {
  loadingCats.value = true
  try {
    const res = await fetch(`${base}/lp2m/v1/reward-jurnal/categories`)
    if (!res.ok) return
    const data = await res.json()
    for (const tax of Object.keys(categories)) {
      if (Array.isArray(data[tax])) categories[tax] = data[tax]
    }
  } catch {
    // fallback: kategori kosong
  } finally {
    loadingCats.value = false
  }
}
onMounted(() => { loadCategories(); loadPeriod() })

// ── Periode pengajuan (open/closed) ──
async function loadPeriod() {
  periodLoading.value = true
  try {
    const res = await fetch(`${base}/lp2m/v1/reward-jurnal/period`)
    if (!res.ok) return
    const data = await res.json().catch(() => ({}))
    periodOpen.value = !!data.open
    periodMsg.value = data.message || ''
  } catch {
    // default: terbuka
  } finally {
    periodLoading.value = false
  }
}

// ── File handling ──
function validateFile(file: File, kind: 'pdf' | 'any', label: string): string {
  if (file.size > 10 * 1024 * 1024) return `${label} maksimal 10 MB.`
  if (kind === 'pdf') {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return `${label} harus PDF.`
  } else {
    const ok = file.type.startsWith('image/') || file.type === 'application/pdf'
    if (!ok) return `${label} harus PDF atau gambar (JPG/PNG).`
  }
  return ''
}

function onFiles(e: Event, key: 'file_artikel' | 'file_proposal_artikel', max: number, kind: 'pdf' | 'any') {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length > max) {
    stepErrors[key] = `Maksimal ${max} file.`
    input.value = ''
    return
  }
  for (const f of files) {
    const err = validateFile(f, kind, key === 'file_artikel' ? 'File Artikel' : 'File Proposal')
    if (err) {
      stepErrors[key] = err
      input.value = ''
      return
    }
  }
  stepErrors[key] = ''
  ;(form as any)[key] = files
}

function onSingle(e: Event, key: string, kind: 'pdf' | 'any') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) {
    ;(form as any)[key] = null
    return
  }
  const lbl = key.replace(/_/g, ' ')
  const err = validateFile(file, kind, lbl.charAt(0).toUpperCase() + lbl.slice(1))
  if (err) {
    stepErrors[key] = err
    input.value = ''
    return
  }
  stepErrors[key] = ''
  ;(form as any)[key] = file
}

function fileCount(key: string) {
  const v = (form as any)[key]
  if (Array.isArray(v)) return v.length
  return v ? 1 : 0
}

// ── Validation ──
function clearStepErrors() {
  Object.keys(stepErrors).forEach((k) => delete stepErrors[k])
  submitError.value = ''
}

function validateDataDiri(): boolean {
  let ok = true
  if (!form.nama_dosen.trim()) { stepErrors.nama_dosen = 'Wajib diisi.'; ok = false }
  if (!form.no_whatsapp.trim()) { stepErrors.no_whatsapp = 'Wajib diisi.'; ok = false }
  return ok
}
function validateArtikel(): boolean {
  let ok = true
  if (!form.judul_artikel.trim()) { stepErrors.judul_artikel = 'Wajib diisi.'; ok = false }
  if (!form.url_artikel.trim()) { stepErrors.url_artikel = 'Wajib diisi.'; ok = false }
  if (form.kategori_jurnal_id === '') { stepErrors.kategori_jurnal_id = 'Wajib dipilih.'; ok = false }
  if (form.file_artikel.length === 0) { stepErrors.file_artikel = 'Wajib diunggah.'; ok = false }
  if (form.file_proposal_artikel.length === 0) { stepErrors.file_proposal_artikel = 'Wajib diunggah.'; ok = false }
  return ok
}
function validateBuku(): boolean {
  let ok = true
  if (!form.judul_buku.trim()) { stepErrors.judul_buku = 'Wajib diisi.'; ok = false }
  if (!form.url_buku.trim()) { stepErrors.url_buku = 'Wajib diisi.'; ok = false }
  if (form.kategori_buku_id === '') { stepErrors.kategori_buku_id = 'Wajib dipilih.'; ok = false }
  if (!form.cover_depan_buku) { stepErrors.cover_depan_buku = 'Wajib diunggah.'; ok = false }
  if (!form.halaman_isbn) { stepErrors.halaman_isbn = 'Wajib diunggah.'; ok = false }
  return ok
}
function validateHaki(): boolean {
  let ok = true
  if (!form.judul_haki.trim()) { stepErrors.judul_haki = 'Wajib diisi.'; ok = false }
  if (!form.nomor_dokumen_haki.trim()) { stepErrors.nomor_dokumen_haki = 'Wajib diisi.'; ok = false }
  if (form.kategori_haki_id === '') { stepErrors.kategori_haki_id = 'Wajib dipilih.'; ok = false }
  if (!form.sertifikat_haki) { stepErrors.sertifikat_haki = 'Wajib diunggah.'; ok = false }
  return ok
}

function validateStep(s: number): boolean {
  if (s === 0) return validateDataDiri()
  if (s === 1) return validateArtikel()
  if (s === 2) return validateBuku()
  if (s === 3) return validateHaki()
  return true
}

function nextStep() {
  clearStepErrors()
  if (validateStep(step.value)) step.value++
}

function prevStep() {
  clearStepErrors()
  if (step.value > 0) step.value--
}

// ── Submit ──
async function submit() {
  if (submitting.value) return
  clearStepErrors()
  const checks = [validateDataDiri(), validateArtikel(), validateBuku(), validateHaki()]
  const firstFail = checks.findIndex((ok) => !ok)
  if (firstFail !== -1) {
    step.value = firstFail
    return
  }
  submitting.value = true

  try {
    const fd = new FormData()
    const textKeys = [
      'nama_dosen', 'no_whatsapp',
      'judul_artikel', 'url_artikel', 'judul_buku', 'url_buku',
      'judul_haki', 'nomor_dokumen_haki', 'penyelenggara_seminar', 'judul_paper_seminar',
    ]
    for (const k of textKeys) {
      const v = (form as any)[k]
      if (v !== undefined && v !== null && v !== '') fd.append(k, String(v))
    }
    const termIds: Record<string, string> = {
      kategori_jurnal_id: String(form.kategori_jurnal_id ?? ''),
      kategori_buku_id: String(form.kategori_buku_id ?? ''),
      kategori_haki_id: String(form.kategori_haki_id ?? ''),
      kategori_seminar_id: String(form.kategori_seminar_id ?? ''),
    }
    for (const k of Object.keys(termIds)) {
      if (termIds[k] && termIds[k] !== '') fd.append(k, termIds[k])
    }
    for (const f of form.file_artikel) fd.append('file_artikel[]', f, f.name)
    for (const f of form.file_proposal_artikel) fd.append('file_proposal_artikel[]', f, f.name)
    const singleFiles: Record<string, File | null> = {
      bukti_bayar: form.bukti_bayar,
      cover_depan_buku: form.cover_depan_buku,
      halaman_isbn: form.halaman_isbn,
      bukti_bayar_buku: form.bukti_bayar_buku,
      sertifikat_haki: form.sertifikat_haki,
      bukti_bayar_haki: form.bukti_bayar_haki,
      sertifikat_pemateri: form.sertifikat_pemateri,
      dokumentasi_seminar: form.dokumentasi_seminar,
    }
    for (const k of Object.keys(singleFiles)) {
      const f = singleFiles[k]
      if (f) fd.append(k, f, f.name)
    }

    const res = await fetch(`${base}/lp2m/v1/reward-jurnal`, { method: 'POST', body: fd })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.success) {
      success.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      if (data.errors && typeof data.errors === 'object') {
        Object.keys(data.errors).forEach((k) => { stepErrors[k] = data.errors[k] })
      }
      submitError.value = data.message || 'Pengajuan gagal dikirim. Periksa kembali data Anda.'
    }
  } catch (e: any) {
    submitError.value = e?.message || 'Tidak dapat terhubung ke server.'
  } finally {
    submitting.value = false
  }
}

function resetAll() {
  Object.assign(form, {
    nama_dosen: '', no_whatsapp: '',
    judul_artikel: '', url_artikel: '', kategori_jurnal_id: '',
    judul_buku: '', url_buku: '', kategori_buku_id: '',
    judul_haki: '', nomor_dokumen_haki: '', kategori_haki_id: '',
    penyelenggara_seminar: '', judul_paper_seminar: '', kategori_seminar_id: '',
    file_artikel: [], file_proposal_artikel: [],
    bukti_bayar: null, cover_depan_buku: null, halaman_isbn: null,
    bukti_bayar_buku: null, sertifikat_haki: null, bukti_bayar_haki: null,
    sertifikat_pemateri: null, dokumentasi_seminar: null,
  })
  step.value = 0
  success.value = false
  clearStepErrors()
}
</script>

<style scoped>
.reward-page { padding-bottom: 80px; }
.reward-hero {
  background: linear-gradient(135deg, var(--green-800), var(--green-900));
  color: #fff;
  padding: 72px 0 56px;
  margin-bottom: 40px;
}
.reward-hero .eyebrow { color: var(--gold-soft); }
.reward-hero .eyebrow::before { background: var(--gold-soft); }
.reward-hero h1 { color: #fff; font-size: 2.4rem; margin-bottom: 10px; }
.reward-hero p { color: var(--green-100); max-width: 52ch; }

.reward-shell { max-width: 760px; margin: 0 auto; }

.rw-steps {
  display: flex;
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  gap: 6px;
  flex-wrap: wrap;
}
.rw-steps li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--paper-2, #e8ecdd);
  border-radius: 6px;
  color: var(--ink-soft);
  font-size: 0.78rem;
  white-space: nowrap;
  flex: 1 1 auto;
}
.rw-steps li.active { background: var(--green-800); color: #fff; }
.rw-steps li.done { background: var(--green-100); color: var(--green-800); }
.rw-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(0,0,0,0.08);
  font-weight: 700;
  flex-shrink: 0;
}
.rw-steps li.active .rw-step-num { background: rgba(255,255,255,0.25); }

.rw-card {
  background: var(--card, #fbfaf5);
  border: 1px solid var(--paper-2, #e8ecdd);
  border-radius: 8px;
  padding: 28px;
}
.rw-title { font-size: 1.4rem; margin-bottom: 4px; }
.rw-sub { color: var(--ink-soft); font-size: 0.9rem; margin-bottom: 20px; }

.rw-intro {
  margin-bottom: 24px;
  padding: 18px 20px;
  background: var(--paper-2, #eef2e3);
  border-left: 4px solid var(--green-800);
  border-radius: 8px;
  color: var(--ink);
  font-size: 0.95rem;
  line-height: 1.7;
}
.rw-intro p { margin: 0 0 10px; }
.rw-intro p:last-child { margin-bottom: 0; }

.rw-center { text-align: center; color: var(--ink-soft); padding: 32px 20px; }

.rw-closed { text-align: center; padding: 44px 28px; }
.rw-closed-icon {
  width: 64px; height: 64px; margin: 0 auto 18px;
  border-radius: 50%;
  background: #fdf1ee;
  color: var(--rust, #9b4224);
  font-size: 2rem; line-height: 64px;
}
.rw-closed h2 { margin-bottom: 10px; }
.rw-closed p { color: var(--ink-soft); max-width: 46ch; margin: 0 auto; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 620px) { .form-grid { grid-template-columns: 1fr; } }

.rw-error {
  margin-top: 14px;
  padding: 10px 14px;
  background: #fdf1ee;
  border: 1px solid #f0c4b8;
  border-radius: 6px;
  color: var(--rust, #9b4224);
  font-size: 0.84rem;
}

.rw-review { margin: 0 0 8px; display: flex; flex-direction: column; }
.rw-review > div:not(.rw-review-sec) {
  display: flex;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--paper-2, #e8ecdd);
}
.rw-review dt { flex: 0 0 160px; font-weight: 600; color: var(--green-800); }
.rw-review dd { margin: 0; color: var(--ink); word-break: break-word; }
.rw-review-sec {
  font-weight: 700;
  color: var(--green-900);
  font-size: 0.85rem;
  padding: 14px 0 4px;
  margin-top: 8px;
  border-bottom: 2px solid var(--green-100);
}
@media (max-width: 520px) {
  .rw-review dt { flex-basis: 110px; }
  .rw-step-label { display: none; }
}

.rw-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }

.rw-success { text-align: center; padding: 48px 28px; }
.rw-success-icon {
  width: 64px; height: 64px; margin: 0 auto 18px;
  border-radius: 50%;
  background: var(--green-100);
  color: var(--green-800);
  font-size: 2rem; line-height: 64px;
}
.rw-success h2 { margin-bottom: 10px; }
.rw-success p { color: var(--ink-soft); max-width: 46ch; margin: 0 auto 20px; }
</style>