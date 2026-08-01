<template>
  <div class="frond-rule">
    <svg viewBox="0 0 1200 34" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="17" x2="1200" y2="17" :stroke="lineColor" stroke-width="1"/>
      <g fill="none" :stroke="leafColor" stroke-width="1.4">
        <path v-for="i in 15" :key="i"
          :d="`M${20+(i-1)*80} 17 Q${40+(i-1)*80} 4 ${60+(i-1)*80} 17`"/>
        <path v-for="i in 15" :key="'b'+i"
          :d="`M${20+(i-1)*80} 17 Q${40+(i-1)*80} 30 ${60+(i-1)*80} 17`"/>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ lineColor?: string; leafColor?: string }>(), {
  lineColor: '#D8D3C0',
  leafColor: '#8CB39A'
})
</script>
