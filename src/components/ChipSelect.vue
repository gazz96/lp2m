<template>
  <div class="chip-select" :class="{ invalid }">
    <div class="chip-row">
      <button
        type="button"
        v-for="opt in options"
        :key="opt.value"
        class="chip"
        :class="{ active: modelValue === opt.value }"
        @click="select(opt)"
      >{{ opt.label }}</button>
    </div>
    <div class="chip-add">
      <input
        type="text"
        class="chip-input"
        v-model="newName"
        :placeholder="addPlaceholder"
        @keydown.enter.prevent="addNew"
      />
      <button type="button" class="chip-add-btn" :disabled="!newName.trim()" @click="addNew">+ Tambah</button>
    </div>
    <p v-if="error" class="chip-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface ChipOption { label: string; value: number }

const props = defineProps<{
  modelValue: number | ''
  options: ChipOption[]
  label?: string
  addPlaceholder?: string
  required?: boolean
  error?: string
  invalid?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | '']
  /** Nama kategori baru yang diketik manual — parent yang request term ke server. */
  create: [name: string]
}>()

const newName = ref('')

function select(opt: ChipOption) {
  // Toggle: klik chip aktif lagi = batalkan pilihan.
  emit('update:modelValue', props.modelValue === opt.value ? '' : opt.value)
}

async function addNew() {
  const name = newName.value.trim()
  if (!name) return
  // Sudah ada di opsi (case-insensitive)? Pilih saja, jangan duplikat.
  const existing = props.options.find((o) => o.label.toLowerCase() === name.toLowerCase())
  if (existing) {
    emit('update:modelValue', existing.value)
    newName.value = ''
    return
  }
  emit('create', name)
  newName.value = ''
}
</script>

<style scoped>
.chip-select { display: flex; flex-direction: column; gap: 10px; }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 7px 16px; border: 1.5px solid var(--line, #d7e0d9); border-radius: 999px;
  background: #fff; color: var(--ink, #1f2a22); font-size: 0.85rem; font-family: inherit;
  cursor: pointer; transition: all .15s ease; line-height: 1.4;
}
.chip:hover { border-color: var(--green-600, #3e8e5f); color: var(--green-700, #2f7a52); }
.chip.active {
  background: var(--green-700, #2f7a52); border-color: var(--green-700, #2f7a52);
  color: #fff; font-weight: 600;
}
.chip-add { display: flex; gap: 8px; }
.chip-input {
  flex: 1; height: 40px; line-height: normal; padding: 0 12px;
  border: 1px solid var(--line, #d7e0d9); border-radius: 8px;
  font-size: 0.88rem; font-family: inherit; background: #fff; outline: none;
}
.chip-input:focus { border-color: var(--green-600, #3e8e5f); }
.chip-add-btn {
  padding: 0 16px; border: 1px solid var(--green-700, #2f7a52); border-radius: 8px;
  background: #fff; color: var(--green-700, #2f7a52); font-size: 0.85rem; font-weight: 600;
  font-family: inherit; cursor: pointer; white-space: nowrap; transition: all .15s ease;
}
.chip-add-btn:hover:not(:disabled) { background: var(--green-700, #2f7a52); color: #fff; }
.chip-add-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.chip-error { margin: 0; color: var(--rust, #b3423a); font-size: 0.8rem; }
.chip-select.invalid .chip { border-color: var(--rust, #b3423a); }
</style>
