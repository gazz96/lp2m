<template>
  <div class="form-panel">
    <!-- Pendaftaran ditutup (deadline lewat) -->
    <div v-if="closed" class="closed-panel">
      <h3 style="color:var(--rust)">Pendaftaran Ditutup</h3>
      <p style="color:var(--ink-soft);margin:8px 0 0">
        Pendaftaran hibah ini sudah melewati batas akhir
        ({{ props.deadline ? new Date(props.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'deadline' }}).
        Formulir pendaftaran tidak dapat diisi lagi.
      </p>
    </div>

    <!-- Loading config -->
    <div v-else-if="loadingConfig" class="loading-text">Memuat konfigurasi form...</div>

    <form v-else @submit.prevent="submitForm" novalidate>
      <div class="form-grid">
        <!-- Standard fields -->
        <TextField
          id="nama"
          v-model="form.nama"
          label="Nama Lengkap & Gelar"
          placeholder="cth. Dr. Andi Pratama, S.Kom., M.T."
          required
          :error="fieldErrors.nama"
          :invalid="!!fieldErrors.nama"
        />
        <TextField
          id="nip"
          v-model="form.nip"
          label="NIDN / NIDK"
          placeholder="cth. 0112345601"
          required
          :error="fieldErrors.nip"
          :invalid="!!fieldErrors.nip"
        />
        <!-- jenis pengusul dihapus dari UI (backend tetap pakai default 'Dosen') -->
        <SelectField
          id="prodi2"
          v-model="form.prodi"
          label="Program Studi / Unit Kerja"
          empty-label="Pilih program studi / unit"
          required
          :options="prodiTerms"
          :error="fieldErrors.prodi"
          :invalid="!!fieldErrors.prodi"
        />
        <SelectField
          id="skema2"
          v-model="form.skema"
          label="Model Hibah"
          empty-label="Pilih model hibah"
          required
          :options="skemaTerms.map((o: any) => o.label || o.name)"
          :error="fieldErrors.skema"
          :invalid="!!fieldErrors.skema"
        />
        <TextField
          id="judul2"
          v-model="form.judul"
          label="Judul Usulan"
          placeholder="Judul lengkap penelitian atau program pengabdian"
          full
          required
          :error="fieldErrors.judul"
          :invalid="!!fieldErrors.judul"
        />
        <TextareaField
          id="ringkasan2"
          v-model="form.ringkasan"
          label="Ringkasan Usulan"
          hint="maksimum 500 karakter"
          placeholder="Latar belakang, tujuan, dan luaran yang ditargetkan"
          :maxlength="500"
          :rows="4"
          full
          required
          :error="fieldErrors.ringkasan"
          :invalid="!!fieldErrors.ringkasan"
        />

        <!-- Custom fields from form builder -->
        <template v-for="f in customFields" :key="f.key">
          <div v-if="f.type === 'radio'" class="field full" :class="{ invalid: fieldErrors[f.key] }">
            <label>{{ f.label }}{{ f.required ? ' *' : '' }}</label>
            <div class="radio-group">
              <label v-for="opt in (f.options || [])" :key="opt">
                <input type="radio" :value="opt" v-model="customValues[f.key]" /> {{ opt }}
              </label>
            </div>
            <div class="error-msg">{{ fieldErrors[f.key] }}</div>
          </div>
          <TextareaField
            v-else-if="f.type === 'textarea'"
            :id="'cf_' + f.key"
            v-model="customValues[f.key]"
            :label="f.label"
            :required="f.required"
            :maxlength="1000"
            full
            :placeholder="'Masukkan ' + f.label.toLowerCase()"
            :error="fieldErrors[f.key]"
            :invalid="!!fieldErrors[f.key]"
          />
          <TextField
            v-else
            :id="'cf_' + f.key"
            v-model="customValues[f.key]"
            :label="f.label"
            :type="f.type"
            :required="f.required"
            :placeholder="'Masukkan ' + f.label.toLowerCase()"
            :error="fieldErrors[f.key]"
            :invalid="!!fieldErrors[f.key]"
          />
        </template>

        <!-- Standard optional fields (always after custom) -->
		<SelectField
		  id="jenis_hibah2"
		  v-model="form.jenis_hibah"
		  label="Jenis Hibah"
		  empty-label="Pilih jenis hibah"
		  required
		  :options="jenisTerms.map((o: any) => o.label || o.name)"
		  :error="fieldErrors.jenis_hibah"
		  :invalid="!!fieldErrors.jenis_hibah"
		/>
		<SelectField
		  id="sdgs2"
		  v-model="form.sdgs"
		  label="SDGs"
		  empty-label="Pilih SDGs"
		  required
		  :options="sdgsTerms.map((o: any) => o.name)"
		  :error="fieldErrors.sdgs"
		  :invalid="!!fieldErrors.sdgs"
		/>
		<SelectField
		  id="kk2"
		  v-model="form.kelompok_keahlian"
		  label="Kelompok Keahlian"
		  empty-label="Pilih kelompok keahlian"
		  required
		  :options="kkTerms.map((o: any) => o.label || o.name)"
		  :error="fieldErrors.kelompok_keahlian"
		  :invalid="!!fieldErrors.kelompok_keahlian"
		/>
		<TextField
		  id="email2"
		  v-model="form.email"
		  type="email"
		  label="Email Aktif"
		  placeholder="nama@itsi.ac.id"
		  full
		  required
		  :error="fieldErrors.email"
		  :invalid="!!fieldErrors.email"
		/>
		<TextField
		  id="hp2"
		  v-model="form.hp"
		  type="tel"
		  label="Nomor WhatsApp Aktif"
		  placeholder="08xx-xxxx-xxxx"
		  full
		  required
		  :error="fieldErrors.hp"
		  :invalid="!!fieldErrors.hp"
		/>
	  </div>

	  <!-- Anggota tim dinamis (maks 2 dosen + 2 mahasiswa) -->
	  <div class="anggota-box mt-22">
		<div class="anggota-head">
		  <div class="anggota-title">Anggota Tim <span class="hint">(opsional, maks 2 dosen + 2 mahasiswa)</span></div>
		  <div class="anggota-actions">
			<button type="button" class="btn btn-outline is-small" :disabled="dosenCount >= 2" @click="addAnggota('dosen')">+ Dosen</button>
			<button type="button" class="btn btn-outline is-small" :disabled="mhsCount >= 2" @click="addAnggota('mahasiswa')">+ Mahasiswa</button>
		  </div>
		</div>
		<div v-if="!form.anggota_list.length" class="anggota-empty">Belum ada anggota. Klik "+ Dosen" atau "+ Mahasiswa" untuk menambah.</div>
		<div v-for="(m, i) in form.anggota_list" :key="i" class="anggota-item" :class="{ invalid: fieldErrors['anggota_list_' + i] }">
		  <div class="anggota-item-head">
			<span class="anggota-badge" :class="m.tipe">Anggota #{{ i + 1 }} — {{ m.tipe === 'mahasiswa' ? 'Mahasiswa' : 'Dosen' }}</span>
			<button type="button" class="anggota-remove" @click="removeAnggota(i)">✕ Hapus</button>
		  </div>
		  <div class="anggota-grid">
			<TextField
			  :id="'ang_nomor2_' + i"
			  v-model="m.nomor"
			  :label="(m.tipe === 'mahasiswa' ? 'NIM' : 'NIDN') + ' *'"
			  :placeholder="m.tipe === 'mahasiswa' ? 'cth. 2024xxxxxx' : 'cth. 0112345601'"
			/>
			<TextField
			  :id="'ang_nama2_' + i"
			  v-model="m.nama"
			  label="Nama Lengkap *"
			  placeholder="Nama lengkap tanpa gelar"
			/>
			<SelectField
			  v-if="m.tipe === 'mahasiswa'"
			  :id="'ang_prodi2_' + i"
			  v-model="m.prodi"
			  label="Program Studi *"
			  empty-label="Pilih prodi"
			  :options="prodiTerms"
			/>
		  </div>
		  <div class="error-msg">{{ fieldErrors['anggota_list_' + i] }}</div>
      </div>
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
import { ref, watch, computed } from 'vue'
import { useHibahForm } from '@/composables/useHibahForm'
import TextField from '@/components/TextField.vue'
import SelectField from '@/components/SelectField.vue'
import TextareaField from '@/components/TextareaField.vue'

const props = withDefaults(defineProps<{ hibahId?: number | null; deadline?: string }>(), {
  hibahId: null,
  deadline: undefined
})
const hibahIdRef = ref<number | null>(props.hibahId ?? null)

const {
  form, submitting, success: successForm, regNo,
  fieldErrors, checkError, customFields, customValues, loadingConfig,
  prodiTerms, skemaTerms, jenisTerms, sdgsTerms, kkTerms,
  addAnggota, removeAnggota,
  isDeadlinePassed,
  submit, reset, loadFormConfig
} = useHibahForm(hibahIdRef, computed(() => props.deadline))

// Form diganti panel "pendaftaran ditutup" bila sudah melewati deadline.
const closed = computed(() => isDeadlinePassed())

// Jumlah anggota per tipe untuk cap 2 dosen + 2 mahasiswa
const dosenCount = computed(() => form.anggota_list.filter(m => m.tipe === 'dosen').length)
const mhsCount = computed(() => form.anggota_list.filter(m => m.tipe === 'mahasiswa').length)

function submitForm() { submit() }

// Reload form config when hibahId changes
watch(() => props.hibahId, (newId) => {
  hibahIdRef.value = newId ?? null
  loadFormConfig()
})
</script>

<style scoped>
.form-panel { background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 28px; }
.closed-panel { text-align: center; padding: 40px 24px; }
.closed-panel h3 { margin: 0; }
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
