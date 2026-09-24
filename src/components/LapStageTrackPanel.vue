<template>
  <section class="lap-track">
    <!-- Status tahap + penjelasan mode (baca / isi / selesai). -->
    <div class="lap-stage">
      <span class="lap-stage__label">Status {{ stage.label }}</span>
      <StatusBadge :status="badgeStatus" :text="statusLabel" />
    </div>

    <p v-if="accepted" class="lap-stage is-done">
      ✓ Form {{ stage.label }} <strong>Diterima</strong> oleh reviewer{{ submittedAt ? ' (dikirim ' + submittedAt + ')' : '' }} —
      halaman ini hanya menampilkan data (mode baca).
    </p>
    <p v-else-if="needsRevision" class="lap-stage is-revise">
      ⚠ Reviewer meminta <strong>perbaikan</strong> pada form {{ stage.label }} —
      <template v-if="canEdit">perbaiki isian & unggah ulang berkas di bawah, lalu kirim ulang.</template>
      <template v-else>buka tautan formulir dari email Anda untuk memperbaiki & mengirim ulang.</template>
    </p>
    <p v-else-if="canEdit" class="lap-stage is-open">
      ✎ Form dibuka — lengkapi isian & unggah berkas di bawah, lalu tekan
      <strong>Kirim {{ stage.label }}</strong>. Tautan ini berlaku satu kali kirim.
    </p>
    <p v-else-if="submitted" class="lap-stage is-done">
      ✓ Form {{ stage.label }} sudah dikirim{{ submittedAt ? ' pada ' + submittedAt : '' }} —
      menunggu keputusan reviewer. Halaman ini hanya menampilkan data (mode baca).
    </p>
    <p v-else class="lap-hint">
      Tahap ini belum dibuka. Setelah reviewer membuka form, tautan pengisian dikirim ke email Anda.
    </p>

    <!-- Template milik EVENT — selalu read-only, hanya tautan unduh. -->
    <template v-if="templates.length">
      <h3 class="lap-sub">Template (unduh, isi, lalu unggah hasilnya)</h3>
      <RevisionStatus
        v-for="t in templates"
        :key="t.urlKey"
        :variant="t.url ? 'ok' : 'empty'"
        :text="t.url ? `⬇ ${t.label}` : `${t.label}: — (belum diunggah admin di event hibah ini)`"
        :href="t.url || undefined"
        :link-label="t.url ? `Download ${LAP_FORMAT_LABEL[t.ext]}` : 'Lihat berkas'"
      />
    </template>

    <!-- Mode baca: nilai teks apa adanya (kosong → "—"). -->
    <template v-if="!canEdit">
      <TrackTable class="lap-table" variant="compact">
        <TrackRow
          v-for="f in stage.text"
          :key="f.key"
          :label="f.label"
          :value="textOrDash(data[f.key])"
          :empty="!hasText(data[f.key])"
        />
      </TrackTable>

      <h3 class="lap-sub">Berkas yang sudah tersimpan</h3>
      <RevisionStatus
        v-for="f in participantFiles"
        :key="f.urlKey"
        :variant="data[f.urlKey] ? 'ok' : 'empty'"
        :text="data[f.urlKey] ? `✓ ${f.label} sudah tersimpan.` : `${f.label}: — (belum ada berkas)`"
        :href="data[f.urlKey] || undefined"
      />
    </template>

    <!-- Mode edit: form isian + unggah. -->
    <form v-else class="lap-form" @submit.prevent="emit('submit')">
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

      <FileField
        v-for="f in participantFiles"
        :key="f.param"
        :label="`Upload ${f.label}${f.required ? ' (wajib)' : ' (opsional)'}`"
        :hint="`Format: ${LAP_FORMAT_LABEL[f.ext]}, maksimal 10 MB.${
          data[f.urlKey] && !files[f.param] ? ' Berkas lama tetap dipakai bila tidak diganti.' : ''
        }`"
        :accept="LAP_ACCEPT[f.ext]"
        :error="errors[f.param]"
        :empty-label="files[f.param] ? '' : data[f.urlKey] ? '○ Berkas lama masih tersimpan' : '○ Belum ada file dipilih'"
        @change="(e: Event) => emit('pick', f.param, e)"
      />

      <button type="submit" class="btn btn-primary" :disabled="loading || !canSubmit">
        {{ loading ? 'Mengirim…' : `Kirim ${stage.label}` }}
      </button>
      <p v-if="!canSubmit" class="lap-hint">
        Berkas wajib: {{ requiredLabels }}. Tombol aktif setelah berkas wajib dipilih.
      </p>
    </form>

    <p v-if="message" class="lap-msg" :class="{ 'is-error': error }">{{ message }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hasText, textOrDash } from '@/utils/text'
import StatusBadge from '@/components/StatusBadge.vue'
import TrackTable from '@/components/TrackTable.vue'
import TrackRow from '@/components/TrackRow.vue'
import RevisionStatus from '@/components/RevisionStatus.vue'
import TextField from '@/components/TextField.vue'
import TextareaField from '@/components/TextareaField.vue'
import SelectField from '@/components/SelectField.vue'
import FileField from '@/components/FileField.vue'
import {
  LAP_ACCEPT,
  LAP_FORMAT_LABEL,
  LAP_STATUS_DIKIRIM,
  LAP_STATUS_DIREVISI,
  LAP_STATUS_DITERIMA,
  LAP_STATUS_LABELS,
  lapParticipantFiles,
  lapTemplateFiles,
  type LapStage,
} from '@/data/lapStages'

/** Panel peserta untuk satu tahap lap — mode baca atau form bertoken. */
const props = withDefaults(
  defineProps<{
    stage: LapStage
    /** Data efektif tahap (payload status publik atau payload token). */
    data: Record<string, any>
    /** true hanya bila token form terverifikasi dan belum dikirim. */
    canEdit?: boolean
    /** Nilai form saat mode edit (field teks). */
    model?: Record<string, any>
    /** Berkas yang sudah dipilih, keyed by `param`. */
    files?: Record<string, File | null>
    /** Pesan error per `param`. */
    errors?: Record<string, string>
    loading?: boolean
    canSubmit?: boolean
    message?: string
    error?: boolean
  }>(),
  {
    canEdit: false,
    model: () => ({}),
    files: () => ({}),
    errors: () => ({}),
    loading: false,
    canSubmit: false,
    message: '',
    error: false,
  },
)

const emit = defineEmits<{
  pick: [param: string, event: Event]
  submit: []
}>()

/** Status tahap dari backend: '' | 'direvisi' | 'diterima' (+ legacy 'dibuka'/'dikirim'). */
const status = computed(() => String(props.data?.status || ''))
const submitted = computed(
  () => status.value === LAP_STATUS_DIKIRIM || Boolean(String(props.data?.[props.stage.submittedKey] || '').trim()),
)
/** Keputusan akhir reviewer: laporan diterima → murni mode baca. */
const accepted = computed(() => status.value === LAP_STATUS_DITERIMA)
/** Reviewer minta perbaikan → form dibuka ulang bila token masih valid. */
const needsRevision = computed(() => status.value === LAP_STATUS_DIREVISI)

const submittedAt = computed(() => String(props.data?.[props.stage.submittedKey] || ''))
const statusLabel = computed(() => LAP_STATUS_LABELS[status.value] ?? 'Belum Dibuka')
/** Badge: hijau saat diterima, oranye saat minta revisi, kuning saat menunggu. */
const badgeStatus = computed(() => {
  if (accepted.value) return 'approved'
  if (needsRevision.value) return 'direvisi'
  return 'under_review'
})

const participantFiles = computed(() => lapParticipantFiles(props.stage))

const templates = computed(() =>
  lapTemplateFiles(props.stage).map((f) => ({ ...f, url: String(props.data?.[f.urlKey] || '') })),
)

const requiredLabels = computed(() =>
  participantFiles.value
    .filter((f) => f.required)
    .map((f) => f.label)
    .join(', '),
)
</script>

<style scoped>
.lap-track {
  padding: 16px 18px 20px;
}
.lap-stage {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid var(--paper-2);
  border-radius: 6px;
}
.lap-stage__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.lap-stage.is-done {
  display: block;
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
  font-size: 13px;
}
.lap-stage.is-open {
  display: block;
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
  font-size: 13px;
}
.lap-stage.is-revise {
  display: block;
  background: #ffedd5;
  border-color: #fdba74;
  color: #b45309;
  font-size: 13px;
}
.lap-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--ink-soft);
}
.lap-sub {
  margin: 18px 0 2px;
  font-size: 13px;
  color: var(--ink);
}
.lap-table {
  margin-top: 8px;
}
.lap-form {
  margin: 16px 0 0;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--paper-2);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}
.lap-form .btn {
  margin-top: 4px;
}
.lap-msg {
  margin: 12px 0 0;
  font-size: 13px;
  color: #16803c;
}
.lap-msg.is-error {
  color: #c0392b;
}
</style>
