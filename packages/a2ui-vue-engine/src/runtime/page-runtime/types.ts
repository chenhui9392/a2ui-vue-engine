/*
 * @Author: hui.chenn
 * @Description: PageRuntime 类型定义 - 与 architecture/page-state.md、
 *   runtime-design.md、action-system.md 对齐。
 *
 *   本文件只定义类型：
 *   - PageState 结构（searchState / tableState / currentRow / dialogState / drawerState / refreshTrigger）
 *   - dispatch 类型枚举
 *   - PageRuntimeOptions
 * @Date: 2026-07-02 10:00:00
 */
import type { DataSourceError } from '../../engine/data-source'
import type { ApiContext, ApiResolver, ApiEntry, ResolvedApi } from '../../infra/api'

/** 分页信息 */
export interface PageTablePagination {
  pageNum: number
  pageSize: number
  total: number
}

/** Search 子状态 */
export interface PageSearchState<V = Record<string, any>> {
  /** 表单当前值（未提交） */
  values: V
  /** 上一次提交给 DataSource 的 filter */
  lastSubmit: Record<string, any>
  /** 折叠状态 */
  collapsed: boolean
  /** values !== lastSubmit 时为 true */
  dirty: boolean
}

/** Table 子状态（由 DataSource 反投影） */
export interface PageTableState<T = any> {
  /** 关联 DataSource id */
  dataSourceId: string | null
  /** 只读投影：DataSource.state.data */
  data: T[]
  /** 只读投影：DataSource.state.status === 'loading' | 'refreshing' */
  loading: boolean
  /** 分页信息 */
  pagination: PageTablePagination
  /** 排序 */
  sort: { field: string; order: 'asc' | 'desc' } | null
  /** 选中行主键 */
  selectedRowKeys: (string | number)[]
  /** 只读投影：DataSource.state.error */
  error: DataSourceError | null
}

/** Overlay 子状态（Dialog / Drawer 每个 name 一份） */
export interface PageOverlayEntry {
  visible: boolean
  loading: boolean
  context: Record<string, any> | null
  openedAt: number
}

/** 完整 PageState */
export interface PageState<TRow = any, SVal = Record<string, any>> {
  searchState: PageSearchState<SVal>
  tableState: PageTableState<TRow>
  currentRow: TRow | null
  dialogState: Record<string, PageOverlayEntry>
  drawerState: Record<string, PageOverlayEntry>
  refreshTrigger: number
}

/** dispatch 类型（与 runtime-summary.md §3.1、action-system.md §6 对齐） */
export type PageDispatchType =
  | 'search.change'
  | 'search.submit'
  | 'search.reset'
  | 'search.setValues'
  | 'search.toggleCollapse'
  | 'table.pageChange'
  | 'table.pageSizeChange'
  | 'table.sortChange'
  | 'table.selectionChange'
  | 'table.rowAction'
  | 'datasource.command'
  | 'dialog.open'
  | 'dialog.close'
  | 'drawer.open'
  | 'drawer.close'
  | 'page.refresh'
  | 'page.reset'
  | 'page.setCurrentRow'

/** dispatch 载荷 */
export interface PageDispatchPayload {
  /** DataSource id */
  target?: string
  /** Search submit 的 values / filter */
  values?: Record<string, any>
  filter?: Record<string, any>
  /** Overlay name */
  name?: string
  row?: any
  context?: Record<string, any>
  /** Pagination */
  pageNum?: number
  pageSize?: number
  /** Sort */
  sort?: { field: string; order: 'asc' | 'desc' } | null
  /** Selection */
  selectedRowKeys?: (string | number)[]
  /** datasource.command 专用 */
  op?: string
  args?: any
  /** 其他自定义 */
  [key: string]: any
}

/** PageRuntime 构造选项 */
export interface PageRuntimeOptions {
  /** 页面 id（会用作 data.$page.<pageId>） */
  pageId?: string
  /** 首次绑定 Search 时用的 dataSourceId（未提供时后续 dispatch 中指定） */
  defaultDataSourceId?: string
  /** API 解析上下文（env / project / tenant / user / runtime / extra） */
  context?: ApiContext
  /** ApiResolver 实例；提供后 PageRuntime 会暴露热更新 API 并订阅版本变更 */
  apiResolver?: ApiResolver
}

/** PageRuntime 暴露的 API 热更新接口（委托给持有的 ApiResolver） */
export interface PageRuntimeApiControl {
  /** 热更新单个 apiKey */
  updateApi: (key: string, value: ApiEntry | ResolvedApi | ((prev: ApiEntry) => ApiEntry)) => void
  /** 批量替换 / 合并 API 表 */
  replaceApiMap: (map: Record<string, ApiEntry>, mode?: 'merge' | 'replace') => void
  /** 重新加载（重新执行 provider，拉取远程 manifest） */
  reloadResolver: () => Promise<void>
  /** 切换上下文（env / tenant / user 等） */
  setContext: (patch: Partial<ApiContext>) => void
}
