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
    <section class="upload-card soft-card">
      <div class="text-center">
        <p class="eyebrow">Upload</p>
        <h1>Upload Document</h1>
        <p class="helper">Accepted through Supabase Storage. Max size: 25 MB.</p>
      </div>

      <form class="upload-form" @submit.prevent="handleUpload">
        <label>
          <span>Document Title</span>
          <input v-model="title" type="text" required placeholder="Study notes, lecture slides, and more">
        </label>

        <label class="drop-zone">
          <span>Drop file here or choose a file</span>
          <input type="file" required @change="handleFileChange">
        </label>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="statusMessage" class="success-message">{{ statusMessage }}</p>

        <div class="actions">
          <button class="primary-button" type="submit" :disabled="loading">
            {{ loading ? 'Uploading...' : 'Upload Document' }}
          </button>
          <RouterLink to="/documents" class="secondary-button">Cancel</RouterLink>
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
  background: #f8f9fa;
}

.upload-card {
  width: min(100%, 640px);
  padding: 32px;
}

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

h1 {
  margin: 10px 0 0;
  color: #344767;
}

.helper,
.error-message,
.success-message {
  color: #67748e;
}

.error-message {
  color: #ea0606;
}

.success-message {
  color: #82d616;
}

.upload-form {
  display: grid;
  gap: 18px;
  margin-top: 24px;
}

label {
  display: grid;
  gap: 8px;
  color: #344767;
  font-weight: 600;
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

.drop-zone {
  padding: 20px;
  border-radius: 16px;
  border: 1px dashed #d7dce3;
  background: #f8f9fa;
}

.drop-zone input {
  padding: 0;
  border: 0;
  background: transparent;
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
  background: #5e72e4;
  color: white;
  font-weight: 600;
}

.secondary-button {
  background: #f8f9fa;
  color: #344767;
}

.primary-button:disabled {
  opacity: 0.72;
  cursor: wait;
}

.text-center {
  text-align: center;
}
</style>
