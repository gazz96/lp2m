import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardHome from '@/views/dashboard/HomePage.vue'
import KelolaHibah from '@/views/dashboard/KelolaHibah.vue'
import LihatHibah from '@/views/dashboard/LihatHibah.vue'
import KelolaArtikel from '@/views/dashboard/KelolaArtikel.vue'
import LihatArtikel from '@/views/dashboard/LihatArtikel.vue'
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
        { path: 'kelola-hibah', name: 'kelola-hibah', component: KelolaHibah },
        { path: 'lihat-hibah', name: 'lihat-hibah', component: LihatHibah },
        { path: 'kelola-artikel', name: 'kelola-artikel', component: KelolaArtikel },
        { path: 'lihat-artikel', name: 'lihat-artikel', component: LihatArtikel },
        { path: 'pendaftaran', name: 'pendaftaran', component: Pendaftaran },
      ]
    }
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
  if (to.name === 'login') {
    const auth = useAuthStore()
    if (auth.isLoggedIn) {
      return { name: 'dashboard' }
    }
  }
})

export default router
