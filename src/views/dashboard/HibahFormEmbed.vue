<template>
  <div class="form-panel">
    <!-- Loading config -->
    <div v-if="loadingConfig" class="loading-text">Memuat konfigurasi form...</div>

    <form v-else @submit.prevent="submitForm" novalidate>
      <div class="form-grid">
        <!-- Standard fields -->
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
        <!-- jenis pengusul dihapus dari UI (backend tetap pakai default 'Dosen') -->
        <div class="field" :class="{ invalid: fieldErrors.prodi }">
          <label for="prodi2">Program Studi / Unit Kerja *</label>
          <select id="prodi2" v-model="form.prodi">
            <option value="">Pilih program studi / unit</option>
            <option v-for="o in HIBAH.form.prodiOptions" :key="o" :value="o">{{ o }}</option>
          </select>
          <div class="error-msg">{{ fieldErrors.prodi }}</div>
        </div>
        <div class="field" :class="{ invalid: fieldErrors.skema }">
          <label for="skema2">Model Hibah *</label>
          <select id="skema2" v-model="form.skema">
            <option value="">Pilih model hibah</option>
            <option v-for="o in HIBAH.form.skemaOptions" :key="o" :value="o">{{ o }}</option>
          </select>
          <div class="error-msg">{{ fieldErrors.skema }}</div>
        </div>
        <div class="field full" :class="{ invalid: fieldErrors.judul }">
          <label for="judul2">Judul Usulan *</label>
          <input type="text" id="judul2" v-model="form.judul" placeholder="Judul lengkap penelitian atau program pengabdian" />
          <div class="error-msg">{{ fieldErrors.judul }}</div>
        </div>
        <div class="field full" :class="{ invalid: fieldErrors.ringkasan }">
          <label for="ringkasan2">Ringkasan Usulan *<span class="hint"> — maksimum 500 karakter</span></label>
          <textarea id="ringkasan2" v-model="form.ringkasan" maxlength="500" placeholder="Latar belakang, tujuan, dan luaran yang ditargetkan"></textarea>
          <div class="error-msg">{{ fieldErrors.ringkasan }}</div>
        </div>

        <!-- Custom fields from form builder -->
        <template v-for="f in customFields" :key="f.key">
          <div v-if="f.type === 'textarea'" class="field full" :class="{ invalid: fieldErrors[f.key] }">
            <label :for="'cf_' + f.key">{{ f.label }}{{ f.required ? ' *' : '' }}</label>
            <textarea :id="'cf_' + f.key" v-model="customValues[f.key]" maxlength="1000" :placeholder="'Masukkan ' + f.label.toLowerCase()"></textarea>
            <div class="error-msg">{{ fieldErrors[f.key] }}</div>
          </div>

          <div v-else-if="f.type === 'radio'" class="field full" :class="{ invalid: fieldErrors[f.key] }">
            <label>{{ f.label }}{{ f.required ? ' *' : '' }}</label>
            <div class="radio-group">
              <label v-for="opt in (f.options || [])" :key="opt">
                <input type="radio" :value="opt" v-model="customValues[f.key]" /> {{ opt }}
              </label>
            </div>
            <div class="error-msg">{{ fieldErrors[f.key] }}</div>
          </div>

          <div v-else :class="['field', { invalid: fieldErrors[f.key] }]">
            <label :for="'cf_' + f.key">{{ f.label }}{{ f.required ? ' *' : '' }}</label>
            <input
              :type="f.type"
              :id="'cf_' + f.key"
              v-model="customValues[f.key]"
              :placeholder="'Masukkan ' + f.label.toLowerCase()"
            />
            <div class="error-msg">{{ fieldErrors[f.key] }}</div>
          </div>
        </template>

        <!-- Standard optional fields (always after custom) -->
		<div class="field" :class="{ invalid: fieldErrors.jenis_hibah }">
		  <label for="jenis_hibah2">Jenis Hibah *</label>
		  <select id="jenis_hibah2" v-model="form.jenis_hibah">
			<option value="">Pilih jenis hibah</option>
			<option v-for="o in jenisTerms" :key="o.id" :value="o.name">{{ o.name }}</option>
		  </select>
		  <div class="error-msg">{{ fieldErrors.jenis_hibah }}</div>
		</div>
		<div class="field" :class="{ invalid: fieldErrors.sdgs }">
		  <label for="sdgs2">SDGs *</label>
		  <select id="sdgs2" v-model="form.sdgs">
			<option value="">Pilih SDGs</option>
			<option v-for="o in sdgsTerms" :key="o.id" :value="o.name">{{ o.name }}</option>
		  </select>
		  <div class="error-msg">{{ fieldErrors.sdgs }}</div>
		</div>
		<div class="field" :class="{ invalid: fieldErrors.kelompok_keahlian }">
		  <label for="kk2">Kelompok Keahlian *</label>
		  <select id="kk2" v-model="form.kelompok_keahlian">
			<option value="">Pilih kelompok keahlian</option>
			<option v-for="o in kkTerms" :key="o.id" :value="o.name">{{ o.name }}</option>
		  </select>
		  <div class="error-msg">{{ fieldErrors.kelompok_keahlian }}</div>
		</div>
		<div class="field full" :class="{ invalid: fieldErrors.email }">
		  <label for="email2">Email Aktif *</label>
		  <input type="email" id="email2" v-model="form.email" placeholder="nama@itsi.ac.id" />
		  <div class="error-msg">{{ fieldErrors.email }}</div>
		</div>
		<div class="field full" :class="{ invalid: fieldErrors.hp }">
		  <label for="hp2">Nomor WhatsApp Aktif *</label>
		  <input type="tel" id="hp2" v-model="form.hp" placeholder="08xx-xxxx-xxxx" />
		  <div class="error-msg">{{ fieldErrors.hp }}</div>
		</div>
	  </div>

	  <!-- Anggota tim dinamis (maks 2) -->
	  <div class="anggota-box mt-22">
		<div class="anggota-head">
		  <div class="anggota-title">Anggota Tim <span class="hint">(opsional, maks 2 orang)</span></div>
		  <div class="anggota-actions">
			<button type="button" class="btn btn-outline is-small" :disabled="form.anggota_list.length >= 2" @click="addAnggota('dosen')">+ Dosen</button>
			<button type="button" class="btn btn-outline is-small" :disabled="form.anggota_list.length >= 2" @click="addAnggota('mahasiswa')">+ Mahasiswa</button>
		  </div>
		</div>
		<div v-if="!form.anggota_list.length" class="anggota-empty">Belum ada anggota. Klik "+ Dosen" atau "+ Mahasiswa" untuk menambah.</div>
		<div v-for="(m, i) in form.anggota_list" :key="i" class="anggota-item" :class="{ invalid: fieldErrors['anggota_list_' + i] }">
		  <div class="anggota-item-head">
			<span class="anggota-badge" :class="m.tipe">Anggota #{{ i + 1 }} — {{ m.tipe === 'mahasiswa' ? 'Mahasiswa' : 'Dosen' }}</span>
			<button type="button" class="anggota-remove" @click="removeAnggota(i)">✕ Hapus</button>
		  </div>
		  <div class="anggota-grid">
			<div class="field">
			  <label :for="'ang_nomor2_' + i">{{ m.tipe === 'mahasiswa' ? 'NIM' : 'NIDN' }} *</label>
			  <input :id="'ang_nomor2_' + i" type="text" v-model="m.nomor" :placeholder="m.tipe === 'mahasiswa' ? 'cth. 2024xxxxxx' : 'cth. 0112345601'" />
			</div>
			<div class="field">
			  <label :for="'ang_nama2_' + i">Nama Lengkap *</label>
			  <input :id="'ang_nama2_' + i" type="text" v-model="m.nama" placeholder="Nama lengkap tanpa gelar" />
			</div>
			<div v-if="m.tipe === 'mahasiswa'" class="field">
			  <label :for="'ang_prodi2_' + i">Program Studi *</label>
			  <select :id="'ang_prodi2_' + i" v-model="m.prodi">
				<option value="">Pilih prodi</option>
				<option v-for="p in prodiTerms" :key="p" :value="p">{{ p }}</option>
			  </select>
			</div>
		  </div>
		  <div class="error-msg">{{ fieldErrors['anggota_list_' + i] }}</div>
      </div>

      <div class="check-row mt-22">
        <input type="checkbox" id="pernyataan2" v-model="form.pernyataan" />
        <label for="pernyataan2">Saya menyatakan bahwa usulan ini orisinal, bebas plagiarisme, dan belum pernah menerima pendanaan dari skema hibah lain pada tahun anggaran yang sama.</label>
      </div>
      <div class="error-msg" style="margin-top:4px">{{ checkError }}</div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Mengirim...' : 'Kirim Pendaftaran' }}
        </button>
      </div>
    </form>

    <!-- Success -->
    <div v-if="successForm" class="success-panel show" style="margin-top:20px">
      <h3 style="color:#fff">Pendaftaran Berhasil Dikirim</h3>
      <p style="color:var(--green-100)">Nomor pendaftaran: <strong>{{ regNo }}</strong></p>
      <button class="btn btn-gold" @click="reset">Daftar Usulan Lain</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { HIBAH } from '@/data'
import { useHibahForm } from '@/composables/useHibahForm'

const props = defineProps<{ hibahId?: number | null }>()
const hibahIdRef = ref<number | null>(props.hibahId ?? null)

const {
  form, submitting, success: successForm, regNo,
  fieldErrors, checkError, customFields, customValues, loadingConfig,
  prodiTerms, jenisTerms, sdgsTerms, kkTerms,
  addAnggota, removeAnggota,
  submit, reset, loadFormConfig
} = useHibahForm(hibahIdRef)

function submitForm() { submit() }

// Reload form config when hibahId changes
watch(() => props.hibahId, (newId) => {
  hibahIdRef.value = newId ?? null
  loadFormConfig()
})
</script>

<style scoped>
.form-panel { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 28px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }
.field label { font-size: 0.82rem; font-weight: 600; color: var(--green-800); }
.field .hint { font-size: 0.72rem; color: var(--ink-soft); font-weight: 400; }
.field input, .field select, .field textarea {
  border: 1px solid var(--line); background: #fff; border-radius: 4px;
  padding: 10px 12px; font-family: inherit; font-size: 0.88rem;
  color: var(--ink); outline: none;
}
.field textarea { resize: vertical; min-height: 80px; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--green-600); box-shadow: 0 0 0 3px rgba(47,107,79,0.14); }
.radio-group { display: flex; gap: 16px; flex-wrap: wrap; padding-top: 4px; }
.radio-group label { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 400; color: var(--ink); }
.check-row { display: flex; gap: 10px; align-items: flex-start; background: var(--paper-2); border-radius: 5px; padding: 12px 14px; font-size: 0.82rem; color: var(--ink-soft); }
.check-row input { margin-top: 2px; }
.form-actions { display: flex; align-items: center; gap: 14px; margin-top: 8px; }
.error-msg { font-size: 0.72rem; color: var(--rust); min-height: 1em; }
.field.invalid input, .field.invalid select, .field.invalid textarea { border-color: var(--rust); }
.mt-22 { margin-top: 20px; }
.anggota-box { background: var(--green-50, #f0f5f0); border: 1px solid var(--line); border-radius: 8px; padding: 16px 20px; }
.anggota-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
.anggota-title { font-size: 0.82rem; font-weight: 700; color: var(--green-800); text-transform: uppercase; letter-spacing: 0.5px; }
.anggota-title .hint { text-transform: none; letter-spacing: 0; font-weight: 400; }
.anggota-actions { display: flex; gap: 8px; }
.btn.is-small { padding: 5px 12px; font-size: 0.78rem; }
.anggota-empty { font-size: 0.8rem; color: var(--ink-soft); padding: 10px 0; }
.anggota-item { border: 1px solid var(--line); background: #fff; border-radius: 6px; padding: 12px 14px; margin-top: 10px; }
.anggota-item.invalid { border-color: var(--rust); }
.anggota-item-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.anggota-badge { font-size: 0.74rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: var(--green-100); color: var(--green-800); }
.anggota-badge.mahasiswa { background: #e8ecf7; color: #2c4a8f; }
.anggota-remove { border: none; background: none; color: var(--rust); font-size: 0.76rem; cursor: pointer; padding: 2px 6px; }
.anggota-remove:hover { text-decoration: underline; }
.anggota-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px 16px; }
.loading-text { color: var(--ink-soft); font-size: 0.9rem; padding: 16px 0; text-align: center; }
.success-panel { background: var(--green-800); color: #fff; border-radius: 8px; padding: 28px; text-align: center; }
.success-panel.show { display: block; }
@media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } }
</style>
