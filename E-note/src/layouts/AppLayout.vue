<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const initials = computed(() => {
  const value = authStore.displayName || authStore.user?.email || 'U'
  return value
    .split(' ')
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('')
})

async function handleLogout() {
  await authStore.signOut()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="border-r border-slate-200 bg-white px-5 py-6">
        <div class="flex items-center gap-3">
          <div class="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            {{ initials }}
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">E-note</p>
            <h1 class="text-lg font-semibold">Study Workspace</h1>
          </div>
        </div>

        <nav class="mt-10 grid gap-2 text-sm">
          <RouterLink class="rounded-2xl px-4 py-3 hover:bg-slate-100" to="/dashboard">Dashboard</RouterLink>
          <RouterLink class="rounded-2xl px-4 py-3 hover:bg-slate-100" to="/documents">Documents</RouterLink>
          <RouterLink class="rounded-2xl px-4 py-3 hover:bg-slate-100" to="/flashcards">Flashcards</RouterLink>
          <RouterLink class="rounded-2xl px-4 py-3 hover:bg-slate-100" to="/quizzes">Quizzes</RouterLink>
          <RouterLink class="rounded-2xl px-4 py-3 hover:bg-slate-100" to="/progress">Progress</RouterLink>
          <RouterLink class="rounded-2xl px-4 py-3 hover:bg-slate-100" to="/settings">Settings</RouterLink>
        </nav>

        <button class="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white" type="button" @click="handleLogout">
          Logout
        </button>
      </aside>

      <main class="min-w-0">
        <header class="border-b border-slate-200 bg-white px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm text-slate-500">Good to see you</p>
              <h2 class="text-xl font-semibold">{{ authStore.displayName || authStore.user?.email }}</h2>
            </div>
            <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
              {{ authStore.user?.email }}
            </div>
          </div>
        </header>

        <section class="p-6">
          <RouterView />
        </section>
      </main>
    </div>
  </div>
</template>