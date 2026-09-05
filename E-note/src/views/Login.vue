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
    <section class="auth-card">
      <div class="brand-badge">E-NOTE</div>
      <div class="brand-copy">
        <h1>Welcome back</h1>
        <p>Sign in to your document workspace.</p>
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
            <button type="button" class="toggle-button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </label>

        <div class="auth-row">
          <label class="remember-me">
            <input type="checkbox">
            <span>Remember me</span>
          </label>
          <RouterLink class="forgot-link" to="/forgot-password">Forgot password?</RouterLink>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-link">
        Don't have an account?
        <RouterLink to="/register">Register</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f8f9fa;
}

.auth-card {
  width: min(100%, 460px);
  padding: 32px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f8f9fa;
  color: #5e72e4;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.brand-copy h1 {
  margin: 18px 0 0;
  color: #344767;
  font-size: 2rem;
}

.brand-copy p {
  margin: 8px 0 0;
  color: #67748e;
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
  color: #344767;
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  color: #344767;
}

input:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.12);
}

.password-field {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.toggle-button,
.primary-button {
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.toggle-button {
  padding: 0 14px;
  background: #ffffff;
  color: #344767;
  border: 1px solid #e9ecef;
}

.primary-button {
  padding: 14px 18px;
  background: #5e72e4;
  color: white;
  font-weight: 600;
}

.toggle-button:hover,
.primary-button:hover {
  transform: translateY(-1px);
}

.primary-button:disabled {
  opacity: 0.72;
  cursor: wait;
}

.error-message {
  margin: -2px 0 0;
  color: #ea0606;
}

.auth-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.remember-me {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #67748e;
  font-size: 0.9rem;
}

.forgot-link {
  color: #5e72e4;
  font-size: 0.9rem;
}

.auth-link {
  margin: 22px 0 0;
  color: #67748e;
  text-align: center;
}

.auth-link a {
  color: #5e72e4;
  text-decoration: none;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 24px;
  }

  .password-field,
  .auth-row {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
