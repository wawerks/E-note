<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const email = ref('')
const loading = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

async function handleReset() {
  if (!supabase) {
    errorMessage.value = 'Supabase is not configured.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    statusMessage.value = 'Check your email for the password reset link.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to send reset email.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-xl items-center px-4">
    <div class="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <p class="text-xs uppercase tracking-[0.24em] text-slate-500">E-note</p>
      <h1 class="mt-3 text-3xl font-semibold text-slate-900">Reset your password</h1>
      <p class="mt-2 text-slate-600">We’ll send a secure reset link to your email.</p>

      <form class="mt-8 grid gap-4" @submit.prevent="handleReset">
        <label class="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input v-model="email" type="email" class="rounded-2xl border border-slate-200 px-4 py-3" required placeholder="you@example.com">
        </label>

        <p v-if="errorMessage" class="text-sm text-rose-600">{{ errorMessage }}</p>
        <p v-if="statusMessage" class="text-sm text-emerald-600">{{ statusMessage }}</p>

        <button class="rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-70" type="submit" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send reset link' }}
        </button>
      </form>
    </div>
  </div>
</template>