<!--
 * @Author: hui.chenn
 * @Description: A2TextField component - Form field with label (支持 textarea)
 * @Date: 2026-04-15 16:39:00
 * @LastEditTime: 2026-04-16 17:30:00
 * @LastEditors: hui.chenn
-->
<template>
  <el-form-item
    :label="label"
    :prop="prop"
    :required="required"
    :rules="rules"
    :label-width="labelWidth"
    :class="fieldClass"
  >
    <slot>
      <template v-if="hasChildren">
        <component
          v-for="(child, index) in childrenArray"
          :key="index"
          :is="renderChild(child)"
        />
      </template>
      <el-input
        v-else
        v-model="inputValue"
        :type="inputType"
        :size="size"
        :disabled="disabled"
        :placeholder="placeholder"
        :clearable="clearable"
        :maxlength="maxlength"
        :show-word-limit="showWordLimit"
        :prefix-icon="prefixIcon"
        :suffix-icon="suffixIcon"
        :rows="rows"
        :autosize="autosize"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </slot>
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineComponent } from 'vue'
import { ElFormItem, ElInput } from 'element-plus'
import type { FormItemRule } from 'element-plus'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'

interface A2TextFieldProps {
  modelValue?: string | number
  label?: string
  prop?: string
  required?: boolean
  rules?: FormItemRule[]
  labelWidth?: string | number
  type?: 'text' | 'password' | 'textarea' | 'number'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  placeholder?: string
  clearable?: boolean
  maxlength?: number
  showWordLimit?: boolean
  prefixIcon?: string
  suffixIcon?: string
  rows?: number
  autosize?: boolean | { minRows?: number; maxRows?: number }
  children?: A2Node[]
  context?: RenderContext
}

const props = withDefaults(defineProps<A2TextFieldProps>(), {
  modelValue: '',
  label: '',
  prop: '',
  required: false,
  rules: () => [],
  labelWidth: '100px',
  type: 'text',
  size: 'default',
  disabled: false,
  placeholder: '',
  clearable: false,
  showWordLimit: false,
  rows: 4,
  autosize: false,
  children: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'input', value: string | number): void
  (e: 'change', value: string | number): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'action', payload: any): void
}>()

const inputValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const inputType = computed(() => {
  const validTypes = ['text', 'password', 'textarea', 'number']
  return validTypes.includes(props.type) ? props.type : 'text'
})

const fieldClass = computed(() => {
  return 'a2-text-field'
})

const hasChildren = computed(() => {
  return props.children && Array.isArray(props.children) && props.children.length > 0
})

const childrenArray = computed(() => {
  if (!props.children) return []
  return Array.isArray(props.children) ? props.children : []
})

function renderChild(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2TextFieldChild',
    setup() {
      return () => renderNode(node, props.context!)
    },
  })
}

function handleInput(value: string | number) {
  emit('input', value)
  emit('action', { type: 'input', value })
}

function handleChange(value: string | number) {
  emit('change', value)
  emit('action', { type: 'change', value })
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
  emit('action', { type: 'focus', event })
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
  emit('action', { type: 'blur', event })
}
</script>

<script lang="ts">
export default {
  name: 'A2TextField',
}
</script>

<style scoped>
.a2-text-field {
  width: 100%;
}

.a2-text-field :deep(.el-form-item__content) {
  border-radius: var(--a2-radius-md);
}

/* 输入框全宽 */
.a2-text-field :deep(.el-input),
.a2-text-field :deep(.el-textarea) {
  width: 100%;
}
</style>