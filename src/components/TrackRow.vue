<template>
  <tr class="track-row">
    <th>{{ label }}</th>
    <td :class="{ 'is-empty': empty, 'is-ok': ok }">
      <slot>{{ value }}</slot>
    </td>
  </tr>
</template>

<script setup lang="ts">
defineProps<{
  /** Judul kolom kiri. */
  label: string
  /** Teks sel; diabaikan bila slot dipakai. */
  value?: string
  /** Tampilkan gaya "kosong" (italic + abu-abu). */
  empty?: boolean
  /** Tampilkan gaya "terisi/ok" (hijau). */
  ok?: boolean
}>()
</script>

<style scoped>
.track-row td.is-empty {
  color: var(--ink-soft);
  font-style: italic;
}
.track-row td.is-ok {
  color: #16803c;
}
</style>
