<!--
 * @Author: hui.chenn
 * @Description: A2OptionCard - 选择卡片组件，支持选中状态和单选互斥
 * @Date: 2026-04-24 10:00:00
-->
<template>
  <div
    :class="cardClasses"
    :style="cardStyle"
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
import { computed, ref, watch, resolveComponent } from 'vue'

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

const cardStyle = computed(() => ({
  cursor: props.disabled ? 'not-allowed' : 'pointer',
}))

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

<style scoped>
.a2-option-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #FFFFFF;
  border: 1px solid #E4E7ED;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 120px;
  position: relative;
}

.a2-option-card:hover:not(.a2-option-card--disabled) {
  border-color: #409EFF;
  background: #F5F7FA;
}

/* 选中状态 - 蓝色边框和背景 */
.a2-option-card--selected {
  border-color: #409EFF;
  background: linear-gradient(135deg, #ECF5FF 0%, #FFFFFF 100%);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.a2-option-card--selected .option-card-title {
  color: #409EFF;
}

.a2-option-card--selected .option-card-icon {
  color: #409EFF;
}

/* 禁用状态 */
.a2-option-card--disabled {
  opacity: 0.6;
}

/* 标题行 */
.option-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-card-icon {
  color: #606266;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.option-card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.5;
  flex: 1;
}

/* 选中标记图标 */
.option-card-check {
  color: #409EFF;
  width: 16px;
  height: 16px;
}

/* 内容行 */
.option-card-content {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* 尺寸变体 */
.a2-option-card--small {
  padding: 12px;
  min-width: 100px;
}

.a2-option-card--small .option-card-title {
  font-size: 13px;
}

.a2-option-card--small .option-card-content {
  font-size: 11px;
}

.a2-option-card--large {
  padding: 20px;
  min-width: 160px;
}

.a2-option-card--large .option-card-title {
  font-size: 16px;
}

.a2-option-card--large .option-card-content {
  font-size: 14px;
  margin-top: 12px;
}
</style>