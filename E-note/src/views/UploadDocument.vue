<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { uploadDocument } from '../services/documents'

const router = useRouter()
const file = ref<File | null>(null)
const title = ref('')
const loading = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const maxSizeBytes = 25 * 1024 * 1024

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] ?? null

  if (!title.value && file.value) {
    title.value = file.value.name.replace(/\.[^.]+$/, '')
  }
}

async function handleUpload() {
  if (!file.value) {
    errorMessage.value = 'Choose a file to upload.'
    return
  }

  if (file.value.size > maxSizeBytes) {
    errorMessage.value = 'File size must be 25 MB or smaller.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    await uploadDocument(file.value, title.value.trim() || file.value.name)
    statusMessage.value = 'Document uploaded successfully.'
    await router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Upload failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="upload-page">
    <section class="upload-card">
      <p class="eyebrow">E-note</p>
      <h1>Upload Document</h1>
      <p class="helper">Accepted through Supabase Storage. Max size: 25 MB.</p>

      <form class="upload-form" @submit.prevent="handleUpload">
        <label>
          <span>Document Title</span>
          <input v-model="title" type="text" required placeholder="Study notes, lecture slides, and more">
        </label>

        <label>
          <span>Select File</span>
          <input type="file" required @change="handleFileChange">
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="statusMessage" class="success-message">{{ statusMessage }}</p>

        <div class="actions">
          <button class="primary-button" type="submit" :disabled="loading">
            {{ loading ? 'Uploading...' : 'Upload Document' }}
          </button>
          <RouterLink to="/dashboard" class="secondary-button">Cancel</RouterLink>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.upload-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.upload-card {
  width: min(100%, 560px);
  padding: 32px;
  border-radius: 28px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0;
  color: #2563eb;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.helper,
.error-message,
.success-message {
  color: #475569;
}

.error-message {
  color: #b91c1c;
}

.success-message {
  color: #15803d;
}

.upload-form {
  display: grid;
  gap: 18px;
  margin-top: 24px;
}

label {
  display: grid;
  gap: 8px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #f8fafc;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-button,
.secondary-button {
  padding: 14px 18px;
  border-radius: 16px;
  border: 0;
  text-decoration: none;
  cursor: pointer;
}

.primary-button {
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: white;
  font-weight: 600;
}

.secondary-button {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.primary-button:disabled {
  opacity: 0.72;
  cursor: wait;
}
</style>
