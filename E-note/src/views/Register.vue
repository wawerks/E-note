<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'))

function validateForm() {
  if (!fullName.value.trim()) {
    return 'Full name is required.'
  }

  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    return 'Enter a valid email address.'
  }

  if (password.value.length < 8) {
    return 'Password must be at least 8 characters long.'
  }

  if (password.value !== confirmPassword.value) {
    return 'Passwords do not match.'
  }

  return ''
}

async function handleRegister() {
  if (!supabase) {
    errorMessage.value = 'Supabase is not configured.'
    return
  }

  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        data: {
          full_name: fullName.value.trim(),
        },
      },
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    if (data.session) {
      await router.push('/dashboard')
      return
    }

    successMessage.value = 'Registration complete. Please verify your email before logging in.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to register.'
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
        <h1>Create your account</h1>
        <p>Start organizing your study documents.</p>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label>
          <span>Full Name</span>
          <input v-model="fullName" type="text" autocomplete="name" required placeholder="Your name">
        </label>

        <label>
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required placeholder="you@example.com">
        </label>

        <label>
          <span>Password</span>
          <div class="password-field">
            <input v-model="password" :type="passwordFieldType" autocomplete="new-password" required placeholder="At least 8 characters">
            <button type="button" class="toggle-button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </label>

        <label>
          <span>Confirm Password</span>
          <input v-model="confirmPassword" :type="passwordFieldType" autocomplete="new-password" required placeholder="Repeat your password">
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="auth-link">
        Already have an account?
        <RouterLink to="/login">Sign in</RouterLink>
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
  width: min(100%, 480px);
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

.success-message {
  margin: -2px 0 0;
  color: #82d616;
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

  .password-field {
    grid-template-columns: 1fr;
  }
}
</style>
