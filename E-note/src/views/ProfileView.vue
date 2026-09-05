<script setup lang="ts">
import { computed } from 'vue'
import { authState } from '../lib/auth'

const fullName = computed(() => authState.user?.user_metadata?.full_name || authState.user?.email || 'User')
const initial = computed(() => fullName.value[0]?.toUpperCase() || 'U')
const createdAt = computed(() => authState.user?.created_at ? new Date(authState.user.created_at).toLocaleDateString() : 'Unknown')
</script>

<template>
  <div class="grid gap-6">
    <section class="soft-card p-6">
      <p class="eyebrow">Profile</p>
      <h1 class="mt-2 text-3xl font-semibold text-[#344767]">Your account</h1>
      <p class="mt-2 text-[#67748e]">Manage your personal details and account information.</p>
    </section>

    <section class="soft-card p-6">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <div class="grid h-16 w-16 place-items-center rounded-2xl bg-[#5e72e4] text-xl font-semibold text-white">
            {{ initial }}
          </div>
          <div>
            <h2 class="text-2xl font-semibold text-[#344767]">{{ fullName }}</h2>
            <p class="mt-1 text-[#67748e]">{{ authState.user?.email }}</p>
          </div>
        </div>

        <div class="rounded-2xl bg-[#f8f9fa] px-4 py-3 text-sm text-[#67748e]">
          Account created: {{ createdAt }}
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.soft-card {
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.eyebrow {
  margin: 0;
  color: #67748e;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
</style>
