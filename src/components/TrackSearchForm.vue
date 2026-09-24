<template>
  <form class="track-search" @submit.prevent="emit('submit')">
    <input
      class="track-input"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button type="submit" class="btn btn-primary track-search__btn">{{ buttonLabel }}</button>
  </form>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  buttonLabel?: string
}>(), {
  placeholder: 'cth. LP2M-2026-00001',
  buttonLabel: 'Cek Status',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()
</script>

<style scoped>
.track-search {
  display: flex;
  gap: 12px;
  margin: 0 0 28px;
  flex-wrap: wrap;
}
.track-search .track-input {
  flex: 1;
  min-width: 220px;
  padding: 14px 18px;
  border: 1px solid var(--paper-2);
  border-radius: 4px;
  font-size: 16px;
  background: #fff;
}
.track-search__btn {
  padding: 14px 28px;
  font-size: 15px;
  white-space: nowrap;
}
</style>
