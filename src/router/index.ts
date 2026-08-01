import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
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
      path: '/dashboard',
      component: DashboardView,
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

export default router
