<template>
  <div class="topbar">
    <div class="wrap">
      <div class="topbar-links">
        <a href="#tentang">Tentang LP2M</a>
        <a href="#hibah">Hibah &amp; Event</a>
        <a href="#kontak">Kontak</a>
      </div>
      <div class="topbar-links">
        <a :href="SITE.mainUrl" target="_blank" rel="noopener">{{ SITE.mainUrl.replace('https://', '') }}</a>
        <span class="mono">{{ SITE.email }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SITE } from '@/data'
</script>
