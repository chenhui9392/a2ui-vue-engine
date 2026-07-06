/*
 * @Author: hui.chenn
 * @Description: DataSourceManager - 管理一组 DataSource 实例（可选高层聚合）
 *   与具体消费方（Table / Tree / Chart / Description）无关；由宿主 / Page Runtime 使用。
 *
 *   对齐规范：
 *   - datasource-binding.md：dataSources 声明 + kind + paramsMap + responseMap
 *   - datasource-execution.md：可执行单元、6 阶段生命周期、单一调度
 *   - http-client.md：Runtime 不直接依赖 fetch/axios，一律经 HttpClient 层
 *
 *   Manager 只做：
 *   - create / register / get / has / remove
 *   - execute()  - 执行任意 DataSource 的一次请求
 *   - cancel()   - 中断指定 DataSource 的 in-flight 请求
 *   - reload()   - 保留当前参数重新请求（等价 refresh）
 *   - init / destroy 生命周期
 *
 *   response mapping / loading / error / cache 已内建于 DataSource；
 *   Manager 不重复实现，避免职责漂移。
 * @Date: 2026-07-01 10:00:00
 */
import { DataSource, DataSourceOptions } from './DataSource'
import type {
  DataSourceConfig,
  DataSourceFetchOptions,
  DataSourceTransport,
} from './types'
import { createHttpClientTransport } from './httpClientTransport'
import type { HttpClient } from '../../infra/http'
import type { ApiResolver, ApiContext } from '../../infra/api'

/** 一次 execute 的可选项 */
export interface DataSourceExecuteOptions extends DataSourceFetchOptions {
  /** 是否作为 reload（保留旧数据 + 保留 params），默认 true */
  reload?: boolean
}

export interface DataSourceManagerOptions {
  /** 自定义 transport（优先级最高） */
  transport?: DataSourceTransport
  /** 若提供 HttpClient，则由其构造默认 transport（Runtime 不直接依赖 fetch） */
  httpClient?: HttpClient
  /** ApiResolver；注入后默认 transport 会动态解析 request.apiKey */
  apiResolver?: ApiResolver
  /** 上下文提供者；用于 ApiResolver.resolve + DataSource.buildCacheKey（env/tenant 隔离） */
  context?: () => ApiContext
}

export class DataSourceManager {
  private map = new Map<string, DataSource<any>>()
  private transport?: DataSourceTransport
  private httpClient?: HttpClient
  private apiResolver?: ApiResolver
  private contextProvider?: () => ApiContext

  constructor(options?: DataSourceManagerOptions) {
    this.httpClient = options?.httpClient
    this.apiResolver = options?.apiResolver
    this.contextProvider = options?.context
    // 优先级：显式 transport > HttpClient transport（含 resolver）> DataSource 内建默认 fetch transport
    if (options?.transport) {
      this.transport = options.transport
    } else if (this.httpClient) {
      this.transport = createHttpClientTransport(this.httpClient, {
        resolver: this.apiResolver,
        contextProvider: this.contextProvider,
      })
    }
  }

  // --- 注册 / 查询 --------------------------------------------------------

  /** 注册一个 DataSource；若同 id 已存在则先销毁旧实例 */
  create<T = any>(options: DataSourceOptions): DataSource<T> {
    if (this.map.has(options.id)) {
      this.map.get(options.id)?.destroy()
    }
    const ds = new DataSource<T>({
      ...options,
      transport: options.transport || this.transport,
      // 透传 contextProvider 给 DataSource（用于 buildCacheKey 隔离 env/tenant）
      contextProvider: options.contextProvider || this.contextProvider,
    })
    this.map.set(options.id, ds)
    return ds
  }

  /** 声明式批量注册 */
  register(sources: Record<string, DataSourceConfig>): void {
    for (const [id, config] of Object.entries(sources || {})) {
      this.create({ id, config })
    }
  }

  get<T = any>(id: string): DataSource<T> | undefined {
    return this.map.get(id) as DataSource<T> | undefined
  }

  has(id: string): boolean {
    return this.map.has(id)
  }

  /** 全部 DataSource id 列表 */
  ids(): string[] {
    return Array.from(this.map.keys())
  }

  /** 全部 DataSource 实例 */
  values(): DataSource<any>[] {
    return Array.from(this.map.values())
  }

  // --- 统一调度入口 -------------------------------------------------------

  /**
   * 执行一次 DataSource 请求。
   *
   * 契约（对齐 datasource-execution.md §5 六阶段生命周期）：
   *   start → request → response → commit → error → complete
   *
   * @param id      DataSource id
   * @param options 可选：force / params / reload
   * @returns Promise<void>；错误经 state.error 呈现，不主动 reject
   */
  execute(id: string, options?: DataSourceExecuteOptions): Promise<void> {
    const ds = this.map.get(id)
    if (!ds) {
      // 未注册视为无操作，避免宿主必须先 has 判断
      return Promise.resolve()
    }
    const { reload = true, ...fetchOptions } = options || {}
    return ds.fetch({ ...fetchOptions, refresh: fetchOptions.refresh ?? reload })
  }

  /**
   * 中断指定 DataSource 的 in-flight 请求（对齐 datasource-execution.md §5.4 并发规则）。
   * 无 in-flight 则 no-op；ABORTED 静默，不改 state.error。
   */
  cancel(id: string): void {
    this.map.get(id)?.abort()
  }

  /** 中断所有 in-flight 请求 */
  cancelAll(): void {
    this.map.forEach(ds => ds.abort())
  }

  /**
   * 保留当前参数重新请求（对齐 datasource-binding.md §9.4 & datasource-execution.md §10）。
   * 若 DataSource 有旧数据，走 refreshing；否则走 loading。
   */
  reload(id: string, options?: DataSourceFetchOptions): Promise<void> {
    const ds = this.map.get(id)
    if (!ds) return Promise.resolve()
    return ds.refresh(options)
  }

  /** 触发单个 DataSource 刷新（保留原 API 兼容） */
  refresh(id: string, options?: DataSourceFetchOptions): Promise<void> {
    return this.reload(id, options)
  }

  /** 触发全部 DataSource 刷新 */
  refreshAll(): Promise<void[]> {
    return Promise.all(Array.from(this.map.values()).map(ds => ds.refresh()))
  }

  /**
   * 失效指定 DataSource 的缓存（cache 预留能力入口）。
   * 已由 DataSource.invalidateCache() 实现；此处仅暴露 Manager 层统一入口。
   */
  invalidateCache(id?: string): void {
    if (id) {
      this.map.get(id)?.invalidateCache()
    } else {
      this.map.forEach(ds => ds.invalidateCache())
    }
  }

  // --- 生命周期 -----------------------------------------------------------

  /** 首屏批量初始化（config.auto === true 的实例才会实际发起请求） */
  initAll(): Promise<void[]> {
    return Promise.all(Array.from(this.map.values()).map(ds => ds.init()))
  }

  /** 卸载单个数据源 */
  remove(id: string): void {
    const ds = this.map.get(id)
    if (ds) {
      ds.destroy()
      this.map.delete(id)
    }
  }

  /** 销毁全部 */
  destroy(): void {
    this.map.forEach(ds => ds.destroy())
    this.map.clear()
  }

  /** 遍历 */
  forEach(fn: (ds: DataSource<any>, id: string) => void): void {
    this.map.forEach((v, k) => fn(v, k))
  }

  // --- HttpClient 联动 ----------------------------------------------------

  /** 替换 HttpClient 时同步更新默认 transport（不影响已实例化的 DataSource） */
  setHttpClient(client: HttpClient): void {
    this.httpClient = client
    // 若外部未显式提供 transport，则同步替换（保留 resolver + contextProvider）
    if (!this.transport || (this.transport as any).__fromHttpClient) {
      this.transport = createHttpClientTransport(client, {
        resolver: this.apiResolver,
        contextProvider: this.contextProvider,
      })
    }
  }

  /** 替换 ApiResolver（仅影响后续通过默认 transport 发起的请求） */
  setApiResolver(resolver: ApiResolver | undefined): void {
    this.apiResolver = resolver
    if (this.httpClient && (!this.transport || (this.transport as any).__fromHttpClient)) {
      this.transport = createHttpClientTransport(this.httpClient, {
        resolver: this.apiResolver,
        contextProvider: this.contextProvider,
      })
    }
  }

  /** 替换上下文提供者（影响后续新建 DataSource 的 cache key + 新请求的 resolve） */
  setContext(contextProvider: (() => ApiContext) | undefined): void {
    this.contextProvider = contextProvider
    if (this.httpClient && (!this.transport || (this.transport as any).__fromHttpClient)) {
      this.transport = createHttpClientTransport(this.httpClient, {
        resolver: this.apiResolver,
        contextProvider: this.contextProvider,
      })
    }
  }
}
