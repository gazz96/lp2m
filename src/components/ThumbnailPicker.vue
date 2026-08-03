<template>
  <div class="thumb-picker">
    <div v-if="previewUrl" class="tp-preview">
      <img :src="previewUrl" alt="Thumbnail" />
      <button type="button" class="tp-remove" @click="clear" title="Hapus">✕</button>
    </div>
    <div
      class="tp-dropzone"
      :class="{ dragging }"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <input ref="fileInputRef" type="file" accept="image/*" @change="onFilePicked" hidden />
      <button type="button" class="btn btn-outline btn-sm" @click="triggerFileInput" :disabled="uploading">
        {{ previewUrl ? 'Ganti Gambar' : 'Pilih Thumbnail' }}
      </button>
      <span class="tp-hint">atau drag & drop</span>
    </div>
    <div v-if="uploading" class="tp-status">Mengupload...</div>
    <div v-if="error" class="tp-status error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ mediaId?: number | null; previewUrl?: string }>()
const emit = defineEmits<{ (e: 'update:mediaId', v: number | null): void; (e: 'update:previewUrl', v: string): void }>()

const auth = useAuthStore()
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const uploading = ref(false)
const error = ref('')

function triggerFileInput() { fileInputRef.value?.click() }

async function uploadFile(file: File) {
  uploading.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    formData.append('status', 'publish')

    const res = await fetch(`${SITE.apiBase}/media`, {
      method: 'POST',
      headers: { ...auth.authHeaders() },
      body: formData
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Upload gagal (HTTP ${res.status})`)
    }

    const data = await res.json()
    emit('update:mediaId', data.id)
    emit('update:previewUrl', data.source_url || data.guid?.rendered || '')
  } catch (e: any) {
    error.value = e.message
  } finally {
    uploading.value = false
  }
}

function onFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadFile(file)
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file?.type.startsWith('image/')) uploadFile(file)
}

function clear() {
  emit('update:mediaId', null)
  emit('update:previewUrl', '')
}
</script>

<style scoped>
.thumb-picker { display: flex; flex-direction: column; gap: 10px; }
.tp-preview { position: relative; display: inline-block; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
.tp-preview img { max-width: 240px; max-height: 160px; display: block; }
.tp-remove { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; border: none; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
.tp-dropzone { display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px dashed var(--line); border-radius: 6px; transition: border-color 0.2s; }
.tp-dropzone.dragging { border-color: var(--green-600); background: var(--green-50); }
.tp-hint { font-size: 0.74rem; color: var(--ink-soft); }
.tp-status { font-size: 0.78rem; color: var(--ink-soft); }
.tp-status.error { color: var(--rust); }
.btn-sm { padding: 6px 14px; font-size: 0.8rem; }
</style>
