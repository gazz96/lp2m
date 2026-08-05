<template>
  <TopBar />
  <SiteNav />
  <main id="site-content">
    <div id="primary" class="content-area" style="max-width:760px;margin:0 auto;padding:60px 16px">
      <div v-if="loading" style="text-align:center;padding:40px"><span class="spinner" style="display:inline-block"></span></div>
      <div v-else-if="notFound" style="text-align:center;padding:40px;color:var(--ink-soft)">Artikel tidak ditemukan.</div>
      <article v-else-if="item">
        <div style="font-size:13px;color:var(--ink-soft);margin-bottom:8px">{{ fmtDate(item.date) }}</div>
        <h1 style="font-size:36px;margin-bottom:24px" v-html="item.title?.rendered"></h1>
        <div v-if="item._embedded?.author?.[0]" style="font-size:14px;color:var(--ink-soft);margin-bottom:24px">
          Oleh <strong>{{ item._embedded.author[0].name }}</strong>
        </div>
        <div v-if="item._embedded?.['wp:featuredmedia']?.[0]?.source_url" style="margin-bottom:32px">
          <img :src="item._embedded['wp:featuredmedia'][0].source_url" style="width:100%;border-radius:8px" />
        </div>
        <div class="entry-content" v-html="item.content?.rendered"></div>
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

const item=ref<Record<string,any> | null>(null),loading=ref(true),notFound=ref(false)
const base=SITE.apiBase.replace('/wp/v2','')

function fmtDate(d:string){return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}

onMounted(async ()=>{
  const slug=(useRoute().params.slug as string)
  try{
    const r=await fetch(`${base}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=author,wp:featuredmedia`)
    if(!r.ok)throw new Error('HTTP '+r.status)
    const data=await r.json()
    if(data?.length) item.value=data[0]; else notFound.value=true
  }catch{notFound.value=true}
  finally{loading.value=false}
})
</script>
