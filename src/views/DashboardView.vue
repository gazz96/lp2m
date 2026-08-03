<template>
  <div class="dashboard-shell">
    <aside class="dash-sidebar">
      <div class="dash-brand">
        <router-link to="/" class="dash-logo">
          <div class="brand-mark-sm">LP</div>
          <span>LP2M Dashboard</span>
        </router-link>
      </div>
      <nav class="dash-nav">
        <router-link to="/dashboard" exact-active-class="active" class="dash-link">
          <svg class="dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Beranda
        </router-link>
        <div class="nav-section">Hibah</div>
        <router-link to="/dashboard/hibah" active-class="active" class="dash-link sub">
          <svg class="dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Lihat Hibah
        </router-link>
        <router-link to="/dashboard/hibah/tambah" active-class="active" class="dash-link sub">
          <svg class="dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Hibah
        </router-link>
        <router-link to="/dashboard/hibah/kategori" active-class="active" class="dash-link sub">
          <svg class="dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Kategori Hibah
        </router-link>
        <router-link to="/dashboard/hibah/skema" active-class="active" class="dash-link sub">
          <svg class="dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
          Skema Hibah
        </router-link>
        <router-link to="/dashboard/kelola-artikel" active-class="active" class="dash-link">
          <svg class="dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Kelola Artikel
        </router-link>
        <router-link to="/dashboard/pendaftaran" active-class="active" class="dash-link">
          <svg class="dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
          Pendaftaran
        </router-link>
      </nav>
      <div class="dash-footer">
        <div class="dash-user" v-if="auth.isLoggedIn">
          <div class="user-avatar">{{ auth.userInitials }}</div>
          <div class="user-info">
            <div class="user-name">{{ auth.user?.name }}</div>
            <div class="user-role">{{ auth.isAdmin ? 'Admin' : 'Editor' }}</div>
          </div>
        </div>
        <button v-if="auth.isLoggedIn" @click="doLogout" class="btn-logout">Keluar</button>
        <router-link to="/" class="dash-link-sm">← Kembali ke Landing</router-link>
      </div>
    </aside>

    <main class="dash-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const router = useRouter()
const auth = useAuthStore()
function doLogout() { auth.logout(); router.push('/') }
</script>

<style scoped>
/* ── Shell ── */
.dashboard-shell { display: flex; min-height: 100vh; background: var(--wp-bg); }

/* ── Sidebar (WP admin-menu.css spec) ── */
.dash-sidebar {
  width: 240px; background: #1d2327; color: #f0f0f1;
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 40;
}

.dash-brand {
  padding: 18px 16px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.dash-logo {
  display: flex; align-items: center; gap: 10px;
  color: #fff; text-decoration: none; font-size: 14px; font-weight: 600;
}
.brand-mark-sm {
  width: 28px; height: 28px; border-radius: 4px;
  background: var(--wp-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}

.dash-nav { flex: 1; margin: 12px 0; padding: 0; display: flex; flex-direction: column; gap: 0; }

.nav-section {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.4); padding: 12px 16px 4px; font-weight: 600;
}

.dash-link {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; margin: 0 8px; border-radius: var(--wp-radius);
  color: #f0f0f1; text-decoration: none; font-size: 14px;
  line-height: 1.3; min-height: 34px; transition: background 0.1s;
}
.dash-link:hover { background: var(--wp-primary); color: #fff; }
.dash-link.active { background: var(--wp-primary); color: #fff; font-weight: 500; }
.dash-link.sub { padding-left: 20px; font-size: 13px; }

.dash-icon { width: 20px; height: 20px; flex-shrink: 0; display: block; color: rgba(240,246,252,0.6); }
.dash-link:hover .dash-icon,
.dash-link.active .dash-icon { color: #fff; }
.dash-link.sub .dash-icon { width: 16px; height: 16px; opacity: 0.7; }

/* ── Main Content ── */
.dash-main {
  margin-left: 240px; flex: 1; min-height: 100vh;
  padding: 32px; max-width: 1100px;
}

/* ── Footer ── */
.dash-footer { padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.08); }
.dash-user { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--wp-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.user-name { font-size: 13px; font-weight: 500; }
.user-role { font-size: 11px; color: rgba(255,255,255,0.45); }

.btn-logout {
  width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6); padding: 6px 14px; border-radius: var(--wp-radius);
  font-size: 12px; cursor: pointer; font-family: inherit; margin-bottom: 8px;
}
.btn-logout:hover { background: rgba(255,255,255,0.08); color: #fff; }
.dash-link-sm { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 12px; }
.dash-link-sm:hover { color: #fff; }
</style>

<style>
/* WP 7.0.2 Admin CSS — scoped to dashboard only (DashboardView) */
@import '@/assets/wp-admin.css';
</style>
