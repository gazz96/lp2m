<template>
  <label class="form-field" :class="[{ 'is-full': full, 'is-invalid': invalid }, $attrs.class]" :style="$attrs.style as any">
    <span v-if="label || $slots.label" class="form-field__label">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="form-field__req">*</span>
    </span>
    <input
      ref="inputRef"
      v-bind="inputAttrs"
      class="form-input form-file"
      :class="inputClass"
      type="file"
      :id="id"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :hidden="hidden"
      @change="onChange"
    />
    <!-- Tombol pemicu saat input disembunyikan (`hidden`). -->
    <button v-if="hidden" type="button" class="form-file__trigger" :disabled="disabled" @click="trigger">
      {{ buttonLabel }}
    </button>
    <span v-if="hint" class="form-field__hint">{{ hint }}</span>
    <span class="form-field__file" :class="fileNames.length ? 'is-pending' : 'is-empty'">
      {{ fileNames.length ? '● ' + fileNames.join(', ') : emptyLabel }}</span
    >
    <span v-if="error" class="form-field__error">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

/** Input unggah berkas dengan label, nama berkas terpilih, dan pemicu tombol opsional. */
const props = withDefaults(defineProps<{
  label?: string
  hint?: string
  error?: string
  invalid?: boolean
  full?: boolean
  id?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  /** Sembunyikan `<input>` native & tampilkan tombol pemicu. */
  hidden?: boolean
  buttonLabel?: string
  /** Teks saat belum ada berkas dipilih. */
  emptyLabel?: string
  /** Kelas tambahan pada `<input>` (mis. `components-text-control__input`). */
  inputClass?: string
  required?: boolean
}>(), {
  buttonLabel: 'Pilih Berkas',
  emptyLabel: '○ Belum ada file dipilih',
})

const emit = defineEmits<{ change: [e: Event] }>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>
  return rest
})

const inputRef = ref<HTMLInputElement | null>(null)

const fileNames = computed(() => {
  const files = inputRef.value?.files
  return files ? Array.from(files).map((f) => f.name) : []
})

function onChange(e: Event) {
  emit('change', e)
}

function trigger() {
  inputRef.value?.click()
}

defineExpose({ trigger })
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-field.is-full {
  grid-column: 1 / -1;
}
.form-field__label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--green-800);
}
.form-field__req {
  color: var(--rust);
  margin-left: 2px;
}
.form-field__hint {
  font-size: 0.72rem;
  color: var(--ink-soft);
  font-weight: 400;
}
.form-input {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 4px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 0.88rem;
  color: var(--ink);
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.form-field.is-invalid .form-input {
  border-color: var(--rust);
}
.form-file__trigger {
  align-self: flex-start;
  cursor: pointer;
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 4px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 0.82rem;
  color: var(--green-800);
}
.form-file__trigger:hover {
  border-color: var(--green-600);
}
.form-field__file {
  font-size: 0.75rem;
  font-weight: 600;
}
.form-field__file.is-pending {
  color: #b45309;
}
.form-field__file.is-empty {
  color: var(--ink-soft);
  font-weight: 400;
}
.form-field__error {
  font-size: 0.72rem;
  color: var(--rust);
  min-height: 1em;
}
</style>
