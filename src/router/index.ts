import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from '~pages'
import { useAuthStore } from '@/stores/auth'

/**
 * setupLayouts wraps the routes from /pages with the
 * components found in /layouts based on the 'layout' meta property.
 */
const routes = setupLayouts([
  ...generatedRoutes,
  {
    path: '/',
    redirect: '/welcome',
  },
])

const publicPages = ['/login', '/forbidden', '/resetpassword']

export const adminPages = [
  'users',
  'roles',
  'languages',
]

export const validatorPages = []

export const hrPages = []

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation Guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  const authRequired = !publicPages.includes(to.path)

  if (authRequired) {
    // Check if user is logged in
    const isLoggedIn = await authStore.getCurrentUser()
    if (!isLoggedIn) {
      return '/login'
    }
  }
})

export default router
