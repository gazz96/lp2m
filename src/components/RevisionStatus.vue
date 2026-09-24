<template>
  <p class="revision-status" :class="variantClass">
    <slot>{{ text }}</slot>
    <a v-if="href" :href="href" target="_blank" rel="noopener">{{ linkLabel }}</a>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** `ok` (hijau, mis. "✓ sudah diunggah"), `empty` (italic abu-abu), `plain`. */
  variant?: 'ok' | 'empty' | 'plain'
  /** Teks; diabaikan bila slot dipakai. */
  text?: string
  /** Bila diisi → render tautan "Lihat berkas". */
  href?: string
  linkLabel?: string
}>(), {
  variant: 'plain',
  linkLabel: 'Lihat berkas',
})

const variantClass = computed(() => (props.variant === 'plain' ? '' : `is-${props.variant}`))
</script>

<style scoped>
.revision-status {
  margin: 14px 0 0;
  font-size: 14px;
}
.revision-status.is-ok {
  color: #16803c;
}
.revision-status.is-empty {
  color: var(--ink-soft);
  font-style: italic;
  font-size: 13px;
}
.revision-status a {
  margin-left: 8px;
}

/* Di dalam tabel ringkas spasi atas tidak diperlukan. */
:deep(.track-row) .revision-status {
  margin-top: 0;
}
</style>
