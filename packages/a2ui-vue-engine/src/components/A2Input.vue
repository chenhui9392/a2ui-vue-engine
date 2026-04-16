<!--
 * @Author: hui.chenn
 * @Description: A2Input component
 * @Date: 2026-04-15 16:32:00
 * @LastEditTime: 2026-04-15 16:38:38
 * @LastEditors: hui.chenn
-->
<template>
  <el-input
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
    class="a2-input"
    @input="handleInput"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElInput } from 'element-plus'

interface A2InputProps {
  modelValue?: string | number
  type?: 'text' | 'password' | 'textarea' | 'number' | 'email' | 'url'
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
}

const props = withDefaults(defineProps<A2InputProps>(), {
  modelValue: '',
  type: 'text',
  size: 'default',
  disabled: false,
  placeholder: '',
  clearable: false,
  showWordLimit: false,
  rows: 2,
  autosize: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'input', value: string | number): void
  (e: 'change', value: string | number): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
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
  const validTypes = ['text', 'password', 'textarea', 'number', 'email', 'url']
  return validTypes.includes(props.type) ? props.type : 'text'
})

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

function handleClear() {
  emit('clear')
  emit('action', { type: 'clear' })
}
</script>

<script lang="ts">
export default {
  name: 'A2Input',
}
</script>

<style scoped>
.a2-input {
  width: 100%;
  border-radius: var(--a2-radius-md);
}
</style>