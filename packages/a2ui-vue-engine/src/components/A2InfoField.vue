<!--
 * @Author: hui.chenn
 * @Description: A2InfoField - 信息展示字段，支持图标+标签+值
 * @Date: 2026-04-27 12:00:00
-->
<template>
  <div class="a2-info-field" :style="fieldStyle">
    <!-- 标签行：图标 + 名称 -->
    <div class="info-field-label-row">
      <!-- 图片图标 -->
      <img
        v-if="isImageIcon"
        :src="icon"
        class="info-field-icon info-field-icon--img"
        alt="icon"
      />
      <!-- Element Plus 图标 -->
      <component v-else-if="resolvedIcon" :is="resolvedIcon" class="info-field-icon" />
      <span :class="['info-field-label', props.size === 'large' ? 'info-field-label--large' : '']">{{ label }}</span>
    </div>
    <!-- 值行 -->
    <div v-if="displayValue" :class="valueClass" :style="valueStyle">
      {{ displayValue }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

interface A2InfoFieldProps {
  icon?: string
  label?: string
  modelValue?: string
  variant?: 'tag' | 'text' | 'quote'
  size?: 'large' | 'default'
  bgColor?: string
}

const props = withDefaults(defineProps<A2InfoFieldProps>(), {
  icon: '',
  label: '',
  modelValue: '',
  variant: 'text',
  size: 'default',
  bgColor: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'click', event: MouseEvent): void
  (e: 'action', payload: any): void
}>()

// 判断 icon 是否为图片 URL
const isImageIcon = computed(() => {
  if (!props.icon) return false
  return props.icon.startsWith('http://') || props.icon.startsWith('https://') || props.icon.startsWith('data:')
})

// Resolve icon component（仅对非图片 icon）
const resolvedIcon = computed(() => {
  if (!props.icon || isImageIcon.value) return undefined

  try {
    const icon = resolveComponent(`Icon${props.icon}`)
    if (icon && typeof icon !== 'string') return icon
  } catch {
    // Ignore
  }

  try {
    const icon = resolveComponent(props.icon)
    if (icon && typeof icon !== 'string') return icon
  } catch {
    // Ignore
  }

  return undefined
})

// 显示的值（优先使用 modelValue）
const displayValue = computed(() => {
  return props.modelValue || ''
})

// 整行背景色
const fieldStyle = computed(() => {
  if (props.bgColor) {
    return {
      backgroundColor: props.bgColor,
      margin: '-16px -16px 0 -16px',
      padding: '12px 16px',
      width: 'calc(100% + 32px)',
    }
  }
  return {}
})

const valueClass = computed(() => {
  return [
    'info-field-value',
    props.variant === 'tag' ? 'info-field-value--tag' : '',
    props.variant === 'quote' ? 'info-field-value--quote' : '',
  ]
})

const valueStyle = computed(() => {
  if (props.variant === 'tag') {
    return {
      background: '#EFF4FF',
      borderRadius: '12px',
      border: '1px solid #CED9F3',
    }
  }
  if (props.variant === 'quote') {
    return {
      background: '#F5F7FA',
      borderRadius: '8px',
      padding: '12px 16px',
    }
  }
  return {}
})

function handleClick(event: MouseEvent) {
  emit('click', event)
  emit('action', { type: 'click', event })
}
</script>

<script lang="ts">
export default {
  name: 'A2InfoField',
}
</script>

<style scoped>
.a2-info-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* 标签行 */
.info-field-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-field-icon {
  width: 16px;
  height: 16px;
  color: #606266;
  flex-shrink: 0;
}

.info-field-icon--img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: block;
}

.info-field-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.5;
}

.info-field-label--large {
  font-size: 16px;
  font-weight: 600;
}

/* 值行 */
.info-field-value {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  word-break: break-all;
  padding: 0 4px;
}

/* Tag 样式值 */
.info-field-value--tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 13px;
  color: #2260FA;
  width: fit-content;
}

/* Quote 引用样式值 */
.info-field-value--quote {
  position: relative;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}
</style>
