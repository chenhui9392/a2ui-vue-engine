<!--
 * @Author: hui.chenn
 * @Description: A2OptionCard - 选择卡片组件，支持选中状态和单选互斥
 * @Date: 2026-04-24 10:00:00
-->
<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- 标题行（带图标） -->
    <div class="option-card-header">
      <component v-if="icon" :is="resolvedIcon" class="option-card-icon" />
      <span class="option-card-title">{{ title }}</span>
      <!-- 选中标记 -->
      <component v-if="isSelected" :is="CheckIcon" class="option-card-check" />
    </div>

    <!-- 内容行 -->
    <div class="option-card-content" v-if="content">
      {{ content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

interface A2OptionCardProps {
  modelValue?: string | number | boolean | null
  title?: string
  content?: string
  icon?: string
  size?: 'small' | 'default' | 'large'
  disabled?: boolean
  selected?: boolean
  value?: string | number | boolean // 卡片代表的值，用于单选互斥
}

const props = withDefaults(defineProps<A2OptionCardProps>(), {
  modelValue: null,
  title: '',
  content: '',
  icon: '',
  size: 'default',
  disabled: false,
  selected: false,
  value: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'click', event: MouseEvent): void
  (e: 'action', payload: any): void
}>()

// Check icon for selected state
const CheckIcon = computed(() => {
  try {
    return resolveComponent('IconCircleCheck')
  } catch {
    try {
      return resolveComponent('IconCheck')
    } catch {
      return null
    }
  }
})

// Internal selected state - based on modelValue matching card's value
const isSelected = computed(() => {
  // If card has a specific value, check if modelValue matches it
  if (props.value !== undefined) {
    return props.modelValue === props.value
  }
  // Fallback to selected prop or boolean modelValue
  return props.selected || props.modelValue === true
})

const cardClasses = computed(() => {
  return [
    'a2-option-card',
    `a2-option-card--${props.size}`,
    {
      'a2-option-card--selected': isSelected.value,
      'a2-option-card--disabled': props.disabled,
    }
  ]
})

// Resolve icon component
const resolvedIcon = computed(() => {
  if (!props.icon) return undefined

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

function handleClick(event: MouseEvent) {
  if (props.disabled) return

  // Toggle: if already selected and has value, deselect (set to null)
  // Otherwise, select (emit this card's value or true)
  const newValue = isSelected.value && props.value !== undefined ? null : (props.value ?? true)

  emit('update:modelValue', newValue)
  emit('click', event)
  emit('action', {
    type: 'click',
    selected: !isSelected.value,
    value: newValue,
    event
  })
}
</script>

<script lang="ts">
export default {
  name: 'A2OptionCard',
}
</script>
