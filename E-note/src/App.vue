<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { authState, bootstrapAuth } from './lib/auth'

onMounted(() => {
  void bootstrapAuth()
})
</script>

<template>
  <div class="app-shell">
    <div v-if="authState.loading" class="auth-loading">
      <div class="loading-card">
        <p class="eyebrow">E-note</p>
        <h1>Checking your session</h1>
        <p>Connecting to Supabase and restoring your account.</p>
      </div>
    </div>

    <RouterView v-else />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.auth-loading {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(45, 99, 255, 0.18), transparent 35%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.14), transparent 32%),
    #08111f;
  color: #f8fafc;
}

.loading-card {
  width: min(100%, 440px);
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: rgba(8, 17, 31, 0.72);
  backdrop-filter: blur(18px);
  box-shadow: 0 32px 80px rgba(2, 6, 23, 0.45);
}

.eyebrow {
  margin-bottom: 12px;
  color: #7dd3fc;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.loading-card h1 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}

.loading-card p {
  margin: 12px 0 0;
  color: rgba(226, 232, 240, 0.82);
}
</style>