<template>
  <div class="editor-wrap" v-if="editor">
    <div class="editor-toolbar">
      <button
        v-for="btn in toolbarButtons"
        :key="btn.label"
        class="components-button is-tertiary is-small"
        :class="{ 'is-active': btn.isActive ? btn.isActive(editor) : false }"
        :title="btn.label"
        @click.prevent="btn.click(editor)"
      >
        <span v-if="btn.icon" v-html="btn.icon"></span>
        <span v-else>{{ btn.label }}</span>
      </button>
    </div>
    <editor-content :editor="editor" class="editor-canvas" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch, shallowRef } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { Editor as EditorInstance } from '@tiptap/vue-3'

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()

const editor = shallowRef<EditorInstance | null>(null)

const toolbarButtons = [
  {
    label: 'B',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleBold().run(),
    isActive: (e: EditorInstance) => e.isActive('bold'),
  },
  {
    label: 'I',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleItalic().run(),
    isActive: (e: EditorInstance) => e.isActive('italic'),
  },
  {
    label: 'U',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleUnderline ? e.chain().focus().toggleUnderline().run() : null,
    isActive: () => false,
  },
  {
    label: 'S',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="4" y1="12" x2="20" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleStrike().run(),
    isActive: (e: EditorInstance) => e.isActive('strike'),
  },
  {
    label: 'H2',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16M18 4v16M6 12h12"/><path d="M18 12l-4-4M18 12l-4 4"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (e: EditorInstance) => e.isActive('heading', { level: 2 }),
  },
  {
    label: 'H3',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v16M18 4v16M6 12h12"/><path d="M18 8l-3 4 3 4"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e: EditorInstance) => e.isActive('heading', { level: 3 }),
  },
  {
    label: 'List',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleBulletList().run(),
    isActive: (e: EditorInstance) => e.isActive('bulletList'),
  },
  {
    label: 'NumList',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e: EditorInstance) => e.isActive('orderedList'),
  },
  {
    label: 'Blockquote',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 15h6l-2 6h2l4-8V3H3z"/><path d="M13 15h6l-2 6h2l4-8V3H13z"/></svg>',
    click: (e: EditorInstance) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e: EditorInstance) => e.isActive('blockquote'),
  },
  {
    label: 'Link',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    click: (e: EditorInstance) => {
      const url = window.prompt('URL:')
      if (url) e.chain().focus().setLink({ href: url }).run()
    },
    isActive: (e: EditorInstance) => e.isActive('link'),
  },
]

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    if (val) editor.value.commands.setContent(val)
  }
})

editor.value = new Editor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Placeholder.configure({ placeholder: props.placeholder || 'Mulai menulis...' }),
  ],
  onUpdate: ({ editor: ed }) => {
    emit('update:modelValue', ed.getHTML())
  },
}) as unknown as EditorInstance

onBeforeUnmount(() => { editor.value?.destroy() })
</script>

<style scoped>
.editor-wrap {
  border: 1px solid var(--wp-border-light);
  border-radius: 2px;
  background: var(--wp-surface);
}
.editor-toolbar {
  display: flex; gap: 2px; padding: 6px 8px;
  border-bottom: 1px solid var(--wp-border-light);
  background: #fafafa;
  flex-wrap: wrap;
}
.editor-toolbar .components-button {
  min-height: 30px; height: 30px; width: 30px;
  padding: 0; border-radius: 2px;
}
.editor-toolbar .components-button.is-active {
  background: var(--wp-primary); color: #fff;
}
.editor-canvas {
  padding: 20px;
  min-height: 300px;
  font-size: 16px; line-height: 1.6;
}
.editor-canvas :deep(.ProseMirror) { outline: none; min-height: 260px; }
.editor-canvas :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #757575; pointer-events: none; float: left; height: 0;
}
.editor-canvas :deep(h2) { font-size: 1.5em; font-weight: 600; margin: 1em 0 .5em; }
.editor-canvas :deep(h3) { font-size: 1.2em; font-weight: 600; margin: 1em 0 .5em; }
.editor-canvas :deep(blockquote) { border-left: 4px solid var(--wp-primary); margin: 1em 0; padding: 0 0 0 1em; color: var(--wp-text-secondary); }
.editor-canvas :deep(ul), .editor-canvas :deep(ol) { padding-left: 1.5em; }
.editor-canvas :deep(li) { margin-bottom: .25em; }
.editor-canvas :deep(a) { color: var(--wp-primary); }
</style>
