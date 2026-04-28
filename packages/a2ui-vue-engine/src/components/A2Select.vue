<!--
 * @Author: hui.chenn
 * @Description: A2Select component
 * @Date: 2026-04-15 16:33:00
 * @LastEditTime: 2026-04-15 16:33:24
 * @LastEditors: hui.chenn
-->
<template>
  <el-select
    v-model="selectValue"
    :size="size"
    :disabled="disabled"
    :clearable="clearable"
    :placeholder="placeholder"
    :multiple="multiple"
    :filterable="filterable"
    :multiple-limit="multipleLimit"
    class="a2-select"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElSelect, ElOption } from 'element-plus'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface A2SelectProps {
  modelValue?: string | number | string[] | number[]
  options?: SelectOption[]
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  multiple?: boolean
  filterable?: boolean
  multipleLimit?: number
}

const props = withDefaults(defineProps<A2SelectProps>(), {
  modelValue: '',
  options: () => [],
  size: 'default',
  disabled: false,
  clearable: false,
  placeholder: '请选择',
  multiple: false,
  filterable: false,
  multipleLimit: 0,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | string[] | number[]): void
  (e: 'change', value: string | number | string[] | number[]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'action', payload: any): void
}>()

const selectValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  selectValue.value = newVal
})

watch(selectValue, (newVal) => {
  emit('update:modelValue', newVal)
})

function handleChange(value: string | number | string[] | number[]) {
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
  name: 'A2Select',
}
</script>

<style scoped>
.a2-select {
  width: 100%;
  border-radius: var(--a2-radius-md);
}
</style>