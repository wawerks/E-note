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
    <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Library</p>
          <h1 class="mt-2 text-3xl font-semibold text-slate-900">Documents</h1>
          <p class="mt-2 text-slate-600">Search and open your uploaded study materials.</p>
        </div>
        <RouterLink to="/upload" class="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">Upload Document</RouterLink>
      </div>

      <div class="mt-6">
        <input v-model="searchQuery" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Search documents, filenames, or file types">
      </div>
    </section>

    <section v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="index in 3" :key="index" class="h-44 rounded-3xl bg-slate-200/70 animate-pulse"></div>
    </section>

    <p v-else-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{{ errorMessage }}</p>

    <section v-else-if="!filteredDocuments.length" class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <h2 class="text-2xl font-semibold text-slate-900">No documents yet</h2>
      <p class="mt-2 text-slate-600">Upload your first study material and start learning.</p>
      <RouterLink to="/upload" class="mt-6 inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">Upload Document</RouterLink>
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="document in filteredDocuments" :key="document.id" class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">{{ document.file_type }}</p>
            <h3 class="mt-2 text-lg font-semibold text-slate-900">{{ document.title }}</h3>
            <p class="mt-1 text-sm text-slate-600">{{ document.file_name }}</p>
          </div>
          <div class="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">{{ formatFileSize(document.file_size) }}</div>
        </div>

        <div class="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>{{ new Date(document.created_at).toLocaleDateString() }}</span>
          <span>{{ authState.user?.email }}</span>
        </div>

        <button type="button" class="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white" @click="openDocument(document)">
          Open
        </button>
      </article>
    </section>
  </div>
</template>
