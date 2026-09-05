import { defineStore } from 'pinia'
import { computed } from 'vue'
import { authState, bootstrapAuth, getDisplayName, logout } from '../lib/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = computed(() => authState.user)
  const session = computed(() => authState.session)
  const loading = computed(() => authState.loading)
  const ready = computed(() => authState.ready)
  const displayName = computed(() => getDisplayName(authState.user))

  async function initialize() {
    await bootstrapAuth()
  }

  async function signOut() {
    await logout()
  }

  return {
    user,
    session,
    loading,
    ready,
    displayName,
    initialize,
    signOut,
  }
})