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
  <main class="auth-page">
    <section class="auth-panel">
      <header class="brand-copy">
        <h1>Reset your password</h1>
        <p>We'll send a secure reset link to your email</p>
      </header>

      <form class="auth-form" @submit.prevent="handleReset">
        <label>
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required placeholder="you@example.com">
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send reset link' }}
        </button>
      </form>

      <RouterLink class="back-link" to="/login">Back to login</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 164px 24px 48px;
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

.error-message,
.status-message {
  margin: -2px 0 0;
  font-size: 11px;
  line-height: 1.4;
}

.error-message { color: #f04444; }
.status-message { color: #408c62; }

.primary-button {
  width: 100%;
  height: 31px;
  margin-top: -1px;
  border: 0;
  border-radius: 9px;
  background: #111;
  color: #fff;
  font-size: 11px;
  cursor: pointer;
}

.primary-button:disabled {
  opacity: 0.72;
  cursor: wait;
}

.back-link {
  display: block;
  margin-top: 25px;
  color: #f15a24;
  font-size: 11px;
  text-align: center;
  text-decoration: none;
}

@media (max-width: 640px) {
  .auth-page { padding-top: 130px; }
}
</style>