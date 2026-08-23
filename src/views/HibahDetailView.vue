<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div id="primary" class="content-area hibah-detail-page">
      <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
      <div v-else-if="notFound" style="text-align:center;padding:40px;color:var(--ink-soft)">Hibah tidak ditemukan.</div>
      <article v-else-if="item">
        <nav class="breadcrumb">
          <router-link to="/hibah">Hibah</router-link>
          <span class="sep">/</span>
          <span>{{ item.title?.rendered ? clean(item.title.rendered) : '' }}</span>
        </nav>

        <div class="meta-line">
          <span>{{ fmtDate(item.date) }}</span>
          <span v-if="item.status_hibah" class="badge" :class="statusClass">{{ statusLabel }}</span>
        </div>

        <h1 style="font-size:36px;margin-bottom:24px" v-html="item.title?.rendered"></h1>

        <div v-if="featured" class="featured-media">
          <img
            :src="featured.src"
            :srcset="featured.srcset"
            :sizes="featured.sizes"
            :alt="featured.alt"
            loading="lazy"
            decoding="async"
            width="1200"
            height="675"
          />
        </div>

        <div class="entry-content" v-html="item.content?.rendered"></div>
        <div v-if="hasMeta" class="meta-card" style="margin-top:32px;padding:20px;border:1px solid var(--line);border-radius:8px">
          <div v-for="row in metaRows" :key="row.label" style="display:flex;gap:12px;padding:6px 0;border-bottom:1px solid var(--line)">
            <span style="width:160px;flex-shrink:0;color:var(--ink-soft)">{{ row.label }}</span>
            <span>{{ row.value }}</span>
          </div>
        </div>

        <!-- Form pendaftaran inline -->
        <div id="form-hibah" class="form-section" style="margin-top:40px">
          <div class="form-head">
            <h2 style="font-size:1.5rem;margin-bottom:6px">Daftar Hibah Ini</h2>
            <p style="color:var(--ink-soft);margin:0">Isi formulir di bawah untuk mengajukan usulan pada hibah ini.</p>
          </div>
          <HibahForm
            :hibah-id="item.id"
            :deadline="item.deadline"
            :file-panduan="item.file_panduan || []"
            :file-template="item.file_template || []"
            :file-kelompok-keahlian="item.file_kelompok_keahlian || []"
          />
        </div>
      </article>
    </div>
  </main>
  <SiteFooter />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { SITE } from '@/data'
import TopBar from '@/components/TopBar.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import HibahForm from '@/components/HibahForm.vue'

const item=ref<Record<string,any> | null>(null),loading=ref(true),notFound=ref(false)
const base=SITE.apiBase.replace('/wp/v2','')

function fmtDate(d:string){return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}

// ── Responsive featured image ──
const featured = computed(() => {
  const media = item.value?._embedded?.['wp:featuredmedia']?.[0]
  if (!media?.source_url) return null
  const sizes = media.media_details?.sizes || {}
  const pick = sizes.medium_large || sizes.large || sizes.medium
  const src = pick?.source_url || media.source_url
  const srcset = Object.values(sizes)
    .filter((s: any) => s?.source_url && s?.width)
    .sort((a: any, b: any) => a.width - b.width)
    .map((s: any) => `${s.source_url} ${s.width}w`)
    .join(', ')
  return {
    src,
    srcset: srcset || undefined,
    sizes: srcset ? '(max-width: 860px) 100vw, 860px' : undefined,
    alt: media.alt_text || (item.value?.title?.rendered ? clean(item.value.title.rendered) : '') || ''
  }
})

// ── Status badge ──
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  open: { label: 'Dibuka', cls: 'is-open' },
  closed: { label: 'Ditutup', cls: 'is-closed' },
  announced: { label: 'Diumumkan', cls: 'is-announced' },
  draft: { label: 'Draft', cls: 'is-draft' }
}
const statusInfo = computed(() => STATUS_MAP[item.value?.status_hibah || ''] || null)
const statusLabel = computed(() => statusInfo.value?.label || (item.value?.status_hibah || '').toUpperCase() || '')
const statusClass = computed(() => statusInfo.value?.cls || '')

const hasMeta = computed(() => !!item.value && (
  item.value.deadline_label || item.value.dana_maks || item.value.event_eyebrow
  || item.value.model_hibah_names?.length || item.value.jenis_hibah_names?.length
  || item.value.sdgs_names?.length || item.value.kelompok_keahlian_names?.length
))
const metaRows = computed(() => {
  const p = item.value
  if (!p) return []
  const rows: {label:string;value:string}[] = []
  if (p.event_eyebrow) rows.push({label:'Tahun Akademik',value:clean(p.event_eyebrow)})
  if (p.model_hibah_names?.length) rows.push({label:'Model Hibah',value:p.model_hibah_names.join(', ')})
  if (p.jenis_hibah_names?.length) rows.push({label:'Jenis Hibah',value:p.jenis_hibah_names.join(', ')})
  if (p.sdgs_names?.length) rows.push({label:'SDGs',value:p.sdgs_names.join(', ')})
  if (p.kelompok_keahlian_names?.length) rows.push({label:'Kelompok Keahlian',value:p.kelompok_keahlian_names.join(', ')})
  if (p.deadline_label) rows.push({label:'Deadline',value:p.deadline_label})
  if (p.dana_maks) rows.push({label:'Dana Maks',value:'Rp '+Number(p.dana_maks).toLocaleString('id-ID')})
  return rows
})

onMounted(async ()=>{
  const slug=(useRoute().params.slug as string)
  try{
    const r=await fetch(`${base}/wp/v2/hibah?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia`)
    if(!r.ok)throw new Error('HTTP '+r.status)
    const data=await r.json()
    if(data?.length) item.value=data[0]; else notFound.value=true
  }catch{notFound.value=true}
  finally{loading.value=false}
})
</script>

<style scoped>
.hibah-detail-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 60px 16px;
}
.breadcrumb {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.82rem;
  color: var(--ink-soft);
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.breadcrumb a { color: var(--green-700); font-weight: 600; }
.breadcrumb .sep { opacity: 0.5; }
.meta-line {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  font-size: 0.86rem;
  color: var(--ink-soft);
}
.badge {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.badge.is-open { background: #d5f5e3; color: #1e8449; }
.badge.is-closed { background: #e5e7e5; color: #6b7280; }
.badge.is-announced { background: var(--green-100); color: var(--green-800); }
.badge.is-draft { background: #fef9e7; color: #7d6608; }
.featured-media { margin-bottom: 32px; }
.featured-media img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}
.form-section { border-top: 2px solid var(--line); padding-top: 32px; }
.form-head { margin-bottom: 24px; }
</style>
