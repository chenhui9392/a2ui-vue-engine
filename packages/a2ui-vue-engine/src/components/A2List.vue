<!--
 * @Author: hui.chenn
 * @Description: A2List component
 * @Date: 2026-04-15 16:38:00
 * @LastEditTime: 2026-04-15 16:37:45
 * @LastEditors: hui.chenn
-->
<template>
  <div class="a2-list" @click="handleClick">
    <template v-if="hasChildren">
      <div
        v-for="(child, index) in childrenArray"
        :key="child.id || index"
        class="a2-list-item"
      >
        <component :is="renderChild(child)" />
      </div>
    </template>
    <template v-else-if="items && items.length > 0">
      <div
        v-for="(item, index) in items"
        :key="item.id || index"
        class="a2-list-item"
        @click="handleItemClick(item, index)"
      >
        <slot name="item" :item="item" :index="index">
          <span>{{ (item as ListItem).label || item }}</span>
        </slot>
      </div>
    </template>
    <template v-else>
      <div class="a2-list-empty">
        <slot name="empty">暂无数据</slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'

interface ListItem {
  id?: string | number
  label?: string
  [key: string]: any
}

interface A2ListProps {
  items?: ListItem[] | string[]
  children?: A2Node[] | string
  context?: RenderContext
  bordered?: boolean
  split?: boolean
}

const props = withDefaults(defineProps<A2ListProps>(), {
  items: () => [],
  children: () => [],
  bordered: false,
  split: true,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'itemClick', item: ListItem, index: number): void
  (e: 'action', payload: any): void
}>()

const hasChildren = computed(() => {
  return props.children && (Array.isArray(props.children) ? props.children.length > 0 : true)
})

const childrenArray = computed(() => {
  if (!props.children) return []
  return Array.isArray(props.children) ? props.children : []
})

function renderChild(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2ListChild',
    setup() {
      return () => renderNode(node, props.context!)
    },
  })
}

function handleClick(event: MouseEvent) {
  emit('click', event)
  emit('action', { type: 'click', event })
}

function handleItemClick(item: ListItem | string, index: number) {
  emit('itemClick', item as ListItem, index)
  emit('action', { type: 'itemClick', item, index })
}
</script>

<script lang="ts">
export default {
  name: 'A2List',
}
</script>

<style scoped>
.a2-list {
  width: 100%;
  border-radius: var(--a2-radius-md);
}

.a2-list-item {
  padding: var(--a2-spacing-md) 0;
  border-bottom: 1px solid var(--a2-border-lighter);
}

.a2-list-item:last-child {
  border-bottom: none;
}

.a2-list-empty {
  padding: var(--a2-spacing-xl);
  text-align: center;
  color: var(--a2-text-secondary);
}
</style>