<template>
  <div class="playground-page">
    <!-- Header -->
    <div class="playground-header">
      <div class="header-left">
        <h1 class="title">A2UI Playground</h1>
        <el-tag type="info" size="small">JSON 调试工具</el-tag>
      </div>
      <div class="header-right">
        <el-select v-model="selectedExample" placeholder="选择示例" size="default" style="width: 180px; margin-right: 8px;">
          <el-option label="员工信息登记表" value="employee" />
          <el-option label="网络权限申请单" value="network" />
          <el-option label="创建工单" value="workorder" />
        </el-select>
        <el-tooltip content="执行 JSON 渲染" placement="bottom">
          <el-button type="primary" @click="handleRun">
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
          <span class="panel-title">预览</span>
          <el-tag type="success" size="small" v-if="renderSuccess">
            已渲染
          </el-tag>
        </div>
        <div class="preview-body">
          <A2UIRoot
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
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Document, CopyDocument, Refresh } from '@element-plus/icons-vue'
import { A2UIRoot } from 'a2ui-vue-engine'
import type { A2Node, FormDataResult } from 'a2ui-vue-engine'

// Mock examples
const mockExamples: Record<string, string> = {
  employee: `[
  {
    "id": "root",
    "component": "Card",
    "child": "main-column",
    "width": "md"
  },
  {
    "id": "main-column",
    "component": "Column",
    "children": [
      "header-row",
      "form-column",
      "submit-row"
    ],
    "align": "stretch"
  },
  {
    "id": "header-row",
    "component": "Row",
    "children": ["title-text"],
    "align": "center"
  },
  {
    "id": "title-text",
    "component": "Text",
    "text": "员工信息登记表",
    "variant": "h3"
  },
  {
    "id": "form-column",
    "component": "Column",
    "children": [
      "name-field",
      "gender-field",
      "education-field",
      "email-field",
      "phone-field"
    ],
    "align": "stretch"
  },
  {
    "id": "name-field",
    "component": "TextField",
    "label": "姓名",
    "placeholder": "请输入员工姓名",
    "value": { "path": "/form/name" }
  },
  {
    "id": "gender-field",
    "component": "SelectField",
    "label": "性别",
    "placeholder": "请选择性别",
    "options": [
      { "label": "男", "value": "male" },
      { "label": "女", "value": "female" }
    ],
    "value": { "path": "/form/gender" }
  },
  {
    "id": "education-field",
    "component": "SelectField",
    "label": "学历",
    "placeholder": "请选择学历",
    "options": [
      { "label": "高中", "value": "high" },
      { "label": "大专", "value": "college" },
      { "label": "本科", "value": "bachelor" },
      { "label": "硕士", "value": "master" },
      { "label": "博士", "value": "doctor" }
    ],
    "value": { "path": "/form/education" }
  },
  {
    "id": "email-field",
    "component": "TextField",
    "label": "邮箱",
    "placeholder": "请输入邮箱地址",
    "value": { "path": "/form/email" }
  },
  {
    "id": "phone-field",
    "component": "TextField",
    "label": "手机号",
    "placeholder": "请输入手机号码",
    "value": { "path": "/form/phone" }
  },
  {
    "id": "submit-row",
    "component": "Row",
    "children": ["submit-btn"],
    "justify": "end"
  },
  {
    "id": "submit-btn-text",
    "component": "Text",
    "text": "提交"
  },
  {
    "id": "submit-btn",
    "component": "Button",
    "child": "submit-btn-text",
    "type": "primary"
  }
]`,
  network: `[
  {
    "id": "root",
    "component": "Card",
    "child": "main-column",
    "width": "lg"
  },
  {
    "id": "main-column",
    "component": "Column",
    "children": [
      "header-row",
      "applicant-section",
      "permission-section",
      "reason-section",
      "date-section",
      "action-row"
    ],
    "align": "stretch",
    "gap": 20
  },
  {
    "id": "header-row",
    "component": "Row",
    "children": ["title-text"],
    "align": "center"
  },
  {
    "id": "title-text",
    "component": "Text",
    "text": "网络权限申请单",
    "variant": "h3"
  },
  {
    "id": "applicant-section",
    "component": "Column",
    "children": [
      "applicant-row1",
      "applicant-row2"
    ],
    "align": "stretch",
    "gap": 16
  },
  {
    "id": "applicant-row1",
    "component": "Row",
    "children": ["name-field", "dept-field"],
    "gap": 16,
    "align": "stretch"
  },
  {
    "id": "applicant-row2",
    "component": "Row",
    "children": ["position-field", "empno-field"],
    "gap": 16,
    "align": "stretch"
  },
  {
    "id": "name-field",
    "component": "TextField",
    "label": "申请人姓名",
    "placeholder": "请输入姓名",
    "value": { "path": "/form/applicantName" }
  },
  {
    "id": "dept-field",
    "component": "SelectField",
    "label": "所属部门",
    "placeholder": "请选择部门",
    "options": [
      { "label": "技术研发部", "value": "tech" },
      { "label": "产品设计部", "value": "design" },
      { "label": "市场营销部", "value": "marketing" },
      { "label": "人力资源部", "value": "hr" },
      { "label": "财务部", "value": "finance" },
      { "label": "行政部", "value": "admin" }
    ],
    "value": { "path": "/form/department" }
  },
  {
    "id": "position-field",
    "component": "TextField",
    "label": "职位",
    "placeholder": "请输入职位",
    "value": { "path": "/form/position" }
  },
  {
    "id": "empno-field",
    "component": "TextField",
    "label": "工号",
    "placeholder": "请输入工号",
    "value": { "path": "/form/empNo" }
  },
  {
    "id": "permission-section",
    "component": "Column",
    "children": ["permission-label", "permission-picker"],
    "align": "stretch",
    "gap": 8
  },
  {
    "id": "permission-label",
    "component": "Text",
    "text": "申请权限类型",
    "variant": "shortText"
  },
  {
    "id": "permission-picker",
    "component": "ChoicePicker",
    "label": "",
    "columns": 2,
    "choiceOptions": [
      { "label": "外网访问权限", "value": "internet", "description": "访问外部网站和资源" },
      { "label": "邮件收发权限", "value": "email", "description": "发送和接收外部邮件" },
      { "label": "文件传输权限", "value": "ftp", "description": "上传下载外部文件" },
      { "label": "VPN接入权限", "value": "vpn", "description": "远程接入公司内网" }
    ],
    "value": { "path": "/form/permissions" }
  },
  {
    "id": "reason-section",
    "component": "Column",
    "children": ["reason-field"],
    "align": "stretch"
  },
  {
    "id": "reason-field",
    "component": "TextField",
    "label": "申请理由",
    "placeholder": "请详细说明申请理由...",
    "variant": "longText",
    "rows": 3,
    "value": { "path": "/form/reason" }
  },
  {
    "id": "date-section",
    "component": "Column",
    "children": ["apply-date-field"],
    "align": "stretch"
  },
  {
    "id": "apply-date-field",
    "component": "DateTimeInput",
    "label": "申请日期",
    "placeholder": "选择日期",
    "enableDate": true,
    "enableTime": false,
    "value": { "path": "/form/applyDate" }
  },
  {
    "id": "action-row",
    "component": "Row",
    "children": ["cancel-btn", "submit-btn"],
    "justify": "end",
    "gap": 12
  },
  {
    "id": "cancel-btn-text",
    "component": "Text",
    "text": "取消"
  },
  {
    "id": "cancel-btn",
    "component": "Button",
    "child": "cancel-btn-text"
  },
  {
    "id": "submit-btn-text",
    "component": "Text",
    "text": "提交申请"
  },
  {
    "id": "submit-btn",
    "component": "Button",
    "child": "submit-btn-text",
    "type": "primary"
  }
]`,
  workorder: `[
  {
    "id": "root",
    "component": "Card",
    "child": "main-column",
    "width": "md"
  },
  {
    "id": "main-column",
    "component": "Column",
    "children": [
      "header-row",
      "workorder-title-field",
      "system-picker",
      "module-picker",
      "problem-desc-field",
      "submit-button"
    ],
    "align": "stretch",
    "gap": 16
  },
  {
    "id": "header-row",
    "component": "Row",
    "children": ["title-text"],
    "align": "center"
  },
  {
    "id": "title-text",
    "component": "Text",
    "text": "创建工单",
    "variant": "h3"
  },
  {
    "id": "workorder-title-field",
    "component": "TextField",
    "label": "工单标题",
    "placeholder": "请输入工单标题",
    "required": true,
    "value": { "path": "/form/workorderTitle" }
  },
  {
    "id": "system-picker",
    "component": "ChoicePicker",
    "label": "所属系统",
    "variant": "mutuallyExclusive",
    "displayStyle": "chips",
    "required": true,
    "options": [
      { "label": "国内GOMS", "value": "goms_cn" },
      { "label": "海外GOMS", "value": "goms_global" },
      { "label": "ERP系统", "value": "erp" },
      { "label": "WMS系统", "value": "wms" }
    ],
    "value": { "path": "/form/system" }
  },
  {
    "id": "module-picker",
    "component": "ChoicePicker",
    "label": "所属模块",
    "variant": "mutuallyExclusive",
    "displayStyle": "chips",
    "required": true,
    "options": [
      { "label": "订单管理", "value": "order_management" },
      { "label": "主数据管理", "value": "master_data_management" },
      { "label": "库存管理", "value": "inventory" },
      { "label": "采购管理", "value": "procurement" },
      { "label": "财务管理", "value": "finance" }
    ],
    "value": { "path": "/form/module" }
  },
  {
    "id": "problem-desc-field",
    "component": "TextField",
    "label": "问题描述",
    "placeholder": "请详细描述遇到的问题...",
    "variant": "longText",
    "rows": 4,
    "required": true,
    "value": { "path": "/form/problemDesc" }
  },
  {
    "id": "submit-button-text",
    "component": "Text",
    "text": "提交工单"
  },
  {
    "id": "submit-button",
    "component": "Button",
    "child": "submit-button-text",
    "type": "primary"
  }
]`
}

// Refs
const selectedExample = ref('employee')
const a2uiRootRef = ref<InstanceType<typeof A2UIRoot>>()
const textareaRef = ref<HTMLTextAreaElement>()
const highlightRef = ref<HTMLElement>()
const codeContentRef = ref<HTMLElement>()
const jsonContent = ref(mockExamples.employee)
const errorMessage = ref('')
const renderSuccess = ref(false)
const messageCount = ref(0)
const lastRunTime = ref('')
const currentFormData = ref<FormDataResult>({ form: {} })

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

const formDataJson = computed<string>(() => {
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
    if (a2uiRootRef.value) {
      a2uiRootRef.value.updateTree(null)
      a2uiRootRef.value.processMessage({
        type: 'node',
        node: node,
      })
      currentFormData.value = a2uiRootRef.value.getFormData()
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
function handleAction(payload: any) {
  console.log('A2UI Action:', payload)
  ElMessage.info(`Action: ${payload.type}`)
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
})

// Initialize on mount
onMounted(() => {
  handleRun()
})
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
  padding: 16px 20px;
  overflow: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.preview-body :deep(.el-form) {
  width: auto;
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