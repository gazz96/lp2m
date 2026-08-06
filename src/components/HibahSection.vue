<template>
  <section class="hibah-section" id="hibah">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">{{ HIBAH.eyebrow }}</div>
          <h2>{{ HIBAH.title }}</h2>
        </div>
        <p class="desc">{{ HIBAH.desc }}</p>
      </RevealBlock>

      <!-- Banner -->
      <RevealBlock class="hibah-banner">
        <div>
          <div class="eyebrow banner-eyebrow">{{ HIBAH.banner.eyebrow }}</div>
          <h2>{{ eventData.bannerTitle }}</h2>
          <p>{{ eventData.bannerDesc }}</p>
          <div class="timeline">
            <div v-for="t in eventData.timeline" :key="t.date + t.label" class="t-row">
              <span class="date">{{ fmtTimelineDate(t.date) }}</span>
              <span>{{ t.label }}</span>
            </div>
          </div>
        </div>
        <div class="countdown-box">
          <div class="cd-label">Sisa waktu pendaftaran</div>
          <CountdownTimer :deadline="eventData.deadline" />
          <div class="cd-sub">hari menuju {{ eventData.deadlineLabel }}</div>
          <ul class="leaf-list mt-16">
            <li v-for="info in eventData.info" :key="info">
              <svg width="16" height="16" viewBox="0 0 18 18"><path d="M2 16 C2 9 6 2 16 2 C14 8 9 13 2 16 Z" fill="none" stroke="#C99A3B" stroke-width="1.6"/></svg>
              {{ info }}
            </li>
          </ul>
          <a href="#form-hibah" class="btn btn-gold full-width">Isi Formulir Sekarang</a>
        </div>
      </RevealBlock>

      <!-- Form -->
      <div id="form-hibah">
        <div v-if="!successForm" class="form-panel">
          <h3>Formulir Pendaftaran Hibah</h3>
          <p class="cap">Lengkapi seluruh data dengan benar. Kolom bertanda <span style="color:var(--rust)">*</span> wajib diisi.</p>
          <form @submit.prevent="submitForm" novalidate>
            <div class="form-grid">
              <div class="field" :class="{ invalid: fieldErrors.nama }">
                <label for="nama">Nama Lengkap &amp; Gelar *</label>
                <input type="text" id="nama" v-model="form.nama" placeholder="cth. Dr. Andi Pratama, S.Kom., M.T." />
                <div class="error-msg">{{ fieldErrors.nama }}</div>
              </div>
              <div class="field" :class="{ invalid: fieldErrors.nip }">
                <label for="nip">NIDN / NIDK / NIM *</label>
                <input type="text" id="nip" v-model="form.nip" placeholder="cth. 0112345601" />
                <div class="error-msg">{{ fieldErrors.nip }}</div>
              </div>
              <div class="field full">
                <label>Jenis Pengusul *</label>
                <div class="radio-group">
                  <label><input type="radio" v-model="form.jenis" value="Dosen" /> Dosen</label>
                  <label><input type="radio" v-model="form.jenis" value="Mahasiswa" /> Mahasiswa</label>
                  <label><input type="radio" v-model="form.jenis" value="Tenaga Kependidikan" /> Tenaga Kependidikan</label>
                </div>
              </div>
              <div class="field" :class="{ invalid: fieldErrors.prodi }">
                <label for="prodi">Program Studi / Unit Kerja *</label>
                <div class="combobox" :class="{ open: prodiOpen }">
                  <input
                    type="text"
                    id="prodi"
                    v-model="prodiQuery"
                    placeholder="Ketik untuk cari program studi..."
                    @focus="prodiOpen = true"
                    @input="onProdiInput"
                    @blur="onProdiBlur"
                    @keydown.down.prevent="prodiMove(1)"
                    @keydown.up.prevent="prodiMove(-1)"
                    @keydown.enter.prevent="prodiSelect(prodiHighlight)"
                    @keydown.esc="prodiOpen = false"
                    autocomplete="off"
                  />
                  <ul v-if="prodiOpen && filteredProdi.length" class="combobox-list">
                    <li
                      v-for="(p, i) in filteredProdi"
                      :key="p"
                      :class="{ active: i === prodiHighlight }"
                      @mousedown.prevent="selectProdi(p)"
                    >{{ p }}</li>
                  </ul>
                </div>
                <div class="error-msg">{{ fieldErrors.prodi }}</div>
              </div>
              <div class="field" :class="{ invalid: fieldErrors.skema }">
                <label for="skema">Skema Hibah yang Diikuti *</label>
                <div class="combobox" :class="{ open: skemaOpen }">
                  <input
                    type="text"
                    id="skema"
                    v-model="skemaQuery"
                    placeholder="Ketik untuk cari skema (parent & sub-skema)..."
                    @focus="skemaOpen = true"
                    @input="onSkemaInput"
                    @blur="onSkemaBlur"
                    @keydown.down.prevent="skemaMove(1)"
                    @keydown.up.prevent="skemaMove(-1)"
                    @keydown.enter.prevent="skemaSelect(skemaHighlight)"
                    @keydown.esc="skemaOpen = false"
                    autocomplete="off"
                  />
                  <ul v-if="skemaOpen && filteredSkema.length" class="combobox-list">
                    <li
                      v-for="(s, i) in filteredSkema"
                      :key="s.id"
                      :class="{ active: i === skemaHighlight }"
                      @mousedown.prevent="selectSkema(s)"
                    >
                      <span class="sk-label">{{ s.label }}</span>
                      <span v-if="s.desc" class="sk-desc">{{ s.desc }}</span>
                    </li>
                  </ul>
                </div>
                <div class="error-msg">{{ fieldErrors.skema }}</div>
              </div>
              <div class="field full" :class="{ invalid: fieldErrors.judul }">
                <label for="judul">Judul Usulan *</label>
                <input type="text" id="judul" v-model="form.judul" placeholder="Judul lengkap penelitian atau program pengabdian" />
                <div class="error-msg">{{ fieldErrors.judul }}</div>
              </div>
              <div class="field full" :class="{ invalid: fieldErrors.ringkasan }">
                <label for="ringkasan">Ringkasan Usulan *<span class="hint"> — maksimum 500 karakter</span></label>
                <textarea id="ringkasan" v-model="form.ringkasan" maxlength="500" placeholder="Latar belakang, tujuan, dan luaran yang ditargetkan"></textarea>
                <div class="error-msg">{{ fieldErrors.ringkasan }}</div>
              </div>
              <div class="field">
                <label for="jml_tim">Jumlah Anggota Tim</label>
                <input type="number" id="jml_tim" v-model="form.jml_tim" min="0" max="3" placeholder="0–3 orang" />
              </div>
              <div class="field">
                <label for="anggota">Nama Anggota Tim <span class="hint">(opsional)</span></label>
                <input type="text" id="anggota" v-model="form.anggota" placeholder="Pisahkan dengan koma" />
              </div>
              <div class="field" :class="{ invalid: fieldErrors.email }">
                <label for="email">Email Aktif *</label>
                <input type="email" id="email" v-model="form.email" placeholder="nama@itsi.ac.id" />
                <div class="error-msg">{{ fieldErrors.email }}</div>
              </div>
              <div class="field" :class="{ invalid: fieldErrors.hp }">
                <label for="hp">Nomor WhatsApp Aktif *</label>
                <input type="tel" id="hp" v-model="form.hp" placeholder="08xx-xxxx-xxxx" />
                <div class="error-msg">{{ fieldErrors.hp }}</div>
              </div>
              <div class="field full" :class="{ invalid: fieldErrors.proposal }">
                <label for="proposal">Upload Proposal (PDF) *</label>
                <input
                  type="file"
                  id="proposal"
                  accept=".pdf"
                  @change="onFileChange"
                  class="file-input"
                />
                <div class="file-hint">Maksimal 10MB. Format: PDF.</div>
                <div v-if="form.proposalName" class="file-name">{{ form.proposalName }}</div>
                <div class="error-msg">{{ fieldErrors.proposal }}</div>
              </div>
            </div>

            <!-- Download contoh penulisan -->
            <div v-if="eventData.filePanduan.length || eventData.fileTemplate.length" class="download-box mt-22">
              <div class="dl-label">Contoh Penulisan & Template</div>
              <div class="dl-links">
                <a
                  v-for="(url, i) in eventData.filePanduan"
                  :key="'panduan-' + i"
                  :href="url"
                  target="_blank"
                  class="dl-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Panduan Penulisan {{ eventData.filePanduan.length > 1 ? i + 1 : '' }}
                </a>
                <a
                  v-for="(url, i) in eventData.fileTemplate"
                  :key="'template-' + i"
                  :href="url"
                  target="_blank"
                  class="dl-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Template Proposal {{ eventData.fileTemplate.length > 1 ? i + 1 : '' }}
                </a>
              </div>
            </div>

            <div class="check-row mt-22">
              <input type="checkbox" id="pernyataan" v-model="form.pernyataan" />
              <label for="pernyataan">Saya menyatakan bahwa usulan ini orisinal, bebas plagiarisme, dan belum pernah menerima pendanaan dari skema hibah lain pada tahun anggaran yang sama.</label>
            </div>
            <div class="error-msg" style="margin-top:4px">{{ checkError }}</div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Mengirim...' : 'Kirim Pendaftaran' }}
              </button>
              <button type="button" class="btn btn-outline" @click="resetForm">Bersihkan Formulir</button>
            </div>
          </form>
        </div>

        <!-- Success panel -->
        <div v-else class="success-panel show">
          <h3 style="color:#fff">Pendaftaran Berhasil Dikirim</h3>
          <p style="color:var(--green-100);max-width:52ch;margin:0 auto">Terima kasih. Nomor pendaftaran Anda adalah:</p>
          <div class="reg-no">{{ regNo }}</div>
          <p style="color:var(--green-100);max-width:52ch;margin:0 auto 20px">Mohon simpan nomor ini sebagai bukti pendaftaran. Tim LP2M akan mengirimkan konfirmasi dan jadwal reviu melalui email dan WhatsApp dalam 1x24 jam kerja.</p>
          <button class="btn btn-gold" @click="resetForm">Daftar Usulan Lain</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { HIBAH } from '@/data'
import { useHibahForm } from '@/composables/useHibahForm'
import { useHibahEvent } from '@/composables/useHibahEvent'
import RevealBlock from './RevealBlock.vue'
import CountdownTimer from './CountdownTimer.vue'

const { event: eventData } = useHibahEvent()
const activeHibahId = computed(() => eventData.value.id)

const {
  form, submitting, success: successForm, regNo,
  fieldErrors, checkError, submit, reset,
  prodiTerms, skemaOptionsAll
} = useHibahForm(activeHibahId)

// ── Combobox prodi (searchable) ──
const prodiQuery = ref('')
const prodiOpen = ref(false)
const prodiHighlight = ref(0)
const filteredProdi = computed(() => {
  const q = prodiQuery.value.trim().toLowerCase()
  const list = prodiTerms.value
  if (!q) return list
  return list.filter(p => p.toLowerCase().includes(q))
})
function onProdiInput() { prodiOpen.value = true; prodiHighlight.value = 0 }
function prodiMove(d: number) {
  const n = filteredProdi.value.length
  if (!n) return
  prodiHighlight.value = (prodiHighlight.value + d + n) % n
}
function selectProdi(p: string) {
  form.prodi = p
  prodiQuery.value = p
  prodiOpen.value = false
}
function prodiSelect(idx: number) {
  const p = filteredProdi.value[idx]
  if (p) selectProdi(p)
}
function onProdiBlur() {
  setTimeout(() => { prodiOpen.value = false }, 150)
}

// ── Combobox skema (searchable, parent+child+desc) ──
const skemaQuery = ref('')
const skemaOpen = ref(false)
const skemaHighlight = ref(0)
const filteredSkema = computed(() => {
  const q = skemaQuery.value.trim().toLowerCase()
  const list = skemaOptionsAll()
  if (!q) return list
  return list.filter(s => s.label.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
})
function onSkemaInput() { skemaOpen.value = true; skemaHighlight.value = 0 }
function skemaMove(d: number) {
  const n = filteredSkema.value.length
  if (!n) return
  skemaHighlight.value = (skemaHighlight.value + d + n) % n
}
function selectSkema(s: { label: string }) {
  form.skema = s.label
  skemaQuery.value = s.label
  skemaOpen.value = false
}
function skemaSelect(idx: number) {
  const s = filteredSkema.value[idx]
  if (s) selectSkema(s)
}
function onSkemaBlur() {
  setTimeout(() => { skemaOpen.value = false }, 150)
}

// eventData diambil dari useHibahEvent() — endpoint /itsi/v1/hibah/nearest-deadline

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    fieldErrors.proposal = 'Ukuran file maksimal 10MB.'
    input.value = ''
    return
  }
  if (file.type !== 'application/pdf') {
    fieldErrors.proposal = 'Hanya file PDF yang diperbolehkan.'
    input.value = ''
    return
  }
  fieldErrors.proposal = ''
  form.proposal = file
  form.proposalName = file.name
}

function submitForm() { submit() }
function resetForm() { reset() }
function fmtTimelineDate(d: string) {
  if (!d) return ''
  // Terima YYYY-MM-DD atau "01 Agu 2026" (format lama) → tampilkan id-ID pendek.
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return d
}
</script>

<style scoped>
.banner-eyebrow { color: var(--gold-soft); }
.banner-eyebrow::before { background: var(--gold-soft); }
.mt-16 { margin-top: 16px; }
.mt-22 { margin-top: 22px; }
.full-width { width: 100%; justify-content: center; }

/* Combobox prodi searchable */
.combobox { position: relative; }
.combobox input { width: 100%; }
.combobox-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 30;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid var(--line, #d8d0c0);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  max-height: 220px;
  overflow-y: auto;
}
.combobox-list li {
  padding: 9px 14px;
  font-size: 0.85rem;
  cursor: pointer;
}
.combobox-list li.active,
.combobox-list li:hover { background: var(--green-50, #eef4ef); }
.sk-label { display: block; font-weight: 600; }
.sk-desc { display: block; font-size: 0.76rem; color: var(--ink-soft, #6b6457); margin-top: 2px; }

/* File upload */
.file-input {
  padding: 10px;
  border: 1px dashed var(--line, #d8d0c0);
  border-radius: 6px;
  background: var(--green-50, #f8faf8);
  cursor: pointer;
}
.file-input:hover { border-color: var(--gold, #C99A3B); }
.file-hint { font-size: 0.75rem; color: var(--ink-soft, #6b6457); margin-top: 4px; }
.file-name { font-size: 0.82rem; color: var(--green-700, #2d5a3d); margin-top: 6px; font-weight: 600; }

/* Download box */
.download-box {
  background: var(--green-50, #f0f5f0);
  border: 1px solid var(--line, #d8d0c0);
  border-radius: 8px;
  padding: 16px 20px;
}
.dl-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--green-800, #1e3d2a);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}
.dl-links { display: flex; flex-wrap: wrap; gap: 10px; }
.dl-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid var(--line, #d8d0c0);
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--green-700, #2d5a3d);
  text-decoration: none;
  transition: all 0.2s;
}
.dl-link:hover {
  border-color: var(--gold, #C99A3B);
  color: var(--gold, #C99A3B);
  transform: translateY(-1px);
}
</style>
