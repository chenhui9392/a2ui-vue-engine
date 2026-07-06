<!--
 * @Author: hui.chenn
 * @Description: A2Search - 协议驱动的搜索表单组件
 *   自动绑定 Form (通过 A2UIRoot.data 或本地) / DataSource / Table (via DataSource)
 *   支持 Search / Reset / Collapse / Default Search
 * @Date: 2026-07-01 10:00:00
 * @LastEditTime: 2026-07-01 10:00:00
 * @LastEditors: hui.chenn
-->
<template>
  <div class="a2-search">
    <el-form
      class="a2-search__form"
      :label-width="labelWidth"
      label-position="right"
      @submit.prevent="handleSubmit"
    >
      <el-row :gutter="12">
        <el-col
          v-for="field in visibleFields"
          :key="field.id"
          :span="field.span || defaultFieldSpan"
        >
          <el-form-item :label="field.label || ''">
            <!-- text -->
            <el-input
              v-if="field.type === 'text'"
              :model-value="valueOf(field.id)"
              :placeholder="field.placeholder"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              @update:model-value="(v) => handleChange(field.id, v)"
              @keydown.enter.prevent="handleSubmit"
            />

            <!-- number -->
            <el-input-number
              v-else-if="field.type === 'number'"
              :model-value="valueOf(field.id)"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              class="a2-search__input"
              @update:model-value="(v) => handleChange(field.id, v)"
            />

            <!-- select -->
            <el-select
              v-else-if="field.type === 'select'"
              :model-value="valueOf(field.id)"
              :placeholder="field.placeholder"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              class="a2-search__input"
              @update:model-value="(v) => handleChange(field.id, v)"
            >
              <el-option
                v-for="opt in field.options || []"
                :key="String(opt.value)"
                :label="opt.label"
                :value="opt.value"
                :disabled="opt.disabled"
              />
            </el-select>

            <!-- date -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              :model-value="valueOf(field.id)"
              type="date"
              :placeholder="field.placeholder"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              class="a2-search__input"
              @update:model-value="(v) => handleChange(field.id, v)"
            />

            <!-- daterange -->
            <el-date-picker
              v-else-if="field.type === 'daterange'"
              :model-value="valueOf(field.id)"
              type="daterange"
              range-separator="~"
              :start-placeholder="'开始日期'"
              :end-placeholder="'结束日期'"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              class="a2-search__input"
              @update:model-value="(v) => handleChange(field.id, v)"
            />

            <!-- switch -->
            <el-switch
              v-else-if="field.type === 'switch'"
              :model-value="valueOf(field.id)"
              :disabled="field.disabled"
              @update:model-value="(v) => handleChange(field.id, v)"
            />
          </el-form-item>
        </el-col>

        <!-- Actions column：搜索 / 重置 / 展开或收起 -->
        <el-col :span="actionSpan" class="a2-search__actions-col">
          <el-form-item label="" class="a2-search__actions-item">
            <div class="a2-search__actions">
              <el-button type="primary" @click="handleSubmit">
                {{ config?.submitText || '搜索' }}
              </el-button>
              <el-button
                v-if="config?.showReset !== false"
                @click="handleReset"
              >
                {{ config?.resetText || '重置' }}
              </el-button>
              <!-- 展开/收起：与搜索/重置同一行；文案随 collapsed 变化 -->
              <el-button
                v-if="showCollapseToggle"
                type="primary"
                link
                class="a2-search__collapse-btn"
                @click="handleToggleCollapse"
              >
                {{ runtime.state.collapsed ? '展开' : '收起' }}
                <el-icon class="a2-search__collapse-icon">
                  <ArrowDown v-if="runtime.state.collapsed" />
                  <ArrowUp v-else />
                </el-icon>
              </el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, watch } from 'vue'
import { ElForm, ElFormItem, ElRow, ElCol, ElInput, ElInputNumber, ElSelect, ElOption, ElDatePicker, ElSwitch, ElButton, ElIcon } from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import type { Ref } from 'vue'
import { SearchRuntime } from '../runtime/search-runtime'
import type { SearchRuntimeConfig, SearchFormBridge, SearchDataSourceBridge, SearchSubmitPayload } from '../runtime/search-runtime'
import type { DataSource } from '../engine/data-source'

interface A2SearchProps {
  /** 协议驱动配置 */
  config?: SearchRuntimeConfig
  /** label 宽度 */
  labelWidth?: string
  /** 关联的 DataSource 实例（宿主传入；协议中通过 `config.dataSource` 声明 id）*/
  dataSource?: DataSource<any>
  /** 表单值前缀（写入 A2UIRoot.data.form.<prefix>.*）*/
  formPrefix?: string
}

const props = withDefaults(defineProps<A2SearchProps>(), {
  labelWidth: '80px',
  formPrefix: '',
})

const emit = defineEmits<{
  (e: 'submit', payload: SearchSubmitPayload): void
  (e: 'reset', values: Record<string, any>): void
  (e: 'action', payload: any): void
}>()

// 自动绑定 A2UIRoot.data.form（如果在 A2UIRoot 内）
const a2uiData = inject<Ref<Record<string, any>>>('a2uiData', undefined as any)
const a2uiUpdateData = inject<(patch: Record<string, any>) => void>(
  'a2uiUpdateData',
  undefined as any
)

const formBridge: SearchFormBridge = {
  read: () => {
    if (a2uiData?.value) {
      const scope = props.formPrefix
        ? (a2uiData.value.form?.[props.formPrefix] ?? {})
        : (a2uiData.value.form ?? {})
      return { ...scope }
    }
    return {}
  },
  write: (patch) => {
    if (a2uiUpdateData) {
      if (props.formPrefix) {
        a2uiUpdateData({
          form: {
            ...(a2uiData?.value?.form || {}),
            [props.formPrefix]: {
              ...(a2uiData?.value?.form?.[props.formPrefix] || {}),
              ...patch,
            },
          },
        })
      } else {
        a2uiUpdateData({
          form: {
            ...(a2uiData?.value?.form || {}),
            ...patch,
          },
        })
      }
    }
  },
  replace: (values) => {
    if (a2uiUpdateData) {
      if (props.formPrefix) {
        a2uiUpdateData({
          form: {
            ...(a2uiData?.value?.form || {}),
            [props.formPrefix]: { ...values },
          },
        })
      } else {
        a2uiUpdateData({
          form: { ...values },
        })
      }
    }
  },
}

const dataSourceBridge: SearchDataSourceBridge | undefined = props.dataSource
  ? {
      submit: (filter) => props.dataSource?.setFilter(filter),
      reset: () => props.dataSource?.setFilter({}),
      instance: props.dataSource,
    }
  : undefined

// SearchRuntime 实例（每次 config 变更时重建）
const runtime = createRuntime()

function createRuntime() {
  return new SearchRuntime({
    id: 'a2-search',
    config: props.config || { fields: [] },
    form: a2uiData ? formBridge : undefined,
    dataSource: dataSourceBridge,
    onSubmit: (payload) => {
      emit('submit', payload)
      emit('action', { type: 'submit', ...payload })
    },
    onReset: (values) => {
      emit('reset', values)
      emit('action', { type: 'reset', values })
    },
  })
}

let currentRuntime: SearchRuntime = runtime

// Watch config 变化：重建 runtime
watch(
  () => props.config,
  () => {
    currentRuntime = createRuntime()
  }
)

const visibleFields = computed(() => currentRuntime.visibleFields.value)

/**
 * 默认字段 span：折叠状态下让字段稍紧，为 actions 预留 8-9 栅格
 * - 折叠（≤3 字段）：每个 span=5，3 字段 = 15；actions = 9（含展开）
 * - 展开（4 字段）：每个 span=6，4 字段 = 24（actions 独占下一行）
 * - 展开（更多）：默认 span=6
 */
const defaultFieldSpan = computed(() => {
  const n = visibleFields.value.length
  if (n <= 3) return 5
  return 6
})

const actionSpan = computed(() => {
  const total = visibleFields.value.reduce(
    (acc, f) => acc + (f.span || defaultFieldSpan.value),
    0
  )
  const remainder = total % 24
  const remaining = 24 - remainder
  // 如果字段刚好铺满 24 的整数倍 → actions 独占下一行 span=24 靠右
  if (remainder === 0) return 24
  // 至少 6 栅格容纳 搜索/重置/展开 三按钮（与最后一行字段同水平线）
  if (remaining < 6) return 24
  return remaining
})

/** 是否显示"展开/收起"按钮 */
const showCollapseToggle = computed(() => {
  const cfg = props.config
  return !!(cfg?.collapsible && cfg?.showCollapse !== false)
})

function valueOf(id: string): any {
  return currentRuntime.state.values[id]
}

function handleChange(id: string, value: any): void {
  currentRuntime.setValue(id, value)
}

function handleSubmit(): void {
  currentRuntime.submit()
}

function handleReset(): void {
  currentRuntime.reset()
}

function handleToggleCollapse(): void {
  currentRuntime.toggleCollapse()
  emit('action', { type: 'toggleCollapse', collapsed: currentRuntime.state.collapsed })
}

onBeforeUnmount(() => {
  // SearchRuntime 无副作用清理，占位
})
</script>

<script lang="ts">
export default {
  name: 'A2Search',
}
</script>

<style scoped>
.a2-search {
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  background: #ffffff;
  border-radius: var(--a2-radius-md, 8px);
  border: 1px solid var(--a2-border-lighter, #ebeef5);
  margin-bottom: 12px;
  overflow: hidden;
  position: relative;
}

.a2-search__form {
  width: 100%;
  position: relative;
}

/* 确保内部 el-row/el-col 尊重容器宽度 */
.a2-search :deep(.el-row) {
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.a2-search :deep(.el-col) {
  padding-left: 6px !important;
  padding-right: 6px !important;
}

.a2-search__input {
  width: 100%;
}

.a2-search__actions-col {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  min-width: 0;
}

.a2-search__actions-item {
  margin-bottom: 0;
}

/* actions 的 form-item 内部对齐：让按钮与输入框基线一致 */
.a2-search__actions-item :deep(.el-form-item__label) {
  visibility: hidden;
}
.a2-search__actions-item :deep(.el-form-item__content) {
  justify-content: flex-end;
}

.a2-search__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

/* 展开/收起按钮：与"搜索/重置"拉开视觉距离 */
.a2-search__collapse-btn {
  margin-left: 16px;
}

.a2-search__collapse-icon {
  margin-left: 2px;
}
</style>
