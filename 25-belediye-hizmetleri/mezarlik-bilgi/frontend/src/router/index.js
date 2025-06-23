import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mezarlik',
      name: 'mezarlik',
      component: () => import('../views/Mezarlik.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/defin',
      name: 'defin',
      component: () => import('../views/Defin.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/arama',
      name: 'arama',
      component: () => import('../views/Arama.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ziyaretci',
      name: 'ziyaretci',
      component: () => import('../views/Ziyaretci.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/harita',
      name: 'harita',
      component: () => import('../views/Harita.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/raporlar',
      name: 'raporlar',
      component: () => import('../views/Raporlar.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router