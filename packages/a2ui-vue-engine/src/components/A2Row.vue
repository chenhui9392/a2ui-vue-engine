<!--
 * @Author: hui.chenn
 * @Description: A2Row component - Flex row layout with unified styling
 * @Date: 2026-04-15 16:36:00
 * @LastEditTime: 2026-04-16 17:30:00
 * @LastEditors: hui.chenn
-->
<template>
  <el-row
    :gutter="gutter"
    :justify="justify"
    :align="elAlign"
    :tag="tag"
    :class="rowClass"
    :style="rowStyle"
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
  </el-row>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import { ElRow } from 'element-plus'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'

interface A2RowProps {
  gutter?: number | [number, number]
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
  align?: 'top' | 'middle' | 'bottom' | 'center' | 'stretch'
  tag?: string
  children?: A2Node[] | string
  context?: RenderContext
}

const props = withDefaults(defineProps<A2RowProps>(), {
  gutter: 0,
  justify: 'start',
  align: 'middle', // Default to middle for better alignment
  tag: 'div',
  children: () => [],
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'action', payload: any): void
}>()

// Map align to Element Plus format
const elAlign = computed(() => {
  const alignMap: Record<string, 'top' | 'middle' | 'bottom'> = {
    'top': 'top',
    'middle': 'middle',
    'bottom': 'bottom',
    'center': 'middle',
    'stretch': 'middle',
  }
  return alignMap[props.align] || 'middle'
})

const hasChildren = computed(() => {
  return props.children && (Array.isArray(props.children) ? props.children.length > 0 : true)
})

const childrenArray = computed(() => {
  if (!props.children) return []
  return Array.isArray(props.children) ? props.children : []
})

const rowClass = computed(() => {
  return 'a2-row'
})

const rowStyle = computed(() => {
  const style: Record<string, string> = {}
  // Unified standard: 10px gap between buttons in action rows
  style.gap = '10px'
  return style
})

function renderChild(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2RowChild',
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
  name: 'A2Row',
}
</script>

<style scoped>
.a2-row {
  width: 100%;
  gap: var(--a2-gap-inline);
}

/* 确保使用 CSS 变量 */
:deep(.el-row) {
  gap: 10px;
}
</style>