import { createRouter, createWebHistory } from 'vue-router'
import { authState, bootstrapAuth } from '../lib/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/AuthLayout.vue'),
      children: [
        {
          path: '',
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
          path: '/forgot-password',
          name: 'forgot-password',
          meta: { guestOnly: true },
          component: () => import('../views/ForgotPassword.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
        },
        {
          path: '/documents',
          name: 'documents',
          component: () => import('../views/DocumentsView.vue'),
        },
        {
          path: '/upload',
          name: 'upload',
          component: () => import('../views/UploadDocument.vue'),
        },
        {
          path: '/documents/:id',
          name: 'document-reader',
          component: () => import('../views/DocumentReader.vue'),
        },
        {
          path: '/flashcards',
          name: 'flashcards',
          component: () => import('../views/FlashcardsView.vue'),
        },
        {
          path: '/quizzes',
          name: 'quizzes',
          component: () => import('../views/QuizzesView.vue'),
        },
        {
          path: '/progress',
          name: 'progress',
          component: () => import('../views/ProgressView.vue'),
        },
        {
          path: '/settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue'),
        },
      ],
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
