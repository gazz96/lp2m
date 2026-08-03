<template>
  <div class="tag-select">
    <div class="selected-tags" v-if="selectedTerms.length">
      <span v-for="t in selectedTerms" :key="t.id" class="tag-chip">
        {{ t.name }}
        <button type="button" class="tag-x" @click="$emit('remove', t.id)">✕</button>
      </span>
    </div>
    <div class="search-row">
      <input
        type="text"
        v-model="search"
        :placeholder="placeholder"
        class="search-input"
        @focus="open = true"
        @blur="hideDropdown"
      />
      <div class="search-dropdown" v-if="open && filteredOptions.length">
        <button
          type="button"
          v-for="t in filteredOptions"
          :key="t.id"
          class="drop-item"
          @mousedown.prevent="$emit('add', t); search = ''"
        >{{ t.name }}</button>
      </div>
      <div class="search-dropdown" v-if="open && search.trim() && !filteredOptions.length">
        <button type="button" class="drop-item new" @mousedown.prevent="$emit('create', search.trim()); search = ''">
          + Buat "{{ search.trim() }}"
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  terms: Array<{ id: number; name: string }>
  selected: number[]
  placeholder?: string
}>()

defineEmits<{
  add: [t: { id: number; name: string }]
  remove: [id: number]
  create: [name: string]
}>()

const search = ref('')
const open = ref(false)

const selectedTerms = computed(() =>
  props.terms.filter(t => props.selected.includes(t.id))
)

const filteredOptions = computed(() => {
  const avail = props.terms.filter(t => !props.selected.includes(t.id))
  if (!search.value.trim()) return avail
  return avail.filter(t => t.name.toLowerCase().includes(search.value.toLowerCase()))
})

function hideDropdown() { setTimeout(() => { open.value = false }, 150) }
</script>

<style scoped>
.tag-select { border: 1px solid var(--line); border-radius: 5px; background: #fff; padding: 8px; }
.selected-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
.tag-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--green-100); color: var(--green-800); border-radius: 16px; font-size: 0.78rem; }
.tag-x { width: 18px; height: 18px; border-radius: 50%; border: none; background: transparent; color: var(--green-600); cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; }
.tag-x:hover { background: var(--green-200); }
.search-row { position: relative; }
.search-input { width: 100%; border: none !important; box-shadow: none !important; padding: 6px 8px !important; font-size: 0.84rem; outline: none; }
.search-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid var(--line); border-radius: 5px; max-height: 180px; overflow-y: auto; z-index: 50; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.drop-item { display: block; width: 100%; text-align: left; padding: 8px 12px; border: none; background: transparent; cursor: pointer; font-size: 0.82rem; font-family: inherit; }
.drop-item:hover { background: var(--paper-2); }
.drop-item.new { color: var(--green-700); font-style: italic; }
</style>
