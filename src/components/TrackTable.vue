<template>
  <dl class="track-table">
    <tbody>
      <slot />
    </tbody>
  </dl>
</template>

<script setup lang="ts">
import { provide, toRef, type ComputedRef } from 'vue'
import { trackRowKey, type TrackTableVariant } from './trackTableContext'

const props = withDefaults(defineProps<{ variant?: TrackTableVariant }>(), {
  variant: 'default',
})
provide(trackRowKey, toRef(props, 'variant') as ComputedRef<TrackTableVariant>)
</script>

<style scoped>
.track-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid var(--paper-2);
  border-radius: 6px;
  overflow: hidden;
}
.track-table :deep(th),
.track-table :deep(td) {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--paper-2);
  text-align: left;
}
.track-table :deep(th) {
  width: 210px;
  background: var(--paper);
  font-weight: 500;
  font-size: 13px;
  color: var(--ink-soft);
  vertical-align: top;
}
.track-table :deep(.track-row:last-child th),
.track-table :deep(.track-row:last-child td) {
  border-bottom: 0;
}

/* Varian ringkas: kolom label lebih lebar (dipakai tabel ringkasan dana/detail). */
.track-table.is-compact :deep(th) {
  width: 230px;
}

@media (max-width: 640px) {
  .track-table :deep(th) {
    width: 130px;
    padding: 10px 12px;
    font-size: 12px;
  }
  .track-table :deep(td) {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
