import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardHome from '@/views/dashboard/HomePage.vue'
import HibahIndex from '@/views/dashboard/Hibah/Index.vue'
import HibahForm from '@/views/dashboard/Hibah/Form.vue'
import HibahKategori from '@/views/dashboard/Hibah/Kategori.vue'
import HibahModel from '@/views/dashboard/Hibah/Model.vue'
import HibahJenis from '@/views/dashboard/Hibah/Jenis.vue'
import HibahSdgs from '@/views/dashboard/Hibah/Sdgs.vue'
import HibahKelompokKeahlian from '@/views/dashboard/Hibah/KelompokKeahlian.vue'
import KelolaArtikel from '@/views/dashboard/KelolaArtikel.vue'
import ArtikelForm from '@/views/dashboard/ArtikelForm.vue'
import KategoriArtikel from '@/views/dashboard/KategoriArtikel.vue'
import Pendaftaran from '@/views/dashboard/Pendaftaran.vue'
import PendaftaranDetail from '@/views/dashboard/PendaftaranDetail.vue'
import Profile from '@/views/dashboard/Profile.vue'
import Settings from '@/views/dashboard/Settings.vue'
import SuksesView from '@/views/SuksesView.vue'
import TrackStatusView from '@/views/TrackStatusView.vue'
import BlogView from '@/views/BlogView.vue'
import HibahArchiveView from '@/views/HibahArchiveView.vue'
import HibahDetailView from '@/views/HibahDetailView.vue'
import ArtikelDetailView from '@/views/ArtikelDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() { return { top: 0 } },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/v/sukses/:no', name: 'sukses', component: SuksesView },
    { path: '/blog', name: 'blog', component: BlogView },
    { path: '/hibah', name: 'hibah-archive', component: HibahArchiveView },
    { path: '/hibah/:slug', name: 'hibah-detail', component: HibahDetailView },
    { path: '/artikel/:slug', name: 'artikel-detail', component: ArtikelDetailView },
    { path: '/halaman/:slug', name: 'page-detail', component: ArtikelDetailView },
    { path: '/daftar/status', name: 'track', component: TrackStatusView },
    { path: '/daftar/status/:no', name: 'track-no', component: TrackStatusView },
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
        { path: 'hibah/skema', name: 'hibah-skema', redirect: { name: 'hibah-model' } },
        { path: 'hibah/model', name: 'hibah-model', component: HibahModel },
        { path: 'hibah/jenis', name: 'hibah-jenis', component: HibahJenis },
        { path: 'hibah/sdgs', name: 'hibah-sdgs', component: HibahSdgs },
        { path: 'hibah/kelompok-keahlian', name: 'hibah-kelompok-keahlian', component: HibahKelompokKeahlian },
        { path: 'kelola-artikel', name: 'kelola-artikel', component: KelolaArtikel },
        { path: 'artikel', name: 'artikel', component: KelolaArtikel },
        { path: 'artikel/tambah', name: 'artikel-tambah', component: ArtikelForm },
        { path: 'artikel/:id', name: 'artikel-edit', component: ArtikelForm },
        { path: 'kelola-artikel/kategori', name: 'kelola-artikel-kategori', component: KategoriArtikel },
        { path: 'artikel/kategori', name: 'artikel-kategori', component: KategoriArtikel },
        { path: 'pendaftaran', name: 'pendaftaran', component: Pendaftaran },
        { path: 'pendaftaran/:id', name: 'pendaftaran-detail', component: PendaftaranDetail },
        { path: 'profile', name: 'profile', component: Profile },
        { path: 'settings', name: 'settings', component: Settings },
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
