<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div id="primary" class="content-area" style="max-width:860px;margin:0 auto;padding:60px 16px">
      <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
      <div v-else-if="notFound" style="text-align:center;padding:40px;color:var(--ink-soft)">Hibah tidak ditemukan.</div>
      <article v-else-if="item">
        <div style="font-size:13px;color:var(--ink-soft);margin-bottom:8px">{{ fmtDate(item.date) }}</div>
        <h1 style="font-size:36px;margin-bottom:24px" v-html="item.title?.rendered"></h1>
        <div v-if="item._embedded?.['wp:featuredmedia']?.[0]?.source_url" style="margin-bottom:32px">
          <img :src="item._embedded['wp:featuredmedia'][0].source_url" style="width:100%;border-radius:8px" />
        </div>
        <div class="entry-content" v-html="item.content?.rendered"></div>
        <div v-if="hasMeta" class="meta-card" style="margin-top:32px;padding:20px;border:1px solid var(--border);border-radius:8px">
          <div v-for="row in metaRows" :key="row.label" style="display:flex;gap:12px;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="width:160px;flex-shrink:0;color:var(--ink-soft)">{{ row.label }}</span>
            <span>{{ row.value }}</span>
          </div>
        </div>
        <div style="margin-top:32px">
          <WpButton variant="primary" :to="`/dashboard/daftar?hibah=${item.id}`">Daftar Sekarang</WpButton>
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
import WpButton from '@/components/WpButton.vue'

const item=ref<Record<string,any> | null>(null),loading=ref(true),notFound=ref(false)
const base=SITE.apiBase.replace('/wp/v2','')

function fmtDate(d:string){return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
function clean(s:string){return new DOMParser().parseFromString(s,'text/html').body.textContent||''}

const hasMeta = computed(() => !!item.value && (
  item.value.deadline_label || item.value.dana_maks || item.value.event_eyebrow
))
const metaRows = computed(() => {
  const p = item.value
  if (!p) return []
  const rows: {label:string;value:string}[] = []
  if (p.event_eyebrow) rows.push({label:'Tahun Akademik',value:clean(p.event_eyebrow)})
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
