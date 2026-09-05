<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authState, logout } from '../lib/auth'
import {
  formatFileSize,
  getUserDisplayName,
  getDocumentSignedUrl,
  listUserDocuments,
  type DocumentRecord,
} from '../services/documents'

const router = useRouter()
const documents = ref<DocumentRecord[]>([])
const loading = ref(true)
const errorMessage = ref('')

const displayName = computed(() => getUserDisplayName(authState.user))

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

async function handleLogout() {
  await logout()
  await router.push('/login')
}

async function openDocument(document: DocumentRecord) {
  void getDocumentSignedUrl(document)
  await router.push({ name: 'document-reader', params: { id: document.id } })
}

onMounted(() => {
  void loadDocuments()
})

const totalDocuments = computed(() => documents.value.length)
const recentDocuments = computed(() => documents.value.slice(0, 5))
const uploadedToday = computed(() => {
  const today = new Date().toDateString()
  return documents.value.filter((document) => new Date(document.created_at).toDateString() === today).length
})
</script>

<template>
  <main class="dashboard-shell">
    <section class="soft-card welcome-card">
      <div>
        <p class="eyebrow">Dashboard</p>
        <h1>Good morning, {{ displayName }}</h1>
        <p>Here's what's happening with your documents today.</p>
      </div>
      <RouterLink to="/upload" class="soft-button">Upload Document</RouterLink>
    </section>

    <section class="stats-grid">
      <article class="soft-card stat-card">
        <div class="stat-icon primary">D</div>
        <p>Total Documents</p>
        <strong>{{ totalDocuments }}</strong>
        <span>Across your personal library</span>
      </article>

      <article class="soft-card stat-card">
        <div class="stat-icon success">T</div>
        <p>Uploaded Today</p>
        <strong>{{ uploadedToday }}</strong>
        <span>New files added today</span>
      </article>

      <article class="soft-card stat-card">
        <div class="stat-icon info">R</div>
        <p>Recent Documents</p>
        <strong>{{ recentDocuments.length }}</strong>
        <span>Latest uploads in view</span>
      </article>
    </section>

    <section class="soft-card content-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Recent Documents</p>
          <h2>Continue where you left off</h2>
        </div>
        <RouterLink to="/documents" class="soft-button muted">View all</RouterLink>
      </div>

      <p v-if="loading" class="state-text">Loading your documents...</p>
      <p v-else-if="errorMessage" class="state-text error">{{ errorMessage }}</p>

      <div v-else-if="!recentDocuments.length" class="empty-state">
        <h4>You don't have any documents yet.</h4>
        <p>Upload your first study material to get started.</p>
      </div>

      <div v-else class="recent-table">
        <div class="table-head">
          <span>Document</span>
          <span>Type</span>
          <span>Date</span>
          <span>Action</span>
        </div>

        <div v-for="document in recentDocuments" :key="document.id" class="table-row">
          <div>
            <strong>{{ document.title }}</strong>
            <p>{{ document.file_name }}</p>
          </div>
          <span>{{ document.file_type || 'Unknown' }}</span>
          <span>{{ new Date(document.created_at).toLocaleDateString() }}</span>
          <button type="button" class="soft-button compact" @click="openDocument(document)">View</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.dashboard-shell {
  display: grid;
  gap: 24px;
}

.soft-card {
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.04);
}

.welcome-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 24px;
}

.welcome-card h1,
.content-card h2 {
  margin: 6px 0 0;
  color: #344767;
}

.welcome-card p,
.stat-card span,
.table-row p,
.state-text,
.empty-state p {
  color: #67748e;
}

.eyebrow {
  margin: 0;
  color: #67748e;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
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

.soft-button.muted {
  background: #f8f9fa;
  color: #344767;
  box-shadow: none;
}

.soft-button.compact {
  padding: 10px 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 22px;
}

.stat-icon {
  display: grid;
  height: 42px;
  width: 42px;
  place-items: center;
  border-radius: 14px;
  color: white;
  font-weight: 700;
}

.stat-icon.primary {
  background: #5e72e4;
}

.stat-icon.success {
  background: #82d616;
}

.stat-icon.info {
  background: #17c1e8;
}

.stat-card p {
  margin: 16px 0 0;
  font-weight: 600;
  color: #344767;
}

.stat-card strong {
  display: block;
  margin-top: 10px;
  color: #344767;
  font-size: 2rem;
}

.content-card {
  padding: 24px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.recent-table {
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-radius: 16px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2fr 0.8fr 0.9fr 0.7fr;
  gap: 12px;
  padding: 16px 18px;
  align-items: center;
}

.table-head {
  background: #f8f9fa;
  color: #67748e;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.table-row {
  border-top: 1px solid #e9ecef;
}

.table-row strong {
  color: #344767;
}

.empty-state {
  padding: 32px;
  text-align: center;
}

.state-text.error {
  color: #ea0606;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-head,
  .table-row {
    grid-template-columns: 2fr 0.8fr 0.9fr;
  }
}

@media (max-width: 720px) {
  .welcome-card,
  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid,
  .table-head,
  .table-row {
    grid-template-columns: 1fr;
  }

  .table-head {
    display: none;
  }
}
</style>
