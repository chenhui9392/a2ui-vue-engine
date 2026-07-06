/*
 * @Author: hui.chenn
 * @Description: DataSource 核心 - 单个数据源实例
 *   支持 GET/POST/PUT/DELETE、分页、Loading、Refresh、Search、Cache、Retry、统一错误处理
 *   与具体消费方（Table / Tree / Chart / Description）解耦，仅暴露标准 state
 * @Date: 2026-07-01 10:00:00
 */
import { reactive, computed, ComputedRef, watch, WatchStopHandle } from 'vue'
import type {
  DataSourceConfig,
  DataSourceError,
  DataSourceFetchOptions,
  DataSourceMeta,
  DataSourceRuntimeParams,
  DataSourceState,
  DataSourceTransport,
} from './types'
import type { ApiContext } from '../../infra/api'
import { defaultTransport, createTransportError } from './transport'
import { DataSourceCacheStore, stableKey } from './cache'
import { pickByPath, sleep, debounce } from './utils'

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_INITIAL_PAGE = 1
const DEFAULT_DEBOUNCE = 300

/** DataSource 选项 */
export interface DataSourceOptions {
  /** 数据源唯一 id */
  id: string
  /** 声明配置 */
  config: DataSourceConfig
  /** 可选的自定义 transport */
  transport?: DataSourceTransport
  /**
   * 上下文提供者（用于 cache key 隔离 env/tenant）。
   * 由 DataSourceManager / PageRuntime 注入；缺省时 cache key 不含 env/tenant 维度。
   */
  contextProvider?: () => ApiContext
}

/** 单个 DataSource 实例 */
export class DataSource<T = any> {
  readonly id: string
  private config: DataSourceConfig
  private transport: DataSourceTransport
  private cache: DataSourceCacheStore<any>
  private contextProvider?: () => ApiContext

  /** 响应式 state */
  public readonly state: DataSourceState<T>

  /** 是否已首次加载过 */
  private inited = false

  /** 当前 in-flight 请求控制器 */
  private inflightController: AbortController | null = null
  /** 当前 in-flight 请求的 tag（避免过期响应写回）*/
  private inflightTag = 0

  private debouncedSetParams: (partial: Partial<DataSourceRuntimeParams>) => void
  private stopWatchers: WatchStopHandle[] = []

  constructor(options: DataSourceOptions) {
    this.id = options.id
    this.config = normalizeConfig(options.config)
    this.transport = options.transport || defaultTransport
    this.contextProvider = options.contextProvider
    this.cache = new DataSourceCacheStore({
      ttl: this.config.cache?.ttl,
      maxSize: this.config.cache?.maxSize,
    })

    this.state = reactive<DataSourceState<T>>({
      status: 'idle',
      data: null,
      meta: initialMeta(this.config),
      error: null,
      params: initialParams(this.config),
      updatedAt: 0,
    }) as DataSourceState<T>

    const debounceMs = this.config.debounce ?? DEFAULT_DEBOUNCE
    this.debouncedSetParams = debounce((partial: Partial<DataSourceRuntimeParams>) => {
      this.applyParamsAndFetch(partial, { debounced: true })
    }, debounceMs)
  }

  // --- Public API --------------------------------------------------------

  /**
   * 首次加载（幂等：多次调用只触发一次首屏拉取）。
   */
  async init(): Promise<void> {
    if (this.inited) return
    this.inited = true
    if (this.config.auto === false) return
    if (this.config.kind === 'static') {
      this.setStaticData()
      return
    }
    await this.fetch({ refresh: false })
  }

  /**
   * 强制拉取一次。默认作为「刷新」处理（保留旧数据）。
   */
  refresh(options?: DataSourceFetchOptions): Promise<void> {
    return this.fetch({ refresh: true, ...options })
  }

  /**
   * 触发一次请求。
   */
  async fetch(options?: DataSourceFetchOptions): Promise<void> {
    if (this.config.kind === 'static') {
      this.setStaticData()
      return
    }
    if (options?.params) {
      Object.assign(this.state.params, options.params)
    }
    await this.executeFetch({
      force: !!options?.force,
      refresh: options?.refresh ?? (this.state.status === 'success'),
    })
  }

  /** 更新页码（分页模式）*/
  setPage(page: number): void {
    this.state.params.page = page
    this.executeFetch({ refresh: true })
  }

  /** 更新每页大小（回到首页）*/
  setPageSize(pageSize: number): void {
    this.state.params.pageSize = pageSize
    this.state.params.page = this.config.pagination?.initialPage ?? DEFAULT_INITIAL_PAGE
    this.executeFetch({ refresh: true })
  }

  /** 更新 cursor（cursor 模式）*/
  setCursor(cursor: any): void {
    this.state.params.cursor = cursor
    this.executeFetch({ refresh: true })
  }

  /** 设置排序 */
  setSort(sort: DataSourceRuntimeParams['sort']): void {
    this.state.params.sort = sort
    this.state.params.page = this.config.pagination?.initialPage ?? DEFAULT_INITIAL_PAGE
    this.executeFetch({ refresh: true })
  }

  /** 设置搜索关键字（debounce）*/
  setSearch(search: string): void {
    this.state.params.search = search
    this.state.params.page = this.config.pagination?.initialPage ?? DEFAULT_INITIAL_PAGE
    this.debouncedSetParams({ search })
  }

  /** 设置筛选（debounce）*/
  setFilter(filter: Record<string, any>): void {
    this.state.params.filter = { ...filter }
    this.state.params.page = this.config.pagination?.initialPage ?? DEFAULT_INITIAL_PAGE
    this.debouncedSetParams({ filter })
  }

  /** 追加设置额外自定义参数 */
  setExtra(extra: Record<string, any>): void {
    this.state.params.extra = { ...(this.state.params.extra || {}), ...extra }
    this.executeFetch({ refresh: true })
  }

  /** 清空缓存 */
  invalidateCache(): void {
    this.cache.invalidate()
  }

  /** 取消进行中的请求 */
  abort(): void {
    if (this.inflightController) {
      this.inflightController.abort()
      this.inflightController = null
    }
  }

  /** 销毁：取消请求、清缓存、停 watcher */
  destroy(): void {
    this.abort()
    this.cache.invalidate()
    this.stopWatchers.forEach(stop => stop())
    this.stopWatchers = []
    this.debouncedSetParams.cancel?.()
  }

  /**
   * 监听外部字段变化：refreshOn 声明的字段变化时自动 refresh。
   * @param resolvePath 外部提供的取值函数（因为 DataSource 与 A2UIRoot.data 解耦）
   */
  bindRefreshOn(resolvePath: (path: string) => any): void {
    if (!this.config.refreshOn || this.config.refreshOn.length === 0) return
    for (const path of this.config.refreshOn) {
      const stop = watch(
        () => resolvePath(path),
        () => {
          this.refresh()
        }
      )
      this.stopWatchers.push(stop)
    }
  }

  // --- Selectors (computed 语法糖) ---------------------------------------

  get list(): ComputedRef<T[]> {
    return computed(() => {
      const d = this.state.data as any
      return Array.isArray(d) ? d : []
    })
  }

  get single(): ComputedRef<T | null> {
    return computed(() => {
      const d = this.state.data as any
      return Array.isArray(d) ? null : d
    })
  }

  get loading(): ComputedRef<boolean> {
    return computed(() => this.state.status === 'loading')
  }

  get refreshing(): ComputedRef<boolean> {
    return computed(() => this.state.status === 'refreshing')
  }

  get error(): ComputedRef<DataSourceError | null> {
    return computed(() => this.state.error)
  }

  get meta(): ComputedRef<DataSourceMeta> {
    return computed(() => this.state.meta)
  }

  // --- Internals ---------------------------------------------------------

  private setStaticData(): void {
    const raw = this.config.data
    const data = Array.isArray(raw) ? raw : raw ?? null
    this.state.data = data as any
    this.state.status = 'success'
    this.state.error = null
    this.state.updatedAt = Date.now()
    this.state.meta = {
      ...this.state.meta,
      total: Array.isArray(raw) ? raw.length : 0,
      hasMore: false,
    }
  }

  private applyParamsAndFetch(
    partial: Partial<DataSourceRuntimeParams>,
    _meta?: { debounced?: boolean }
  ): void {
    Object.assign(this.state.params, partial)
    this.executeFetch({ refresh: true })
  }

  private async executeFetch(options: { force?: boolean; refresh?: boolean }): Promise<void> {
    // apiKey 与 url 至少有一个；apiKey 由 transport 内部经 ApiResolver 解析为 url
    if (
      !this.config.request?.apiKey &&
      !this.config.request?.url &&
      this.config.kind !== 'static'
    ) {
      this.state.status = 'error'
      this.state.error = createTransportError(
        'CONFIG_MISSING_URL',
        `DataSource[${this.id}] missing request.apiKey or request.url`
      )
      return
    }

    // Cache
    const cacheKey = this.buildCacheKey()
    if (this.config.cache?.enabled && !options.force) {
      const cached = this.cache.get(cacheKey)
      if (cached !== undefined) {
        this.applyResponse(cached, { fromCache: true })
        return
      }
    }

    // 前置状态
    this.state.status = options.refresh && this.state.data ? 'refreshing' : 'loading'
    this.state.error = null

    // 中断上一次
    this.abort()
    const controller = new AbortController()
    this.inflightController = controller
    const tag = ++this.inflightTag

    try {
      const raw = await this.fetchWithRetry(controller.signal)
      // 过期响应：忽略
      if (tag !== this.inflightTag) return

      if (this.config.cache?.enabled) {
        this.cache.set(cacheKey, raw)
      }
      this.applyResponse(raw, { fromCache: false })
    } catch (err: any) {
      if (tag !== this.inflightTag) return
      const dsError = normalizeError(err)
      // AbortError 主动忽略
      if (dsError.code === 'ABORTED') return
      this.state.status = 'error'
      this.state.error = dsError
    } finally {
      if (this.inflightController === controller) {
        this.inflightController = null
      }
    }
  }

  private async fetchWithRetry(signal: AbortSignal): Promise<any> {
    const retryConfig = this.config.retry
    const count = retryConfig?.count ?? 0
    const initialDelay = retryConfig?.delay ?? 300
    const backoff = retryConfig?.backoff ?? 2

    let attempt = 0
    let lastError: DataSourceError | null = null

    while (attempt <= count) {
      try {
        return await this.transport(
          this.config.request!,
          snapshotParams(this.state.params),
          signal
        )
      } catch (err) {
        lastError = normalizeError(err)
        if (lastError.code === 'ABORTED') throw err
        const retriable = retryConfig?.isRetryable
          ? retryConfig.isRetryable(lastError)
          : lastError.retriable !== false
        if (!retriable || attempt >= count) throw err
        const delay = initialDelay * Math.pow(backoff, attempt)
        attempt++
        await sleep(delay, signal)
      }
    }

    throw lastError || createTransportError('UNKNOWN', 'Unknown fetch error')
  }

  private applyResponse(raw: any, meta: { fromCache: boolean }): void {
    const map = this.config.request?.responseMap || {}
    const paginationMode = this.config.pagination?.mode || 'page'

    let list: any = undefined
    let single: any = undefined
    if (map.list) {
      list = pickByPath(raw, map.list)
    } else if (Array.isArray(raw)) {
      list = raw
    } else if (Array.isArray(raw?.list)) {
      list = raw.list
    } else if (Array.isArray(raw?.data)) {
      list = raw.data
    } else if (Array.isArray(raw?.items)) {
      list = raw.items
    }

    if (map.data) {
      single = pickByPath(raw, map.data)
    } else if (list === undefined) {
      single = raw?.data !== undefined ? raw.data : raw
    }

    const total =
      (map.total ? pickByPath(raw, map.total) : raw?.total ?? raw?.count) ??
      (Array.isArray(list) ? list.length : 0)

    let hasMore: boolean
    let cursor: any = this.state.meta.cursor
    let nextCursor: any = null

    if (paginationMode === 'cursor') {
      cursor = map.cursor ? pickByPath(raw, map.cursor) : raw?.cursor ?? cursor
      nextCursor = map.nextCursor ? pickByPath(raw, map.nextCursor) : raw?.nextCursor ?? null
      hasMore = map.hasMore
        ? !!pickByPath(raw, map.hasMore)
        : !!(nextCursor ?? raw?.hasMore)
    } else {
      const page = this.state.params.page ?? 1
      const pageSize = this.state.params.pageSize ?? DEFAULT_PAGE_SIZE
      hasMore = page * pageSize < (total || 0)
    }

    this.state.data = (list ?? single) as any
    this.state.meta = {
      page: this.state.params.page ?? this.state.meta.page,
      pageSize: this.state.params.pageSize ?? this.state.meta.pageSize,
      total: Number(total || 0),
      hasMore,
      cursor,
      nextCursor,
    }
    this.state.status = 'success'
    this.state.error = null
    if (!meta.fromCache) {
      this.state.updatedAt = Date.now()
    } else if (this.state.updatedAt === 0) {
      this.state.updatedAt = Date.now()
    }
  }

  private buildCacheKey(): string {
    const ctx = this.contextProvider?.()
    return stableKey({
      id: this.id,
      apiKey: this.config.request?.apiKey,
      url: this.config.request?.url,
      method: this.config.request?.method,
      params: this.state.params,
      // env / tenant 维度隔离，避免不同环境 / 租户共享缓存
      env: ctx?.env,
      tenant: ctx?.tenant,
    })
  }
}

// --- Helpers ---------------------------------------------------------------

function normalizeConfig(config: DataSourceConfig): DataSourceConfig {
  return {
    kind: config.kind ?? 'http',
    auto: config.auto ?? true,
    ...config,
  }
}

function initialParams(config: DataSourceConfig): DataSourceRuntimeParams {
  const paginationEnabled = config.pagination?.enabled !== false
  return {
    page: paginationEnabled ? config.pagination?.initialPage ?? DEFAULT_INITIAL_PAGE : undefined,
    pageSize: paginationEnabled ? config.pagination?.pageSize ?? DEFAULT_PAGE_SIZE : undefined,
    cursor: null,
    sort: null,
    filter: {},
    search: '',
    extra: {},
  }
}

function initialMeta(config: DataSourceConfig): DataSourceMeta {
  return {
    page: config.pagination?.initialPage ?? DEFAULT_INITIAL_PAGE,
    pageSize: config.pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
    total: 0,
    hasMore: false,
    cursor: null,
    nextCursor: null,
  }
}

function snapshotParams(p: DataSourceRuntimeParams): DataSourceRuntimeParams {
  return {
    page: p.page,
    pageSize: p.pageSize,
    cursor: p.cursor,
    sort: p.sort ? { ...p.sort } : null,
    filter: p.filter ? { ...p.filter } : {},
    search: p.search,
    extra: p.extra ? { ...p.extra } : {},
  }
}

function normalizeError(err: any): DataSourceError {
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    return err as DataSourceError
  }
  return createTransportError(
    'UNKNOWN',
    typeof err?.message === 'string' ? err.message : String(err),
    { cause: err, retriable: false }
  )
}
