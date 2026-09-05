import { createRouter, createWebHistory } from 'vue-router'
import { authState, bootstrapAuth } from '../lib/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      meta: { guestOnly: true },
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { guestOnly: true },
      component: () => import('../views/Register.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      meta: { requiresAuth: true },
      component: () => import('../views/Dashboard.vue'),
    },
    {
      path: '/upload',
      name: 'upload',
      meta: { requiresAuth: true },
      component: () => import('../views/UploadDocument.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  await bootstrapAuth()

  const isAuthenticated = Boolean(authState.user)

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return '/dashboard'
  }

  if (to.path === '/' || to.path === '') {
    return isAuthenticated ? '/dashboard' : '/login'
  }

  return true
})

export default router
