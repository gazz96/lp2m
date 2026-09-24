<template>
  <section class="lap-admin">
    <!-- Status tahap: membuka form peserta, keputusan reviewer, dan pemicu email. -->
    <div class="lap-status">
      <SelectField
        v-model="model[stage.statusKey]"
        :label="`Status Tahap — ${stage.label}`"
        :options="LAP_STATUS_OPTIONS"
        :hint="'Buka Form Peserta = email undangan + tautan baru. Direvisi = email permintaan perbaikan + tautan baru. Diterima = tautan ditutup permanen.'"
        style="width:100%"
      />
      <p v-if="accepted" class="lap-note is-ok">
        ✓ Laporan <strong>Diterima</strong> — tautan form peserta ditutup permanen, tidak ada email yang dikirim.
      </p>
      <p v-else-if="needsRevision" class="lap-note is-revise">
        ⚠ Status <strong>Direvisi</strong> — tautan baru dibuat &amp; email permintaan perbaikan dikirim
        ke peserta (sekali per status ini). Tautan sebelumnya sudah tidak berlaku.
      </p>
      <p v-else-if="status === LAP_STATUS_DIBUKA" class="lap-note is-ok">
        ✎ Form dibuka — email undangan + tautan bertoken terkirim otomatis (sekali per pembukaan).
      </p>
      <p v-else-if="submittedAt" class="lap-note is-ok">
        ✓ Peserta sudah mengirim form ini pada <strong>{{ submittedAt }}</strong> —
        pilih <strong>Diterima</strong> atau <strong>Direvisi</strong> sebagai keputusan reviewer.
      </p>
      <p v-else class="lap-note">
        Form peserta belum dibuka. Pilih <strong>Buka Form Peserta</strong> untuk mengirim email undangan.
      </p>
    </div>

    <!-- Field teks tahap. -->
    <div class="lap-grid">
      <template v-for="f in stage.text" :key="f.key">
        <TextareaField
          v-if="f.type === 'textarea'"
          v-model="model[f.key]"
          :label="f.label"
          :hint="f.hint"
          :rows="f.rows ?? 3"
          full
        />
        <SelectField
          v-else-if="f.type === 'select'"
          v-model="model[f.key]"
          :label="f.label"
          :hint="f.hint"
          :options="f.options || []"
          style="width:100%"
        />
        <TextField
          v-else
          v-model="model[f.key]"
          :label="f.label"
          :hint="f.hint"
          :placeholder="f.placeholder"
          :type="f.type === 'url' ? 'url' : 'text'"
        />
      </template>
    </div>

    <!-- Berkas hasil peserta (template TIDAK diunggah dari sini — lihat catatan di atas). -->
    <div class="lap-files">
      <h4 class="lap-files__title">Berkas hasil (diunggah peserta, admin boleh mengganti)</h4>
      <div class="lap-file" v-for="f in participantFiles" :key="f.param">
        <div class="lap-file__head">
          <span class="lap-file__label">
            {{ f.label }}
            <em class="lap-file__format">{{ LAP_FORMAT_LABEL[f.ext] }}</em>
          </span>
          <a
            v-if="detail[f.urlKey]"
            :href="detail[f.urlKey]"
            target="_blank"
            rel="noopener"
            class="lap-file__link"
          >⬇ Download tersimpan</a>
          <span v-else class="lap-file__empty">○ Belum ada berkas</span>
        </div>

        <FileField
          :label="files[f.param] ? `Ganti file: ${files[f.param]?.name}` : `Upload / Ganti — ${f.label}`"
          :hint="f.hint"
          :accept="LAP_ACCEPT[f.ext]"
          :error="errors[f.param]"
          :empty-label="files[f.param] ? '' : '○ Belum ada file dipilih'"
          @change="(e: Event) => emit('pick', f.param, e)"
        />
        <button
          v-if="files[f.param]"
          type="button"
          class="components-button is-tertiary is-small lap-file__cancel"
          @click="emit('clear', f.param)"
        >Batal</button>
      </div>
    </div>

    <!-- Template: read-only. Diunggah SEKALI di event hibah → tidak berulang per peserta. -->
    <div class="lap-templates">
      <h4 class="lap-files__title">Template (milik event hibah — peserta hanya mengunduh)</h4>
      <p class="lap-note">
        Template diunggah <strong>sekali</strong> di menu <strong>Hibah → Panduan &amp; Template</strong>,
        lalu semua peserta mengunduhnya di halaman Track Status. Tidak ada unggahan template per pendaftaran.
      </p>
      <ul class="lap-templates__list">
        <li v-for="f in templateFiles" :key="f.urlKey">
          <span class="lap-file__label">{{ f.label }}</span>
          <a
            v-if="templates[f.urlKey]"
            :href="templates[f.urlKey]"
            target="_blank"
            rel="noopener"
            class="lap-file__link"
          >⬇ Download</a>
          <em v-else class="lap-file__empty">belum diunggah di event</em>
        </li>
      </ul>
      <a
        v-if="hibahEditUrl"
        :href="hibahEditUrl"
        target="_blank"
        rel="noopener"
        class="lap-file__link"
      >Buka event hibah untuk mengunggah / mengganti template ↗</a>
      <p v-else class="lap-file__empty">Pendaftaran ini belum terhubung ke event hibah.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SelectField from '@/components/SelectField.vue'
import TextField from '@/components/TextField.vue'
import TextareaField from '@/components/TextareaField.vue'
import FileField from '@/components/FileField.vue'
import {
  LAP_ACCEPT,
  LAP_FORMAT_LABEL,
  LAP_STATUS_DIBUKA,
  LAP_STATUS_DIREVISI,
  LAP_STATUS_DITERIMA,
  LAP_STATUS_OPTIONS,
  lapParticipantFiles,
  lapTemplateFiles,
  type LapStage,
} from '@/data/lapStages'

/** Panel admin untuk satu tahap lap (Lap. Kemajuan / Lap. Akhir). */
const props = defineProps<{
  stage: LapStage
  /** Data detail pendaftaran dari API (untuk tautan berkas & waktu kirim). */
  detail: Record<string, any>
  /** Nilai form (field teks + status tahap) — dimutasi langsung lewat v-model. */
  model: Record<string, any>
  /** Berkas peserta yang akan diunggah, keyed by `param`. */
  files: Record<string, File | null>
  /** Pesan error per `param`. */
  errors: Record<string, string>
  /** URL edit post hibah — tautan untuk mengganti template level event. */
  hibahEditUrl?: string
}>()

const emit = defineEmits<{
  pick: [param: string, event: Event]
  clear: [param: string]
}>()

const submittedAt = computed(() => String(props.detail?.[props.stage.submittedKey] || '').trim())

/** Status tahap aktif — dari form admin (`detail` di-merge ke `model` oleh parent). */
const status = computed(() => String(props.model?.[props.stage.statusKey] || ''))
/** Keputusan akhir: laporan diterima. */
const accepted = computed(() => status.value === LAP_STATUS_DITERIMA)
/** Keputusan: peserta diminta memperbaiki. */
const needsRevision = computed(() => status.value === LAP_STATUS_DIREVISI)

/** Berkas hasil peserta — satu-satunya yang bisa diunggah dari sini. */
const participantFiles = computed(() => lapParticipantFiles(props.stage))

/**
 * Template milik EVENT: hanya dibaca dari payload (`detail`).
 * Nilainya diambil dari CPT hibah, bukan postmeta pendaftaran.
 */
const templateFiles = computed(() => lapTemplateFiles(props.stage))
const templates = computed(() => {
  const out: Record<string, string> = {}
  for (const f of templateFiles.value) out[f.urlKey] = String(props.detail?.[f.urlKey] || '')
  return out
})
</script>

<style scoped>
.lap-admin {
  padding: 16px 18px 20px;
  display: grid;
  gap: 16px;
}
.lap-status {
  padding: 12px 14px;
  background: #f0f6fc;
  border: 1px solid #c3d9ef;
  border-radius: 8px;
}
.lap-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--wp-text-muted);
  font-weight: 400;
}
.lap-note.is-ok {
  color: #1a7f37;
}
.lap-note.is-revise {
  color: #b45309;
}
.lap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.lap-files {
  display: grid;
  gap: 12px;
}
.lap-files__title {
  margin: 0;
  font-size: 13px;
  color: var(--wp-text);
  border-bottom: 1px solid var(--wp-border-light);
  padding-bottom: 6px;
}
.lap-file {
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.lap-file__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.lap-file__label {
  font-size: 13px;
  font-weight: 600;
}
.lap-file__format {
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  color: var(--wp-text-muted);
  margin-left: 4px;
}
.lap-file__link {
  font-size: 12px;
  font-weight: 600;
  color: #2271b3;
  text-decoration: none;
}
.lap-file__link:hover {
  text-decoration: underline;
}
.lap-file__empty {
  font-size: 12px;
  color: var(--wp-text-muted);
  font-style: italic;
}
.lap-file__cancel {
  margin-top: 6px;
}
.lap-templates {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}
.lap-templates__list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 4px;
}
.lap-templates__list li {
  font-size: 13px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 782px) {
  .lap-grid {
    grid-template-columns: 1fr;
  }
}
</style>
