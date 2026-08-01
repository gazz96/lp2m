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
            <div v-for="t in eventData.timeline" :key="t.date" class="t-row">
              <span class="date">{{ t.date }}</span>
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
                <select id="prodi" v-model="form.prodi">
                  <option value="">Pilih program studi / unit</option>
                  <option v-for="o in HIBAH.form.prodiOptions" :key="o" :value="o">{{ o }}</option>
                </select>
                <div class="error-msg">{{ fieldErrors.prodi }}</div>
              </div>
              <div class="field" :class="{ invalid: fieldErrors.skema }">
                <label for="skema">Skema Hibah yang Diikuti *</label>
                <select id="skema" v-model="form.skema">
                  <option value="">Pilih skema hibah</option>
                  <option v-for="o in HIBAH.form.skemaOptions" :key="o" :value="o">{{ o }}</option>
                </select>
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
import { ref, onMounted } from 'vue'
import { HIBAH, SITE } from '@/data'
import type { HibahEvent } from '@/types'
import { useHibahForm } from '@/composables/useHibahForm'
import RevealBlock from './RevealBlock.vue'
import CountdownTimer from './CountdownTimer.vue'

const activeHibahId = ref<number | null>(null)

const {
  form, submitting, success: successForm, regNo,
  fieldErrors, checkError, submit, reset
} = useHibahForm(activeHibahId)

const eventData = ref({
  bannerTitle: HIBAH.banner.title,
  bannerDesc: HIBAH.banner.desc,
  deadline: HIBAH.banner.deadline,
  deadlineLabel: HIBAH.banner.deadlineLabel,
  timeline: HIBAH.banner.timeline,
  info: HIBAH.banner.info,
})

onMounted(async () => {
  try {
    const url = `${SITE.apiBase}/hibah?status_hibah=aktif&per_page=1`
    const res = await fetch(url)
    if (!res.ok) return
    const data: HibahEvent[] = await res.json()
    if (data.length > 0) {
      const ev = data[0]
      activeHibahId.value = ev.id
      eventData.value = {
        bannerTitle: new DOMParser().parseFromString(ev.title.rendered, 'text/html').body.textContent || HIBAH.banner.title,
        bannerDesc: new DOMParser().parseFromString(ev.excerpt.rendered, 'text/html').body.textContent || HIBAH.banner.desc,
        deadline: ev.deadline || HIBAH.banner.deadline,
        deadlineLabel: ev.deadline_label || HIBAH.banner.deadlineLabel,
        timeline: ev.timeline_items?.length ? ev.timeline_items : HIBAH.banner.timeline,
        info: ev.info_tambahan ? ev.info_tambahan.split('\n').filter((l: string) => l.trim()) : HIBAH.banner.info,
      }
    }
  } catch {
    // Network error — use static content.json
  }
})

function submitForm() { submit() }
function resetForm() { reset() }
</script>

<style scoped>
.banner-eyebrow { color: var(--gold-soft); }
.banner-eyebrow::before { background: var(--gold-soft); }
.mt-16 { margin-top: 16px; }
.mt-22 { margin-top: 22px; }
.full-width { width: 100%; justify-content: center; }
</style>
