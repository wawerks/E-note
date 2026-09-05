import { reactive } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

type AuthState = {
  loading: boolean
  ready: boolean
  session: Session | null
  user: User | null
  error: string | null
}

export const authState = reactive<AuthState>({
  loading: true,
  ready: false,
  session: null,
  user: null,
  error: null,
})

let bootstrapPromise: Promise<void> | null = null
let authSubscription: { unsubscribe: () => void } | null = null

function applySession(session: Session | null) {
  authState.session = session
  authState.user = session?.user ?? null
}

export async function bootstrapAuth() {
  if (bootstrapPromise) {
    return bootstrapPromise
  }

  if (!supabase) {
    authState.loading = false
    authState.ready = true
    authState.session = null
    authState.user = null
    authState.error = 'Supabase client is not configured.'
    return
  }

  bootstrapPromise = (async () => {
    authState.loading = true

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      authState.error = error.message
    }

    applySession(data.session)

    if (!authSubscription) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        applySession(session)
        authState.loading = false
        authState.ready = true
      })

      authSubscription = listener.subscription
    }

    authState.loading = false
    authState.ready = true
  })().finally(() => {
    bootstrapPromise = null
  })

  return bootstrapPromise
}

export async function logout() {
  if (!supabase) {
    applySession(null)
    return
  }

  await supabase.auth.signOut()
  applySession(null)
}

export function disposeAuthListener() {
  authSubscription?.unsubscribe()
  authSubscription = null
}

export function getDisplayName(user: User | null) {
  if (!user) {
    return ''
  }

  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    'User'
  )
}
