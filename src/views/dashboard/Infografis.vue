<template>
  <div>
    <h1>📊 Infografis</h1>
    <p class="subtitle">Visualisasi capaian LP2M — penelitian, pengabdian, dan sebaran wilayah.</p>

    <!-- Stat cards -->
    <div class="dash-grid-3" style="margin-bottom:24px">
      <div v-for="item in INFOGRAFIS.ledger" :key="item.label" class="dash-card ledger-item">
        <div class="num-lg">
          <AnimatedNumber :target="item.count" :decimals="item.decimals" :suffix="item.suffix || ''" />
        </div>
        <div class="lbl-sm">{{ item.label }}</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="dash-grid-2" style="margin-bottom:20px">
      <div class="dash-card">
        <h3>Tren Usulan 5 Tahun Terakhir</h3>
        <div class="cap">Jumlah usulan penelitian dan pengabdian per tahun</div>
        <BarChart />
        <div class="legend">
          <span class="item"><span class="dot" style="background:#2A5F42"></span>Penelitian</span>
          <span class="item"><span class="dot" style="background:#C99A3B"></span>Pengabdian</span>
        </div>
      </div>

      <div class="dash-card">
        <h3>Distribusi Skema Hibah 2025</h3>
        <div class="cap">Proporsi usulan berdasarkan skema pendanaan</div>
        <div class="donut-row">
          <DonutChart :data="INFOGRAFIS.donutData" />
          <div class="legend legend-col">
            <span v-for="d in INFOGRAFIS.donutData" :key="d.label" class="item">
              <span class="dot" :style="{ background: d.color }"></span>{{ d.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Region bars -->
    <div class="dash-card">
      <h3>Sebaran Wilayah Pengabdian — Sumatera Utara</h3>
      <div class="cap" style="margin-bottom:16px">Jumlah desa/kelompok mitra binaan LP2M per wilayah</div>
      <div class="region-list">
        <div v-for="r in INFOGRAFIS.regions" :key="r.name" class="region-row">
          <span>{{ r.name }}</span>
          <span class="bar-track"><span class="bar-fill" :style="{ width: r.width + '%' }"></span></span>
          <span class="val">{{ r.val }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { INFOGRAFIS } from '@/data'
import AnimatedNumber from '@/components/AnimatedNumber.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
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

.region-list { display: grid; gap: 10px; }
.region-row { display: grid; grid-template-columns: 150px 1fr 40px; align-items: center; gap: 12px; font-size: 0.83rem; }
.region-row .bar-track { background: var(--paper-2); border-radius: 3px; height: 10px; overflow: hidden; }
.region-row .bar-fill { height: 100%; background: var(--green-600); border-radius: 3px; transition: width 1s ease; }
.region-row .val { text-align: right; color: var(--ink-soft); font-family: 'IBM Plex Mono', monospace; font-size: 0.76rem; }
</style>
