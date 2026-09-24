<template>
  <div class="wf-panel" :class="{ 'wf-panel--muted': muted }">
    <p v-if="eyebrow" class="wf-eyebrow">{{ eyebrow }}</p>
    <h2 v-if="title">{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
/** Panel konten di dalam `WorkflowStepper` (dipakai semua tab di Track Status & Dashboard). */
withDefaults(defineProps<{
  title?: string
  /** Teks kecil di atas judul, mis. "Tahap 1". */
  eyebrow?: string
  /** Varian latar abu-abu (dipakai panel Riwayat). */
  muted?: boolean
}>(), {
  muted: false,
})
</script>

<style scoped>
.wf-panel {
  padding: 20px 22px 24px;
}
.wf-panel h2 {
  margin: 0 0 14px;
  font-size: 17px;
}
.wf-panel--muted {
  background: #fff;
  border-top: 1px solid var(--paper-2);
}
.wf-eyebrow {
  margin: 0 0 4px;
  color: #2271b3;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (max-width: 640px) {
  .wf-panel {
    padding: 16px 14px 20px;
  }
}
</style>
