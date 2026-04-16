<template>
  <div class="a2ui-root" ref="rootRef">
    <template v-if="error">
      <div class="a2ui-error">
        <p>Render Error: {{ error.message }}</p>
        <button @click="resetError">Retry</button>
      </div>
    </template>
    <template v-else-if="tree">
      <component :is="renderContent" />
    </template>
    <template v-else>
      <div class="a2ui-loading" v-if="loading">
        <slot name="loading">Loading...</slot>
      </div>
      <div class="a2ui-empty" v-else>
        <slot name="empty">No content</slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, defineComponent, provide, shallowRef } from 'vue'
import type { A2Node, A2Message, A2UIRootProps, RenderContext, ComponentMapper } from '../types'
import { MessageProcessor, createMessageProcessor, convertFlatToTree } from '../core'
import type { FlatA2Node } from '../types'
import { renderTree, createRenderContext } from '../renderer'
import { createComponentMap } from '../components'

const props = withDefaults(defineProps<A2UIRootProps>(), {
  initialData: () => ({}),
  componentMap: () => ({}),
})

const emit = defineEmits<{
  (e: 'message', message: A2Message): void
  (e: 'error', error: Error): void
  (e: 'ready'): void
  (e: 'complete'): void
}>()

// State
const rootRef = ref<HTMLElement | null>(null)
const tree = shallowRef<A2Node | null>(props.initialTree || null)
const data = ref<Record<string, any>>({ ...props.initialData })
const error = ref<Error | null>(null)
const loading = ref(false)
const processor = shallowRef<MessageProcessor | null>(null)

// Component map
const mergedComponentMap = computed<ComponentMapper>(() => {
  return createComponentMap(props.componentMap)
})

// Render context
const renderContext = computed<RenderContext>(() => {
  return createRenderContext(data.value, mergedComponentMap.value, {
    onEvent: handleEvent,
  })
})

// Render content as functional component
const renderContent = computed(() => {
  if (!tree.value) return null

  return defineComponent({
    name: 'A2UIContent',
    setup() {
      return () => renderTree(tree.value!, renderContext.value)
    },
  })
})

// Handle events from components
function handleEvent(event: string, payload: any, context: any): void {
  console.log('A2UI Event:', event, payload, context)
  // Emit to parent
  emit('message', {
    type: 'action',
    id: `event-${Date.now()}`,
    action: event,
    payload,
  } as A2Message)
}

// Initialize message processor
function initProcessor(): void {
  processor.value = createMessageProcessor({
    onNode: (message) => {
      if (message.type === 'node') {
        // Check if it's a flat format (array of nodes with id/component fields)
        const nodeData = message.node
        if (Array.isArray(nodeData) && nodeData.length > 0 && nodeData[0].id && nodeData[0].component) {
          // Convert flat format to tree format
          const convertedTree = convertFlatToTree(nodeData as FlatA2Node[])
          if (convertedTree) {
            tree.value = convertedTree
          } else {
            error.value = new Error('Failed to convert flat format to tree')
          }
        } else {
          // Regular tree format
          tree.value = message.node
        }
      } else if (message.type === 'node_update') {
        tree.value = message.node
      } else if (message.type === 'node_append' && message.parentId) {
        // Handle node append
      } else if (message.type === 'node_remove') {
        // Handle node remove
      }
    },
    onData: (message) => {
      data.value = { ...data.value }
    },
    onError: (message) => {
      error.value = new Error(`${message.code}: ${message.message}`)
      emit('error', error.value)
    },
    onComplete: () => {
      loading.value = false
      emit('complete')
    },
  })
}

// Process JSONL stream
async function processStream(url: string): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    await processor.value?.processStream(response)
  } catch (e) {
    error.value = e as Error
    emit('error', error.value)
  } finally {
    loading.value = false
  }
}

// Reset error state
function resetError(): void {
  error.value = null
  if (props.streamUrl) {
    processStream(props.streamUrl)
  }
}

// Update data
function updateData(newData: Record<string, any>): void {
  data.value = { ...data.value, ...newData }
}

// Update tree
function updateTree(newTree: A2Node): void {
  tree.value = newTree
}

// Get current data
function getData(): Record<string, any> {
  return { ...data.value }
}

// Get current tree
function getTree(): A2Node | null {
  return tree.value
}

// Process message
function processMessage(message: A2Message): void {
  // 必须添加 \n，否则 processChunk 会把消息当作不完整的行留在 buffer 中
  processor.value?.processChunk(JSON.stringify(message) + '\n')
}

// Provide context to children
provide('a2uiData', data)
provide('a2uiTree', tree)
provide('a2uiUpdateData', updateData)
provide('a2uiUpdateTree', updateTree)

// Expose methods
defineExpose({
  updateData,
  updateTree,
  getData,
  getTree,
  processMessage,
  processStream,
})

// Lifecycle
onMounted(() => {
  initProcessor()
  emit('ready')

  if (props.streamUrl) {
    processStream(props.streamUrl)
  }
})

onUnmounted(() => {
  processor.value?.reset()
})

// Watch for prop changes
watch(() => props.initialData, (newData) => {
  data.value = { ...data.value, ...newData }
}, { deep: true })

watch(() => props.initialTree, (newTree) => {
  if (newTree) {
    tree.value = newTree
  }
})
</script>

<style scoped>
.a2ui-root {
  width: 100%;
  height: 100%;
}

.a2ui-loading,
.a2ui-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  color: #666;
}

.a2ui-error {
  padding: 16px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #cf1322;
}

.a2ui-error button {
  margin-top: 8px;
  padding: 4px 12px;
  background-color: #cf1322;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.a2ui-error button:hover {
  background-color: #a8071a;
}
</style>
