<script setup lang="ts">
import { computed, ref } from 'vue'
import { CircleAlert, Eye, EyeOff } from 'lucide-vue-next'
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
    <section class="auth-panel">
      <header class="brand-copy">
        <h1>Create your account</h1>
        <p>Start organizing your study documents.</p>
      </header>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label>
          <span>Full name</span>
          <input v-model="fullName" type="text" autocomplete="name" required>
        </label>

        <label>
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required>
        </label>

        <label>
          <span>Password</span>
          <div class="password-field">
            <input v-model="password" :type="passwordFieldType" autocomplete="new-password" required>
            <button
              type="button"
              class="toggle-button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="showPassword" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
        </label>

        <label>
          <span>Confirm password</span>
          <div class="password-field">
            <input v-model="confirmPassword" :type="passwordFieldType" autocomplete="new-password" required>
            <button
              type="button"
              class="toggle-button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="showPassword" :size="18" />
              <EyeOff v-else :size="18" />
            </button>
          </div>
        </label>

        <p v-if="errorMessage" class="error-message">
          <CircleAlert :size="14" />
          <span>{{ errorMessage }}</span>
        </p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <div class="signup-divider"><span>Already have an account?</span></div>
      <RouterLink class="signup-button" to="/login">Log in</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  padding: 130px 24px 48px;
  background: #fff;
}

.auth-panel {
  width: min(100%, 344px);
}

.brand-copy h1 {
  margin: 0;
  color: #171717;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;
}

.brand-copy p {
  margin: 5px 0 0;
  color: #929292;
  font-size: 12px;
  text-align: center;
}

.auth-form {
  display: grid;
  gap: 16px;
  margin-top: 37px;
}

label {
  display: grid;
  gap: 7px;
  color: #171717;
  font-size: 11px;
}

input {
  width: 100%;
  height: 31px;
  padding: 0 11px;
  border: 1px solid #dedede;
  border-radius: 9px;
  background: #fff;
  color: #171717;
  font-size: 11px;
}

input:focus {
  outline: none;
  border-color: #ff936d;
  box-shadow: 0 0 0 2px rgba(255, 147, 109, 0.13);
}

.password-field {
  position: relative;
}

.toggle-button {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  width: 34px;
  height: 31px;
  place-items: center;
  border: 0;
  background: transparent;
  color: #9da2a5;
  cursor: pointer;
}

.primary-button {
  display: grid;
  width: 100%;
  height: 31px;
  margin-top: -1px;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: #111;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
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
  display: flex;
  align-items: center;
  gap: 5px;
  margin: -2px 0 0;
  color: #f04444;
  font-size: 11px;
}

.success-message {
  margin: -2px 0 0;
  color: #3f9b63;
  font-size: 11px;
}

.signup-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 25px 0 18px;
  color: #9c9c9c;
  font-size: 11px;
}

.signup-divider::before,
.signup-divider::after {
  height: 1px;
  flex: 1;
  background: #ededed;
  content: '';
}

.signup-button {
  display: grid;
  width: 100%;
  height: 31px;
  place-items: center;
  border: 1px solid #dedede;
  border-radius: 9px;
  color: #171717;
  font-size: 11px;
  text-decoration: none;
}

@media (max-width: 640px) {
  .auth-page {
    padding-top: 110px;
  }
}
</style>
