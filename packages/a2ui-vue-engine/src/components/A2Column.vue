<!--
 * @Author: hui.chenn
 * @Description: A2Column component - Flex column layout with unified styling
 * @Date: 2026-04-15 16:37:00
 * @LastEditTime: 2026-04-16 17:30:00
 * @LastEditors: hui.chenn
-->
<template>
  <el-col
    :span="span"
    :offset="offset"
    :push="push"
    :pull="pull"
    :xs="xs"
    :sm="sm"
    :md="md"
    :lg="lg"
    :xl="xl"
    :tag="tag"
    :class="colClass"
    :style="colStyle"
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
  </el-col>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import { ElCol } from 'element-plus'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'

interface ResponsiveConfig {
  span?: number
  offset?: number
  push?: number
  pull?: number
}

interface A2ColumnProps {
  span?: number
  offset?: number
  push?: number
  pull?: number
  xs?: number | ResponsiveConfig
  sm?: number | ResponsiveConfig
  md?: number | ResponsiveConfig
  lg?: number | ResponsiveConfig
  xl?: number | ResponsiveConfig
  tag?: string
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  children?: A2Node[] | string
  context?: RenderContext
  // Position context for special styling
  isFirst?: boolean
  isLast?: boolean
}

const props = withDefaults(defineProps<A2ColumnProps>(), {
  span: 24,
  offset: 0,
  push: 0,
  pull: 0,
  tag: 'div',
  align: 'stretch',
  children: () => [],
  isFirst: false,
  isLast: false,
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

const colClass = computed(() => {
  const classes: string[] = ['a2-column']

  if (props.align) {
    classes.push(`a2-column--align-${props.align}`)
  }

  return classes.join(' ')
})

const colStyle = computed(() => {
  const style: Record<string, string> = {}

  // Alignment
  if (props.align === 'stretch') {
    style.alignItems = 'stretch'
  } else if (props.align === 'center') {
    style.alignItems = 'center'
  } else if (props.align === 'end') {
    style.alignItems = 'flex-end'
  } else if (props.align === 'start') {
    style.alignItems = 'flex-start'
  }

  // Unified standard: 10px gap between all children
  style.gap = '10px'

  return style
})

function renderChild(node: A2Node) {
  if (!props.context) return null

  // Pass position context to child
  const childArray = childrenArray.value
  const childIndex = childArray.findIndex(c => c.id === node.id)
  const childContext = {
    ...props.context,
    isFirst: childIndex === 0,
    isLast: childIndex === childArray.length - 1,
  }

  return defineComponent({
    name: 'A2ColumnChild',
    setup() {
      return () => renderNode(node, childContext)
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
  name: 'A2Column',
}
</script>

<style scoped>
.a2-column {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--a2-gap-block);
}

.a2-column--align-stretch {
  align-items: stretch;
}

.a2-column--align-center {
  align-items: center;
}

.a2-column--align-start {
  align-items: flex-start;
}

.a2-column--align-end {
  align-items: flex-end;
}

.a2-column--align-baseline {
  align-items: baseline;
}
</style>