<!--
 * @Author: hui.chenn
 * @Description: A2SelectField component - Select dropdown with label
 * @Date: 2026-04-16 18:00:00
 * @LastEditTime: 2026-04-16 18:00:00
 * @LastEditors: hui.chenn
-->
<template>
  <el-form-item
    :label="label"
    :prop="prop"
    :required="required"
    :label-width="labelWidth"
    :class="fieldClass"
  >
    <el-select
      v-model="selectValue"
      :size="size"
      :disabled="disabled"
      :clearable="clearable"
      :placeholder="placeholder"
      :multiple="multiple"
      :filterable="filterable"
      :multiple-limit="multipleLimit"
      class="a2-select-field__select"
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
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElFormItem, ElSelect, ElOption } from 'element-plus'
import type { FormItemRule } from 'element-plus'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface A2SelectFieldProps {
  modelValue?: string | number | string[] | number[]
  label?: string
  prop?: string
  required?: boolean
  rules?: FormItemRule[]
  labelWidth?: string | number
  options?: SelectOption[]
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  multiple?: boolean
  filterable?: boolean
  multipleLimit?: number
}

const props = withDefaults(defineProps<A2SelectFieldProps>(), {
  modelValue: '',
  label: '',
  prop: '',
  required: false,
  rules: () => [],
  labelWidth: '100px',
  options: () => [],
  size: 'default',
  disabled: false,
  clearable: true,
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

const fieldClass = computed(() => {
  return 'a2-select-field'
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
  name: 'A2SelectField',
}
</script>

<style scoped>
.a2-select-field {
  width: 100%;
}

.a2-select-field__select {
  width: 100%;
  border-radius: var(--a2-radius-md);
}

.a2-select-field :deep(.el-form-item__content) {
  border-radius: var(--a2-radius-md);
}
</style>