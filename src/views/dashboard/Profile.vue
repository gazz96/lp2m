<template>
  <div class="wrap">
    <h1>Profile</h1>
    <p style="color:var(--wp-text-secondary);margin-top:-8px;margin-bottom:20px">Data diambil dari WordPress ITSI.</p>

    <div class="components-panel" style="margin-bottom:16px">
      <div class="components-panel__body">
        <table class="form-table" style="width:100%">
          <tr><th>Nama</th><td>{{ auth.user?.name || '—' }}</td></tr>
          <tr><th>Username</th><td>{{ auth.user?.name || '—' }}</td></tr>
          <tr><th>Role</th><td>{{ auth.isAdmin ? 'Administrator' : 'Editor' }}</td></tr>
          <tr><th>User ID</th><td>{{ auth.user?.id || '—' }}</td></tr>
        </table>
      </div>
    </div>

    <WpButton variant="destructive" @click="doLogout">Keluar / Logout</WpButton>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import WpButton from '@/components/WpButton.vue'
const router=useRouter()
const auth=useAuthStore()
function doLogout(){auth.logout();router.push('/')}
</script>
