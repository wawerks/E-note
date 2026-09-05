<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authState, logout } from '../lib/auth'
import {
  getDocumentById,
  getDocumentSignedUrl,
  type DocumentRecord,
  getUserDisplayName,
} from '../services/documents'

const route = useRoute()
const router = useRouter()

const documentRecord = ref<DocumentRecord | null>(null)
const documentUrl = ref('')
const loading = ref(true)
const errorMessage = ref('')
const activeTool = ref('notes')

const displayName = computed(() => getUserDisplayName(authState.user))

async function loadDocument() {
  loading.value = true
  errorMessage.value = ''

  try {
    const documentId = String(route.params.id)
    documentRecord.value = await getDocumentById(documentId)
    documentUrl.value = await getDocumentSignedUrl(documentRecord.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to open document.'
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  await logout()
  await router.push('/login')
}

onMounted(() => {
  void loadDocument()
})
</script>

<template>
  <main class="reader-page">
    <header class="reader-header soft-card">
      <div>
        <p class="eyebrow">Document Reader</p>
        <h1>{{ documentRecord?.title || 'Document Reader' }}</h1>
        <p>Signed in as {{ displayName }}</p>
      </div>

      <div class="reader-actions">
        <RouterLink to="/dashboard" class="secondary-button">Back to Dashboard</RouterLink>
        <button class="secondary-button" type="button" @click="handleLogout">Logout</button>
      </div>
    </header>

    <section class="workspace">
      <aside class="tool-rail soft-card">
        <button class="tool-button" :class="{ active: activeTool === 'notes' }" type="button" @click="activeTool = 'notes'">Notes</button>
        <button class="tool-button" :class="{ active: activeTool === 'highlights' }" type="button" @click="activeTool = 'highlights'">Highlights</button>
        <button class="tool-button" :class="{ active: activeTool === 'summary' }" type="button" @click="activeTool = 'summary'">Summary</button>
        <button class="tool-button" :class="{ active: activeTool === 'search' }" type="button" @click="activeTool = 'search'">Search</button>
      </aside>

      <section class="reader-content soft-card">
        <div class="reader-toolbar">
          <div>
            <p class="reader-label">Document workspace</p>
            <h2>{{ documentRecord?.title || 'Loading document...' }}</h2>
          </div>

          <div class="reader-toolbar-actions">
            <a v-if="documentUrl" :href="documentUrl" target="_blank" rel="noreferrer" class="secondary-button">Open raw file</a>
          </div>
        </div>

        <div v-if="loading" class="state-panel">Loading document...</div>
        <div v-else-if="errorMessage" class="state-panel error-text">{{ errorMessage }}</div>

        <div v-else class="reader-grid">
          <section class="preview-pane">
            <iframe
              :src="documentUrl"
              class="document-frame"
              title="Document preview"
            />
          </section>

          <aside class="tool-panel">
            <div v-if="activeTool === 'notes'">
              <h3>Notes</h3>
              <textarea rows="10" placeholder="Add your notes here..."></textarea>
            </div>

            <div v-else-if="activeTool === 'highlights'">
              <h3>Highlights</h3>
              <p>Highlight tools can be added here.</p>
            </div>

            <div v-else-if="activeTool === 'summary'">
              <h3>Summary</h3>
              <p>Summarization tools can be added here.</p>
            </div>

            <div v-else>
              <h3>Search</h3>
              <input type="text" placeholder="Search inside the document">
            </div>
          </aside>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.reader-page {
  min-height: 100vh;
  padding: 28px;
  background: #f8f9fa;
  color: #344767;
}

.reader-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  padding: 24px;
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
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.reader-header h1 {
  margin: 8px 0 0;
  color: #344767;
}

.reader-header p {
  margin: 8px 0 0;
  color: #67748e;
}

.reader-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.secondary-button {
  padding: 14px 18px;
  border-radius: 16px;
  border: 0;
  text-decoration: none;
  cursor: pointer;
  background: #f8f9fa;
  color: #344767;
}

.workspace {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 18px;
  min-height: calc(100vh - 180px);
}

.tool-rail {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 16px;
}

.tool-button {
  padding: 12px 10px;
  border: 0;
  border-radius: 14px;
  background: #f8f9fa;
  color: #67748e;
  cursor: pointer;
}

.tool-button.active {
  background: #5e72e4;
  color: white;
}

.reader-content {
  display: grid;
  gap: 16px;
  padding: 24px;
  overflow: hidden;
}

.reader-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.reader-label {
  margin: 0;
  color: #67748e;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.reader-toolbar h2 {
  margin: 6px 0 0;
}

.reader-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.55fr);
  gap: 16px;
  min-height: 0;
}

.preview-pane,
.tool-panel {
  min-height: 0;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
}

.document-frame {
  width: 100%;
  height: 100%;
  min-height: 620px;
  border: 0;
  border-radius: 20px;
}

.tool-panel {
  padding: 18px;
}

.tool-panel h3 {
  margin: 0 0 12px;
}

.tool-panel textarea,
.tool-panel input {
  width: 100%;
  border: 1px solid #e9ecef;
  border-radius: 14px;
  padding: 12px;
  background: white;
  color: #344767;
}

.state-panel {
  padding: 24px;
  border-radius: 20px;
  background: #f8fafc;
}

.error-text {
  color: #ea0606;
}

@media (max-width: 900px) {
  .reader-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .workspace,
  .reader-grid {
    grid-template-columns: 1fr;
  }

  .tool-rail {
    grid-auto-flow: column;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    overflow-x: auto;
  }
}
</style>