<template>
  <TopBar />
  <SiteNav>
    <template #extra>
      <router-link to="/dashboard" class="btn btn-primary nav-btn-dash">Dashboard</router-link>
    </template>
  </SiteNav>
  <main>
    <HeroSection />
    <FrondRule leafColor="#8CB39A" />
    <TentangSection />
    <BidangSection />
    <InfografisSection />
    <FrondRule leafColor="#C99A3B" />
    <HibahSection />
    <PublikasiSection />
    <MitraSection />
    <CtaSection />
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import HeroSection from '@/components/HeroSection.vue'
import FrondRule from '@/components/FrondRule.vue'
import TentangSection from '@/components/TentangSection.vue'
import BidangSection from '@/components/BidangSection.vue'
import InfografisSection from '@/components/InfografisSection.vue'
import HibahSection from '@/components/HibahSection.vue'
import PublikasiSection from '@/components/PublikasiSection.vue'
import MitraSection from '@/components/MitraSection.vue'
import CtaSection from '@/components/CtaSection.vue'
import SiteFooter from '@/components/SiteFooter.vue'
</script>

<style scoped>
.nav-btn-dash {
  padding: 9px 18px;
  background: var(--gold);
  color: var(--green-900);
  border-color: var(--gold);
}
.nav-btn-dash:hover { background: var(--gold-dark); color: #fff; }
</style>
