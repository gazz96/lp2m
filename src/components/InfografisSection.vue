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

      <RevealBlock class="ledger-grid" style="margin-bottom:28px">
        <div v-for="item in INFOGRAFIS.ledger" :key="item.label" class="ledger-card">
          <div class="num">
            <AnimatedNumber :target="item.count" :decimals="item.decimals" :suffix="item.suffix || ''" />
          </div>
          <div class="lbl">{{ item.label }}</div>
        </div>
      </RevealBlock>

      <div class="info-grid">
        <RevealBlock class="info-card">
          <h3>Tren Usulan 5 Tahun Terakhir</h3>
          <div class="cap">Jumlah usulan penelitian dan pengabdian yang masuk per tahun anggaran</div>
          <BarChart />
          <div class="legend">
            <span class="item"><span class="dot" style="background:#2A5F42"></span>Penelitian</span>
            <span class="item"><span class="dot" style="background:#C99A3B"></span>Pengabdian</span>
          </div>
        </RevealBlock>

        <RevealBlock class="info-card">
          <h3>Distribusi Skema Hibah 2025</h3>
          <div class="cap">Proporsi usulan berdasarkan skema pendanaan internal</div>
          <div class="donut-wrap">
            <DonutChart :data="INFOGRAFIS.donutData" />
            <div class="legend legend-col">
              <span v-for="d in INFOGRAFIS.donutData" :key="d.label" class="item">
                <span class="dot" :style="{ background: d.color }"></span>{{ d.label }}
              </span>
            </div>
          </div>
        </RevealBlock>
      </div>

      <RevealBlock class="info-card">
        <h3>Sebaran Wilayah Pengabdian</h3>
        <div class="cap">Jumlah desa/kelompok mitra binaan LP2M per wilayah kerja sama, Sumatera Utara</div>
        <div class="region-list">
          <div v-for="r in INFOGRAFIS.regions" :key="r.name" class="region-row">
            <span>{{ r.name }}</span>
            <span class="bar-track">
              <span class="bar-fill" :ref="(el: any) => observeBar(el, r.width)"></span>
            </span>
            <span class="val">{{ r.val }}</span>
          </div>
        </div>
      </RevealBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { INFOGRAFIS } from '@/data'
import RevealBlock from './RevealBlock.vue'
import AnimatedNumber from './AnimatedNumber.vue'
import BarChart from './charts/BarChart.vue'
import DonutChart from './charts/DonutChart.vue'

function observeBar(el: any, width: number) {
  if (!el) return
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        el.style.width = width + '%'
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.3 })
  observer.observe(el)
}
</script>

<style scoped>
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
