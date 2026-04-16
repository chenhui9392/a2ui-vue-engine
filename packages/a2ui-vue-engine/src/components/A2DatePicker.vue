<!--
 * @Author: hui.chenn
 * @Description: A2DatePicker component
 * @Date: 2026-04-15 16:34:00
 * @LastEditTime: 2026-04-15 16:34:13
 * @LastEditors: hui.chenn
-->
<template>
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
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :range-separator="rangeSeparator"
    class="a2-datepicker"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElDatePicker } from 'element-plus'

interface A2DatePickerProps {
  modelValue?: string | Date | [string, string] | [Date, Date]
  type?: 'year' | 'month' | 'date' | 'dates' | 'datetime' | 'week' | 'datetimerange' | 'daterange' | 'monthrange'
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  clearable?: boolean
  placeholder?: string
  format?: string
  valueFormat?: string
  disabledDate?: (date: Date) => boolean
  startPlaceholder?: string
  endPlaceholder?: string
  rangeSeparator?: string
}

const props = withDefaults(defineProps<A2DatePickerProps>(), {
  modelValue: '',
  type: 'date',
  size: 'default',
  disabled: false,
  clearable: true,
  placeholder: '请选择日期',
  format: 'YYYY-MM-DD',
  valueFormat: 'YYYY-MM-DD',
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期',
  rangeSeparator: '至',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | Date | [string, string] | [Date, Date]): void
  (e: 'change', value: string | Date | [string, string] | [Date, Date]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'action', payload: any): void
}>()

const dateValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  dateValue.value = newVal
})

watch(dateValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const pickerType = computed(() => {
  const validTypes = ['year', 'month', 'date', 'dates', 'datetime', 'week', 'datetimerange', 'daterange', 'monthrange']
  return validTypes.includes(props.type) ? props.type : 'date'
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

function handleClear() {
  emit('clear')
  emit('action', { type: 'clear' })
}
</script>

<script lang="ts">
export default {
  name: 'A2DatePicker',
}
</script>

<style scoped>
.a2-datepicker {
  width: 100%;
  border-radius: var(--a2-radius-md);
}
</style>