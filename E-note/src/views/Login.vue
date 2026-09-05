<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'))

function getRedirectTarget() {
  const redirect = route.query.redirect

  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    return redirect
  }

  return '/dashboard'
}

async function handleLogin() {
  if (!supabase) {
    errorMessage.value = 'Supabase is not configured.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    await router.push(getRedirectTarget())
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to log in.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="hero-panel">
      <p class="brand-mark">E-note</p>
      <h1>Keep your documents organized in one place.</h1>
      <p>
        Sign in to access your dashboard, upload documents, and stay in sync
        across devices.
      </p>

      <div class="hero-points">
        <div>
          <strong>Secure access</strong>
          <span>Supabase Auth protects every session.</span>
        </div>
        <div>
          <strong>Private library</strong>
          <span>Each document stays tied to your account.</span>
        </div>
      </div>
    </section>

    <section class="auth-panel">
      <div class="brand">
        <p class="eyebrow">Welcome back</p>
        <h2>Login</h2>
        <p>Use your E-note account to continue.</p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label>
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required placeholder="you@example.com">
        </label>

        <label>
          <span>Password</span>
          <div class="password-field">
            <input v-model="password" :type="passwordFieldType" autocomplete="current-password" required placeholder="Your password">
            <button type="button" class="ghost-button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Login' }}
        </button>
      </form>

      <p class="auth-link">
        New to E-note?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(420px, 0.8fr);
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.16), transparent 24%),
    linear-gradient(180deg, #08111f 0%, #111827 100%);
}

.hero-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: clamp(32px, 6vw, 88px);
  color: #f8fafc;
}

.hero-panel h1 {
  margin: 0;
  max-width: 12ch;
  font-size: clamp(2.8rem, 5vw, 5.4rem);
  line-height: 0.95;
}

.hero-panel > p {
  max-width: 52ch;
  margin: 0;
  color: rgba(226, 232, 240, 0.82);
  font-size: 1.05rem;
}

.hero-points {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.hero-points div {
  max-width: 420px;
  padding: 18px 20px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.38);
  backdrop-filter: blur(12px);
}

.hero-points strong {
  display: block;
  margin-bottom: 6px;
}

.hero-points span {
  color: rgba(226, 232, 240, 0.76);
}

.auth-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(28px, 5vw, 72px);
  background: rgba(15, 23, 42, 0.84);
  border-left: 1px solid rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
  backdrop-filter: blur(18px);
}

.brand-mark {
  margin: 0;
  color: #7dd3fc;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.eyebrow {
  margin: 0 0 10px;
  color: #7dd3fc;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.brand h2 {
  margin: 0;
  font-size: clamp(2rem, 3.6vw, 3.2rem);
}

.brand p {
  margin: 12px 0 0;
  color: rgba(226, 232, 240, 0.82);
}

.auth-form {
  display: grid;
  gap: 18px;
  margin-top: 28px;
}

label {
  display: grid;
  gap: 8px;
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.7);
  color: inherit;
}

input:focus {
  outline: 2px solid rgba(56, 189, 248, 0.45);
  border-color: transparent;
}

.password-field {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.ghost-button,
.primary-button {
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.ghost-button {
  padding: 0 14px;
  background: rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
}

.primary-button {
  padding: 14px 18px;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: white;
  font-weight: 600;
}

.ghost-button:hover,
.primary-button:hover {
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: 0.72;
  cursor: wait;
}

.error-message {
  margin: -2px 0 0;
  color: #fca5a5;
}

.auth-link {
  margin: 22px 0 0;
  color: rgba(226, 232, 240, 0.82);
}

.auth-link a {
  color: #7dd3fc;
  text-decoration: none;
}

@media (max-width: 640px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    min-height: 40vh;
    padding-bottom: 24px;
  }

  .auth-panel {
    border-left: 0;
    border-top: 1px solid rgba(148, 163, 184, 0.14);
  }

  .auth-panel {
    padding: 24px;
  }

  .password-field {
    grid-template-columns: 1fr;
  }
}
</style>
