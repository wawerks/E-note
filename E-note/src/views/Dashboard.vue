<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authState, logout } from '../lib/auth'
import { formatFileSize, getUserDisplayName, listUserDocuments, type DocumentRecord } from '../services/documents'

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

onMounted(() => {
  void loadDocuments()
})

const totalDocuments = computed(() => documents.value.length)
const recentDocuments = computed(() => documents.value.slice(0, 5))
</script>

<template>
  <main class="dashboard-page">
    <aside class="sidebar">
      <div>
        <p class="brand-mark">E-note</p>
        <h1>Dashboard</h1>
        <p class="user-line">Signed in as {{ displayName }}</p>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-link active">Overview</RouterLink>
        <RouterLink to="/upload" class="nav-link">Upload Document</RouterLink>
        <button type="button" class="nav-link logout-link" @click="handleLogout">Logout</button>
      </nav>
    </aside>

    <section class="content">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Welcome back</p>
          <h2>{{ displayName }}</h2>
          <p>Manage your notes, study materials, and uploads from one place.</p>
        </div>

        <div class="hero-actions">
          <RouterLink to="/upload" class="primary-button">Upload Document</RouterLink>
          <button class="secondary-button" type="button" @click="handleLogout">Logout</button>
        </div>
      </header>

      <section class="metrics-grid">
        <article class="metric-card">
          <span>Total Documents</span>
          <strong>{{ totalDocuments }}</strong>
        </article>

        <article class="metric-card">
          <span>Account</span>
          <strong>{{ authState.user?.email }}</strong>
        </article>
      </section>

      <section class="documents-card">
        <div class="section-heading">
          <h3>Recent Documents</h3>
          <RouterLink to="/upload">Add more</RouterLink>
        </div>

        <p v-if="loading" class="state-text">Loading your documents...</p>
        <p v-else-if="errorMessage" class="state-text error">{{ errorMessage }}</p>

        <div v-else-if="!recentDocuments.length" class="empty-state">
          <h4>You don't have any documents yet.</h4>
          <p>Upload your first study material to get started.</p>
        </div>

        <div v-else class="document-list">
          <article v-for="document in recentDocuments" :key="document.id" class="document-row">
            <div>
              <h4>{{ document.title }}</h4>
              <p>{{ document.file_name }}</p>
            </div>

            <div class="document-meta">
              <span>{{ document.file_type || 'Unknown type' }}</span>
              <span>{{ formatFileSize(document.file_size) }}</span>
              <span>{{ new Date(document.created_at).toLocaleDateString() }}</span>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  background: #f4f7fb;
  color: #0f172a;
}

.sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  color: #e2e8f0;
}

.brand-mark,
.eyebrow {
  margin: 0;
  color: #7dd3fc;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.sidebar h1,
.hero-card h2,
.documents-card h3 {
  margin: 8px 0 0;
}

.user-line {
  margin-top: 12px;
  color: rgba(226, 232, 240, 0.75);
}

.sidebar-nav {
  display: grid;
  gap: 10px;
}

.nav-link {
  padding: 14px 16px;
  border-radius: 16px;
  color: inherit;
  text-decoration: none;
  background: rgba(148, 163, 184, 0.08);
  border: 0;
  text-align: left;
  font: inherit;
}

.nav-link.active {
  background: rgba(56, 189, 248, 0.18);
}

.logout-link {
  cursor: pointer;
}

.content {
  display: grid;
  gap: 20px;
  padding: 28px;
}

.hero-card,
.documents-card,
.metric-card {
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 28px;
}

.hero-card p,
.metric-card span,
.document-row p,
.empty-state p,
.state-text {
  color: #475569;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 20px;
}

.metric-card strong {
  display: block;
  margin-top: 12px;
  font-size: clamp(1.4rem, 4vw, 2rem);
}

.documents-card {
  padding: 24px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.section-heading a {
  color: #2563eb;
  text-decoration: none;
}

.empty-state {
  padding: 24px;
  border-radius: 20px;
  background: #f8fafc;
}

.document-list {
  display: grid;
  gap: 12px;
}

.document-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8fafc;
}

.document-row h4,
.empty-state h4 {
  margin: 0;
}

.document-meta {
  display: grid;
  justify-items: end;
  gap: 6px;
  color: #475569;
  font-size: 0.92rem;
}

.state-text.error {
  color: #b91c1c;
}

@media (max-width: 900px) {
  .dashboard-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding-bottom: 20px;
  }

  .hero-card,
  .document-row {
    flex-direction: column;
  }

  .document-meta {
    justify-items: start;
  }
}

@media (max-width: 640px) {
  .content,
  .sidebar {
    padding: 20px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
