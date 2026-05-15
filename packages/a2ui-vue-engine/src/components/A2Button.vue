<!--
 * @Author: hui.chenn
 * @Description: A2Button component with auto-styling based on content
 * @Date: 2026-04-15 16:30:00
 * @LastEditTime: 2026-05-15 17:30:00
 * @LastEditors: hui.chenn
-->
<template>
  <el-button
    :type="autoType"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :icon="undefined"
    :plain="plain"
    :round="round"
    :circle="circle"
    :class="buttonClass"
    :style="buttonStyle"
    @click="handleClick"
  >
    <slot>
      <template v-if="hasChildren">
        <img v-if="isSubmitButton" :src="submitIcon" class="btn-submit-icon" />
        <img v-if="hasCustomIcon" :src="props.icon" class="btn-custom-icon" />
        <component
          v-for="(child, index) in childrenArray"
          :key="index"
          :is="renderChild(child)"
        />
      </template>
      <template v-else>
        <img v-if="isSubmitButton" :src="submitIcon" class="btn-submit-icon" />
        <img v-if="hasCustomIcon" :src="props.icon" class="btn-custom-icon" />
        <span v-if="isSubmitButton">{{ text }}</span>
        <template v-else>{{ text }}</template>
      </template>
    </slot>
  </el-button>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import submitIcon from '../assets/icons/submit.png'
import { ElButton } from 'element-plus'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'

interface A2ButtonProps {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  loading?: boolean
  icon?: string
  plain?: boolean
  round?: boolean
  circle?: boolean
  text?: string
  bgColor?: string
  borderColor?: string
  color?: string
  children?: A2Node[] | string
  context?: RenderContext
}

const props = withDefaults(defineProps<A2ButtonProps>(), {
  type: undefined,
  size: 'default',
  disabled: false,
  loading: false,
  plain: false,
  round: false,
  circle: false,
  text: '',
  bgColor: '',
  borderColor: '',
  color: '',
  children: () => [],
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'action', payload: any): void
}>()

// Get text content from children for auto-styling
const buttonText = computed(() => {
  if (props.text) return props.text
  if (props.children && Array.isArray(props.children)) {
    // Find Text component and get its content
    const textNode = props.children.find(child => child.type === 'a2-text')
    if (textNode?.props?.content) {
      return textNode.props.content
    }
  }
  return ''
})

// Auto-detect button type based on text content
// Unified standard: "取消" -> default (gray), "提交" -> primary, others -> default
const autoType = computed(() => {
  // If type is explicitly set, use it
  if (props.type) return props.type

  const text = buttonText.value.toLowerCase()

  // Keywords for button styling
  if (text.includes('提交') || text.includes('确认') || text.includes('保存') || text.includes('确定')) {
    return 'primary'
  }
  if (text.includes('取消') || text.includes('关闭') || text.includes('返回')) {
    return 'default'
  }
  if (text.includes('删除') || text.includes('移除')) {
    return 'danger'
  }
  if (text.includes('重置') || text.includes('清空')) {
    return 'warning'
  }

  return 'default'
})

const isSubmitButton = computed(() => {
  // 提交/保存/确认/确定类按钮
  const text = buttonText.value.toLowerCase()
  return text.includes('提交') || text.includes('确认') || text.includes('保存') || text.includes('确定')
})

const buttonClass = computed(() => {
  const classes = ['a2-button']
  if (props.bgColor) {
    classes.push('a2-button--custom')
  }
  // 提交类按钮添加特殊样式类
  if (isSubmitButton.value) {
    classes.push('a2-button--submit')
  }
  return classes.join(' ')
})

const buttonStyle = computed(() => {
  const style: Record<string, string> = {}

  // disabled 状态统一显示灰色（优先级最高）
  if (props.disabled) {
    return {
      backgroundColor: '#c0c4cc',
      borderColor: '#c0c4cc',
      color: '#ffffff',
    }
  }

  // 自定义颜色：背景、边框、文字分别设置
  if (props.bgColor) {
    style.backgroundColor = props.bgColor
  }
  if (props.borderColor) {
    style.borderColor = props.borderColor
  } else if (props.bgColor) {
    // 兼容旧逻辑：只设 bgColor 时边框跟随背景
    style.borderColor = props.bgColor
  }
  if (props.color) {
    style.color = props.color
  } else if (props.bgColor && !props.color) {
    // 兼容旧逻辑：只设 bgColor 时文字为白色
    style.color = '#FFFFFF'
  }

  // 当只设 bgColor 没设 borderColor 时，隐藏边框保持旧效果
  if (props.bgColor && !props.borderColor) {
    style.border = 'none'
  }

  if (Object.keys(style).length > 0) {
    return style
  }

  // 提交/保存/确认/确定类按钮自动使用 #2260FA
  if (isSubmitButton.value) {
    return {
      backgroundColor: '#2260FA',
      borderColor: '#2260FA',
      color: '#FFFFFF',
    }
  }

  return {}
})

const hasChildren = computed(() => {
  return props.children && (Array.isArray(props.children) ? props.children.length > 0 : true)
})

const childrenArray = computed(() => {
  if (!props.children) return []
  return Array.isArray(props.children) ? props.children : []
})

// Check if icon prop is a valid image URL
const hasCustomIcon = computed(() => {
  const icon = props.icon || ''
  if (!icon) return false
  return /^https?:\/\//i.test(icon) ||
         /^data:/i.test(icon) ||
         /\.(png|jpe?g|gif|svg|webp|bmp|ico)(\?.*)?$/i.test(icon)
})

function renderChild(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2ButtonChild',
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
  name: 'A2Button',
}
</script>

<style scoped>
.a2-button {
  min-width: 80px;
  border-radius: var(--a2-radius-md);
  transition: all var(--a2-transition-fast);
}

/* 自定义背景色按钮 */
.a2-button--custom {
  /* border 在 buttonStyle 中动态控制，当只设 bgColor 没设 borderColor 时隐藏 */
}

.a2-button--custom:hover {
  opacity: 0.9;
}

.a2-button--custom:active {
  opacity: 0.85;
}

/* 主要按钮样式 */
.a2-button.el-button--primary {
  background-color: var(--a2-color-primary);
  border-color: var(--a2-color-primary);
}

/* 次要按钮样式 */
.a2-button.el-button--default {
  background-color: var(--a2-bg-base);
  border-color: var(--a2-border-base);
}

/* 危险按钮样式 */
.a2-button.el-button--danger {
  background-color: var(--a2-color-danger);
  border-color: var(--a2-color-danger);
}

/* 警告按钮样式 */
.a2-button.el-button--warning {
  background-color: var(--a2-color-warning);
  border-color: var(--a2-color-warning);
}

/* 成功按钮样式 */
.a2-button.el-button--success {
  background-color: var(--a2-color-success);
  border-color: var(--a2-color-success);
}

/* disabled 状态统一灰色 */
.a2-button.is-disabled,
.a2-button.is-disabled:hover,
.a2-button.is-disabled:active,
.a2-button.is-disabled:focus {
  background-color: #c0c4cc !important;
  border-color: #c0c4cc !important;
  color: #ffffff !important;
}

.a2-button.is-disabled .btn-custom-icon,
.a2-button.is-disabled .btn-submit-icon {
  filter: grayscale(100%);
}

/* 提交按钮图标 */
.btn-submit-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  vertical-align: middle;
}

/* 自定义图标 */
.btn-custom-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  vertical-align: middle;
  object-fit: contain;
}
</style>
