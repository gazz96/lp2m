import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardHome from '@/views/dashboard/HomePage.vue'
import EventHibah from '@/views/dashboard/EventHibah.vue'
import Panduan from '@/views/dashboard/Panduan.vue'
import BeritaArtikel from '@/views/dashboard/BeritaArtikel.vue'
import Infografis from '@/views/dashboard/Infografis.vue'

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardHome },
        { path: 'event-hibah', name: 'event-hibah', component: EventHibah },
        { path: 'panduan', name: 'panduan', component: Panduan },
        { path: 'berita-artikel', name: 'berita-artikel', component: BeritaArtikel },
        { path: 'infografis', name: 'infografis', component: Infografis }
      ]
    }
  ]
})

// Auth guard
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
  // Redirect logged-in user from /login to dashboard
  if (to.name === 'login') {
    const auth = useAuthStore()
    if (auth.isLoggedIn) {
      return { name: 'dashboard' }
    }
  }
})

export default router
