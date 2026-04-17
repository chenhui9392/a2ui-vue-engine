/**
 * @Author: hui.chenn
 * @Description: A2UI Playground - JSON Debug Tool
 * @Date: 2026-04-15 16:48:00
 * @LastEditTime: 2026-04-16 15:00:00
 * @LastEditors: hui.chenn
 */
<template>
  <div class="playground-container">
    <!-- Header -->
    <div class="playground-header">
      <div class="header-left">
        <h1 class="title">A2UI Playground</h1>
        <el-tag type="info" size="small">JSON Debug Tool</el-tag>
      </div>
      <div class="header-right">
        <el-tooltip content="执行 JSON 渲染" placement="bottom">
          <el-button type="primary" @click="handleRun">
            <el-icon><VideoPlay /></el-icon>
            Run
          </el-button>
        </el-tooltip>
        <el-tooltip content="格式化 JSON 数据" placement="bottom">
          <el-button @click="handleFormat">
            <el-icon><Document /></el-icon>
            Format
          </el-button>
        </el-tooltip>
        <el-tooltip content="复制 JSON 到剪贴板" placement="bottom">
          <el-button @click="handleCopy">
            <el-icon><CopyDocument /></el-icon>
            Copy
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Main Content -->
    <div class="playground-main">
      <!-- Left Panel: 分上下两部分 -->
      <div class="left-panel">
        <!-- 上半部分: JSON Editor (70%空间) -->
        <div class="editor-section">
          <div class="section-header">
            <span class="section-title">JSON Schema</span>
            <el-tag type="warning" size="small" v-if="jsonLines">Lines: {{ jsonLines }}</el-tag>
          </div>
          <div class="editor-body">
            <!-- 代码编辑器容器 -->
            <div class="code-editor">
              <!-- 行号 -->
              <div class="line-numbers">
                <span v-for="n in lineCount" :key="n" class="line-number">{{ n }}</span>
              </div>
              <!-- 代码内容 -->
              <div class="code-content" ref="codeContentRef">
                <pre class="code-highlight" ref="highlightRef"><code v-html="highlightedJson"></code></pre>
                <textarea
                  ref="textareaRef"
                  v-model="jsonContent"
                  class="code-input"
                  placeholder="Enter JSON here..."
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

        <!-- 下半部分: Form Data (30%空间) -->
        <div class="data-section">
          <div class="section-header">
            <span class="section-title">Form Data</span>
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
      <div class="preview-panel">
        <div class="panel-header">
          <span class="panel-title">Preview</span>
          <el-tag type="success" size="small" v-if="renderSuccess">
            Rendered
          </el-tag>
        </div>
        <div class="preview-body">
          <el-form label-width="100px">
            <A2UIRoot
              ref="a2uiRootRef"
              :component-map="componentMap"
              @message="handleAction"
              @formData-change="handleFormDataChange"
            />
          </el-form>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="playground-footer">
      <div class="footer-left">
        <span>Messages: {{ messageCount }}</span>
        <span v-if="lastRunTime">Last run: {{ lastRunTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Document, CopyDocument } from '@element-plus/icons-vue'
import { A2UIRoot, defaultComponentMap } from 'a2ui-vue-engine'
import type { A2Node, ComponentMapper, FormDataResult } from 'a2ui-vue-engine'
import { defaultJson } from './mock'

// Refs
const a2uiRootRef = ref<InstanceType<typeof A2UIRoot>>()
const textareaRef = ref<HTMLTextAreaElement>()
const highlightRef = ref<HTMLElement>()
const codeContentRef = ref<HTMLElement>()
const jsonContent = ref('')
const errorMessage = ref('')
const renderSuccess = ref(false)
const messageCount = ref(0)
const lastRunTime = ref('')
const componentMap: ComponentMapper = { ...defaultComponentMap }
const currentFormData = ref<FormDataResult>({ form: {} })

// 行数计算
const lineCount = computed(() => {
  if (!jsonContent.value) return 1
  return jsonContent.value.split('\n').length
})

const jsonLines = computed(() => lineCount.value)

// Form Data 行数
const dataLineCount = computed(() => {
  if (!formDataJson.value) return 1
  return formDataJson.value.split('\n').length
})

// JSON 语法高亮 - 完整版
function highlightJson(jsonStr: string): string {
  if (!jsonStr) return ''

  // 转义HTML
  let escaped = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 按行处理，更精确的高亮
  const lines = escaped.split('\n')
  const highlightedLines = lines.map(line => {
    // 处理键名: "key":
    line = line.replace(/"([^"]+)"(\s*:)/g, '<span class="hl-key">"$1"</span>$2')

    // 处理字符串值: : "value"
    line = line.replace(/:\s*"([^"]*)"/g, ': <span class="hl-string">"$1"</span>')

    // 处理数字
    line = line.replace(/:\s*(-?\d+\.?\d*)(\s*[,\]\}])/g, ': <span class="hl-number">$1</span>$2')

    // 处理布尔值
    line = line.replace(/:\s*(true|false)(\s*[,\]\}])/g, ': <span class="hl-boolean">$1</span>$2')

    // 处理 null
    line = line.replace(/:\s*(null)(\s*[,\]\}])/g, ': <span class="hl-null">$1</span>$2')

    return line
  })

  return highlightedLines.join('\n')
}

// 高亮 JSON Schema
const highlightedJson = computed(() => highlightJson(jsonContent.value))

// Form Data JSON - from A2UIRoot
const formDataJson = computed<string>(() => {
  return JSON.stringify(currentFormData.value, null, 2)
})

// 高亮 Form Data
const highlightedFormData = computed(() => highlightJson(formDataJson.value))

// 滚动同步
function handleScroll() {
  if (textareaRef.value && highlightRef.value && codeContentRef.value) {
    const scrollTop = textareaRef.value.scrollTop
    const scrollLeft = textareaRef.value.scrollLeft

    // 同步高亮层滚动
    highlightRef.value.scrollTop = scrollTop
    highlightRef.value.scrollLeft = scrollLeft

    // 同步行号滚动 - 让行号也跟随滚动
    const lineNumbersEl = codeContentRef.value.parentElement?.querySelector('.line-numbers')
    if (lineNumbersEl) {
      lineNumbersEl.scrollTop = scrollTop
    }
  }
}

// 键盘处理（Tab键插入2空格）
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = textareaRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // 插入2个空格代替Tab
    const value = textarea.value
    textarea.value = value.substring(0, start) + '  ' + value.substring(end)

    // 更新光标位置
    textarea.selectionStart = textarea.selectionEnd = start + 2

    // 手动触发v-model更新
    jsonContent.value = textarea.value
  }
}

// Initialize with default content
onMounted(() => {
  jsonContent.value = defaultJson
})

// Parse and validate JSON
function parseJsonContent(): A2Node | null {
  const content = jsonContent.value.trim()
  if (!content) {
    errorMessage.value = 'JSON content is empty'
    return null
  }

  try {
    const node = JSON.parse(content)
    errorMessage.value = ''
    return node
  } catch (e) {
    errorMessage.value = `JSON parse error: ${e}`
    return null
  }
}

// Run rendering
function handleRun() {
  const node = parseJsonContent()
  if (!node) return

  try {
    if (a2uiRootRef.value) {
      a2uiRootRef.value.updateTree(null)
      a2uiRootRef.value.processMessage({
        type: 'node',
        node: node,
      })
      // Get formData from A2UIRoot after processing
      currentFormData.value = a2uiRootRef.value.getFormData()
    }

    messageCount.value = 1
    lastRunTime.value = new Date().toLocaleTimeString()
    renderSuccess.value = true
    errorMessage.value = ''
    ElMessage.success('Rendered successfully!')
  } catch (e) {
    errorMessage.value = `Render error: ${e}`
    renderSuccess.value = false
    ElMessage.error(errorMessage.value)
  }
}

// Format JSON
function handleFormat() {
  try {
    const parsed = JSON.parse(jsonContent.value)
    jsonContent.value = JSON.stringify(parsed, null, 2)
    ElMessage.success('JSON formatted!')
  } catch (e) {
    ElMessage.error('Invalid JSON')
  }
}

// Copy JSON
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(jsonContent.value)
    ElMessage.success('Copied to clipboard!')
  } catch (e) {
    ElMessage.error('Copy failed!')
  }
}

// Handle action events from A2UI
function handleAction(payload: any) {
  console.log('A2UI Action:', payload)
  ElMessage.info(`Action: ${payload.type}`)
}

// Handle form data change from A2UIRoot
function handleFormDataChange(formData: FormDataResult) {
  currentFormData.value = formData
}

onUnmounted(() => {
  if (a2uiRootRef.value) {
    a2uiRootRef.value.updateTree(null)
  }
})
</script>

<style scoped>
/* 整体布局 - 无滚动条 */
.playground-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f8f9fa;
}

/* Header */
.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 12px 20px;
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
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* Code Editor Container - 白色背景 */
.code-editor {
  display: flex;
  height: 100%;
  background: #fff;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

/* 行号区域 */
.line-numbers {
  width: 50px;
  padding: 8px 0;
  background: #fafafa;
  color: #909399;
  text-align: right;
  user-select: none;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
}

.line-numbers::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.line-number {
  display: block;
  padding-right: 12px;
  height: 21px;
  line-height: 21px;
  font-size: 13px;
}

/* 代码内容区域 */
.code-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 高亮显示层 */
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
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
}

.code-highlight code {
  display: block;
  white-space: pre;
}

/* 输入层 - 透明叠加 */
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
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  tab-size: 2;
}

.code-input::selection {
  background: rgba(64, 158, 255, 0.25);
}

/* 语法高亮颜色 - 使用 :deep() 穿透 scoped */
:deep(.hl-key) {
  color: #0451a5; /* 键名 - 深蓝色 */
}

:deep(.hl-string) {
  color: #a31515; /* 字符串 - 深红色 */
}

:deep(.hl-number) {
  color: #09885a; /* 数字 - 绿色 */
}

:deep(.hl-boolean) {
  color: #0451a5; /* 布尔值 - 深蓝色 */
}

:deep(.hl-null) {
  color: #0451a5; /* null - 深蓝色 */
}

/* Data Editor - readonly */
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
  pointer-events: auto; /* 允许滚动 */
  overflow: auto;
}

/* Error Panel */
.error-panel {
  padding: 8px 16px;
  background: #fef0f0;
  flex-shrink: 0;
}

/* Preview Panel */
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: #fff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 36px;
  padding: 8px 16px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
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
  padding: 20px 24px;
  overflow: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

/* Preview 内容容器 */
.preview-body .el-form {
  width: auto;
}

/* Footer */
.playground-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
  padding: 4px 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #909399;
}
</style>

<style>
/* 全局样式 - 禁用页面滚动条 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
  overflow: hidden;
}
</style>