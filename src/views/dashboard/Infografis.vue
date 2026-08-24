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
        <h3>Distribusi Jenis Hibah {{ tahun }}</h3>
        <div class="cap">Proporsi usulan berdasarkan jenis hibah</div>
        <div v-if="jenisDonut.length" class="donut-row">
          <div class="donut-box">
            <DonutChart
              :data="jenisDonut"
              :center-value="jenisCenterValue"
              :center-label="jenisCenterLabel"
              drillable
              @select="onJenisSelect"
            />
            <button v-if="activeJenis" class="btn-back" @click="activeJenis = ''">← Semua Jenis</button>
          </div>
          <div class="legend legend-col">
            <span v-for="(d, i) in jenisLegend" :key="'jl-' + i" class="item" :class="{ active: d.active }">
              <span class="dot" :style="{ background: d.color }"></span>
              <span class="lg-abbr">{{ d.abbr }}</span>
              <span class="lg-name">{{ d.label }}</span>
              <span class="lg-count">{{ d.count }}</span>
            </span>
          </div>
        </div>
        <p v-else class="empty-state">Belum ada data jenis hibah untuk tahun {{ tahun }}.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AnimatedNumber from '@/components/AnimatedNumber.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import { useInfografis } from '@/composables/useInfografis'

const { tahun, data: stats, status, years, init, setYear } = useInfografis()

const PALETTE = ['#1F4D36', '#2F6B4F', '#C99A3B', '#9B4224', '#4C6B8A', '#7A4C9B', '#B0542F', '#3B7A57', '#8A6D3B', '#5B7C9E']

// Drill-down jenis hibah.
const activeJenis = ref('')

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
const totalUsulan = computed(() => stats.value?.total_usulan || 0)

const jenisParents = computed(() => stats.value?.jenis_distribusi || [])
const activeParent = computed(() => jenisParents.value.find(p => p.label === activeJenis.value) || null)

const jenisDonut = computed(() => {
  const isChild = !!activeParent.value
  const items = isChild
    ? (activeParent.value?.children || []).map((c, i) => ({ label: c.label, count: c.count, clickable: false }))
    : jenisParents.value.map((p, i) => ({ label: p.label, count: p.count, clickable: (p.children || []).length > 0 }))

  return items.map((d, i) => ({
    label: d.label,
    count: d.count,
    clickable: d.clickable,
    val: (d.count / totalUsulan.value) * 100,
    color: PALETTE[i % PALETTE.length],
  }))
})

const jenisCenterValue = computed(() =>
  activeJenis.value ? (activeParent.value?.count || 0) : totalUsulan.value
)
const jenisCenterLabel = computed(() => {
  if (activeJenis.value) {
    return abbr(activeParent.value?.label || '')
  }
  return 'usulan'
})

const jenisLegend = computed(() => {
  const isChild = !!activeParent.value
  const list = isChild
    ? (activeParent.value?.children || [])
    : jenisParents.value.map(p => ({ label: p.label, count: p.count }))
  return list.map((d, i) => ({
    abbr: abbr(d.label),
    label: d.label,
    count: d.count,
    color: PALETTE[i % PALETTE.length],
    active: isChild ? false : d.label === activeJenis.value,
  }))
})

function onJenisSelect(seg: { label: string }) {
  const p = jenisParents.value.find(x => x.label === seg.label)
  if (p && (p.children || []).length > 0) {
    activeJenis.value = p.label
  }
}

function abbr(label: string): string {
  const parts = String(label).split(/[\s,]+/).filter(Boolean)
  const skip = new Set(['and', 'for', 'of', 'the', 'to', 'a', 'an', 'in', 'on', 'with', 'at'])
  const initials = parts.filter(w => !skip.has(w.toLowerCase())).map(w => w.charAt(0).toUpperCase()).join('')
  return (initials || label).slice(0, 4).toUpperCase()
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
.donut-box { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.btn-back {
  background: none;
  border: 1px solid var(--line, #ddd6c3);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.72rem;
  color: var(--ink-soft, #5a6b5e);
  cursor: pointer;
}
.btn-back:hover { background: var(--line, #eee8d8); }
.lg-abbr {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  color: #3E4C40;
  min-width: 26px;
}
.lg-name { color: #3E4C40; }
.lg-count {
  font-family: 'IBM Plex Mono', monospace;
  color: var(--ink-soft, #5a6b5e);
  opacity: 0.8;
  margin-left: auto;
}
.legend-col .item.active { outline: 1px solid var(--gold, #C99A3B); border-radius: 6px; padding: 2px 6px; }
.year-filter { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: var(--ink-soft); }
.year-filter select {
  padding: 7px 12px; border: 1px solid var(--line, #ddd6c3);
  border-radius: 8px; background: var(--paper, #fff); font-size: 0.9rem; font-weight: 600;
}
.year-filter-status { font-size: 0.8rem; color: var(--ink-soft); }
.year-filter-status.error { color: #b45309; }
.empty-state { color: var(--ink-soft); font-size: 0.9rem; padding: 18px 0; }
</style>
