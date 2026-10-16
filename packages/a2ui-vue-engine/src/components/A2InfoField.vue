<!--
 * @Author: hui.chenn
 * @Description: A2InfoField - 信息展示字段，支持图标+标签+值
 * @Date: 2026-04-27 12:00:00
-->
<template>
  <div :class="fieldClasses" :style="fieldStyle">
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
    <div v-if="displayValue" :class="valueClass">
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
const fieldClasses = computed(() => [
  'a2-info-field',
  props.bgColor ? 'a2-info-field--custom-bg' : '',
])

const fieldStyle = computed(() => props.bgColor
  ? { backgroundColor: props.bgColor }
  : {})

const valueClass = computed(() => {
  return [
    'info-field-value',
    props.variant === 'tag' ? 'info-field-value--tag' : '',
    props.variant === 'quote' ? 'info-field-value--quote' : '',
  ]
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
