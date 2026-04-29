<template>
  <div class="a2-choice-picker" :class="{ 'is-disabled': disabled, 'is-required': required }">
    <div class="choice-label" v-if="label">
      <span>{{ label }}</span>
      <span class="required-mark" v-if="required">*</span>
    </div>
    <div class="choice-grid" :class="{ 'chips-style': displayStyle === 'chips' }">
      <div
        v-for="(option, index) in options"
        :key="index"
        class="choice-item"
        :class="{
          selected: isSelected(option.value),
          disabled: option.disabled || disabled
        }"
        @click="handleClick(option)"
      >
        <div class="choice-content">
          <div class="choice-title">{{ option.label }}</div>
          <div class="choice-desc" v-if="option.description">{{ option.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { PropType } from 'vue'

interface ChoiceOption {
  label: string
  value: string | number
  description?: string
  disabled?: boolean
}

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array as PropType<ChoiceOption[]>,
    default: () => [],
  },
  value: {
    type: Object as PropType<{ path: string }>,
    default: null,
  },
  variant: {
    type: String as PropType<'default' | 'mutuallyExclusive'>,
    default: 'default',
  },
  displayStyle: {
    type: String as PropType<'default' | 'chips'>,
    default: 'default',
  },
  defaultValue: {
    type: [Array, String, Number] as PropType<(string | number)[] | string | number>,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change', 'update:modelValue'])

// 判断是否为互斥模式（单选）
const isMutuallyExclusive = computed(() => props.variant === 'mutuallyExclusive')

// 内部选中值
const selectedValues = ref<(string | number)[]>([])

// 判断是否选中
function isSelected(value: string | number): boolean {
  return selectedValues.value.includes(value)
}

// 处理点击
function handleClick(option: ChoiceOption) {
  if (option.disabled || props.disabled) return

  if (isMutuallyExclusive.value) {
    // 互斥模式：单选
    selectedValues.value = [option.value]
  } else {
    // 多选模式
    const index = selectedValues.value.indexOf(option.value)
    if (index > -1) {
      selectedValues.value.splice(index, 1)
    } else {
      selectedValues.value.push(option.value)
    }
  }

  emit('change', isMutuallyExclusive.value ? option.value : [...selectedValues.value])
}

// 初始化默认值
watch(() => props.defaultValue, (newVal) => {
  if (newVal !== undefined && newVal !== null) {
    if (isMutuallyExclusive.value) {
      // 单选模式：接受单个值
      if (typeof newVal === 'string' || typeof newVal === 'number') {
        selectedValues.value = [newVal]
      } else if (Array.isArray(newVal) && newVal.length > 0) {
        selectedValues.value = [newVal[0]]
      }
    } else {
      // 多选模式：接受数组
      if (Array.isArray(newVal)) {
        selectedValues.value = [...newVal]
      }
    }
  }
}, { immediate: true })
</script>

<style scoped>
.a2-choice-picker {
  width: 100%;
}

.a2-choice-picker.is-required .choice-label {
  color: #303133;
}

.choice-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.required-mark {
  color: #f56c6c;
  margin-left: 2px;
}

.choice-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.choice-item {
  padding: 4px 10px;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #fff;
  box-sizing: border-box;
}

.choice-item:hover:not(.disabled) {
  border-color: #2260FA;
}

.choice-item.selected:not(.disabled) {
  border-color: #2260FA;
  border-width: 1px;
  background: #EBF3FF;
}

.choice-item.selected:not(.disabled) .choice-title {
  color: #2260FA;
}

.choice-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f5f7fa;
}

.a2-choice-picker.is-disabled .choice-item {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f5f7fa;
}

.choice-content {
  width: 100%;
}

.choice-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  line-height: 1.5;
}

.choice-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

@media (max-width: 600px) {
  .choice-grid {
    flex-direction: column;
  }
}
</style>