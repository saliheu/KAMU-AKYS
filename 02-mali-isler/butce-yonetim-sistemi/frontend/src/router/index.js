import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'budgets',
          name: 'Budgets',
          component: () => import('@/views/budgets/BudgetList.vue')
        },
        {
          path: 'budgets/new',
          name: 'BudgetCreate',
          component: () => import('@/views/budgets/BudgetCreate.vue')
        },
        {
          path: 'budgets/:id',
          name: 'BudgetDetail',
          component: () => import('@/views/budgets/BudgetDetail.vue')
        },
        {
          path: 'expenses',
          name: 'Expenses',
          component: () => import('@/views/expenses/ExpenseList.vue')
        },
        {
          path: 'revenues',
          name: 'Revenues',
          component: () => import('@/views/revenues/RevenueList.vue')
        },
        {
          path: 'reports',
          name: 'Reports',
          component: () => import('@/views/reports/Reports.vue')
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue')
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/Profile.vue')
        }
      ]
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router