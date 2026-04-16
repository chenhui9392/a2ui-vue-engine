<!--
 * @Author: hui.chenn
 * @Description: A2Card component - 卡片容器，支持统一宽度标准
 * @Date: 2026-04-15 16:35:00
 * @LastEditTime: 2026-04-16 17:30:00
 * @LastEditors: hui.chenn
-->
<template>
  <el-card
    :header="header"
    :shadow="shadow"
    :body-style="bodyStyle"
    :class="cardClass"
    :style="cardStyle"
    @click="handleClick"
  >
    <slot>
      <template v-if="hasChildren">
        <component
          v-for="(child, index) in childrenArray"
          :key="index"
          :is="renderChild(child)"
        />
      </template>
    </slot>
  </el-card>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import { ElCard } from 'element-plus'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'

interface A2CardProps {
  header?: string
  shadow?: 'always' | 'hover' | 'never'
  bodyStyle?: Record<string, string>
  children?: A2Node[] | string
  slots?: Record<string, A2Node[]>
  context?: RenderContext
  // Card 统一宽度标准：sm=400px, md=560px, lg=720px, xl=960px, full=100%
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const props = withDefaults(defineProps<A2CardProps>(), {
  header: '',
  shadow: 'hover',
  bodyStyle: () => ({ padding: '20px' }),
  children: () => [],
  slots: () => ({}),
  width: 'md', // 默认 560px 宽度
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'action', payload: any): void
}>()

const hasChildren = computed(() => {
  return props.children && (Array.isArray(props.children) ? props.children.length > 0 : true)
})

const childrenArray = computed(() => {
  if (!props.children) return []
  return Array.isArray(props.children) ? props.children : []
})

const headerSlot = computed(() => props.slots?.header || [])
const footerSlot = computed(() => props.slots?.footer || [])

const headerSlotChildren = computed(() => headerSlot.value || [])
const footerSlotChildren = computed(() => footerSlot.value || [])

const cardClass = computed(() => {
  return ['a2-card', `a2-card--${props.width}`].join(' ')
})

const cardStyle = computed(() => {
  const widthMap = {
    sm: '400px',
    md: '560px',
    lg: '720px',
    xl: '960px',
    full: '100%',
  }
  return {
    width: widthMap[props.width],
  }
})

function renderChild(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2CardChild',
    setup() {
      return () => renderNode(node, props.context!)
    },
  })
}

function handleClick(event: MouseEvent) {
  emit('click', event)
  emit('action', { type: 'click', event })
}
</script>

<script lang="ts">
export default {
  name: 'A2Card',
}
</script>

<style scoped>
.a2-card {
  border-radius: var(--a2-radius-lg);
  box-shadow: var(--a2-shadow-card);
}

/* Card 统一宽度标准 */
.a2-card--sm {
  width: 400px;
}

.a2-card--md {
  width: 560px;
}

.a2-card--lg {
  width: 720px;
}

.a2-card--xl {
  width: 960px;
}

.a2-card--full {
  width: 100%;
}

.a2-card :deep(.el-card__body) {
  padding: var(--a2-spacing-xl);
}
</style>
