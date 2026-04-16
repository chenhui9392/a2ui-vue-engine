<!--
 * @Author: hui.chenn
 * @Description: A2DateTimeInput component - Date and time input field with label
 * @Date: 2026-04-16 16:00:00
 * @LastEditTime: 2026-04-16 17:30:00
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
    <el-date-picker
      v-model="dateValue"
      :type="pickerType"
      :size="size"
      :disabled="disabled"
      :clearable="clearable"
      :placeholder="placeholder"
      :format="format"
      :value-format="valueFormat"
      :disabled-date="disabledDate"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElFormItem, ElDatePicker } from 'element-plus'

interface A2DateTimeInputProps {
  modelValue?: string | Date | [string, string] | [Date, Date]
  label?: string
  prop?: string
  required?: boolean
  labelWidth?: string | number
  enableDate?: boolean
  enableTime?: boolean
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  format?: string
  valueFormat?: string
  disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<A2DateTimeInputProps>(), {
  modelValue: '',
  label: '',
  prop: '',
  required: false,
  labelWidth: '100px',
  enableDate: true,
  enableTime: false,
  size: 'default',
  disabled: false,
  clearable: true,
  placeholder: '请选择日期',
  format: 'YYYY-MM-DD',
  valueFormat: 'YYYY-MM-DD',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | Date | [string, string] | [Date, Date]): void
  (e: 'change', value: string | Date | [string, string] | [Date, Date]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'action', payload: any): void
}>()

const dateValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  dateValue.value = newVal
})

watch(dateValue, (newVal) => {
  emit('update:modelValue', newVal)
})

// Compute picker type based on enableDate and enableTime
const pickerType = computed(() => {
  if (props.enableDate && props.enableTime) {
    return 'datetime'
  } else if (props.enableDate) {
    return 'date'
  } else if (props.enableTime) {
    return 'datetime' // Element Plus doesn't have a pure time picker type, use datetime
  }
  return 'date'
})

const fieldClass = computed(() => {
  return 'a2-date-time-input'
})

function handleChange(value: string | Date | [string, string] | [Date, Date]) {
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
  name: 'A2DateTimeInput',
}
</script>

<style scoped>
.a2-date-time-input {
  width: 100%;
}

.a2-date-time-input :deep(.el-date-editor) {
  width: 100%;
  border-radius: var(--a2-radius-md);
}
</style>