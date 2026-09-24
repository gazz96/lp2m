<template>
  <label class="form-field" :class="[{ 'is-full': full, 'is-invalid': invalid }, $attrs.class]" :style="$attrs.style as any">
    <span v-if="label || $slots.label" class="form-field__label">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="form-field__req">*</span>
      <span v-if="hint" class="form-field__hint">{{ hint }}</span>
    </span>
    <textarea
      :id="id"
      v-bind="inputAttrs"
      class="form-input form-textarea"
      :class="inputClass"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      @input="onInput"
      @blur="emit('blur', $event)"
    />
    <span v-if="error" class="form-field__error">{{ error }}</span>
    <span v-else-if="counter" class="form-field__counter">
      {{ String(modelValue ?? '').length }}<template v-if="maxlength"> / {{ maxlength }}</template>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

/** Textarea generik dengan label/error opsional + penghitung karakter. */
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  hint?: string
  error?: string
  invalid?: boolean
  full?: boolean
  id?: string
  placeholder?: string
  rows?: number | string
  maxlength?: number | string
  disabled?: boolean
  readonly?: boolean
  /** Tampilkan penghitung karakter di bawah (butuh `maxlength` untuk format "n / max"). */
  counter?: boolean
  /** Kelas tambahan pada `<textarea>` (mis. `components-textarea-control__input`). */
  inputClass?: string
  required?: boolean
}>(), {
  rows: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [e: Event]
}>()

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>
  return rest
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
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
  resize: vertical;
}
.form-textarea {
  min-height: 80px;
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
.form-field__counter {
  font-size: 0.7rem;
  color: var(--ink-soft);
  text-align: right;
}
</style>
