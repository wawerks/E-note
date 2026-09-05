<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { BookOpenText, LayoutDashboard, LogOut, Menu, Settings, Upload, UserRound } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

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
  <div class="min-h-screen bg-[#f8f9fa] text-[#344767]">
    <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-[#344767]/30 lg:hidden" @click="sidebarOpen = false"></div>

    <div class="min-h-screen lg:flex">
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-80 -translate-x-full flex-col border-r border-[#e9ecef] bg-white px-5 py-6 shadow-[0_4px_6px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:translate-x-0 lg:shadow-none"
        :class="sidebarOpen ? 'translate-x-0' : ''"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="grid h-11 w-11 place-items-center rounded-2xl bg-[#5e72e4] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(94,114,228,0.25)]">
              {{ initials }}
            </div>
            <div>
              <p class="text-[0.7rem] uppercase tracking-[0.24em] text-[#67748e]">E-note</p>
              <h1 class="text-lg font-semibold text-[#344767]">Study Workspace</h1>
            </div>
          </div>

          <button class="grid h-10 w-10 place-items-center rounded-2xl border border-[#e9ecef] bg-white text-[#344767] lg:hidden" type="button" @click="sidebarOpen = false">
            <Menu class="h-5 w-5" />
          </button>
        </div>

        <nav class="mt-10 grid gap-2 text-sm">
          <RouterLink class="nav-item" to="/dashboard" @click="sidebarOpen = false">
            <LayoutDashboard class="h-4 w-4" /> Dashboard
          </RouterLink>
          <RouterLink class="nav-item" to="/documents" @click="sidebarOpen = false">
            <BookOpenText class="h-4 w-4" /> Documents
          </RouterLink>
          <RouterLink class="nav-item" to="/upload" @click="sidebarOpen = false">
            <Upload class="h-4 w-4" /> Upload Document
          </RouterLink>
          <RouterLink class="nav-item" to="/profile" @click="sidebarOpen = false">
            <UserRound class="h-4 w-4" /> Profile
          </RouterLink>
          <RouterLink class="nav-item" to="/settings" @click="sidebarOpen = false">
            <Settings class="h-4 w-4" /> Settings
          </RouterLink>
        </nav>

        <div class="mt-8 rounded-[16px] bg-[#f8f9fa] p-4 text-sm text-[#67748e]">
          <p class="text-xs uppercase tracking-[0.18em]">Signed in</p>
          <p class="mt-2 font-medium text-[#344767]">{{ authStore.displayName || authStore.user?.email }}</p>
        </div>

        <button class="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#344767] px-4 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(52,71,103,0.18)]" type="button" @click="handleLogout">
          <LogOut class="h-4 w-4" /> Logout
        </button>
      </aside>

      <main class="min-w-0 flex-1">
        <header class="sticky top-0 z-20 border-b border-[#e9ecef] bg-[#f8f9fa]/90 px-5 py-4 backdrop-blur-sm lg:px-8">
          <div class="flex items-center justify-between gap-4">
            <button class="grid h-11 w-11 place-items-center rounded-2xl border border-[#e9ecef] bg-white text-[#344767] shadow-[0_4px_6px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)] lg:hidden" type="button" @click="sidebarOpen = true">
              <Menu class="h-5 w-5" />
            </button>

            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-[#67748e]">Good to see you</p>
              <h2 class="text-xl font-semibold text-[#344767]">{{ authStore.displayName || authStore.user?.email }}</h2>
            </div>

            <div class="hidden rounded-2xl bg-white px-4 py-2 text-sm text-[#67748e] shadow-[0_4px_6px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)] md:block">
              {{ authStore.user?.email }}
            </div>
          </div>
        </header>

        <section class="p-5 lg:p-8">
          <RouterView />
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  padding: 14px 16px;
  color: #67748e;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: #ffffff;
  color: #344767;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02), 0 8px 24px rgba(0, 0, 0, 0.04);
}
</style>