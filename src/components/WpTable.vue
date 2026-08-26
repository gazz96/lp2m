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
              <span class="sorting-indicator asc" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 15 12 9 18 15"/></svg>
              </span>
              <span class="sorting-indicator desc" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
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
          <slot :name="'cell-' + col.key" :row="row" :col="col" :value="getCellValue(row, col)">
            <!-- Primary column with row-title -->
            <template v-if="col.primary">
              <strong v-if="col.type === 'html'"><router-link v-if="col.rowActions && col.rowActions(row).length && col.rowActions(row)[0]!.to" :to="(col.rowActions(row)[0]!.to as string)" class="row-title" v-html="getCellValue(row, col)"></router-link><span v-else v-html="getCellValue(row, col)"></span></strong>
              <strong v-else><a :href="row._editLink ?? '#'" class="row-title">{{ getCellValue(row, col) }}</a></strong>
              <div class="row-actions" v-if="col.rowActions">
                <span v-for="(act, idx) in col.rowActions(row)" :key="idx" :class="act.className">
                  <router-link v-if="act.to" :to="act.to">{{ act.label }}</router-link>
                  <a v-else-if="act.href" :href="act.href" :target="act.target">{{ act.label }}</a>
                  <a v-else-if="act.onClick" href="#" @click.prevent="act.onClick">{{ act.label }}</a>
                  <template v-if="idx < (col.rowActions(row)?.length ?? 0) - 1"> | </template>
                </span>
              </div>
            </template>

            <!-- Status badge -->
            <span v-else-if="col.type === 'badge'" class="post-state" :class="row._status === 'draft' ? 'draft' : ''">{{ getCellValue(row, col) }}</span>

            <!-- Link / download -->
            <template v-else-if="col.type === 'link'">
              <a v-if="getCellValue(row, col)" :href="getCellValue(row, col)" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {{ col.linkLabel || 'Download' }}
              </a>
              <span v-else style="color:var(--wp-text-muted)">—</span>
            </template>

            <!-- Tags/pills -->
            <template v-else-if="col.type === 'tags'">
              <span v-for="t in getCellValue(row, col)" :key="t" style="display:inline-block;padding:1px 6px;margin:1px;background:#f0f0f1;border-radius:3px;font-size:12px">{{ t }}</span>
              <span v-if="!getCellValue(row,col).length" style="color:var(--wp-text-muted)">—</span>
            </template>

            <!-- HTML -->
            <span v-else-if="col.type === 'html'" v-html="getCellValue(row, col)"></span>

            <!-- Regular text -->
            <template v-else>{{ getCellValue(row, col) }}</template>
          </slot>
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
              <span class="sorting-indicator asc" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 15 12 9 18 15"/></svg>
              </span>
              <span class="sorting-indicator desc" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
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
  type?: 'text' | 'badge' | 'tags' | 'date' | 'link' | 'html'
  width?: string
  linkLabel?: string
  format?: (val: any) => string
  accessor?: (row: Record<string, any>) => any
  rowActions?: (row: Record<string, any>) => WpRowAction[]
}

export interface WpRowAction {
  label: string
  className?: string
  to?: string
  href?: string
  target?: string
  onClick?: () => void
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
