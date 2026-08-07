<template>
  <div>
    <h1>📊 Infografis</h1>
    <p class="subtitle">Visualisasi capaian LP2M dari data pendaftaran — filter per tahun.</p>

    <!-- Filter tahun -->
    <div class="year-filter" style="margin-bottom:20px">
      <label for="infografis-dash-tahun">Tahun:</label>
      <select id="infografis-dash-tahun" :value="tahun" @change="onYearChange" :disabled="status === 'loading'">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        <option v-if="!years.length" :value="tahun">{{ tahun }}</option>
      </select>
      <span v-if="status === 'loading'" class="year-filter-status">Memuat data…</span>
      <span v-else-if="status === 'error'" class="year-filter-status error">Gagal memuat — data statis ditampilkan</span>
    </div>

    <!-- Stat cards -->
    <div class="dash-grid-3" style="margin-bottom:24px">
      <div v-if="status === 'loading' && !stats" class="dash-card"><SkeletonBlock variant="card" :count="1" /></div>
      <template v-else-if="stats">
        <div v-for="item in ledgerItems" :key="item.label" class="dash-card ledger-item">
          <div class="num-lg">
            <AnimatedNumber :target="item.count" />
          </div>
          <div class="lbl-sm">{{ item.label }}</div>
        </div>
      </template>
    </div>

    <!-- Charts row -->
    <div class="dash-grid-2" style="margin-bottom:20px">
      <div class="dash-card">
        <h3>Tren Usulan {{ tahun }} per SDGs</h3>
        <div class="cap">Jumlah usulan berdasarkan SDGs pada tahun {{ tahun }}</div>
        <BarChart v-if="sdgsItems.length" :data="sdgsItems" />
        <p v-else class="empty-state">Belum ada data SDGs untuk tahun {{ tahun }}.</p>
      </div>

      <div class="dash-card">
        <h3>Distribusi Skema Hibah {{ tahun }}</h3>
        <div class="cap">Proporsi usulan berdasarkan skema pendanaan</div>
        <div v-if="skemaItems.length" class="donut-row">
          <DonutChart :data="skemaDonut" :center-value="totalUsulan" center-label="usulan" />
          <div class="legend legend-col">
            <span v-for="d in skemaItems" :key="d.label" class="item">
              <span class="dot" :style="{ background: colorFor(d.label) }"></span>{{ d.label }} ({{ d.count }})
            </span>
          </div>
        </div>
        <p v-else class="empty-state">Belum ada data skema untuk tahun {{ tahun }}.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AnimatedNumber from '@/components/AnimatedNumber.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
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
.ledger-item { text-align: center; padding: 22px; }
.num-lg {
  font-family: 'Fraunces', serif; font-weight: 700;
  font-size: 2.1rem; color: var(--green-700);
}
.lbl-sm { font-size: 0.8rem; color: var(--ink-soft); margin-top: 4px; }
.cap { font-size: 0.78rem; color: var(--ink-soft); margin-bottom: 20px; }
.legend { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 14px; }
.legend .item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--ink-soft); }
.legend .dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
.legend-col { flex-direction: column; gap: 8px; }
.donut-row { display: flex; align-items: center; gap: 22px; }
.year-filter { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: var(--ink-soft); }
.year-filter select {
  padding: 7px 12px; border: 1px solid var(--line, #ddd6c3);
  border-radius: 8px; background: var(--paper, #fff); font-size: 0.9rem; font-weight: 600;
}
.year-filter-status { font-size: 0.8rem; color: var(--ink-soft); }
.year-filter-status.error { color: #b45309; }
.empty-state { color: var(--ink-soft); font-size: 0.9rem; padding: 18px 0; }
</style>
