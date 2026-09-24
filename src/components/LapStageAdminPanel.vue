<template>
  <section class="lap-admin">
    <!-- Status tahap: membuka form peserta + memicu email undangan. -->
    <div class="lap-status">
      <SelectField
        v-model="model[stage.statusKey]"
        :label="`Status Tahap — ${stage.label}`"
        :options="LAP_STATUS_OPTIONS"
        :hint="'Pilih “Buka Form Peserta” untuk mengirim email + tautan bertoken ke peserta.'"
        style="width:100%"
      />
      <p v-if="submittedAt" class="lap-note is-ok">
        ✓ Peserta sudah mengirim form ini pada <strong>{{ submittedAt }}</strong> — tautan form sudah mati.
      </p>
      <p v-else class="lap-note">
        Form peserta belum dikirim. Email undangan terkirim otomatis saat status diset
        <strong>Buka Form Peserta</strong> (sekali per pembukaan).
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

    <!-- Berkas: template (admin) + berkas hasil (peserta). -->
    <div v-for="group in fileGroups" :key="group.title" class="lap-files">
      <h4 class="lap-files__title">{{ group.title }}</h4>
      <div class="lap-file" v-for="f in group.files" :key="f.param">
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
          :hidden="false"
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
  /** Berkas baru yang akan diunggah, keyed by `param`. */
  files: Record<string, File | null>
  /** Pesan error per `param`. */
  errors: Record<string, string>
}>()

const emit = defineEmits<{
  pick: [param: string, event: Event]
  clear: [param: string]
}>()

const submittedAt = computed(() => String(props.detail?.[props.stage.submittedKey] || '').trim())

const fileGroups = computed(() => [
  {
    title: 'Template (disediakan admin — peserta hanya mengunduh)',
    files: lapTemplateFiles(props.stage),
  },
  {
    title: 'Berkas hasil (diunggah peserta, admin boleh mengganti)',
    files: lapParticipantFiles(props.stage),
  },
])
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

@media (max-width: 782px) {
  .lap-grid {
    grid-template-columns: 1fr;
  }
}
</style>
