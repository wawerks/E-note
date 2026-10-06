<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
  ArrowLeft,
  CircleHelp,
  Download,
  Eraser,
  FileText,
  Highlighter,
  Image,
  LayoutGrid,
  Link,
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
const canvasRef = ref<HTMLCanvasElement | null>(null)
const pageCanvases = ref<HTMLCanvasElement[]>([])
const imageInput = ref<HTMLInputElement | null>(null)
const canvasSize = ref({ width: 0, height: 0 })
const textEditor = ref<{ x: number; y: number } | null>(null)
const textValue = ref('')
const isDrawing = ref(false)
const isSelecting = ref(false)
const strokeStart = ref({ x: 0, y: 0 })
const lastPoint = ref({ x: 0, y: 0 })
const selectionBox = ref({ x: 0, y: 0, width: 0, height: 0 })
const undoStack = ref<ImageData[]>([])
const redoStack = ref<ImageData[]>([])
let resizeObserver: ResizeObserver | undefined
let pdfDocument: { numPages: number; getPage: (page: number) => Promise<unknown> } | null = null
let pdfPage: { getViewport: (options: { scale: number }) => { width: number; height: number }; render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> } } | null = null

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

function getCanvasPoint(event: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const bounds = canvas.getBoundingClientRect()
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
}

function getContext() {
  return canvasRef.value?.getContext('2d') ?? null
}

function saveCanvasState() {
  const canvas = canvasRef.value
  const context = getContext()
  if (!canvas || !context) return
  undoStack.value.push(context.getImageData(0, 0, canvas.width, canvas.height))
  if (undoStack.value.length > 30) undoStack.value.shift()
  redoStack.value = []
}

function restoreCanvasState(state: ImageData | undefined) {
  const context = getContext()
  if (context && state) context.putImageData(state, 0, 0)
}

function undoAnnotation() {
  const canvas = canvasRef.value
  const context = getContext()
  if (!canvas || !context || !undoStack.value.length) return
  redoStack.value.push(context.getImageData(0, 0, canvas.width, canvas.height))
  restoreCanvasState(undoStack.value.pop())
}

function redoAnnotation() {
  const canvas = canvasRef.value
  const context = getContext()
  if (!canvas || !context || !redoStack.value.length) return
  undoStack.value.push(context.getImageData(0, 0, canvas.width, canvas.height))
  restoreCanvasState(redoStack.value.pop())
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const oldCanvas = document.createElement('canvas')
  oldCanvas.width = canvas.width
  oldCanvas.height = canvas.height
  oldCanvas.getContext('2d')?.drawImage(canvas, 0, 0)
  const bounds = canvas.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.round(bounds.width * ratio))
  canvas.height = Math.max(1, Math.round(bounds.height * ratio))
  canvas.style.width = `${bounds.width}px`
  canvas.style.height = `${bounds.height}px`
  const context = getContext()
  if (context) {
    context.scale(ratio, ratio)
    if (oldCanvas.width && oldCanvas.height) context.drawImage(oldCanvas, 0, 0, bounds.width, bounds.height)
  }
  canvasSize.value = { width: bounds.width, height: bounds.height }
}

function setPageCanvas(element: unknown, pageNumber: number) {
  if (element instanceof HTMLCanvasElement) pageCanvases.value[pageNumber - 1] = element
}

async function renderPdfPage(pageNumber: number, canvas: HTMLCanvasElement) {
  if (!pdfDocument) return
  pdfPage = await pdfDocument.getPage(pageNumber) as typeof pdfPage
  const container = canvas.parentElement
  if (!container || !pdfPage) return
  const baseViewport = pdfPage.getViewport({ scale: 1 })
  const scale = Math.max((container.clientWidth - 24) / baseViewport.width, 0.5)
  const viewport = pdfPage.getViewport({ scale })
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.round(viewport.width * ratio)
  canvas.height = Math.round(viewport.height * ratio)
  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`
  const context = canvas.getContext('2d')
  if (!context) return
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  await pdfPage.render({ canvasContext: context, viewport }).promise
}

async function renderAllPdfPages() {
  await nextTick()
  await Promise.all(pageCanvases.value.map((canvas, index) => renderPdfPage(index + 1, canvas)))
  resizeCanvas()
}

async function loadPdfDocument(url: string) {
  try {
    const pdfModuleUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs'
    const pdfjs = await import(/* @vite-ignore */ pdfModuleUrl) as { getDocument: (source: { url: string }) => { promise: Promise<{ numPages: number; getPage: (page: number) => Promise<unknown> }> }; GlobalWorkerOptions: { workerSrc: string } }
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs'
    pdfDocument = await pdfjs.getDocument({ url }).promise
    pageCount.value = pdfDocument.numPages
  } catch {
    errorMessage.value = 'Unable to render this document in the custom reader.'
  }
}

async function goToPage(page: number) {
  if (!pdfDocument || page < 1 || page > pageCount.value) return
  currentPage.value = page
  pageCanvases.value[page - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function beginAnnotation(event: PointerEvent) {
  if (!editMode.value || activeTool.value === 'select') return
  const point = getCanvasPoint(event)
  strokeStart.value = point
  lastPoint.value = point
  isDrawing.value = !['text', 'image', 'shape', 'lasso'].includes(activeTool.value)
  isSelecting.value = activeTool.value === 'lasso' || activeTool.value === 'shape'
  if (activeTool.value === 'text') {
    textEditor.value = point
    nextTick(() => document.querySelector<HTMLInputElement>('.canvas-text-editor')?.focus())
    return
  }
  if (activeTool.value === 'image') {
    imageInput.value?.click()
    return
  }
  saveCanvasState()
  canvasRef.value?.setPointerCapture(event.pointerId)
}

function continueAnnotation(event: PointerEvent) {
  if (!isDrawing.value) {
    if (isSelecting.value) {
      const point = getCanvasPoint(event)
      selectionBox.value = { x: Math.min(strokeStart.value.x, point.x), y: Math.min(strokeStart.value.y, point.y), width: Math.abs(point.x - strokeStart.value.x), height: Math.abs(point.y - strokeStart.value.y) }
    }
    return
  }
  const context = getContext()
  if (!context) return
  const point = getCanvasPoint(event)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = activeTool.value === 'highlighter' ? 18 : activeTool.value === 'eraser' ? 28 : 3
  context.globalCompositeOperation = activeTool.value === 'eraser' ? 'destination-out' : 'source-over'
  context.strokeStyle = activeTool.value === 'highlighter' ? 'rgba(246, 196, 69, 0.38)' : '#34363a'
  context.beginPath()
  context.moveTo(lastPoint.value.x, lastPoint.value.y)
  context.lineTo(point.x, point.y)
  context.stroke()
  lastPoint.value = point
}

function finishAnnotation(event: PointerEvent) {
  if (!isDrawing.value && !isSelecting.value) return
  const context = getContext()
  const point = getCanvasPoint(event)
  if (activeTool.value === 'shape' && context) {
    context.globalCompositeOperation = 'source-over'
    context.strokeStyle = '#34363a'
    context.lineWidth = 2
    context.strokeRect(strokeStart.value.x, strokeStart.value.y, point.x - strokeStart.value.x, point.y - strokeStart.value.y)
  }
  isDrawing.value = false
  isSelecting.value = false
  if (activeTool.value !== 'lasso') selectionBox.value = { x: 0, y: 0, width: 0, height: 0 }
}

function commitText() {
  const context = getContext()
  if (!context || !textEditor.value || !textValue.value.trim()) {
    textEditor.value = null
    textValue.value = ''
    return
  }
  saveCanvasState()
  context.globalCompositeOperation = 'source-over'
  context.fillStyle = '#34363a'
  context.font = '16px Space Grotesk'
  context.fillText(textValue.value, textEditor.value.x, textEditor.value.y)
  textEditor.value = null
  textValue.value = ''
}

function insertImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !canvasRef.value) return
  const image = new window.Image()
  image.onload = () => {
    const context = getContext()
    if (!context) return
    saveCanvasState()
    const scale = Math.min(1, (canvasRef.value!.width / (window.devicePixelRatio || 1) - 40) / image.width)
    context.globalCompositeOperation = 'source-over'
    context.drawImage(image, 20, 20, image.width * scale, image.height * scale)
  }
  image.src = URL.createObjectURL(file)
  event.target instanceof HTMLInputElement && (event.target.value = '')
}

async function loadDocument() {
  loading.value = true
  errorMessage.value = ''

  try {
    const documentId = String(route.params.id)
    documentRecord.value = await getDocumentById(documentId)
    documentUrl.value = await getDocumentSignedUrl(documentRecord.value)
    await loadPdfDocument(documentUrl.value)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to open document.'
  } finally {
    loading.value = false
    await nextTick()
    setupAnnotationCanvas()
    await renderAllPdfPages()
  }
}

async function handleLogout() {
  await logout()
  await router.push('/login')
}

onMounted(() => {
  void loadDocument()
})

function setupAnnotationCanvas() {
  if (!canvasRef.value || resizeObserver) return
  resizeObserver = new ResizeObserver(resizeCanvas)
  resizeObserver.observe(canvasRef.value)
  resizeCanvas()
}

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <main class="reader-page">
    <header class="topbar">
      <div class="topbar-left">
        <RouterLink to="/dashboard" class="back-button" aria-label="Back to dashboard" title="Back to dashboard">
          <ArrowLeft :size="18" />
        </RouterLink>
        <button class="icon-button" type="button" aria-label="Open page thumbnails" @click="thumbnailsOpen = !thumbnailsOpen">
          <LayoutGrid :size="19" />
        </button>
        <div class="document-heading">
          <FileText :size="17" />
          <span>{{ documentRecord?.title || 'Document Reader' }}</span>
        </div>
      </div>

      <div class="tool-strip" :class="{ disabled: !editMode }" aria-label="Editing tools">
        <button v-for="tool in toolItems" :key="tool.id" class="tool-button" :class="{ active: activeTool === tool.id }" type="button" :aria-label="tool.label" :title="tool.label" @click="activeTool = tool.id">
          <component :is="tool.icon" :size="19" />
        </button>
        <span class="tool-divider"></span>
        <button class="tool-button" :class="{ active: activeTool === 'shape' }" type="button" aria-label="Shape tool" title="Shape tool" @click="activeTool = 'shape'"><CircleHelp :size="18" /></button>
        <button class="tool-button" :class="{ active: activeTool === 'lasso' }" type="button" aria-label="Lasso tool" title="Lasso tool" @click="activeTool = 'lasso'"><Link :size="18" /></button>
      </div>

      <div class="mode-switcher" aria-label="Reader mode">
        <button type="button" :class="{ active: editMode }" @click="editMode = true">Edit</button>
        <button type="button" :class="{ active: !editMode }" @click="editMode = false">Read only</button>
      </div>

      <div class="topbar-actions">
        <button class="icon-button" type="button" aria-label="Undo" @click="undoAnnotation"><Undo2 :size="18" /></button>
        <button class="icon-button" type="button" aria-label="Redo" @click="redoAnnotation"><Redo2 :size="18" /></button>
        <span class="toolbar-divider"></span>
        <button class="icon-button" type="button" aria-label="Open Goodnotes Assistant" @click="assistantOpen = !assistantOpen"><Sparkles :size="18" /></button>
        <a v-if="documentUrl" class="icon-button" :href="documentUrl" target="_blank" rel="noreferrer" aria-label="Download document"><Download :size="18" /></a>
        <button class="icon-button" type="button" aria-label="Open menu" @click="sidebarOpen = !sidebarOpen"><Menu :size="19" /></button>
      </div>
    </header>

    <div class="editor-body">
      <section class="canvas-area">
        <div v-if="loading" class="state-panel">Loading document...</div>
        <div v-else-if="errorMessage" class="state-panel error-text">{{ errorMessage }}</div>
        <div v-else class="paper-stage">
          <div class="document-stack">
            <div v-for="page in pageCount" :key="page" class="pdf-page">
              <canvas :ref="element => setPageCanvas(element, page)" :aria-label="`Document page ${page}`"></canvas>
            </div>
          </div>
          <canvas ref="canvasRef" class="annotation-canvas" :class="{ interactive: editMode && activeTool !== 'select' }" @pointerdown="beginAnnotation" @pointermove="continueAnnotation" @pointerup="finishAnnotation" @pointercancel="finishAnnotation"></canvas>
          <div v-if="selectionBox.width || selectionBox.height" class="selection-box" :style="{ left: `${selectionBox.x}px`, top: `${selectionBox.y}px`, width: `${selectionBox.width}px`, height: `${selectionBox.height}px` }"></div>
          <input v-if="textEditor" v-model="textValue" class="canvas-text-editor" :style="{ left: `${textEditor.x}px`, top: `${textEditor.y - 20}px` }" @keydown.enter.prevent="commitText" @blur="commitText" placeholder="Type here" />
        </div>

      </section>
    </div>

    <input ref="imageInput" class="hidden-file-input" type="file" accept="image/*" @change="insertImage" />

    <aside v-if="thumbnailsOpen" class="floating-panel thumbnails-panel">
      <div class="panel-heading"><strong>Pages</strong><button class="close-button" type="button" aria-label="Close pages" @click="thumbnailsOpen = false"><X :size="17" /></button></div>
      <button class="page-thumbnail active" type="button" @click="goToPage(1)"><span>1</span><div class="thumbnail-paper"></div></button>
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
.topbar { z-index: 3; display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 58px; padding: 0 18px; border-bottom: 1px solid #dedbd6; background: rgba(255, 255, 255, 0.96); }
.topbar-left, .topbar-actions, .document-heading, .assistant-title { display: flex; align-items: center; }
.topbar-left, .topbar-actions { gap: 9px; }
.document-heading { gap: 9px; margin-left: 8px; font-size: 0.9rem; font-weight: 600; }
.document-heading svg { color: #8a756d; }
.icon-button, .back-button, .close-button, .round-button { display: inline-grid; place-items: center; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 8px; background: transparent; cursor: pointer; text-decoration: none; }
.icon-button:hover, .close-button:hover, .round-button:hover { background: #f1eeeb; }
.icon-button:focus-visible, button:focus-visible, a:focus-visible { outline: 2px solid #c96f4a; outline-offset: 2px; }
.toolbar-divider, .tool-divider { width: 1px; height: 24px; margin: 0 4px; background: #e2dfdc; }
.mode-switcher { display: flex; gap: 2px; padding: 3px; border-radius: 8px; background: #f1efed; }
.mode-switcher button { padding: 5px 12px; border: 0; border-radius: 6px; background: transparent; color: #787b80; font-size: 0.76rem; cursor: pointer; }
.mode-switcher button.active { background: #fff; color: #4b4f55; box-shadow: 0 1px 3px rgba(47, 43, 40, 0.12); }
.editor-body { display: flex; flex: 1; min-height: 0; }
.tool-strip { z-index: 2; display: flex; flex: 0 1 auto; flex-direction: row; align-items: center; gap: 3px; padding: 0; background: transparent; }
.tool-strip.disabled { opacity: 0.42; }
.tool-button { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; border-radius: 9px; background: transparent; color: #696b70; cursor: pointer; }
.tool-button:hover, .tool-button.active { background: #e9e1dc; color: #bd603e; }
.tool-divider { width: 1px; height: 24px; margin: 0 5px; }
.canvas-area { position: relative; display: flex; flex: 1; min-width: 0; min-height: 0; align-items: center; justify-content: center; padding: 26px 54px 58px; overflow: auto; background: #e7e5e2; }
.back-button { color: #7d5b4e; }
.paper-stage { position: relative; width: min(100%, 920px); min-height: 500px; overflow: hidden; background: #fff; box-shadow: 0 7px 22px rgba(62, 56, 50, 0.15); }
.document-stack { display: grid; gap: 18px; padding: 12px; }
.pdf-page { display: flex; justify-content: center; width: 100%; background: #fff; }
.pdf-page canvas { display: block; max-width: 100%; background: #fff; box-shadow: 0 2px 12px rgba(62, 56, 50, 0.08); }
.annotation-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.annotation-canvas.interactive { pointer-events: auto; cursor: crosshair; }
.selection-box { position: absolute; pointer-events: none; border: 1px dashed #c87350; background: rgba(200, 115, 80, 0.1); }
.canvas-text-editor { position: absolute; z-index: 1; width: 180px; padding: 5px 7px; border: 1px solid #c87350; border-radius: 4px; outline: 0; background: #fffdfb; color: #34363a; font: 14px 'Space Grotesk', sans-serif; }
.hidden-file-input { display: none; }
.page-controls { display: none; }
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
  .tool-strip { max-width: 45vw; overflow-x: auto; }
  .tool-button { width: 34px; height: 34px; }
  .canvas-area { padding: 14px 14px 53px; }
  .paper-stage { min-height: 420px; }
  .thumbnails-panel { left: 54px; }
}
</style>