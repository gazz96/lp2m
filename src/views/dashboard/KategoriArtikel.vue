<template>
  <div class="wrap">
    <h1>Kategori Artikel</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">Kelola kategori untuk artikel.</p>

    <div class="components-panel" style="margin-bottom:20px">
      <div class="components-panel__body">
        <div style="display:flex;gap:12px;align-items:flex-end">
          <div style="flex:1">
            <label class="components-base-control__label">Nama Kategori</label>
            <input class="components-text-control__input" type="text" v-model="newName" placeholder="cth. Berita" @keyup.enter="addCat" />
          </div>
          <div style="flex:1">
            <label class="components-base-control__label">Slug <span style="font-weight:400;text-transform:none">(opsional)</span></label>
            <input class="components-text-control__input" type="text" v-model="newSlug" placeholder="berita" />
          </div>
          <WpButton variant="primary" @click="addCat" :disabled="!newName.trim()||adding">{{ adding?'Menyimpan...':'Tambah' }}</WpButton>
        </div>
        <div v-if="err" class="components-notice is-error" style="margin-top:12px;margin-bottom:0"><div class="components-notice__content">{{ err }}</div></div>
      </div>
    </div>

    <WpTable :columns="columns" :rows="terms" emptyTitle="Belum ada kategori." emptySub="Gunakan form di atas." />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SITE } from '@/data'
import { useAuthStore } from '@/stores/auth'
import WpTable from '@/components/WpTable.vue'
import WpButton from '@/components/WpButton.vue'
import type { WpColumn } from '@/components/WpTable.vue'
const auth=useAuthStore()
const terms=ref<{id:number;name:string;slug:string;count:number}[]>([])
const newName=ref(''),newSlug=ref(''),adding=ref(false),err=ref('')
const columns:WpColumn[]=[{key:'name',label:'Nama',primary:true},{key:'slug',label:'Slug'},{key:'count',label:'Jumlah',width:'80px'}]
async function load(){try{const r=await window.fetch(`${SITE.apiBase}/categories?per_page=100&orderby=name&order=asc`);if(r.ok)terms.value=await r.json()}catch{}}
async function addCat(){const n=newName.value.trim();if(!n)return;adding.value=true;err.value='';const s=newSlug.value.trim()||n.toLowerCase().replace(/[^a-z0-9]+/g,'-')
  try{const r=await window.fetch(`${SITE.apiBase}/categories`,{method:'POST',headers:{'Content-Type':'application/json',...auth.authHeaders()},body:JSON.stringify({name:n,slug:s})});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).message||'Gagal');newName.value='';newSlug.value='';load()}catch(e:any){err.value=e.message}finally{adding.value=false}}
onMounted(load)
</script>
