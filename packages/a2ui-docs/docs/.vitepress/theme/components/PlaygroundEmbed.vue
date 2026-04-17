<template>
  <div class="playground-embed">
    <div class="embed-header">
      <span class="embed-title">{{ title }}</span>
      <div class="embed-actions">
        <el-button size="small" type="primary" @click="handleRun">
          <el-icon><VideoPlay /></el-icon>
          Run
        </el-button>
        <el-button size="small" @click="handleReset">
          <el-icon><Refresh /></el-icon>
          Reset
        </el-button>
      </div>
    </div>

    <div class="embed-main">
      <!-- Left: Code Editor -->
      <div class="embed-editor">
        <textarea
          v-model="editorContent"
          class="json-editor"
          spellcheck="false"
          placeholder="Enter JSON schema..."
        ></textarea>
        <div class="error-message" v-if="error">
          <el-alert :title="error" type="error" :closable="false" show-icon />
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="embed-preview">
        <div class="preview-container">
          <el-form label-width="100px" label-position="left">
            <A2UIRoot
              ref="a2uiRootRef"
              @message="handleMessage"
              @formData-change="handleFormDataChange"
            />
          </el-form>
        </div>
        <div class="form-data-panel" v-if="formDataJson">
          <div class="panel-header">Form Data</div>
          <pre class="form-data-content">{{ formDataJson }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { VideoPlay, Refresh } from '@element-plus/icons-vue'
import { A2UIRoot } from 'a2ui-vue-engine'
import type { A2Node, FormDataResult } from 'a2ui-vue-engine'

interface Props {
  jsonExample?: string | object
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  jsonExample: '',
  title: 'Example'
})

// Convert prop to JSON string (handles both string and object)
function normalizeJson(input: string | object): string {
  if (typeof input === 'string') {
    return input
  }
  if (typeof input === 'object' && input !== null) {
    return JSON.stringify(input, null, 2)
  }
  return ''
}

// State
const a2uiRootRef = ref<InstanceType<typeof A2UIRoot>>()
const editorContent = ref(normalizeJson(props.jsonExample))
const originalContent = ref(normalizeJson(props.jsonExample))
const error = ref('')
const formData = ref<FormDataResult>({ form: {} })

// Form Data JSON display
const formDataJson = computed(() => {
  if (!formData.value.form || Object.keys(formData.value.form).length === 0) {
    return ''
  }
  return JSON.stringify(formData.value, null, 2)
})

// Handle run
function handleRun() {
  error.value = ''

  try {
    let node: A2Node

    // If editor content is already a valid object, use it directly
    if (typeof editorContent.value === 'object') {
      node = editorContent.value as A2Node
    } else {
      node = JSON.parse(editorContent.value) as A2Node
    }

    if (a2uiRootRef.value) {
      a2uiRootRef.value.updateTree(null)
      a2uiRootRef.value.processMessage({
        type: 'node',
        node: node
      })
    }
  } catch (e) {
    error.value = `Invalid JSON: ${e}`
  }
}

// Handle reset
function handleReset() {
  editorContent.value = originalContent.value
  error.value = ''
  handleRun()
}

// Handle message from A2UIRoot
function handleMessage(msg: any) {
  console.log('A2UI Message:', msg)
}

// Handle form data change
function handleFormDataChange(data: FormDataResult) {
  formData.value = data
}

// Watch external JSON changes
watch(() => props.jsonExample, (newJson) => {
  const normalized = normalizeJson(newJson)
  if (normalized && normalized !== originalContent.value) {
    editorContent.value = normalized
    originalContent.value = normalized
    handleRun()
  }
})

// Initial run on mount
onMounted(() => {
  if (props.jsonExample) {
    handleRun()
  }
})
</script>

<style scoped>
.playground-embed {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  margin: 16px 0;
}

.embed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.embed-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.embed-actions {
  display: flex;
  gap: 8px;
}

.embed-main {
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

@media (min-width: 768px) {
  .embed-main {
    flex-direction: row;
  }
}

.embed-editor {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  border-right: none;
  border-bottom: 1px solid #e4e7ed;
  min-height: 200px;
}

@media (min-width: 768px) {
  .embed-editor {
    border-right: 1px solid #e4e7ed;
    border-bottom: none;
    max-width: 400px;
  }
}

.json-editor {
  flex: 1;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  border: none;
  resize: none;
  outline: none;
  background: #fafbfc;
  color: #303133;
  min-height: 150px;
}

.json-editor:focus {
  background: #fff;
}

.error-message {
  padding: 8px 12px;
  background: #fef0f0;
}

.embed-preview {
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: hidden;
}

@media (min-width: 768px) {
  .embed-preview {
    min-width: 300px;
  }
}

.preview-container {
  flex: 1;
  padding: 16px 20px;
  overflow: auto;
}

.preview-container :deep(.el-form) {
  width: 100%;
}

.preview-container :deep(.el-form-item) {
  margin-bottom: 18px;
}

.form-data-panel {
  border-top: 1px solid #e4e7ed;
  max-height: 150px;
  overflow: hidden;
}

.panel-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  background: #f5f7fa;
}

.form-data-content {
  padding: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  background: #fafbfc;
  overflow-x: auto;
  max-height: 100px;
}
</style>