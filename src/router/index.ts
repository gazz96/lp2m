import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardHome from '@/views/dashboard/HomePage.vue'
import HibahIndex from '@/views/dashboard/Hibah/Index.vue'
import HibahForm from '@/views/dashboard/Hibah/Form.vue'
import HibahKategori from '@/views/dashboard/Hibah/Kategori.vue'
import HibahSkema from '@/views/dashboard/Hibah/Skema.vue'
import KelolaArtikel from '@/views/dashboard/KelolaArtikel.vue'
import KategoriArtikel from '@/views/dashboard/KategoriArtikel.vue'
import Pendaftaran from '@/views/dashboard/Pendaftaran.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() { return { top: 0 } },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardHome },
        { path: 'hibah', name: 'hibah', component: HibahIndex },
        { path: 'hibah/tambah', name: 'hibah-tambah', component: HibahForm },
        { path: 'hibah/:id', name: 'hibah-edit', component: HibahForm },
        { path: 'hibah/kategori', name: 'hibah-kategori', component: HibahKategori },
        { path: 'hibah/skema', name: 'hibah-skema', component: HibahSkema },
        { path: 'kelola-artikel', name: 'kelola-artikel', component: KelolaArtikel },
        { path: 'kelola-artikel/kategori', name: 'kelola-artikel-kategori', component: KategoriArtikel },
        { path: 'pendaftaran', name: 'pendaftaran', component: Pendaftaran },
      ]
    }
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login') {
    const auth = useAuthStore()
    if (auth.isLoggedIn) return { name: 'dashboard' }
  }
})

export default router
