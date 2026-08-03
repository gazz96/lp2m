<template>
  <div class="components-base-control">
    <label v-if="label" :for="id" class="components-base-control__label">{{ label }}</label>
    <slot />
    <p v-if="help" class="components-base-control__help">{{ help }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  help?: string
  id?: string
}>(), {})
</script>
