/*
 * @Author: hui.chenn
 * @Description: PageRuntime - Runtime 内部的"页面协调层"
 *
 *   与 architecture/runtime-design.md、runtime-summary.md、page-state.md、
 *   action-system.md、datasource-execution.md 严格对齐。
 *
 *   本次实现范围（对齐 33.md）：
 *   Search → Action → PageRuntime → DataSource → HttpClient → PageState
 *
 *   本 Runtime 只做「UI 层状态协调」：
 *   - 维护 pageState（唯一状态中心）
 *   - dispatch 单一入口（Coordinator）
 *   - 通过 DataSourceManager 触发请求（Runtime 不直连 fetch/axios）
 *   - 把 DataSource.state 反投影到 pageState.tableState（只读投影）
 *
 *   本次不实现：
 *   - Table / Pagination / Dialog / Drawer / Chain / RefreshOn（后续按需接入）
 *   - Renderer / Component 侧的组件消费（本轮只保证 Runtime 可运行）
 * @Date: 2026-07-02 10:00:00
 */
import { reactive, watch, WatchStopHandle } from 'vue'
import type { DataSource, DataSourceError, DataSourceManager } from '../../engine/data-source'
import type { ApiContext, ApiResolver } from '../../infra/api'
import type {
  PageDispatchPayload,
  PageDispatchType,
  PageRuntimeOptions,
  PageRuntimeApiControl,
  PageState,
  PageTableState,
} from './types'

const DEFAULT_PAGE_SIZE = 20

/**
 * PageRuntime
 *
 * 唯一入口：`dispatch(type, payload)`
 * 唯一状态：`state`（响应式 PageState）
 *
 * 使用示例（本轮 Search → DataSource → PageState 场景）：
 * ```
 * const runtime = new PageRuntime(dsm, { defaultDataSourceId: 'orderList' })
 * runtime.dispatch('search.change', { values: { keyword: 'x' } })
 * runtime.dispatch('search.submit')      // 触发 DataSource.setFilter + setPage(1)
 * // runtime.state.tableState.loading / .data / .pagination.total 会自动更新
 * ```
 */
export class PageRuntime {
  readonly pageId: string
  readonly state: PageState

  private manager: DataSourceManager
  private defaultDataSourceId?: string
  /** 已挂上 watcher 的 DataSource id 集合 */
  private watchedDataSources = new Map<string, WatchStopHandle>()

  /** 可变 ApiContext（setContext 可更新） */
  private context: ApiContext
  /** ApiResolver（可选；提供后暴露热更新 API） */
  private apiResolver?: ApiResolver
  /** resolver 版本订阅的取消函数 */
  private unsubscribeResolver?: () => void

  constructor(manager: DataSourceManager, options?: PageRuntimeOptions) {
    this.manager = manager
    this.pageId = options?.pageId || 'default'
    this.defaultDataSourceId = options?.defaultDataSourceId
    this.context = options?.context ?? { env: 'prod' }
    this.apiResolver = options?.apiResolver

    // 把 contextProvider 注入 DSM（用于 transport.resolve + DataSource.buildCacheKey）
    if (options?.context || options?.apiResolver) {
      this.manager.setContext(() => this.context)
    }
    if (options?.apiResolver) {
      // 用局部变量收窄类型（this.apiResolver 是 class 字段，TS 不会窄化）
      const resolver = options.apiResolver
      this.manager.setApiResolver(resolver)
      // 订阅版本变更 → 失效所有 DataSource 缓存（下次 executeFetch 自动重新 resolve）
      this.unsubscribeResolver = resolver.subscribe(() => {
        this.manager.invalidateCache()
      })
    }

    this.state = reactive<PageState>({
      searchState: {
        values: {},
        lastSubmit: {},
        collapsed: true,
        dirty: false,
      },
      tableState: {
        dataSourceId: this.defaultDataSourceId || null,
        data: [],
        loading: false,
        pagination: { pageNum: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 },
        sort: null,
        selectedRowKeys: [],
        error: null,
      },
      currentRow: null,
      dialogState: {},
      drawerState: {},
      refreshTrigger: 0,
    }) as PageState

    // 若指定了默认 DataSource，立即挂 watcher（DataSource 已由 DSM 创建）
    if (this.defaultDataSourceId) {
      this.bindDataSource(this.defaultDataSourceId)
    }
  }

  // --- Public API --------------------------------------------------------

  /**
   * 唯一 dispatch 入口
   *
   * 契约：
   * - 组件、Action、宿主一律通过此方法写入 pageState / 触发 DataSource
   * - 只读投影字段（tableState.data / loading / total / error）不接受此方法写入
   * - 未知 type 会 warn，不中断
   */
  async dispatch(type: PageDispatchType | string, payload: PageDispatchPayload = {}): Promise<void> {
    switch (type as PageDispatchType) {
      // --- Search ------------------------------------------------------
      case 'search.change':
        return this.onSearchChange(payload)
      case 'search.setValues':
        return this.onSearchSetValues(payload)
      case 'search.submit':
        return this.onSearchSubmit(payload)
      case 'search.reset':
        return this.onSearchReset(payload)
      case 'search.toggleCollapse':
        this.state.searchState.collapsed = !this.state.searchState.collapsed
        return

      // --- Table (params only；数据字段是投影，不接受写)-------------------
      case 'table.pageChange':
        return this.onPageChange(payload)
      case 'table.pageSizeChange':
        return this.onPageSizeChange(payload)
      case 'table.sortChange':
        return this.onSortChange(payload)
      case 'table.selectionChange':
        this.state.tableState.selectedRowKeys = payload.selectedRowKeys || []
        return
      case 'table.rowAction':
        return this.onRowAction(payload)

      // --- Dialog ------------------------------------------------------
      case 'dialog.open':
        return this.onOverlayOpen('dialogState', payload)
      case 'dialog.close':
        return this.onOverlayClose('dialogState', payload)

      // --- Drawer ------------------------------------------------------
      case 'drawer.open':
        return this.onOverlayOpen('drawerState', payload)
      case 'drawer.close':
        return this.onOverlayClose('drawerState', payload)

      // --- Datasource generic command（用于 chain / 高级用法）-------------
      case 'datasource.command':
        return this.onDataSourceCommand(payload)

      // --- Page --------------------------------------------------------
      case 'page.refresh':
        return this.onPageRefresh(payload)
      case 'page.reset':
        return this.onPageReset(payload)
      case 'page.setCurrentRow':
        this.state.currentRow = payload.row ?? null
        return

      default:
        // 未知 type 不炸；符合 datasource-execution.md §3.2 未知 dispatch 应 warn
        // eslint-disable-next-line no-console
        console.warn(`[PageRuntime] unknown dispatch type: ${type}`)
    }
  }

  /** 绑定一个 DataSource：挂 watcher 派生到 tableState（只读投影） */
  bindDataSource(dataSourceId: string): void {
    if (this.watchedDataSources.has(dataSourceId)) return
    const ds = this.manager.get(dataSourceId)
    if (!ds) {
      console.warn(`[PageRuntime] bindDataSource: DataSource "${dataSourceId}" not found`)
      return
    }
    if (!this.state.tableState.dataSourceId) {
      this.state.tableState.dataSourceId = dataSourceId
    }
    const stop = this.watchDataSource(ds)
    this.watchedDataSources.set(dataSourceId, stop)
  }

  /** 解绑一个 DataSource */
  unbindDataSource(dataSourceId: string): void {
    const stop = this.watchedDataSources.get(dataSourceId)
    if (stop) {
      stop()
      this.watchedDataSources.delete(dataSourceId)
    }
  }

  /** 只读 select（可选便利读取） */
  getState(): PageState {
    return this.state
  }

  /** 命令式 refresh（等价 dispatch('page.refresh')） */
  refresh(target?: string): Promise<void> {
    return this.dispatch('page.refresh', { target })
  }

  /** 命令式 openDialog（等价 dispatch('dialog.open')） */
  openDialog(name: string, opts?: { row?: any; context?: Record<string, any> }): Promise<void> {
    return this.dispatch('dialog.open', { name, row: opts?.row, context: opts?.context })
  }

  /** 命令式 closeDialog */
  closeDialog(name: string, opts?: { destroyOnClose?: boolean }): Promise<void> {
    return this.dispatch('dialog.close', { name, destroyOnClose: opts?.destroyOnClose })
  }

  /** 命令式 openDrawer */
  openDrawer(name: string, opts?: { row?: any; context?: Record<string, any> }): Promise<void> {
    return this.dispatch('drawer.open', { name, row: opts?.row, context: opts?.context })
  }

  /** 命令式 closeDrawer */
  closeDrawer(name: string, opts?: { destroyOnClose?: boolean }): Promise<void> {
    return this.dispatch('drawer.close', { name, destroyOnClose: opts?.destroyOnClose })
  }

  /** 命令式 setCurrentRow */
  setCurrentRow(row: any): void {
    this.state.currentRow = row ?? null
  }

  /** 当前 Dialog / Drawer 状态查询 */
  getDialogState(name: string) {
    return this.state.dialogState[name]
  }
  getDrawerState(name: string) {
    return this.state.drawerState[name]
  }

  /** 读取当前 ApiContext 快照 */
  getContext(): ApiContext {
    return this.context
  }

  /** 持有的 ApiResolver（未注入时为 undefined） */
  getApiResolver(): ApiResolver | undefined {
    return this.apiResolver
  }

  // --- API 热更新入口（委托给 ApiResolver） ------------------------------

  /** 热更新单个 apiKey；更新后所有 DataSource 下次请求自动生效 */
  updateApi: PageRuntimeApiControl['updateApi'] = (key, value) => {
    if (!this.apiResolver) {
      console.warn('[PageRuntime] updateApi: no apiResolver provided')
      return
    }
    this.apiResolver.updateApi(key, value)
  }

  /** 批量替换 / 合并 API 表 */
  replaceApiMap: PageRuntimeApiControl['replaceApiMap'] = (map, mode) => {
    if (!this.apiResolver) {
      console.warn('[PageRuntime] replaceApiMap: no apiResolver provided')
      return
    }
    this.apiResolver.replaceApiMap(map, mode)
  }

  /** 重新加载 resolver（拉取远程 manifest） */
  reloadResolver: PageRuntimeApiControl['reloadResolver'] = async () => {
    if (!this.apiResolver) {
      console.warn('[PageRuntime] reloadResolver: no apiResolver provided')
      return
    }
    await this.apiResolver.reloadResolver()
  }

  /** 切换上下文（env / tenant / user 等）；下次请求自动生效 */
  setContext: PageRuntimeApiControl['setContext'] = (patch) => {
    this.context = { ...this.context, ...patch }
    // env / tenant 变化后缓存维度变化，主动失效旧缓存
    this.manager.invalidateCache()
  }

  /** 销毁：清理 watcher + 取消 resolver 订阅 */
  destroy(): void {
    this.watchedDataSources.forEach(stop => stop())
    this.watchedDataSources.clear()
    this.unsubscribeResolver?.()
    this.unsubscribeResolver = undefined
  }

  // --- Search 分支实现 ----------------------------------------------------

  private onSearchChange(payload: PageDispatchPayload): void {
    if (payload.values) {
      this.state.searchState.values = { ...this.state.searchState.values, ...payload.values }
    }
    this.state.searchState.dirty = !shallowEqual(
      this.state.searchState.values,
      this.state.searchState.lastSubmit
    )
  }

  private onSearchSetValues(payload: PageDispatchPayload): void {
    this.state.searchState.values = { ...(payload.values || {}) }
    this.state.searchState.dirty = !shallowEqual(
      this.state.searchState.values,
      this.state.searchState.lastSubmit
    )
  }

  private async onSearchSubmit(payload: PageDispatchPayload): Promise<void> {
    const target = payload.target || this.state.tableState.dataSourceId || this.defaultDataSourceId
    // 允许调用方传 values（Action 里 args:'$form' 已解析后）；否则用当前 searchState.values
    const values = payload.values ? { ...payload.values } : { ...this.state.searchState.values }
    const filter = payload.filter ? { ...payload.filter } : values

    // 更新 pageState
    this.state.searchState.values = { ...values }
    this.state.searchState.lastSubmit = { ...filter }
    this.state.searchState.dirty = false
    this.state.tableState.pagination.pageNum = 1

    // 触发 DataSource
    if (!target) {
      console.warn('[PageRuntime] search.submit: no target dataSource')
      return
    }
    const ds = this.manager.get(target)
    if (!ds) {
      console.warn(`[PageRuntime] search.submit: DataSource "${target}" not found`)
      return
    }
    // 首次遇到该 target 时懒挂 watcher（保持 tableState 反投影同步）
    this.bindDataSource(target)

    // 走 DataSource 的 setFilter + setPage；由 DataSource 内建 debounce
    ds.setFilter(filter)
    ds.setPage(1)
  }

  private async onSearchReset(payload: PageDispatchPayload): Promise<void> {
    const target = payload.target || this.state.tableState.dataSourceId || this.defaultDataSourceId
    // 清空 values / lastSubmit / 回到首页
    this.state.searchState.values = {}
    this.state.searchState.lastSubmit = {}
    this.state.searchState.dirty = false
    this.state.tableState.pagination.pageNum = 1

    if (!target) return
    const ds = this.manager.get(target)
    if (!ds) return
    this.bindDataSource(target)
    ds.setFilter({})
    ds.setPage(1)
  }

  // --- Table 参数分支 -----------------------------------------------------

  private async onPageChange(payload: PageDispatchPayload): Promise<void> {
    const target = payload.target || this.state.tableState.dataSourceId
    const pageNum = payload.pageNum ?? this.state.tableState.pagination.pageNum
    this.state.tableState.pagination.pageNum = pageNum
    if (!target) return
    this.manager.get(target)?.setPage(pageNum)
  }

  private async onPageSizeChange(payload: PageDispatchPayload): Promise<void> {
    const target = payload.target || this.state.tableState.dataSourceId
    const pageSize = payload.pageSize ?? this.state.tableState.pagination.pageSize
    this.state.tableState.pagination.pageSize = pageSize
    this.state.tableState.pagination.pageNum = 1
    if (!target) return
    this.manager.get(target)?.setPageSize(pageSize)
  }

  private async onSortChange(payload: PageDispatchPayload): Promise<void> {
    const target = payload.target || this.state.tableState.dataSourceId
    const sort = payload.sort ?? null
    this.state.tableState.sort = sort
    if (!target) return
    this.manager.get(target)?.setSort(sort)
  }

  // --- Generic DataSource command ----------------------------------------

  private async onDataSourceCommand(payload: PageDispatchPayload): Promise<void> {
    const target = payload.target
    const op = payload.op
    if (!target || !op) {
      console.warn('[PageRuntime] datasource.command missing target/op')
      return
    }
    const ds = this.manager.get(target) as any
    if (!ds || typeof ds[op] !== 'function') {
      console.warn(`[PageRuntime] datasource.command: op "${op}" not found on "${target}"`)
      return
    }
    this.bindDataSource(target)
    await ds[op](payload.args)
  }

  // --- Page --------------------------------------------------------------

  private async onPageRefresh(payload: PageDispatchPayload): Promise<void> {
    this.state.refreshTrigger++
    const target = payload.target
    if (target) {
      this.bindDataSource(target)
      await this.manager.reload(target)
    } else {
      await Promise.all(this.manager.values().map(ds => ds.refresh()))
    }
  }

  private async onPageReset(payload: PageDispatchPayload): Promise<void> {
    await this.onSearchReset(payload)
    this.state.refreshTrigger++
  }

  // --- Table Row Action -------------------------------------------------

  /**
   * table.rowAction：Row 上的按钮触发（查看 / 编辑 / 删除 等）
   * - 写入 currentRow（快照）
   * - 若 payload.name 指定，则同时打开对应 Dialog / Drawer（默认 dialog；overlayTarget 可指定）
   * 对齐 dialog-runtime.md §3.1 打开流程
   */
  private async onRowAction(payload: PageDispatchPayload): Promise<void> {
    if (payload.row !== undefined) {
      this.state.currentRow = payload.row
    }
    if (payload.name) {
      const overlayKind =
        (payload as any).overlayTarget === 'drawer' ? 'drawer.open' : 'dialog.open'
      await this.dispatch(overlayKind, {
        name: payload.name,
        row: payload.row,
        context: payload.context,
      })
    }
  }

  // --- Dialog / Drawer 分支 ----------------------------------------------

  /** 打开 Overlay（dialog / drawer 通用） */
  private onOverlayOpen(
    bucket: 'dialogState' | 'drawerState',
    payload: PageDispatchPayload
  ): void {
    const name = payload.name
    if (!name) {
      console.warn(`[PageRuntime] ${bucket}.open missing "name"`)
      return
    }
    // 若打开时携带 row，写入 currentRow（供子树 bindings 消费）
    if (payload.row !== undefined) {
      this.state.currentRow = payload.row
    }
    const entry = this.state[bucket][name] || {
      visible: false,
      loading: false,
      context: null,
      openedAt: 0,
    }
    this.state[bucket] = {
      ...this.state[bucket],
      [name]: {
        ...entry,
        visible: true,
        context: payload.context ?? entry.context ?? null,
        openedAt: Date.now(),
      },
    }
  }

  /** 关闭 Overlay */
  private onOverlayClose(
    bucket: 'dialogState' | 'drawerState',
    payload: PageDispatchPayload
  ): void {
    const name = payload.name
    if (!name) {
      console.warn(`[PageRuntime] ${bucket}.close missing "name"`)
      return
    }
    const entry = this.state[bucket][name]
    if (!entry) return
    this.state[bucket] = {
      ...this.state[bucket],
      [name]: {
        ...entry,
        visible: false,
        loading: false,
      },
    }
    // destroyOnClose = true 时清空 currentRow / context（对齐 dialog-runtime.md §3.5）
    if (payload.destroyOnClose === true) {
      this.state.currentRow = null
      this.state[bucket] = {
        ...this.state[bucket],
        [name]: {
          ...this.state[bucket][name],
          context: null,
        },
      }
    }
  }

  // --- 内部：从 DataSource.state 反投影到 tableState ----------------------

  private watchDataSource(ds: DataSource<any>): WatchStopHandle {
    // 立即同步一次
    this.projectToTableState(ds)
    return watch(
      // 观察响应式 state 的关键字段（保守写法：整体 shallow 观察）
      () => [ds.state.status, ds.state.data, ds.state.meta.total, ds.state.error],
      () => this.projectToTableState(ds),
      { deep: false }
    )
  }

  private projectToTableState(ds: DataSource<any>): void {
    const st = ds.state
    const t: PageTableState = this.state.tableState
    // 数据（只读投影）；确保始终为数组，供 Table 消费
    t.data = Array.isArray(st.data) ? (st.data as any[]) : st.data ? [st.data as any] : []
    // Loading（loading + refreshing 都视为 loading）
    t.loading = st.status === 'loading' || st.status === 'refreshing'
    // 分页
    if (typeof st.meta.total === 'number') t.pagination.total = st.meta.total
    if (typeof st.meta.page === 'number') t.pagination.pageNum = st.meta.page
    if (typeof st.meta.pageSize === 'number') t.pagination.pageSize = st.meta.pageSize
    // Error
    t.error = (st.error as DataSourceError | null) || null
  }
}

// --- helpers --------------------------------------------------------------

function shallowEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  const ka = Object.keys(a || {})
  const kb = Object.keys(b || {})
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (a[k] !== b[k]) return false
  }
  return true
}
