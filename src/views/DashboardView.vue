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
          <span class="dash-icon">🏠</span> Beranda Dashboard
        </router-link>
        <router-link to="/dashboard/event-hibah" active-class="active" class="dash-link">
          <span class="dash-icon">📋</span> Event & Hibah
        </router-link>
        <router-link to="/dashboard/panduan" active-class="active" class="dash-link">
          <span class="dash-icon">📘</span> Panduan & Template
        </router-link>
        <router-link to="/dashboard/berita-artikel" active-class="active" class="dash-link">
          <span class="dash-icon">📰</span> Berita & Artikel
        </router-link>
        <router-link to="/dashboard/infografis" active-class="active" class="dash-link">
          <span class="dash-icon">📊</span> Infografis
        </router-link>
      </nav>
      <div class="dash-footer">
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
.dash-icon { font-size: 1.1rem; width: 22px; text-align: center; }

.dash-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
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
