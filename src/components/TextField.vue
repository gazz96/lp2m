<template>
  <label class="form-field" :class="[{ 'is-full': full, 'is-invalid': invalid }, $attrs.class]" :style="$attrs.style as any">
    <span v-if="label || $slots.label" class="form-field__label">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="form-field__req">*</span>
      <span v-if="hint" class="form-field__hint">{{ hint }}</span>
    </span>
    <input
      :id="id"
      v-bind="inputAttrs"
      class="form-input"
      :class="inputClass"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :step="step"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :accept="accept"
      :inputmode="inputmode"
      @input="onInput"
      @change="emit('change', $event)"
      @blur="emit('blur', $event)"
    />    <slot />
    <span v-if="error" class="form-field__error">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed, useSlots, useAttrs } from 'vue'

/** Input teks generik (text/email/tel/url/number/date/time/search/…).
 *  Bila `type="file"`, gunakan `FileField.vue` agar bisa membaca nama berkas. */
const props = withDefaults(defineProps<{
  /** Nilai input; `v-model`. Number di-parse otomatis saat `type="number"`. */
  modelValue?: string | number | null
  label?: string
  hint?: string
  error?: string
  /** Border merah saat validasi gagal. */
  invalid?: boolean
  /** Field mengambil lebar penuh grid (kolom `full`). */
  full?: boolean
  type?: string
  id?: string
  placeholder?: string
  min?: string | number
  max?: string | number
  step?: string | number
  maxlength?: number | string
  disabled?: boolean
  readonly?: boolean
  autocomplete?: string
  accept?: string
  inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'none'
  /** Kelas tambahan untuk `<input>` itu sendiri (mis. `components-text-control__input`). */
  inputClass?: string
  required?: boolean
}>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [e: Event]
  blur: [e: Event]
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
// Semua atribut fallthrough (mis. @keyup, autofocus, name) diteruskan ke <input>,
// kecuali class/style yang tetap di wrapper agar layout grid tidak rusak.
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>
  return rest
})

const slots = useSlots()
const hasLabel = computed(() => Boolean(props.label || slots.label))

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  emit('update:modelValue', props.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value)
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
