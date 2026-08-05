<template>
  <div class="skeleton" :class="variant" :style="{ height }">
    <span v-if="variant === 'text'" class="sk-line" :style="{ width: width || '100%' }"></span>
    <template v-else-if="variant === 'chip'">
      <span v-for="i in count" :key="i" class="sk-chip"></span>
    </template>
    <template v-else-if="variant === 'card'">
      <div v-for="i in count" :key="i" class="sk-card">
        <span class="sk-line w60"></span>
        <span class="sk-line w80"></span>
        <span class="sk-line w40"></span>
      </div>
    </template>
    <template v-else-if="variant === 'grid'">
      <div v-for="i in count" :key="i" class="sk-grid-item"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'text' | 'chip' | 'card' | 'grid'
  count?: number
  width?: string
  height?: string
}>(), {
  variant: 'text',
  count: 3,
  height: 'auto',
})
</script>

<style scoped>
.skeleton {
  display: block;
  overflow: hidden;
  position: relative;
  background: #f0ece3;
  border-radius: 8px;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* text */
.skeleton.text { background: transparent; }
.sk-line { display: block; height: 14px; margin: 8px 0; background: #ece7dc; border-radius: 6px; }

/* chip */
.skeleton.chip { background: transparent; }
.sk-chip { display: inline-block; width: 110px; height: 34px; margin: 6px; background: #ece7dc; border-radius: 999px; }

/* card */
.skeleton.card { background: transparent; display: flex; gap: 16px; flex-wrap: wrap; }
.sk-card { flex: 1 1 220px; padding: 18px; background: #f0ece3; border-radius: 10px; display: flex; flex-direction: column; gap: 8px; }
.sk-card .sk-line { margin: 0; }

/* grid */
.skeleton.grid { background: transparent; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
.sk-grid-item { height: 90px; background: #f0ece3; border-radius: 10px; }

.w60 { width: 60%; }
.w80 { width: 80%; }
.w40 { width: 40%; }
</style>
