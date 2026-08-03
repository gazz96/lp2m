<template>
  <div class="dashboard-shell">
    <!-- Sidebar -->
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

    <!-- Main content -->
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

function doLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background: var(--paper);
}

.dash-sidebar {
  width: 260px;
  background: var(--green-900);
  color: var(--green-100);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
}

.dash-brand {
  padding: 22px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.dash-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  text-decoration: none;
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 0.95rem;
}
.brand-mark-sm {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--green-600);
  display: flex; align-items: center; justify-content: center;
  color: var(--gold-soft);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.dash-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-section {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--green-400);
  padding: 12px 12px 4px;
  font-weight: 700;
}
.dash-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 5px;
  color: var(--green-100);
  text-decoration: none;
  font-size: 0.88rem;
  transition: background 0.15s;
}
.dash-link:hover { background: rgba(255,255,255,0.08); color: #fff; }
.dash-link.active { background: rgba(201,154,59,0.2); color: var(--gold-soft); }
.dash-link.sub { padding-left: 28px; font-size: 0.82rem; }
.dash-icon { width: 20px; height: 20px; flex-shrink: 0; display: block; }
.dash-link.sub .dash-icon { width: 16px; height: 16px; }

.dash-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dash-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--gold-soft);
  color: var(--green-900);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}
.user-info {
  overflow: hidden;
}
.user-name {
  font-size: 0.82rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 0.7rem;
  color: var(--green-300);
}
.btn-logout {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: var(--green-100);
  border-radius: 5px;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-logout:hover { background: rgba(255,255,255,0.08); color: #fff; }
.dash-link-sm {
  color: var(--green-300);
  text-decoration: none;
  font-size: 0.8rem;
}
.dash-link-sm:hover { color: #fff; }

.dash-main {
  flex: 1;
  margin-left: 260px;
  padding: 32px;
  max-width: 1100px;
}

/* Dashboard global styles */
.dash-main h1 {
  font-size: 1.6rem;
  margin-bottom: 8px;
  color: var(--green-900);
}
.dash-main .subtitle {
  color: var(--ink-soft);
  font-size: 0.92rem;
  margin-bottom: 28px;
}
.dash-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
}
.dash-card h3 {
  font-size: 1.05rem;
  margin-bottom: 14px;
}
.dash-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.dash-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.dash-stat {
  background: var(--green-800);
  color: #fff;
  border-radius: 8px;
  padding: 20px;
}
.dash-stat .num {
  font-family: 'Fraunces', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--gold-soft);
}
.dash-stat .lbl {
  font-size: 0.8rem;
  color: var(--green-100);
  margin-top: 4px;
}

@media (max-width: 800px) {
  .dash-sidebar { width: 200px; }
  .dash-main { margin-left: 200px; padding: 20px; }
  .dash-grid-2, .dash-grid-3 { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .dashboard-shell { flex-direction: column; }
  .dash-sidebar {
    width: 100%;
    position: relative;
    flex-direction: row;
    overflow-x: auto;
    padding: 12px;
    gap: 8px;
  }
  .dash-brand, .dash-nav { display: flex; gap: 6px; }
  .dash-nav { flex-direction: row; padding: 0; }
  .dash-link { padding: 8px 10px; font-size: 0.78rem; }
  .dash-footer { display: none; }
  .dash-main { margin-left: 0; padding: 16px; }
}
</style>
