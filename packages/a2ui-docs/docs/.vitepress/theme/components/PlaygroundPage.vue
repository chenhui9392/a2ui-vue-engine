<template>
  <div class="playground-page">
    <!-- Header -->
    <div class="playground-header">
      <div class="header-left">
        <h1 class="title">A2UI Playground</h1>
        <el-tag type="info" size="small">JSON 调试工具</el-tag>
      </div>
      <div class="header-right">
        <el-select v-model="selectedExample" placeholder="选择示例" size="default" style="width: 280px; margin-right: 8px;">
          <el-option label="组件全览" value="allComponents" />
          <el-option label="员工信息登记表" value="employee" />
          <el-option label="网络权限申请单" value="network" />
          <el-option label="创建工单" value="workorder" />
          <el-option label="✨ CRUD 页面 (PageSchema + Runtime)" value="crudPageSchema" />
        </el-select>
        <el-tooltip :content="runButtonTooltip" placement="bottom">
          <el-button type="primary" :disabled="!canRun" @click="handleRun">
            <el-icon><VideoPlay /></el-icon>
            运行
          </el-button>
        </el-tooltip>
        <el-tooltip content="格式化 JSON" placement="bottom">
          <el-button @click="handleFormat">
            <el-icon><Document /></el-icon>
            格式化
          </el-button>
        </el-tooltip>
        <el-tooltip content="复制 JSON" placement="bottom">
          <el-button @click="handleCopy">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </el-tooltip>
        <el-tooltip content="重置为默认" placement="bottom">
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Main Content -->
    <div class="playground-main">
      <!-- Left Panel -->
      <div class="left-panel">
        <!-- JSON Editor -->
        <div class="editor-section">
          <div class="section-header">
            <span class="section-title">JSON Schema</span>
            <el-tag type="warning" size="small" v-if="jsonLines">{{ jsonLines }} 行</el-tag>
          </div>
          <div class="editor-body">
            <div class="code-editor">
              <div class="line-numbers">
                <span v-for="n in lineCount" :key="n" class="line-number">{{ n }}</span>
              </div>
              <div class="code-content" ref="codeContentRef">
                <pre class="code-highlight" ref="highlightRef"><code v-html="highlightedJson"></code></pre>
                <textarea
                  ref="textareaRef"
                  v-model="jsonContent"
                  class="code-input"
                  placeholder="在此输入 JSON..."
                  spellcheck="false"
                  @scroll="handleScroll"
                  @keydown="handleKeydown"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="error-panel" v-if="errorMessage">
            <el-alert
              :title="errorMessage"
              type="error"
              :closable="false"
              show-icon
            />
          </div>
        </div>

        <!-- Form Data -->
        <div class="data-section">
          <div class="section-header">
            <span class="section-title">{{ runtimeMode ? 'Runtime State' : 'Form Data' }}</span>
            <el-tag v-if="runtimeMode" type="success" size="small">PageSchema</el-tag>
          </div>
          <div class="data-body">
            <div class="code-editor data-editor">
              <div class="line-numbers">
                <span v-for="n in dataLineCount" :key="n" class="line-number">{{ n }}</span>
              </div>
              <div class="code-content">
                <pre class="code-highlight"><code v-html="highlightedFormData"></code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="preview-panel" :class="{ 'preview-panel--fullscreen': previewFullscreen }">
        <div class="panel-header">
          <span class="panel-title">预览</span>
          <el-tag type="success" size="small" v-if="renderSuccess">
            已渲染
          </el-tag>
          <div class="panel-header-actions">
            <el-tooltip :content="previewFullscreen ? '退出全屏 (Esc)' : '全屏预览'" placement="bottom">
              <el-button size="small" text @click="togglePreviewFullscreen">
                <el-icon>
                  <Close v-if="previewFullscreen" />
                  <FullScreen v-else />
                </el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
        <div class="preview-body">
          <!-- PageSchema 模式：走 createRuntime -->
          <A2UIRoot
            v-if="runtimeMode && runtime"
            :key="runtimeKey"
            :runtime="runtime"
          />
          <!-- 扁平数组模式：走 processMessage -->
          <A2UIRoot
            v-else
            ref="a2uiRootRef"
            @message="handleAction"
            @formData-change="handleFormDataChange"
          />
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="playground-footer">
      <div class="footer-left">
        <span>消息数: {{ messageCount }}</span>
        <span v-if="lastRunTime">最后运行: {{ lastRunTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Document, CopyDocument, Refresh, FullScreen, Close } from '@element-plus/icons-vue'
import { A2UIRoot, createRuntime } from 'a2ui-vue-engine'
import type { A2Node, FormDataResult, A2UIRuntime } from 'a2ui-vue-engine'
import { mockExamples } from './mock-examples'

// Refs
const selectedExample = ref('allComponents')
const a2uiRootRef = ref<InstanceType<typeof A2UIRoot>>()
const textareaRef = ref<HTMLTextAreaElement>()
const highlightRef = ref<HTMLElement>()
const codeContentRef = ref<HTMLElement>()
const jsonContent = ref(mockExamples.allComponents)
const errorMessage = ref('')
const renderSuccess = ref(false)
const messageCount = ref(0)
const lastRunTime = ref('')
const currentFormData = ref<FormDataResult>({ form: {} })

// PageSchema 模式状态（CRUD 页面用 createRuntime 执行）
// 用 shallowRef 避免 Vue 深度响应式导致 runtime.state 被自动解包
const runtime = shallowRef<A2UIRuntime>()
const runtimeMode = ref(false)
const runtimeKey = ref(0)

// Mock 数据（文档站无后端，用静态数据模拟 API 响应）
const mockListData = [
  { id: 1, ruleNo: 'FR-001', ruleType: '制冷故障', faultLevel: 'P1', applicableDepartments: 'IT运维部', productName: '吸尘器A1', productModule: '电机模块', status: 'active', validDate: '2026-01-15', submitterName: '张三' },
  { id: 2, ruleNo: 'FR-002', ruleType: '网络异常', faultLevel: 'P2', applicableDepartments: '客服部', productName: '洗地机X5', productModule: '通信板', status: 'active', validDate: '2026-02-01', submitterName: '李四' },
  { id: 3, ruleNo: 'FR-003', ruleType: '电池续航', faultLevel: 'P1', applicableDepartments: '研发部', productName: '吹风机F9', productModule: '电池组', status: 'inactive', validDate: '2026-01-20', submitterName: '王五' },
  { id: 4, ruleNo: 'FR-004', ruleType: '按键失灵', faultLevel: 'P3', applicableDepartments: '品质部', productName: '料理机M3', productModule: '控制板', status: 'active', validDate: '2026-03-10', submitterName: '赵六' },
  { id: 5, ruleNo: 'FR-005', ruleType: '噪音过大', faultLevel: 'P2', applicableDepartments: '研发部', productName: '搅拌机S2', productModule: '电机', status: 'active', validDate: '2026-02-28', submitterName: '钱七' },
  { id: 6, ruleNo: 'FR-006', ruleType: '漏水', faultLevel: 'P1', applicableDepartments: '品质部', productName: '洗地机X5', productModule: '水箱', status: 'inactive', validDate: '2026-01-05', submitterName: '孙八' },
  { id: 7, ruleNo: 'FR-007', ruleType: '显示异常', faultLevel: 'P3', applicableDepartments: 'IT运维部', productName: '料理机M3', productModule: '显示屏', status: 'active', validDate: '2026-03-15', submitterName: '周九' },
  { id: 8, ruleNo: 'FR-008', ruleType: '充电故障', faultLevel: 'P2', applicableDepartments: '研发部', productName: '吹风机F9', productModule: '充电模块', status: 'active', validDate: '2026-02-10', submitterName: '吴十' },
]

// Mock HttpClient：拦截 API 请求，返回静态数据（文档站无后端代理）
function createMockHttpClient() {
  return {
    request: async (config: any) => {
      const url: string = config.url || ''
      await new Promise(r => setTimeout(r, 200))  // 模拟网络延迟
      if (url.includes('/systemFaultRule/pageList')) {
        const body = config.body || {}
        const pageNo = body.pageNo || 1
        const pageSize = body.pageSize || 10
        const start = (pageNo - 1) * pageSize
        return { data: { code: 200, data: { records: mockListData.slice(start, start + pageSize), total: mockListData.length } } }
      }
      if (url.includes('/systemFaultRule/getDetail')) {
        const id = url.split('/').pop()
        const item = mockListData.find(r => String(r.id) === String(id)) || mockListData[0]
        return { data: { code: 200, data: item } }
      }
      if (url.includes('/systemFaultRule/addOrUpdate')) {
        return { data: { code: 200, data: { id: Date.now() } } }
      }
      return { data: { code: 200, data: {} } }
    },
  }
}

// 检测是否为 PageSchema 格式（含 page + components）
function isPageSchema(data: any): boolean {
  return data && typeof data === 'object' && !Array.isArray(data)
    && data.page && data.components
}

// Line count
const lineCount = computed(() => {
  if (!jsonContent.value) return 1
  return jsonContent.value.split('\n').length
})

const jsonLines = computed(() => lineCount.value)

const dataLineCount = computed(() => {
  if (!formDataJson.value) return 1
  return formDataJson.value.split('\n').length
})

// JSON syntax highlighting
function highlightJson(jsonStr: string): string {
  if (!jsonStr) return ''

  let escaped = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const lines = escaped.split('\n')
  const highlightedLines = lines.map(line => {
    line = line.replace(/"([^"]+)"(\s*:)/g, '<span class="hl-key">"$1"</span>$2')
    line = line.replace(/:\s*"([^"]*)"/g, ': <span class="hl-string">"$1"</span>')
    line = line.replace(/:\s*(-?\d+\.?\d*)(\s*[,\]\}])/g, ': <span class="hl-number">$1</span>$2')
    line = line.replace(/:\s*(true|false)(\s*[,\]\}])/g, ': <span class="hl-boolean">$1</span>$2')
    line = line.replace(/:\s*(null)(\s*[,\]\}])/g, ': <span class="hl-null">$1</span>$2')
    return line
  })

  return highlightedLines.join('\n')
}

const highlightedJson = computed(() => highlightJson(jsonContent.value))

// 判断是否可以运行（JSON 非空且格式有效）
const canRun = computed(() => {
  const content = jsonContent.value.trim()
  if (!content) return false
  try {
    JSON.parse(content)
    return true
  } catch {
    return false
  }
})

// 运行按钮的 tooltip 提示
const runButtonTooltip = computed(() => {
  if (!jsonContent.value.trim()) return 'JSON 内容为空'
  if (!canRun.value) return 'JSON 格式无效'
  return '执行 JSON 渲染'
})

const formDataJson = computed<string>(() => {
  // PageSchema 模式：展示 runtime.state
  if (runtimeMode.value && runtime.value) {
    return JSON.stringify(runtime.value.state.value, null, 2)
  }
  return JSON.stringify(currentFormData.value, null, 2)
})

const highlightedFormData = computed(() => highlightJson(formDataJson.value))

// Scroll sync
function handleScroll() {
  if (textareaRef.value && highlightRef.value && codeContentRef.value) {
    const scrollTop = textareaRef.value.scrollTop
    const scrollLeft = textareaRef.value.scrollLeft
    highlightRef.value.scrollTop = scrollTop
    highlightRef.value.scrollLeft = scrollLeft
    const lineNumbersEl = codeContentRef.value.parentElement?.querySelector('.line-numbers')
    if (lineNumbersEl) {
      lineNumbersEl.scrollTop = scrollTop
    }
  }
}

// Keyboard handling (Tab key)
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = textareaRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + 2
    jsonContent.value = textarea.value
  }
}

// Parse JSON
function parseJsonContent(): A2Node | null {
  const content = jsonContent.value.trim()
  if (!content) {
    errorMessage.value = 'JSON 内容为空'
    return null
  }

  try {
    const node = JSON.parse(content)
    errorMessage.value = ''
    return node
  } catch (e) {
    errorMessage.value = `JSON 解析错误: ${e}`
    return null
  }
}

// Run rendering
function handleRun() {
  const node = parseJsonContent()
  if (!node) return

  try {
    if (isPageSchema(node)) {
      // PageSchema 模式：createRuntime + mock httpClient → A2UIRoot :runtime
      runtimeMode.value = true
      runtime.value?.destroy()
      runtime.value = createRuntime({
        schema: node,
        httpClient: createMockHttpClient() as any,
      })
      runtimeKey.value++
    } else {
      // 扁平数组模式：processMessage
      runtimeMode.value = false
      runtime.value?.destroy()
      runtime.value = undefined
      if (a2uiRootRef.value) {
        a2uiRootRef.value.updateTree(null)
        a2uiRootRef.value.processMessage({
          type: 'node',
          node: node,
        })
        currentFormData.value = a2uiRootRef.value.getFormData()
      }
    }

    messageCount.value++
    lastRunTime.value = new Date().toLocaleTimeString()
    renderSuccess.value = true
    errorMessage.value = ''
    ElMessage.success('渲染成功!')
  } catch (e) {
    errorMessage.value = `渲染错误: ${e}`
    renderSuccess.value = false
    ElMessage.error(errorMessage.value)
  }
}

// Format JSON
function handleFormat() {
  try {
    const parsed = JSON.parse(jsonContent.value)
    jsonContent.value = JSON.stringify(parsed, null, 2)
    ElMessage.success('JSON 格式化成功!')
  } catch (e) {
    ElMessage.error('JSON 格式无效')
  }
}

// Copy JSON
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(jsonContent.value)
    ElMessage.success('已复制到剪贴板!')
  } catch (e) {
    ElMessage.error('复制失败!')
  }
}

// Reset to current example
function handleReset() {
  jsonContent.value = mockExamples[selectedExample.value]
  errorMessage.value = ''
  handleRun()
}

// Handle action
// 追踪最近一次表格行点击（供后续按钮 action 使用）
const lastClickedRow = ref<any>(null)

function handleAction(payload: any) {
  console.log('A2UI Action:', payload)

  // Table 行点击（点击按钮时会先冒泡触发行点击）
  if (payload && payload.type === 'rowClick' && payload.row) {
    lastClickedRow.value = payload.row
    // 行点击本身不 toast，避免噪声
    return
  }

  // 从协议 emit 上抛的 action 消息统一格式为 { type: 'action', action, payload, event }
  // 或组件兜底 emit 的 action 格式为 { type: 'click', ... }
  const actionName = payload?.payload?.action || payload?.action || payload?.type

  // 拦截「查看 / 编辑」→ 打开 Drawer
  if ((actionName === 'viewOrder' || actionName === 'editOrder') && a2uiRootRef.value) {
    const row = lastClickedRow.value
    if (row) {
      const title = actionName === 'viewOrder' ? `工单详情 · ${row.no || ''}` : `编辑工单 · ${row.no || ''}`
      a2uiRootRef.value.updateData({
        drawer: {
          visible: true,
          mode: actionName === 'viewOrder' ? 'view' : 'edit',
          data: { ...row, title },
        },
      })
      ElMessage.info(`${actionName === 'viewOrder' ? '查看' : '编辑'}：${row.no}`)
      return
    }
  }

  ElMessage.info(`Action: ${actionName || payload.type}`)
}

// Handle form data change
function handleFormDataChange(formData: FormDataResult) {
  currentFormData.value = formData
}

// Watch example selection change
watch(selectedExample, (newExample) => {
  jsonContent.value = mockExamples[newExample]
  errorMessage.value = ''
  renderSuccess.value = false
  // 切换示例时清理 runtime 模式
  runtimeMode.value = false
  runtime.value?.destroy()
  runtime.value = undefined
})

// Initialize on mount
onMounted(() => {
  handleRun()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  runtime.value?.destroy()
})

// 全屏预览：Esc 退出
const previewFullscreen = ref(false)
function togglePreviewFullscreen() {
  previewFullscreen.value = !previewFullscreen.value
}
function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && previewFullscreen.value) {
    previewFullscreen.value = false
  }
}
</script>

<style scoped>
.playground-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  min-height: 500px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

/* Header */
.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 禁用状态的 primary 按钮显示灰色 */
.header-right .el-button--primary.is-disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  color: #ffffff;
}

/* Main Content */
.playground-main {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Left Panel */
.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
  background: #fff;
}

/* Editor Section (70%) */
.editor-section {
  flex: 7;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-bottom: 1px solid #e4e7ed;
}

/* Data Section (30%) */
.data-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 36px;
  padding: 8px 16px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

/* Editor Body */
.editor-body,
.data-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Code Editor Container */
.code-editor {
  display: flex;
  height: 100%;
  background: #fff;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

/* Line Numbers */
.line-numbers {
  width: 40px;
  padding: 8px 0;
  background: #fafafa;
  color: #909399;
  text-align: right;
  user-select: none;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.line-numbers::-webkit-scrollbar {
  display: none;
}

.line-number {
  display: block;
  padding-right: 8px;
  height: 19.5px;
  line-height: 19.5px;
  font-size: 12px;
}

/* Code Content */
.code-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Highlight Layer */
.code-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 12px;
  margin: 0;
  color: #303133;
  white-space: pre;
  overflow: auto;
  font-size: 13px;
  line-height: 1.5;
  pointer-events: none;
}

.code-highlight code {
  display: block;
  white-space: pre;
}

/* Input Layer */
.code-input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 12px;
  background: transparent;
  color: transparent;
  caret-color: #303133;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  tab-size: 2;
}

.code-input::selection {
  background: rgba(64, 158, 255, 0.25);
}

/* Syntax Highlight Colors */
:deep(.hl-key) {
  color: #0451a5;
}

:deep(.hl-string) {
  color: #a31515;
}

:deep(.hl-number) {
  color: #09885a;
}

:deep(.hl-boolean) {
  color: #0451a5;
}

:deep(.hl-null) {
  color: #0451a5;
}

/* Data Editor */
.data-editor {
  background: #fafbfc;
}

.data-editor .line-numbers {
  background: #f5f6f7;
}

.data-editor .code-content {
  overflow: auto;
}

.data-editor .code-highlight {
  background: #fafbfc;
  pointer-events: auto;
  overflow: auto;
}

/* Error Panel */
.error-panel {
  padding: 8px 12px;
  background: #fef0f0;
  flex-shrink: 0;
}

/* Preview Panel */
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 50%;
  overflow: hidden;
  background: #fff;
  transition: all 0.2s ease;
}

/* 全屏预览模式：占满整个视口 */
.preview-panel--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  min-width: 100vw;
  max-width: 100vw;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 8px 16px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.panel-header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

/* Preview Body */
.preview-body {
  flex: 1;
  min-height: 0;
  padding: 16px 20px;
  overflow: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
}

/* 让内部所有直接子容器占满宽度，防止溢出 */
.preview-body :deep(.a2ui-root) { width: 100%; min-height: 100px; }
.preview-body :deep(.a2-list),
.preview-body :deep(.a2-column),
.preview-body :deep(.a2-row) {
  width: 100%;
  min-width: 0;
}
.preview-body :deep(.a2-list > .a2-list-item) {
  width: 100%;
  min-width: 0;
}

.preview-body :deep(.el-form) {
  width: 100%;
}

/* Footer */
.playground-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
  padding: 4px 16px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}
</style>
