<template>
  <label class="form-field" :class="[{ 'is-full': full, 'is-invalid': invalid }, $attrs.class]" :style="$attrs.style as any">
    <span v-if="label || $slots.label" class="form-field__label">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="form-field__req">*</span>
      <span v-if="hint" class="form-field__hint">{{ hint }}</span>
    </span>
    <select
      :id="id"
      v-bind="inputAttrs"
      class="form-input form-select"
      :class="inputClass"
      :value="modelValue"
      :disabled="disabled"
      @change="onChange"
      @blur="emit('blur', $event)"
    >
      <!-- Placeholder opsional; kosong = tidak dirender. -->
      <option v-if="placeholder !== undefined" value="" disabled hidden>{{ placeholder }}</option>
      <!-- Opsi dari prop `options` (bila tidak memakai <option> manual via slot). -->
      <option v-if="options?.length" value="">{{ emptyLabel }}</option>
      <option v-for="o in normalizedOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
      <slot />
    </select>
    <span v-if="error" class="form-field__error">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

export type SelectOptionRaw = string | number | { label: string; value: string | number }

const props = withDefaults(defineProps<{
  modelValue?: string | number | null
  label?: string
  hint?: string
  error?: string
  invalid?: boolean
  full?: boolean
  id?: string
  disabled?: boolean
  /** Label opsi kosong (dipakai bersama `options`). */
  emptyLabel?: string
  /** Label untuk opsi kosong ber-`value=""` (memakai native `<option>` saat kosong). */
  placeholder?: string
  /** Daftar opsi: string | number | { label, value }. */
  options?: SelectOptionRaw[]
  /** Kelas tambahan pada `<select>` (mis. `components-select-control__input`). */
  inputClass?: string
  required?: boolean
  /** Kembalikan angka (Number) alih-alih string. */
  numeric?: boolean
}>(), {
  emptyLabel: '',
  numeric: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [e: Event]
  blur: [e: Event]
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>
  return rest
})

const normalizedOptions = computed(() =>
  (props.options || []).map((o) =>
    typeof o === 'object' ? { label: o.label, value: o.value } : { label: String(o), value: o },
  ),
)

function onChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  emit('update:modelValue', props.numeric ? (raw === '' ? '' : Number(raw)) : raw)
}
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
.form-input:focus {
  border-color: var(--green-600);
  box-shadow: 0 0 0 3px rgba(47, 107, 79, 0.14);
}
.form-field.is-invalid .form-input {
  border-color: var(--rust);
}
.form-field__error {
  font-size: 0.72rem;
  color: var(--rust);
  min-height: 1em;
}
</style>
