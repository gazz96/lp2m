<template>
  <p class="track-access" :class="canEdit ? 'is-edit' : 'is-locked'">
    <template v-if="canEdit">✎ Mode edit aktif — token revisi valid. Anda dapat mengunggah Surat Kesanggupan &amp; Revisi File Pengajuan pada tahap Revisi.</template>
    <template v-else-if="approved">✓ Usulan Anda <strong>Diterima</strong> — halaman ini hanya menampilkan data (mode baca).</template>
    <template v-else-if="submitted">✓ Revisi sudah dikirim — halaman ini hanya menampilkan data (mode baca).</template>
    <template v-else-if="tokenError">🔒 {{ tokenError }}</template>
    <template v-else>🔒 Mode baca — tautan edit hanya dikirim ke email peserta setelah Status Tahap 2 ditetapkan “Perbaiki Usulan”.</template>
  </p>
</template>

<script setup lang="ts">
/** Banner status akses di atas WorkflowStepper pada halaman Track Status peserta. */
withDefaults(defineProps<{
  canEdit?: boolean
  approved?: boolean
  submitted?: boolean
  /** Pesan error verifikasi token revisi (bila ada). */
  tokenError?: string
}>(), {
  canEdit: false,
  approved: false,
  submitted: false,
  tokenError: '',
})
</script>

<style scoped>
.track-access {
  margin: 0 0 16px;
  padding: 11px 14px;
  border-radius: 0 0 8px 8px;
  border: 1px solid var(--paper-2);
  border-top: 0;
  font-size: 13px;
  background: #f8fafc;
  color: var(--ink-soft);
}
.track-access.is-edit {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #0f766e;
  font-weight: 600;
}
.track-access.is-locked {
  background: #f8fafc;
}
</style>
