<template>
  <form class="revision-upload" @submit.prevent="emit('submit')">
    <FileField
      v-for="(f, i) in fields"
      :key="f.key"
      :label="`${i + 1}. File Upload ${f.label}`"
      accept="application/pdf,.pdf"
      @change="(e) => emit('pick', f.key, e)"
    />

    <button type="submit" class="btn btn-primary" :disabled="loading || !canSubmit">
      {{ loading ? 'Mengirim…' : 'Kirim Revisi' }}
    </button>
    <p class="revision-hint">{{ hint }}</p>
  </form>
</template>

<script setup lang="ts">
import FileField from '@/components/FileField.vue'

export type RevisionFieldKey = 'surat' | 'proposal'

export type RevisionField = {
  /** Key di dalam objek `files`. */
  key: RevisionFieldKey
  /** Nama berkas yang tampil di label, mis. "Surat Kesanggupan". */
  label: string
}

withDefaults(defineProps<{
  /** Berkas yang sudah dipilih (null = belum ada) — dipakai untuk status tombol. */
  files: Record<RevisionFieldKey, File | null>
  /** Berkas wajib lengkap sebelum tombol aktif. */
  canSubmit?: boolean
  loading?: boolean
  /** Kolom isian; default dua berkas tahap revisi. */
  fields?: RevisionField[]
  hint?: string
}>(), {
  canSubmit: false,
  loading: false,
  fields: () => [
    { key: 'surat', label: 'Surat Kesanggupan' },
    { key: 'proposal', label: 'Revisi File Pengajuan' },
  ],
  hint:
    'Kedua berkas wajib diunggah bersamaan. Hanya PDF, maksimal 10 MB per berkas. ' +
    'Boleh diganti selama token revisi masih aktif.',
})

const emit = defineEmits<{
  /** Dipanggil saat user memilih berkas — validasi PDF/ukuran di parent. */
  pick: [key: RevisionFieldKey, event: Event]
  submit: []
}>()
</script>

<style scoped>
.revision-upload {
  margin: 18px 0 0;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--paper-2);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}
.revision-hint {
  margin: 0;
  font-size: 12px;
  color: var(--ink-soft);
}
</style>
