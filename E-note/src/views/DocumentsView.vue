<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { authState } from '../lib/auth'
import { formatFileSize, getDocumentSignedUrl, listUserDocuments, type DocumentRecord } from '../services/documents'

const router = useRouter()
const documents = ref<DocumentRecord[]>([])
const searchQuery = ref('')
const loading = ref(true)
const errorMessage = ref('')

const filteredDocuments = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return documents.value
  }

  return documents.value.filter((document) => {
    return [document.title, document.file_name, document.file_type]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query))
  })
})

async function loadDocuments() {
  loading.value = true
  errorMessage.value = ''

  try {
    documents.value = await listUserDocuments()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to load documents.'
  } finally {
    loading.value = false
  }
}

async function openDocument(document: DocumentRecord) {
  await getDocumentSignedUrl(document)
  await router.push({ name: 'document-reader', params: { id: document.id } })
}

onMounted(() => {
  void loadDocuments()
})
</script>

<template>
  <div class="grid gap-6">
    <section class="soft-card p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="eyebrow">Library</p>
          <h1 class="mt-2 text-3xl font-semibold text-[#344767]">Documents</h1>
          <p class="mt-2 text-[#67748e]">Search and open your uploaded study materials.</p>
        </div>
        <RouterLink to="/upload" class="soft-button">Upload Document</RouterLink>
      </div>

      <div class="mt-6">
        <input v-model="searchQuery" type="text" class="soft-input w-full" placeholder="Search documents, filenames, or file types">
      </div>
    </section>

    <section v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="index in 3" :key="index" class="h-44 rounded-[16px] bg-white shadow-[0_4px_6px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.04)] animate-pulse"></div>
    </section>

    <p v-else-if="errorMessage" class="soft-card border border-rose-200 bg-rose-50 p-4 text-rose-700">{{ errorMessage }}</p>

    <section v-else-if="!filteredDocuments.length" class="soft-card p-10 text-center">
      <h2 class="text-2xl font-semibold text-[#344767]">No documents yet</h2>
      <p class="mt-2 text-[#67748e]">Upload your first study material and start learning.</p>
      <RouterLink to="/upload" class="soft-button mt-6 inline-flex">Upload Document</RouterLink>
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="document in filteredDocuments" :key="document.id" class="soft-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-[#67748e]">{{ document.file_type }}</p>
            <h3 class="mt-2 text-lg font-semibold text-[#344767]">{{ document.title }}</h3>
            <p class="mt-1 text-sm text-[#67748e]">{{ document.file_name }}</p>
          </div>
          <div class="rounded-2xl bg-[#f8f9fa] px-3 py-2 text-sm text-[#67748e]">{{ formatFileSize(document.file_size) }}</div>
        </div>

        <div class="mt-5 flex items-center justify-between text-sm text-[#67748e]">
          <span>{{ new Date(document.created_at).toLocaleDateString() }}</span>
          <span>{{ authState.user?.email }}</span>
        </div>

        <button type="button" class="soft-button mt-5 w-full" @click="openDocument(document)">
          View
        </button>
      </article>
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

.soft-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  background: #5e72e4;
  color: #ffffff;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(94, 114, 228, 0.18);
}

.soft-input {
  border-radius: 14px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  padding: 14px 16px;
  color: #344767;
}

.soft-input:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.12);
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
