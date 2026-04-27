<!--
 * @Author: hui.chenn
 * @Description: A2Card component - 卡片容器，支持统一宽度标准和头部样式
 * @Date: 2026-04-15 16:35:00
 * @LastEditTime: 2026-04-27 12:00:00
 * @LastEditors: hui.chenn
-->
<template>
  <div :class="cardClass" :style="cardStyle">
    <!-- 自定义头部区域 -->
    <div v-if="header" :class="headerClass" :style="headerStyleObj">
      <component v-if="headerIcon" :is="resolvedIcon" class="card-header-icon" />
      <span class="card-header-text">{{ header }}</span>
    </div>

    <!-- 卡片主体 -->
    <div class="card-body">
      <slot>
        <template v-if="hasChildren">
          <component
            v-for="(child, index) in childrenArray"
            :key="index"
            :is="renderChild(child)"
          />
        </template>
      </slot>
    </div>

    <!-- 卡片底部 -->
    <div v-if="hasFooter" class="card-footer">
      <template v-if="footerSlot && footerSlot.length > 0">
        <component
          v-for="(child, index) in footerSlot"
          :key="index"
          :is="renderFooterChild(child)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, resolveComponent } from 'vue'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'

interface A2CardProps {
  header?: string
  headerIcon?: string
  headerBgColor?: string
  shadow?: 'always' | 'hover' | 'never'
  children?: A2Node[] | string
  slots?: Record<string, A2Node[]>
  context?: RenderContext
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const props = withDefaults(defineProps<A2CardProps>(), {
  header: '',
  headerIcon: '',
  headerBgColor: '#F8F8FB',
  shadow: 'hover',
  children: () => [],
  slots: () => ({}),
  width: 'md',
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

const footerSlot = computed(() => props.slots?.footer || [])

const hasFooter = computed(() => {
  return footerSlot.value && footerSlot.value.length > 0
})

const cardClass = computed(() => {
  return ['a2-card', `a2-card--${props.width}`, `a2-card--shadow-${props.shadow}`].join(' ')
})

const cardStyle = computed(() => {
  const widthMap = {
    xs: '300px',
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

const headerClass = computed(() => {
  return ['card-header', props.headerIcon ? 'card-header--with-icon' : ''].join(' ')
})

const headerStyleObj = computed(() => ({
  backgroundColor: props.headerBgColor,
}))

const resolvedIcon = computed(() => {
  if (!props.headerIcon) return undefined

  try {
    const icon = resolveComponent(`Icon${props.headerIcon}`)
    if (icon && typeof icon !== 'string') return icon
  } catch {
    // Ignore
  }

  try {
    const icon = resolveComponent(props.headerIcon)
    if (icon && typeof icon !== 'string') return icon
  } catch {
    // Ignore
  }

  return undefined
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

function renderFooterChild(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2CardFooterChild',
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
  background: #FFFFFF;
  border: 1px solid #E4E7ED;
  border-radius: 8px;
  overflow: hidden;
}

.a2-card--shadow-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.a2-card--shadow-always {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}

.card-header-icon {
  width: 18px;
  height: 18px;
  color: #606266;
}

.card-header-text {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

/* 卡片主体 */
.card-body {
  padding: 16px;
}

/* 卡片底部 */
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #E4E7ED;
  background: #FFFFFF;
}

/* Card 统一宽度标准 */
.a2-card--xs { width: 300px; }
.a2-card--sm { width: 400px; }
.a2-card--md { width: 560px; }
.a2-card--lg { width: 720px; }
.a2-card--xl { width: 960px; }
.a2-card--full { width: 100%; }
</style>