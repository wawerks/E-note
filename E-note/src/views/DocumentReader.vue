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
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  Eraser,
  FileText,
  Highlighter,
  Image,
  LayoutGrid,
  Link,
  List,
  Menu,
  MessageCircle,
  MousePointer2,
  PenLine,
  Plus,
  Redo2,
  Search,
  Settings2,
  Sparkles,
  Type,
  Undo2,
  X,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const documentRecord = ref<DocumentRecord | null>(null)
const documentUrl = ref('')
const loading = ref(true)
const errorMessage = ref('')
const activeTool = ref('select')
const sidebarOpen = ref(false)
const thumbnailsOpen = ref(false)
const assistantOpen = ref(false)
const editMode = ref(true)
const assistantQuestion = ref('')
const assistantAnswer = ref('')
const currentPage = ref(1)
const pageCount = ref(1)

const displayName = computed(() => getUserDisplayName(authState.user))
const toolItems = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'pen', label: 'Pen', icon: PenLine },
  { id: 'highlighter', label: 'Highlighter', icon: Highlighter },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'image', label: 'Image', icon: Image },
]

const assistantPrompts = [
  'How do I move handwriting?',
  'How do I add a new page?',
  'How do I convert handwriting to text?',
]

function askAssistant(question = assistantQuestion.value) {
  const normalizedQuestion = question.toLowerCase()
  assistantQuestion.value = question

  if (normalizedQuestion.includes('move') || normalizedQuestion.includes('handwriting')) {
    assistantAnswer.value = 'Use the Lasso tool. Circle your handwriting, then drag it to the new spot.'
  } else if (normalizedQuestion.includes('page')) {
    assistantAnswer.value = 'Tap the + button in the top right, then choose whether to add the page before, after, or last.'
  } else if (normalizedQuestion.includes('convert') || normalizedQuestion.includes('text')) {
    assistantAnswer.value = 'Select the Lasso tool, circle your handwriting, tap the selection, then choose convert.'
  } else if (normalizedQuestion.includes('link')) {
    assistantAnswer.value = 'Switch to read-only mode to tap hyperlinks. Links stay fixed when pages are added.'
  } else {
    assistantAnswer.value = 'Try asking about the pen, highlighter, lasso, text input, pages, or hyperlinks.'
  }
}

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
    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-button" type="button" aria-label="Open page thumbnails" @click="thumbnailsOpen = !thumbnailsOpen">
          <LayoutGrid :size="19" />
        </button>
        <div class="document-heading">
          <FileText :size="17" />
          <span>{{ documentRecord?.title || 'Document Reader' }}</span>
        </div>
      </div>

      <div class="mode-switcher" aria-label="Reader mode">
        <button type="button" :class="{ active: editMode }" @click="editMode = true">Edit</button>
        <button type="button" :class="{ active: !editMode }" @click="editMode = false">Read only</button>
      </div>

      <div class="topbar-actions">
        <button class="icon-button" type="button" aria-label="Undo"><Undo2 :size="18" /></button>
        <button class="icon-button" type="button" aria-label="Redo"><Redo2 :size="18" /></button>
        <span class="toolbar-divider"></span>
        <button class="icon-button" type="button" aria-label="Open Goodnotes Assistant" @click="assistantOpen = !assistantOpen"><Sparkles :size="18" /></button>
        <a v-if="documentUrl" class="icon-button" :href="documentUrl" target="_blank" rel="noreferrer" aria-label="Download document"><Download :size="18" /></a>
        <button class="icon-button" type="button" aria-label="Open menu" @click="sidebarOpen = !sidebarOpen"><Menu :size="19" /></button>
      </div>
    </header>

    <div class="editor-body">
      <aside class="tool-strip" :class="{ disabled: !editMode }" aria-label="Editing tools">
        <button v-for="tool in toolItems" :key="tool.id" class="tool-button" :class="{ active: activeTool === tool.id }" type="button" :aria-label="tool.label" :title="tool.label" @click="activeTool = tool.id">
          <component :is="tool.icon" :size="19" />
        </button>
        <span class="tool-divider"></span>
        <button class="tool-button" type="button" aria-label="Shape tool" title="Shape tool"><CircleHelp :size="18" /></button>
        <button class="tool-button" type="button" aria-label="Lasso tool" title="Lasso tool"><Link :size="18" /></button>
      </aside>

      <section class="canvas-area">
        <div v-if="loading" class="state-panel">Loading document...</div>
        <div v-else-if="errorMessage" class="state-panel error-text">{{ errorMessage }}</div>
        <div v-else class="paper-stage">
          <iframe :src="documentUrl" class="document-frame" title="Document preview" />
        </div>

        <div class="page-controls">
          <button class="round-button" type="button" aria-label="Previous page" :disabled="currentPage === 1" @click="currentPage--"><ChevronLeft :size="17" /></button>
          <span>{{ currentPage }} / {{ pageCount }}</span>
          <button class="round-button" type="button" aria-label="Next page" :disabled="currentPage === pageCount" @click="currentPage++"><ChevronRight :size="17" /></button>
        </div>
      </section>
    </div>

    <aside v-if="thumbnailsOpen" class="floating-panel thumbnails-panel">
      <div class="panel-heading"><strong>Pages</strong><button class="close-button" type="button" aria-label="Close pages" @click="thumbnailsOpen = false"><X :size="17" /></button></div>
      <button class="page-thumbnail active" type="button" @click="currentPage = 1"><span>1</span><div class="thumbnail-paper"></div></button>
      <button class="add-page-button" type="button" @click="pageCount++"><Plus :size="16" /> Add page</button>
    </aside>

    <aside v-if="sidebarOpen" class="floating-panel options-panel">
      <div class="panel-heading"><strong>Document</strong><button class="close-button" type="button" aria-label="Close menu" @click="sidebarOpen = false"><X :size="17" /></button></div>
      <p class="signed-in">Signed in as {{ displayName }}</p>
      <button class="panel-action" type="button" @click="assistantOpen = true; sidebarOpen = false"><Sparkles :size="17" /> Goodnotes Assistant</button>
      <button class="panel-action" type="button"><Search :size="17" /> Search document</button>
      <button class="panel-action" type="button"><Settings2 :size="17" /> Document settings</button>
      <RouterLink to="/dashboard" class="panel-action"><BookOpen :size="17" /> Back to dashboard</RouterLink>
      <button class="panel-action danger" type="button" @click="handleLogout">Log out</button>
    </aside>

    <aside v-if="assistantOpen" class="floating-panel assistant-panel">
      <div class="panel-heading"><div class="assistant-title"><Sparkles :size="17" /> <strong>Goodnotes Assistant</strong></div><button class="close-button" type="button" aria-label="Close assistant" @click="assistantOpen = false"><X :size="17" /></button></div>
      <p class="assistant-intro">Ask about writing, editing, or organizing your notes.</p>
      <div v-if="assistantAnswer" class="assistant-answer">{{ assistantAnswer }}</div>
      <div class="prompt-list">
        <button v-for="prompt in assistantPrompts" :key="prompt" type="button" @click="askAssistant(prompt)">{{ prompt }}</button>
      </div>
      <form class="assistant-form" @submit.prevent="askAssistant()">
        <input v-model="assistantQuestion" type="text" placeholder="Ask a question..." aria-label="Ask the assistant" />
        <button type="submit" aria-label="Send question"><MessageCircle :size="17" /></button>
      </form>
      <p class="assistant-tip"><span>Tip</span> Double-tap Apple Pencil (2nd gen) to switch between writing and erasing.</p>
    </aside>
  </main>
</template>

<style scoped>
.reader-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #eceae7;
  color: #30343b;
}

button, a { -webkit-tap-highlight-color: transparent; }
button { color: inherit; }
.topbar { z-index: 3; display: flex; align-items: center; justify-content: space-between; min-height: 58px; padding: 0 18px; border-bottom: 1px solid #dedbd6; background: rgba(255, 255, 255, 0.96); }
.topbar-left, .topbar-actions, .document-heading, .assistant-title { display: flex; align-items: center; }
.topbar-left, .topbar-actions { gap: 9px; }
.document-heading { gap: 9px; margin-left: 8px; font-size: 0.9rem; font-weight: 600; }
.document-heading svg { color: #8a756d; }
.icon-button, .close-button, .round-button { display: inline-grid; place-items: center; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 8px; background: transparent; cursor: pointer; }
.icon-button:hover, .close-button:hover, .round-button:hover { background: #f1eeeb; }
.icon-button:focus-visible, button:focus-visible, a:focus-visible { outline: 2px solid #c96f4a; outline-offset: 2px; }
.toolbar-divider, .tool-divider { width: 1px; height: 24px; margin: 0 4px; background: #e2dfdc; }
.mode-switcher { display: flex; gap: 2px; padding: 3px; border-radius: 8px; background: #f1efed; }
.mode-switcher button { padding: 5px 12px; border: 0; border-radius: 6px; background: transparent; color: #787b80; font-size: 0.76rem; cursor: pointer; }
.mode-switcher button.active { background: #fff; color: #4b4f55; box-shadow: 0 1px 3px rgba(47, 43, 40, 0.12); }
.editor-body { display: flex; flex: 1; min-height: 0; }
.tool-strip { z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 7px; width: 54px; padding: 13px 9px; border-right: 1px solid #dedbd6; background: #f8f7f5; }
.tool-strip.disabled { opacity: 0.42; }
.tool-button { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 9px; background: transparent; color: #696b70; cursor: pointer; }
.tool-button:hover, .tool-button.active { background: #e9e1dc; color: #bd603e; }
.tool-divider { width: 25px; height: 1px; margin: 5px 0; }
.canvas-area { position: relative; display: flex; flex: 1; min-width: 0; min-height: 0; align-items: center; justify-content: center; padding: 26px 54px 58px; overflow: auto; background: #e7e5e2; }
.paper-stage { width: min(100%, 920px); height: 100%; min-height: 500px; overflow: hidden; background: #fff; box-shadow: 0 7px 22px rgba(62, 56, 50, 0.15); }
.document-frame { display: block; width: 100%; height: 100%; min-height: 600px; border: 0; background: #fff; }
.page-controls { position: absolute; bottom: 17px; left: 50%; display: flex; align-items: center; gap: 12px; padding: 4px 7px; transform: translateX(-50%); border: 1px solid #d9d5d1; border-radius: 20px; background: rgba(255, 255, 255, 0.94); box-shadow: 0 3px 12px rgba(45, 42, 39, 0.08); font-size: 0.75rem; color: #62656a; }
.round-button { width: 25px; height: 25px; border-radius: 50%; }
.round-button:disabled { opacity: 0.3; cursor: not-allowed; }
.floating-panel { position: fixed; z-index: 5; border: 1px solid #ddd8d3; background: rgba(255, 255, 255, 0.98); box-shadow: 0 15px 45px rgba(42, 37, 33, 0.18); }
.thumbnails-panel { top: 68px; left: 66px; width: 190px; padding: 14px; border-radius: 12px; }
.options-panel { top: 68px; right: 17px; width: 240px; padding: 14px; border-radius: 12px; }
.assistant-panel { right: 17px; bottom: 17px; width: min(355px, calc(100vw - 34px)); padding: 16px; border-radius: 14px; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 13px; font-size: 0.87rem; }
.close-button { width: 27px; height: 27px; color: #777; }
.page-thumbnail { display: block; width: 100%; padding: 8px; border: 1px solid #e3dfdb; border-radius: 7px; background: #f8f7f5; cursor: pointer; }
.page-thumbnail.active { border-color: #c97855; box-shadow: 0 0 0 2px rgba(201, 120, 85, 0.14); }
.page-thumbnail span { display: block; margin-bottom: 6px; text-align: left; color: #888; font-size: 0.7rem; }
.thumbnail-paper { height: 112px; background: repeating-linear-gradient(0deg, transparent 0 14px, #e8e3de 15px), #fff; }
.add-page-button, .panel-action { display: flex; align-items: center; gap: 9px; width: 100%; padding: 10px 7px; border: 0; border-radius: 7px; background: transparent; text-align: left; font-size: 0.78rem; cursor: pointer; }
.add-page-button { justify-content: center; margin-top: 10px; color: #bb6040; }
.panel-action:hover, .add-page-button:hover { background: #f5f1ee; }
.panel-action.danger { margin-top: 8px; color: #b34e3d; }
.signed-in, .assistant-intro { margin: -3px 0 12px; color: #858181; font-size: 0.74rem; line-height: 1.5; }
.assistant-title { gap: 7px; color: #5a514d; }
.assistant-title svg { color: #c6734e; }
.assistant-answer { margin-bottom: 12px; padding: 11px 12px; border-radius: 9px; background: #fbf1eb; color: #514843; font-size: 0.78rem; line-height: 1.5; }
.prompt-list { display: grid; gap: 6px; }
.prompt-list button { padding: 8px 10px; border: 1px solid #e4dfdb; border-radius: 7px; background: #fff; color: #65676c; text-align: left; font-size: 0.74rem; cursor: pointer; }
.prompt-list button:hover { border-color: #d49a7d; background: #fffaf7; }
.assistant-form { display: flex; gap: 6px; margin-top: 13px; }
.assistant-form input { min-width: 0; flex: 1; padding: 9px 10px; border: 1px solid #ded9d5; border-radius: 7px; outline: 0; font-size: 0.75rem; }
.assistant-form input:focus { border-color: #ce8869; }
.assistant-form button { display: grid; place-items: center; width: 35px; border: 0; border-radius: 7px; background: #c87350; color: #fff; cursor: pointer; }
.assistant-tip { margin: 13px 0 0; color: #898482; font-size: 0.69rem; line-height: 1.45; }
.assistant-tip span { color: #bb6748; font-weight: 700; }
.state-panel { padding: 24px; color: #696b70; }
.error-text { color: #b54a3c; }
@media (max-width: 700px) {
  .topbar { padding: 0 9px; }
  .document-heading { max-width: 150px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .mode-switcher { display: none; }
  .topbar-actions .icon-button:nth-child(1), .topbar-actions .icon-button:nth-child(2), .toolbar-divider { display: none; }
  .tool-strip { width: 46px; padding-inline: 5px; }
  .tool-button { width: 34px; height: 34px; }
  .canvas-area { padding: 14px 14px 53px; }
  .paper-stage, .document-frame { min-height: 420px; }
  .thumbnails-panel { left: 54px; }
}
</style>