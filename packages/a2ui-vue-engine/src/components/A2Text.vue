<!--
 * @Author: hui.chenn
 * @Description: A2Text component
 * @Date: 2026-04-15 16:31:00
 * @LastEditTime: 2026-04-16 17:00:00
 * @LastEditors: hui.chenn
-->
<template>
  <span
    :class="textClass"
    :style="textStyle"
    @click="handleClick"
  >
    {{ content }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface A2TextProps {
  content?: string
  tag?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
  bold?: boolean
  italic?: boolean
  underline?: boolean
  truncated?: boolean
  color?: string
  variant?: string // Added for h3, etc.
}

const props = withDefaults(defineProps<A2TextProps>(), {
  content: '',
  tag: 'span',
  type: undefined,
  size: 'default',
  bold: false,
  italic: false,
  underline: false,
  truncated: false,
  color: undefined,
  variant: undefined,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'action', payload: any): void
}>()

const textClass = computed(() => {
  const classes: string[] = ['a2-text']

  if (props.type) {
    classes.push(`a2-text--${props.type}`)
  }

  // Handle variant-based styling
  if (props.variant === 'h3') {
    classes.push('a2-text--h3')
  }

  // Handle size
  if (props.size) {
    classes.push(`a2-text--${props.size}`)
  }

  if (props.bold) {
    classes.push('a2-text--bold')
  }
  if (props.italic) {
    classes.push('a2-text--italic')
  }
  if (props.underline) {
    classes.push('a2-text--underline')
  }
  if (props.truncated) {
    classes.push('a2-text--truncated')
  }

  return classes.join(' ')
})

const textStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.color) {
    style.color = props.color
  }
  return style
})

function handleClick(event: MouseEvent) {
  emit('click', event)
  emit('action', { type: 'click', event })
}
</script>

<script lang="ts">
export default {
  name: 'A2Text',
}
</script>

<style scoped>
.a2-text {
  display: inline;
  font-family: var(--a2-font-family);
}

.a2-text--primary {
  color: var(--a2-color-primary);
}

.a2-text--success {
  color: var(--a2-color-success);
}

.a2-text--warning {
  color: var(--a2-color-warning);
}

.a2-text--danger {
  color: var(--a2-color-danger);
}

.a2-text--info {
  color: var(--a2-color-info);
}

.a2-text--large {
  font-size: var(--a2-font-size-lg);
}

.a2-text--default {
  font-size: var(--a2-font-size-md);
}

.a2-text--small {
  font-size: var(--a2-font-size-xs);
}

.a2-text--h3 {
  font-size: var(--a2-font-size-title);
  font-weight: 600;
  line-height: var(--a2-line-height-sm);
}

.a2-text--bold {
  font-weight: 600;
}

.a2-text--italic {
  font-style: italic;
}

.a2-text--underline {
  text-decoration: underline;
}

.a2-text--truncated {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
</style>
