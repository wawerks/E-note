<script setup lang="ts">
import { computed, ref } from 'vue'
import { CircleAlert, Eye, EyeOff } from 'lucide-vue-next'
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

    <section class="auth-panel">
      <header class="brand-copy">
        <h1>Welcome back!</h1>
        <p>Log in to your E-Note account</p>
      </header>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label>
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required>
        </label>

        <label>
          <span>Password</span>
          <div class="password-field">
            <input v-model="password" :type="passwordFieldType" autocomplete="current-password" required>
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

        <p class="forgot-password">Forgot your password? <RouterLink to="/forgot-password">Reset</RouterLink></p>

        <p v-if="errorMessage" class="error-message">
          <CircleAlert :size="14" />
          <span>{{ errorMessage }}</span>
        </p>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <div class="signup-divider"><span>New to E-Note?</span></div>
      <RouterLink class="signup-button" to="/register">Sign up</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  padding: 164px 24px 48px;
  background: #fff;
}

.brand {
  position: absolute;
  top: 23px;
  left: 23px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #111;
}

.brand-mark {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 2px solid #f15a24;
  border-radius: 50%;
  background: #111;
}

.brand-mark span {
  width: 0;
  height: 0;
  border-right: 7px solid transparent;
  border-bottom: 13px solid #f15a24;
  border-left: 7px solid transparent;
}

.brand-name {
  display: grid;
  font-size: 17px;
  font-weight: 700;
  line-height: 15px;
}

.brand-name small {
  color: #f15a24;
  font-size: 5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 7px;
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

.auth-panel {
  width: min(100%, 344px);
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

.forgot-password {
  margin: -2px 0 8px;
  color: #777;
  font-size: 11px;
}

.forgot-password a {
  color: #f15a24;
  text-decoration: none;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: -2px 0 0;
  color: #f04444;
  font-size: 11px;
}

.primary-button,
.signup-button {
  display: grid;
  width: 100%;
  height: 31px;
  place-items: center;
  border-radius: 9px;
  font-size: 11px;
  text-decoration: none;
}

.primary-button {
  margin-top: -1px;
  border: 0;
  background: #ff916b;
  color: #111;
  cursor: pointer;
}

.primary-button:disabled {
  opacity: 0.72;
  cursor: wait;
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
  border: 1px solid #dedede;
  color: #171717;
}

@media (max-width: 640px) {
  .auth-page {
    padding-top: 130px;
  }

  .brand {
    top: 20px;
    left: 20px;
  }
}
</style>
