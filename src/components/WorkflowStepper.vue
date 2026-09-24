<template>
  <section class="workflow-stepper" aria-label="Tahapan pelaporan pendaftaran">
    <nav class="workflow-tabs" :style="{ '--wf-cols': tabs.length }">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="workflow-tab"
        :class="{ 'is-active': modelValue === tab.id, 'is-disabled': tab.enabled === false }"
        :disabled="tab.enabled === false"
        @click="$emit('update:modelValue', tab.id)"
      >
        <span class="workflow-step">{{ tab.step }}</span>
        <span>{{ tab.label }}</span>
        <small v-if="tab.enabled === false">Segera</small>
      </button>
    </nav>
    <div class="workflow-content">
      <slot :name="modelValue">
        <div class="workflow-empty">
          <p class="eyebrow">Tahap {{ tabs.findIndex(tab => tab.id === modelValue) + 1 }}</p>
          <h2>{{ tabs.find(tab => tab.id === modelValue)?.label }}</h2>
          <p>Section ini disiapkan untuk tahap berikutnya.</p>
        </div>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface WorkflowTab {
  id: string
  label: string
  step: string
  /** Set false untuk menonaktifkan tab (default: aktif). */
  enabled?: boolean
}

defineProps<{
  tabs: WorkflowTab[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.workflow-stepper{--wf-cols:4;margin:0;padding:0;background:#fff}.workflow-tabs{display:grid;grid-template-columns:repeat(var(--wf-cols),minmax(0,1fr));background:#fff}.workflow-tab{position:relative;display:flex;align-items:center;gap:8px;min-height:58px;padding:10px 12px;border:0;border-right:1px solid #e5e7eb;background:#fff;color:#64748b;text-align:left;font-size:12px;font-weight:600;cursor:pointer}.workflow-tab:last-child{border-right:0}.workflow-tab.is-active{color:#1d4ed8;background:#eff6ff;box-shadow:inset 0 -3px 0 #2271b3}.workflow-tab.is-disabled{cursor:not-allowed;opacity:.65}.workflow-step{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#e2e8f0;color:#475569;font-size:11px}.workflow-tab.is-active .workflow-step{background:#2271b3;color:#fff}.workflow-tab small{margin-left:auto;font-size:10px;font-weight:400;color:#94a3b8}@media(max-width:760px){.workflow-tabs{grid-template-columns:1fr 1fr}.workflow-tab{border-right:0;border-bottom:1px solid #e5e7eb}.workflow-tab:last-child{border-bottom:0}}
.workflow-content{border-top:1px solid #dbeafe;background:#f8fbff}.workflow-empty{padding:32px 20px;color:#64748b}.workflow-empty h2{margin:0;font-size:15px}.workflow-empty p:last-child{margin-bottom:0}.eyebrow{margin:0 0 3px;color:#2271b3;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
</style>
