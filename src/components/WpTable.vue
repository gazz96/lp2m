<template>
  <table class="wp-list-table widefat fixed striped">
    <caption class="screen-reader-text">{{ caption }}</caption>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key"
          :class="['manage-column', 'column-' + col.key,
            col.primary ? 'column-primary' : '',
            col.sortable ? 'sortable' : '',
            col.sortable && sortCol === col.key ? sortDir : '']"
          :style="col.width ? { width: col.width } : {}"
          @click="col.sortable && toggleSort(col.key)"
        >
          <a v-if="col.sortable" href="#"><span>{{ col.label }}</span>
            <span class="sorting-indicators">
              <span class="sorting-indicator asc" aria-hidden="true"></span>
              <span class="sorting-indicator desc" aria-hidden="true"></span>
            </span></a>
          <span v-else>{{ col.label }}</span>
        </th>
      </tr>
    </thead>

    <tbody id="the-list">
      <tr v-for="(row, i) in rows" :key="row.id ?? i" :class="{ 'is-draft': row._status === 'draft' }">
        <td v-for="col in columns" :key="col.key"
          :class="['title column-' + col.key,
            col.primary ? 'column-primary' : '',
            col.rowActions ? 'has-row-actions' : '']"
          :data-colname="col.label"
        >
          <!-- Primary column with row-title -->
          <template v-if="col.primary">
            <strong><a :href="row._editLink ?? '#'" class="row-title">{{ getCellValue(row, col) }}</a></strong>
            <div class="row-actions" v-if="col.rowActions">
              <span v-for="(act, idx) in col.rowActions(row)" :key="idx" :class="act.className">
                <component :is="act.to ? 'router-link' : 'a'" :to="act.to" :href="act.href" :target="act.target">{{ act.label }}</component>
                <template v-if="idx < (col.rowActions(row)?.length ?? 0) - 1"> | </template>
              </span>
            </div>
            <button type="button" class="toggle-row"><span class="screen-reader-text">Detail</span></button>
          </template>

          <!-- Status badge -->
          <span v-else-if="col.type === 'badge'" class="post-state" :class="row._status === 'draft' ? 'draft' : ''">{{ getCellValue(row, col) }}</span>

          <!-- Tags/pills -->
          <template v-else-if="col.type === 'tags'">
            <span v-for="t in getCellValue(row, col)" :key="t" style="display:inline-block;padding:1px 6px;margin:1px;background:#f0f0f1;border-radius:3px;font-size:12px">{{ t }}</span>
            <span v-if="!getCellValue(row,col).length" style="color:var(--wp-text-muted)">—</span>
          </template>

          <!-- Regular text -->
          <template v-else>{{ getCellValue(row, col) }}</template>
        </td>
      </tr>

      <tr v-if="!rows.length">
        <td :colspan="columns.length" style="text-align:center;padding:48px;color:var(--wp-text-muted)">
          <slot name="empty">
            <strong>{{ emptyTitle }}</strong>
            <div style="margin-top:4px">{{ emptySub }}</div>
          </slot>
        </td>
      </tr>
    </tbody>

    <tfoot v-if="showFooter">
      <tr>
        <th v-for="col in columns" :key="col.key"
          :class="['manage-column', 'column-' + col.key,
            col.primary ? 'column-primary' : '',
            col.sortable ? 'sortable' : '',
            col.sortable && sortCol === col.key ? sortDir : '']"
          @click="col.sortable && toggleSort(col.key)"
        >
          <a v-if="col.sortable" href="#"><span>{{ col.label }}</span>
            <span class="sorting-indicators">
              <span class="sorting-indicator asc" aria-hidden="true"></span>
              <span class="sorting-indicator desc" aria-hidden="true"></span>
            </span></a>
          <span v-else>{{ col.label }}</span>
        </th>
      </tr>
    </tfoot>
  </table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface WpColumn {
  key: string
  label: string
  primary?: boolean
  sortable?: boolean
  type?: 'text' | 'badge' | 'tags' | 'date'
  width?: string
  format?: (val: any) => string
  accessor?: (row: Record<string, any>) => any
  rowActions?: (row: Record<string, any>) => WpRowAction[]
}

export interface WpRowAction {
  label: string
  className?: string
  to?: string       // router-link
  href?: string     // external
  target?: string
}

const props = withDefaults(defineProps<{
  columns: WpColumn[]
  rows: Record<string, any>[]
  caption?: string
  emptyTitle?: string
  emptySub?: string
  showFooter?: boolean
  initialSortCol?: string
  initialSortDir?: 'asc' | 'desc'
}>(), {
  caption: 'Daftar',
  emptyTitle: 'Belum ada data.',
  emptySub: '',
  showFooter: false,
  initialSortDir: 'desc',
})

const emit = defineEmits<{
  sort: [col: string, dir: 'asc' | 'desc']
}>()

const sortCol = ref(props.initialSortCol ?? '')
const sortDir = ref<'asc' | 'desc'>(props.initialSortDir)

function toggleSort(key: string) {
  if (sortCol.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortCol.value = key
    sortDir.value = 'desc'
  }
  emit('sort', sortCol.value, sortDir.value)
}

function getCellValue(row: Record<string, any>, col: WpColumn): any {
  if (col.accessor) return col.accessor(row)
  const val = row[col.key]
  if (col.format) return col.format(val)
  return val
}
</script>
