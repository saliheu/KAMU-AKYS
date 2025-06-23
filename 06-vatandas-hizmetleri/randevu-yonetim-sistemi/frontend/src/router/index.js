import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('@/views/Appointments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/new-appointment',
    name: 'NewAppointment',
    component: () => import('@/views/NewAppointment.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/appointment/:id',
    name: 'AppointmentDetail',
    component: () => import('@/views/AppointmentDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/appointments',
    name: 'AdminAppointments',
    component: () => import('@/views/admin/Appointments.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'staff'] }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('@/views/admin/Reports.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'staff'] }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const userRole = store.getters['auth/userRole']

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login')
    } else if (to.matched.some(record => record.meta.requiresRole)) {
      const requiredRoles = to.meta.requiresRole
      if (requiredRoles.includes(userRole)) {
        next()
      } else {
        next('/')
      }
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router