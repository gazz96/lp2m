<template>
  <section id="infografis">
    <div class="wrap">
      <RevealBlock class="section-head">
        <div>
          <div class="eyebrow">{{ INFOGRAFIS.eyebrow }}</div>
          <h2>{{ INFOGRAFIS.title }}</h2>
        </div>
        <p class="desc">{{ INFOGRAFIS.desc }}</p>
      </RevealBlock>

      <!-- Filter tahun -->
      <RevealBlock class="year-filter">
        <label for="infografis-tahun">Tahun:</label>
        <select id="infografis-tahun" :value="tahun" @change="onYearChange" :disabled="status === 'loading'">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          <option v-if="!years.length" :value="tahun">{{ tahun }}</option>
        </select>
        <span class="year-filter-status" v-if="status === 'loading'">Memuat data…</span>
        <span class="year-filter-status error" v-else-if="status === 'error'">Gagal memuat — data statis ditampilkan</span>
      </RevealBlock>

      <RevealBlock class="ledger-grid" style="margin-bottom:28px">
        <div v-if="status === 'loading' && !stats">
          <SkeletonBlock variant="card" :count="4" />
        </div>
        <template v-else-if="stats">
          <div class="ledger-card" v-for="item in ledgerItems" :key="item.label">
            <div class="num">
              <AnimatedNumber :target="item.count" />
            </div>
            <div class="lbl">{{ item.label }}</div>
          </div>
        </template>
      </RevealBlock>

      <div class="info-grid">
        <RevealBlock class="info-card">
          <h3>Tren Usulan {{ tahun }} per SDGs</h3>
          <div class="cap">Jumlah usulan penelitian dan pengabdian berdasarkan SDGs pada tahun {{ tahun }}</div>
          <BarChart v-if="sdgsItems.length" :data="sdgsItems" />
          <p v-else class="empty-state">Belum ada data SDGs untuk tahun {{ tahun }}.</p>
        </RevealBlock>

        <RevealBlock class="info-card">
          <h3>Distribusi Skema Hibah {{ tahun }}</h3>
          <div class="cap">Proporsi usulan berdasarkan skema pendanaan pada tahun {{ tahun }}</div>
          <div class="donut-wrap" v-if="skemaItems.length">
            <DonutChart :data="skemaDonut" :center-value="totalUsulan" center-label="usulan" />
            <div class="legend legend-col">
              <span v-for="d in skemaItems" :key="d.label" class="item">
                <span class="dot" :style="{ background: colorFor(d.label) }"></span>{{ d.label }} ({{ d.count }})
              </span>
            </div>
          </div>
          <p v-else class="empty-state">Belum ada data skema untuk tahun {{ tahun }}.</p>
        </RevealBlock>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { INFOGRAFIS } from '@/data'
import RevealBlock from './RevealBlock.vue'
import AnimatedNumber from './AnimatedNumber.vue'
import SkeletonBlock from './SkeletonBlock.vue'
import BarChart from './charts/BarChart.vue'
import DonutChart from './charts/DonutChart.vue'
import { useInfografis } from '@/composables/useInfografis'

const { tahun, data: stats, status, years, init, setYear } = useInfografis()

const PALETTE = ['#1F4D36', '#2F6B4F', '#C99A3B', '#9B4224', '#4C6B8A', '#7A4C9B', '#B0542F', '#3B7A57', '#8A6D3B', '#5B7C9E']

const ledgerItems = computed(() => {
  const s = stats.value
  if (!s) return []
  return [
    { count: s.total_usulan, label: 'Total Usulan' },
    { count: s.dosen_unik, label: 'Dosen Aktif sebagai Peneliti (Unik)' },
    { count: s.mahasiswa_unik, label: 'Mahasiswa Terlibat Riset & Pengabdian (Unik)' },
    { count: s.jumlah_skema, label: 'Jumlah Skema Hibah Digunakan' },
  ]
})

const sdgsItems = computed(() =>
  (stats.value?.sdgs_trend || []).map(d => ({ label: d.label, count: d.count }))
)

const skemaItems = computed(() => stats.value?.skema_distribusi || [])

const totalUsulan = computed(() => stats.value?.total_usulan || 0)

const skemaDonut = computed(() =>
  skemaItems.value.map((d, i) => ({
    label: d.label,
    count: d.count,
    val: totalUsulan.value > 0 ? (d.count / totalUsulan.value) * 100 : 0,
    color: PALETTE[i % PALETTE.length],
  }))
)

function colorFor(label: string): string {
  const i = skemaItems.value.findIndex(d => d.label === label)
  return PALETTE[(i < 0 ? 0 : i) % PALETTE.length]
}

function onYearChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  if (v) setYear(v)
}

onMounted(() => { init() })
</script>

<style scoped>
.year-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  font-size: 0.9rem;
  color: var(--ink-soft, #5a6b5e);
}
.year-filter select {
  padding: 7px 12px;
  border: 1px solid var(--line, #ddd6c3);
  border-radius: 8px;
  background: var(--paper, #fff);
  font-size: 0.9rem;
  font-weight: 600;
}
.year-filter-status { font-size: 0.8rem; color: var(--ink-soft, #5a6b5e); }
.year-filter-status.error { color: #b45309; }
.empty-state { color: var(--ink-soft, #5a6b5e); font-size: 0.9rem; padding: 18px 0; }
.donut-wrap {
  display: flex;
  align-items: center;
  gap: 26px;
}
.legend-col {
  flex-direction: column;
  gap: 10px;
}
</style>
