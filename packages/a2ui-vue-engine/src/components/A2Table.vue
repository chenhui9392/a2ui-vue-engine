<!--
 * @Author: hui.chenn
 * @Description: A2Table component - 表格组件，支持 columns/rows/selection/empty/loading/cellRender
 *   V2.1 增强：分页（Pagination）能力 + DataSource 联动
 *   Table 只负责展示 + emit 事件；请求由 DataSource 承担；Search / Pagination 通过 DataSource 联动
 * @Date: 2026-07-01 10:00:00
 * @LastEditTime: 2026-07-01 10:00:00
 * @LastEditors: hui.chenn
-->
<template>
  <div class="a2-table">
    <el-table
      v-loading="innerLoading"
      :data="displayRows"
      :row-key="rowKey"
      :stripe="stripe"
      :border="border"
      :size="size"
      :empty-text="emptyText"
      :height="resolvedHeight"
      :max-height="resolvedMaxHeight"
      class="a2-table__inner"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <!-- Selection column -->
      <el-table-column
        v-if="selection && selection.mode === 'multiple'"
        type="selection"
        :width="55"
        :selectable="isRowSelectable"
        :reserve-selection="!!selection.preserveSelection"
      />
      <el-table-column
        v-else-if="selection && selection.mode === 'single'"
        :width="55"
        label=""
      >
        <template #default="{ row }">
          <el-radio
            :model-value="singleSelectedKey"
            :label="row[rowKey!]"
            @change="handleSingleSelect(row)"
          >
            <span></span>
          </el-radio>
        </template>
      </el-table-column>

      <!-- Data columns -->
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.id"
        :prop="column.field"
        :label="column.title"
        :width="column.width"
        :min-width="column.minWidth"
        :align="column.align || 'left'"
        :fixed="column.fixed"
        :sortable="column.sortable ? 'custom' : false"
      >
        <template #default="scope">
          <!-- 优先级：宿主 slot（cell-<column.id>） > 协议 cellRender > 纯值 -->
          <template v-if="$slots[`cell-${column.id}`]">
            <slot
              :name="`cell-${column.id}`"
              :row="scope.row"
              :column="column"
              :rowIndex="scope.$index"
            />
          </template>
          <template v-else-if="column.cellRender">
            <component :is="renderCell(column.cellRender, scope.row, scope.$index)" />
          </template>
          <template v-else>
            <span>{{ formatCellValue(scope.row, column) }}</span>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- Error banner (PageState / DataSource 模式下的错误提示) -->
    <div v-if="showError" class="a2-table__error">
      <div class="a2-table__error-icon">⚠</div>
      <div class="a2-table__error-text">{{ errorMessage }}</div>
      <button v-if="props.pageRuntime || props.dataSource" class="a2-table__error-retry" @click="handleRetry">
        重试
      </button>
    </div>

    <!-- Custom empty content (fallback to el-table's emptyText) -->
    <div v-if="showCustomEmpty" class="a2-table__empty">
      <div v-if="empty?.image" class="a2-table__empty-image">
        <img :src="empty.image" alt="empty" />
      </div>
      <div class="a2-table__empty-text">{{ emptyText }}</div>
      <div v-if="emptyActions && emptyActions.length > 0" class="a2-table__empty-actions">
        <component
          v-for="(child, index) in emptyActions"
          :key="child.id || index"
          :is="renderChild(child)"
        />
      </div>
    </div>

    <!-- Pagination area（可选，additive）-->
    <div v-if="paginationEnabled" class="a2-table__pagination">
      <el-pagination
        :current-page="innerPage"
        :page-size="innerPageSize"
        :page-sizes="paginationConfig.pageSizes"
        :total="innerTotal"
        :layout="paginationConfig.layout"
        :small="!!paginationConfig.small"
        :background="paginationConfig.background !== false"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { ElPagination } from 'element-plus'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'
import type { DataSource } from '../data-source'
import type { PageRuntime } from '../page-runtime'

interface A2TableColumn {
  id: string
  title?: string
  field?: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
  cellRender?: A2Node
  visible?: boolean
  format?: 'date' | 'datetime' | 'currency' | 'number' | 'percent'
}

interface A2TableSelection {
  mode: 'single' | 'multiple'
  preserveSelection?: boolean
  selectable?: (row: any, index: number) => boolean
}

interface A2TableEmpty {
  text?: string
  image?: string
  actions?: A2Node[]
}

/** 分页配置（协议驱动，additive）*/
interface A2TablePagination {
  enabled?: boolean
  pageSize?: number
  pageSizes?: number[]
  layout?: string
  small?: boolean
  background?: boolean
}

interface A2TableProps {
  columns?: A2TableColumn[]
  data?: any[]
  rowKey?: string
  size?: 'large' | 'default' | 'small'
  stripe?: boolean
  border?: boolean
  loading?: boolean
  selection?: A2TableSelection
  empty?: A2TableEmpty
  emptyText?: string
  /** 表格高度（触发内部滚动；el-table 原生 height）*/
  height?: number | string
  /** 表格最大高度（触发内部滚动）*/
  maxHeight?: number | string
  /** 分页配置（可选，additive）*/
  pagination?: A2TablePagination
  /** DataSource 实例（宿主注入；启用时 Table 从 DataSource 读 data/total/loading）*/
  dataSource?: DataSource<any>
  /**
   * PageRuntime 实例（协议驱动：Table 只读 pageState.tableState，翻页/排序/选择走 dispatch）
   * 优先级：pageRuntime > dataSource > props.data
   */
  pageRuntime?: PageRuntime
  /** 关联的 DataSource id（配合 pageRuntime.dispatch({ target })） */
  dataSourceId?: string
  children?: A2Node[] | string
  context?: RenderContext
}

const props = withDefaults(defineProps<A2TableProps>(), {
  columns: () => [],
  data: () => [],
  rowKey: 'id',
  size: 'default',
  stripe: true,
  border: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'rowClick', row: any, index: number): void
  (e: 'rowDblClick', row: any, index: number): void
  (e: 'sortChange', payload: { field: string; order: 'asc' | 'desc' | null }): void
  (e: 'selectionChange', rows: any[], keys: any[]): void
  /** V2.1 新增：分页事件（走 Action System）*/
  (e: 'pageChange', page: number): void
  (e: 'pageSizeChange', pageSize: number): void
  (e: 'paginationChange', payload: { page: number; pageSize: number; total: number }): void
  (e: 'action', payload: any): void
}>()

// ---- PageRuntime / DataSource 联动 ---------------------------------------

/** 是否启用 PageState 绑定（协议驱动模式） */
const usePageState = computed(() => !!props.pageRuntime)

/** 从 PageRuntime.state.tableState 读到的响应式字段 */
const psTableState = computed(() => props.pageRuntime?.state.tableState)

/** 从 DataSource 读到的响应式数据（存在时作为二级来源） */
const dsData = computed(() => props.dataSource?.state.data)
const dsMeta = computed(() => props.dataSource?.state.meta)
const dsStatus = computed(() => props.dataSource?.state.status)

// Normalize rows: 优先 PageState；其次 DataSource；否则 props.data；兼容 { list } / { data } 嵌套
const tableRows = computed(() => {
  if (usePageState.value) {
    const arr = psTableState.value?.data
    return Array.isArray(arr) ? arr : []
  }
  const source: any = props.dataSource ? dsData.value : props.data
  if (Array.isArray(source)) return source
  if (source && Array.isArray(source.list)) return source.list
  if (source && Array.isArray(source.data)) return source.data
  return []
})

/** loading 优先级：PageState > DataSource > props.loading */
const innerLoading = computed(() => {
  if (usePageState.value) return !!psTableState.value?.loading
  if (props.dataSource) {
    return dsStatus.value === 'loading' || dsStatus.value === 'refreshing'
  }
  return props.loading
})

/** 错误状态（仅 PageState 模式下暴露给模板；DataSource 模式沿用现有 loading/empty 行为） */
const innerError = computed(() => {
  if (usePageState.value) return psTableState.value?.error || null
  if (props.dataSource) return props.dataSource.state.error || null
  return null
})

/** 是否显示错误横幅（有错误 + 无 loading）*/
const showError = computed(() => !!innerError.value && !innerLoading.value)

/** 错误消息 */
const errorMessage = computed(() => {
  const e = innerError.value as any
  return e?.message || e?.code || '请求失败'
})

/** 重试：优先 pageRuntime.dispatch('page.refresh')；其次 DataSource.refresh() */
function handleRetry() {
  if (props.pageRuntime) {
    void props.pageRuntime.dispatch('page.refresh', { target: props.dataSourceId })
  } else if (props.dataSource) {
    void props.dataSource.refresh()
  }
}

// ---- Pagination -----------------------------------------------------------

const paginationConfig = computed<Required<A2TablePagination>>(() => {
  const cfg = props.pagination || {}
  return {
    enabled: cfg.enabled ?? false,
    pageSize: cfg.pageSize ?? 10,
    pageSizes: cfg.pageSizes ?? [10, 20, 50],
    layout: cfg.layout ?? 'total, sizes, prev, pager, next, jumper',
    small: cfg.small ?? false,
    background: cfg.background ?? true,
  }
})

/**
 * 是否启用分页：
 * - 显式 pagination.enabled = true
 * - 或 pageRuntime 存在且 tableState.pagination.total > 0（自动开启）
 * - 或 dataSource 存在且 meta.total > 0（自动开启）
 * - 显式 pagination.enabled = false 则关闭
 */
const paginationEnabled = computed(() => {
  if (props.pagination?.enabled === false) return false
  if (props.pagination?.enabled === true) return true
  if (usePageState.value && (psTableState.value?.pagination.total ?? 0) > 0) return true
  if (props.dataSource && (dsMeta.value?.total ?? 0) > 0) return true
  return false
})

/** 本地分页 fallback（无 DataSource / PageRuntime 时的静态数据）*/
const localPage = ref(1)
const localPageSize = ref(paginationConfig.value.pageSize)

const innerPage = computed<number>(() => {
  if (usePageState.value) return psTableState.value?.pagination.pageNum ?? 1
  if (props.dataSource) return dsMeta.value?.page ?? 1
  return localPage.value
})

const innerPageSize = computed<number>(() => {
  if (usePageState.value) {
    return psTableState.value?.pagination.pageSize ?? paginationConfig.value.pageSize
  }
  if (props.dataSource) return dsMeta.value?.pageSize ?? paginationConfig.value.pageSize
  return localPageSize.value
})

const innerTotal = computed<number>(() => {
  if (usePageState.value) return psTableState.value?.pagination.total ?? 0
  if (props.dataSource) return dsMeta.value?.total ?? 0
  if (Array.isArray(props.data)) return props.data.length
  return 0
})

// 静态数据 + 显式开启分页时的客户端切片
const clientPagedRows = computed(() => {
  const all = tableRows.value
  const p = innerPage.value
  const s = innerPageSize.value
  const start = (p - 1) * s
  return all.slice(start, start + s)
})

// 最终展示的 rows：PageState / DataSource → 服务端已切片；否则若开启分页 → 客户端切片；否则原始
const displayRows = computed(() => {
  if (usePageState.value) return tableRows.value
  if (props.dataSource) return tableRows.value
  if (paginationEnabled.value) return clientPagedRows.value
  return tableRows.value
})

// ---- 视觉配置 -------------------------------------------------------------

const visibleColumns = computed(() => {
  return (props.columns || []).filter(col => col.visible !== false)
})

// 允许数字/百分比字符串/px 字符串
function normalizeSize(v: number | string | undefined): number | string | undefined {
  if (v === undefined || v === null || v === '') return undefined
  if (typeof v === 'number') return v
  return v
}

const resolvedHeight = computed(() => normalizeSize(props.height))
const resolvedMaxHeight = computed(() => normalizeSize(props.maxHeight))

const emptyText = computed(() => {
  return props.empty?.text || props.emptyText || '暂无数据'
})

const emptyActions = computed<A2Node[]>(() => {
  return (props.empty?.actions as A2Node[]) || []
})

const showCustomEmpty = computed(() => {
  return (
    displayRows.value.length === 0 &&
    !innerLoading.value &&
    (props.empty?.image || emptyActions.value.length > 0)
  )
})

// ---- 选择 ----------------------------------------------------------------

const singleSelectedKey = ref<any>(null)

function isRowSelectable(row: any, index: number): boolean {
  if (props.selection?.selectable && typeof props.selection.selectable === 'function') {
    try {
      return props.selection.selectable(row, index)
    } catch {
      return true
    }
  }
  return true
}

function handleRowClick(row: any) {
  const index = displayRows.value.indexOf(row)
  emit('rowClick', row, index)
  emit('action', { type: 'rowClick', row, index })
}

function handleRowDblClick(row: any) {
  const index = displayRows.value.indexOf(row)
  emit('rowDblClick', row, index)
  emit('action', { type: 'rowDblClick', row, index })
}

function handleSortChange(payload: { prop: string; order: 'ascending' | 'descending' | null }) {
  const orderMap: Record<string, 'asc' | 'desc' | null> = {
    ascending: 'asc',
    descending: 'desc',
  }
  const normalized = {
    field: payload.prop,
    order: payload.order ? orderMap[payload.order] : null,
  }
  emit('sortChange', normalized)
  emit('action', { type: 'sortChange', ...normalized })
  // 联动：优先 pageRuntime.dispatch；其次 DataSource.setSort
  if (props.pageRuntime) {
    void props.pageRuntime.dispatch('table.sortChange', {
      target: props.dataSourceId,
      sort: normalized.order ? { field: normalized.field, order: normalized.order } : null,
    })
  } else if (props.dataSource) {
    props.dataSource.setSort(normalized.order ? { field: normalized.field, order: normalized.order } : null)
  }
}

function handleSelectionChange(rows: any[]) {
  const keys = rows.map(r => (props.rowKey ? r[props.rowKey] : r))
  emit('selectionChange', rows, keys)
  emit('action', { type: 'selectionChange', rows, keys })
  if (props.pageRuntime) {
    void props.pageRuntime.dispatch('table.selectionChange', { selectedRowKeys: keys })
  }
}

function handleSingleSelect(row: any) {
  singleSelectedKey.value = props.rowKey ? row[props.rowKey] : row
  emit('selectionChange', [row], [singleSelectedKey.value])
  emit('action', { type: 'selectionChange', rows: [row], keys: [singleSelectedKey.value] })
  if (props.pageRuntime) {
    void props.pageRuntime.dispatch('table.selectionChange', {
      selectedRowKeys: [singleSelectedKey.value],
    })
  }
}

watch(
  () => displayRows.value,
  () => {
    if (
      singleSelectedKey.value != null &&
      !displayRows.value.some(r => (props.rowKey ? r[props.rowKey] : r) === singleSelectedKey.value)
    ) {
      singleSelectedKey.value = null
    }
  }
)

// ---- Pagination 事件（走 Action System）-----------------------------------

function handlePageChange(page: number) {
  emit('pageChange', page)
  emit('paginationChange', {
    page,
    pageSize: innerPageSize.value,
    total: innerTotal.value,
  })
  emit('action', { type: 'pageChange', page })
  // 联动：优先 pageRuntime.dispatch；其次 DataSource；否则本地翻页
  if (props.pageRuntime) {
    void props.pageRuntime.dispatch('table.pageChange', {
      target: props.dataSourceId,
      pageNum: page,
    })
  } else if (props.dataSource) {
    props.dataSource.setPage(page)
  } else {
    localPage.value = page
  }
}

function handlePageSizeChange(pageSize: number) {
  emit('pageSizeChange', pageSize)
  emit('paginationChange', {
    page: 1,
    pageSize,
    total: innerTotal.value,
  })
  emit('action', { type: 'pageSizeChange', pageSize })
  // 联动：优先 pageRuntime.dispatch；其次 DataSource；否则本地
  if (props.pageRuntime) {
    void props.pageRuntime.dispatch('table.pageSizeChange', {
      target: props.dataSourceId,
      pageSize,
    })
  } else if (props.dataSource) {
    props.dataSource.setPageSize(pageSize)
  } else {
    localPageSize.value = pageSize
    localPage.value = 1
  }
}

// ---- 单元格 / 空态渲染 ----------------------------------------------------

function formatCellValue(row: any, column: A2TableColumn): string {
  if (!column.field) return ''
  const raw = row[column.field]
  if (raw === undefined || raw === null) return ''
  switch (column.format) {
    case 'date':
      try {
        return new Date(raw).toLocaleDateString()
      } catch {
        return String(raw)
      }
    case 'datetime':
      try {
        return new Date(raw).toLocaleString()
      } catch {
        return String(raw)
      }
    case 'number':
      return typeof raw === 'number' ? raw.toLocaleString() : String(raw)
    case 'currency':
      return typeof raw === 'number' ? `¥${raw.toLocaleString()}` : String(raw)
    case 'percent':
      return typeof raw === 'number' ? `${(raw * 100).toFixed(2)}%` : String(raw)
    default:
      return String(raw)
  }
}

function renderCell(node: A2Node, row: any, rowIndex: number) {
  if (!props.context) return null
  const subContext: RenderContext = {
    ...props.context,
    data: {
      ...props.context.data,
      row,
      rowIndex,
    },
  }
  return defineComponent({
    name: 'A2TableCell',
    setup() {
      return () => renderNode(node, subContext)
    },
  })
}

function renderChild(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2TableEmptyChild',
    setup() {
      return () => renderNode(node, props.context!)
    },
  })
}
</script>

<script lang="ts">
export default {
  name: 'A2Table',
}
</script>

<style scoped>
.a2-table {
  width: 100%;
  min-width: 0;
  background: #FFFFFF;
  border-radius: var(--a2-radius-md, 8px);
  overflow: hidden;
}

.a2-table__inner {
  width: 100%;
  min-width: 0;
}

/* 单元格内容单行显示；宽度不足由 el-table 自身启用横向滚动 */
.a2-table :deep(.el-table__cell) .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 操作列（用户在 cellRender 用 a2-row 布局的按钮）避免换行 */
.a2-table :deep(.el-table__cell) .a2-row {
  flex-wrap: nowrap !important;
}

.a2-table__empty {
  padding: var(--a2-spacing-xl, 24px);
  text-align: center;
  color: var(--a2-text-secondary, #909399);
}

.a2-table__empty-image {
  margin-bottom: 12px;
}

.a2-table__empty-image img {
  max-width: 120px;
  max-height: 120px;
}

.a2-table__empty-text {
  font-size: 14px;
  margin-bottom: 12px;
}

.a2-table__empty-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.a2-table__pagination {
  display: flex;
  justify-content: flex-end;
  padding: 12px 8px;
  background: #ffffff;
  border-top: 1px solid var(--a2-border-lighter, #ebeef5);
  /* 让分页栏在纵向滚动容器中固定在底部 */
  position: sticky;
  bottom: 0;
  z-index: 2;
}

.a2-table__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: var(--a2-danger, #f56c6c);
  background: var(--a2-danger-bg, #fef0f0);
  border-top: 1px solid var(--a2-border-lighter, #ebeef5);
}

.a2-table__error-icon {
  font-size: 16px;
}

.a2-table__error-text {
  flex: 1;
  font-size: 13px;
}

.a2-table__error-retry {
  padding: 4px 10px;
  border: 1px solid currentColor;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
}

.a2-table__error-retry:hover {
  opacity: 0.8;
}
</style>
