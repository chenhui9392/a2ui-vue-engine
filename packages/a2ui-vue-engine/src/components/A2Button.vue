<!--
 * @Author: hui.chenn
 * @Description: Button component that forwards explicit props to Element Plus
 * @Date: 2026-04-15 16:30:00
 * @LastEditTime: 2026-05-15 17:30:00
 * @LastEditors: hui.chenn
-->
<template>
  <el-button
    :type="props.type"
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
        <img v-if="hasCustomIcon" :src="props.icon" class="btn-custom-icon" />
        {{ buttonText }}
        <component
          v-for="(child, index) in nonTextChildren"
          :key="index"
          :is="renderChild(child)"
        />
      </template>
      <template v-else>
        <img v-if="hasCustomIcon" :src="props.icon" class="btn-custom-icon" />
        {{ text }}
      </template>
    </slot>
  </el-button>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
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

const buttonClass = computed(() => {
  const classes = ['a2-button']
  if (props.bgColor) {
    classes.push('a2-button--custom')
  }
  return classes.join(' ')
})

const buttonStyle = computed(() => {
  const style: Record<string, string> = {}

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
  }

  // 当只设 bgColor 没设 borderColor 时，隐藏边框保持旧效果
  if (props.bgColor && !props.borderColor) {
    style.border = 'none'
  }

  if (Object.keys(style).length > 0) {
    return style
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

// Button labels should inherit the button's own text color. Rendering a Text
// component inside a primary button can make the label invisible in host themes.
const buttonText = computed(() => {
  if (props.text) return props.text
  const textChild = childrenArray.value.find(child => child.type === 'a2-text')
  return textChild?.props?.content ?? ''
})

const nonTextChildren = computed(() =>
  childrenArray.value.filter(child => child.type !== 'a2-text')
)

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
