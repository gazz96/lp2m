<template>
  <p class="revision-note">
    <strong>{{ label }}</strong>
    <span :class="{ 'is-empty': empty }">{{ text }}</span>
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { hasText, textOrDash } from '@/utils/text'

const props = defineProps<{
  label: string
  value?: unknown
}>()

const text = computed(() => textOrDash(props.value))
const empty = computed(() => !hasText(props.value))
</script>

<style scoped>
.revision-note {
  margin: 0 0 12px;
}
.revision-note strong {
  display: block;
  font-size: 13px;
}
.revision-note span {
  display: block;
  white-space: pre-wrap;
  margin: 4px 0 0;
  font-size: 14px;
}
.revision-note span.is-empty {
  color: var(--ink-soft);
  font-style: italic;
}
</style>
