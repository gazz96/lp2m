<template>
  <div class="htmleditor">
    <div class="he-toolbar">
      <button type="button" @click="exec('bold')" title="Bold"><b>B</b></button>
      <button type="button" @click="exec('italic')" title="Italic"><i>I</i></button>
      <button type="button" @click="exec('underline')" title="Underline"><u>U</u></button>
      <span class="sep"></span>
      <button type="button" @click="exec('formatBlock', '<h2>')" title="Heading 2">H2</button>
      <button type="button" @click="exec('formatBlock', '<h3>')" title="Heading 3">H3</button>
      <span class="sep"></span>
      <button type="button" @click="insertLink" title="Link">🔗</button>
      <button type="button" @click="exec('insertUnorderedList')" title="Bullet List">•≡</button>
      <span class="sep"></span>
      <button type="button" :class="{ active: previewMode }" @click="togglePreview" title="Preview">{{ previewMode ? '✏️ Edit' : '👁 Preview' }}</button>
    </div>
    <div
      v-show="!previewMode"
      ref="editorRef"
      class="he-editor"
      contenteditable="true"
      @input="onInput"
      @paste="onPaste"
      @blur="emitValue"
    ></div>
    <div v-if="previewMode" class="he-preview" v-html="sanitize(modelValue)"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, defineProps, defineEmits } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const editorRef = ref<HTMLDivElement | null>(null)
const previewMode = ref(false)

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
})

watch(() => props.modelValue, (v) => {
  if (editorRef.value && !previewMode.value && v !== editorRef.value.innerHTML) {
    editorRef.value.innerHTML = v
  }
})

function exec(cmd: string, val?: string) {
  document.execCommand(cmd, false, val || undefined)
  editorRef.value?.focus()
  emitValue()
}

function insertLink() {
  const url = prompt('URL:')
  if (url) {
    document.execCommand('createLink', false, url)
    emitValue()
  }
}

function onInput() { emitValue() }

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

function emitValue() {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

function togglePreview() {
  previewMode.value = !previewMode.value
}

function sanitize(html: string) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '')
}
</script>

<style scoped>
.htmleditor { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: #fff; }
.he-toolbar { display: flex; align-items: center; gap: 4px; padding: 8px 10px; background: var(--paper-2); border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.he-toolbar button { width: 30px; height: 28px; border: 1px solid var(--line); background: var(--card); border-radius: 4px; cursor: pointer; font-size: 0.82rem; display: flex; align-items: center; justify-content: center; color: var(--ink); font-family: inherit; }
.he-toolbar button:hover { background: var(--green-100); border-color: var(--green-600); }
.he-toolbar button.active { background: var(--green-700); color: #fff; border-color: var(--green-700); }
.he-toolbar .sep { width: 1px; height: 20px; background: var(--line); margin: 0 4px; }
.he-editor { min-height: 180px; padding: 14px; outline: none; font-size: 0.88rem; line-height: 1.7; color: var(--ink); }
.he-editor:empty::before { content: 'Tulis konten...'; color: #999; }
.he-preview { padding: 14px; font-size: 0.88rem; line-height: 1.7; min-height: 180px; color: var(--ink); }
.he-preview :deep(h2) { font-size: 1.2rem; margin: 0.8em 0 0.4em; color: var(--green-800); }
.he-preview :deep(h3) { font-size: 1rem; margin: 0.7em 0 0.3em; }
.he-preview :deep(p) { margin: 0.5em 0; }
.he-preview :deep(ul), .he-preview :deep(ol) { padding-left: 20px; margin: 0.5em 0; }
</style>
