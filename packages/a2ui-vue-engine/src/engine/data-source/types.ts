/*
 * @Author: hui.chenn
 * @Description: DataSource 类型定义 - 与 architecture/datasource.md 对齐
 *   通用数据源协议，与具体消费方（Table / Tree / Chart / Description）解耦。
 * @Date: 2026-07-01 10:00:00
 */

/** HTTP 方法 */
export type DataSourceHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/** 分页模式 */
export type DataSourcePaginationMode = 'page' | 'cursor'

/** 数据源加载状态 */
export type DataSourceStatus = 'idle' | 'loading' | 'refreshing' | 'success' | 'error'

/** 数据源类型 */
export type DataSourceKind = 'http' | 'static'

/** 请求配置 */
export interface DataSourceRequest {
  /**
   * API Key（优先于 url）：由 ApiResolver 动态解析为 url + method + ...
   * 形如 'user.list' / 'order.detail'，与 Page JSON 中的 apiKey 一致。
   * 未注入 ApiResolver 时回退到 url 字段。
   */
  apiKey?: string
  url?: string
  method?: DataSourceHttpMethod
  /** 查询字符串参数 */
  params?: Record<string, any>
  /** 请求体 */
  body?: any
  /** 请求头 */
  headers?: Record<string, string>
  /** 超时（毫秒）*/
  timeout?: number
  /** 携带凭证 */
  credentials?: RequestCredentials
  /** 响应字段映射：list / total / cursor / hasMore */
  responseMap?: DataSourceResponseMap
}

/** 响应字段映射 - 把不同后端结构规范化为统一 state */
export interface DataSourceResponseMap {
  /** 数据数组字段路径（如 'data.list' 或 'items'）*/
  list?: string
  /** 总数字段路径 */
  total?: string
  /** 单条数据字段路径（Description 场景）*/
  data?: string
  /** cursor 字段路径 */
  cursor?: string
  /** nextCursor 字段路径 */
  nextCursor?: string
  /** hasMore 字段路径 */
  hasMore?: string
}

/** 分页配置 */
export interface DataSourcePagination {
  enabled?: boolean
  mode?: DataSourcePaginationMode
  /** 首页页码，默认 1 */
  initialPage?: number
  /** 每页大小，默认 20 */
  pageSize?: number
  /** 请求参数名映射：默认 page/pageSize */
  paramsMap?: {
    page?: string
    pageSize?: string
    cursor?: string
  }
}

/** 缓存配置 */
export interface DataSourceCache {
  enabled?: boolean
  /** 过期时间（毫秒），默认 60_000 */
  ttl?: number
  /** 最大缓存条目数，默认 32 */
  maxSize?: number
}

/** 重试配置 */
export interface DataSourceRetry {
  count?: number
  /** 初始延迟（毫秒）*/
  delay?: number
  /** 退避倍率，默认 2（指数退避）*/
  backoff?: number
  /** 判断错误是否可重试；默认：网络错误 / 5xx / timeout */
  isRetryable?: (error: DataSourceError) => boolean
}

/** 数据源声明配置 */
export interface DataSourceConfig {
  /** 数据源类型 */
  kind?: DataSourceKind
  /** 请求配置（kind = 'http'）*/
  request?: DataSourceRequest
  /** 静态数据（kind = 'static'）*/
  data?: any
  /** 分页配置 */
  pagination?: DataSourcePagination
  /** 缓存配置 */
  cache?: DataSourceCache
  /** 重试配置 */
  retry?: DataSourceRetry
  /** 是否自动首次加载，默认 true */
  auto?: boolean
  /** 依赖字段变更时自动 refresh（预留，运行时按外部驱动）*/
  refreshOn?: string[]
  /** debounce 毫秒，默认 300ms（search/filter 场景）*/
  debounce?: number
}

/** 请求参数（合并静态 params + 分页 / 排序 / 筛选 / 搜索）*/
export interface DataSourceRuntimeParams {
  /** 页码 */
  page?: number
  /** 页大小 */
  pageSize?: number
  /** cursor（cursor 模式）*/
  cursor?: any
  /** 排序：{ field, order: 'asc' | 'desc' } */
  sort?: { field: string; order: 'asc' | 'desc' } | null
  /** 筛选条件 */
  filter?: Record<string, any>
  /** 搜索关键字 */
  search?: string
  /** 额外自定义参数 */
  extra?: Record<string, any>
}

/** 分页 / 元信息 */
export interface DataSourceMeta {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
  cursor: any
  nextCursor: any
}

/** 统一错误对象 */
export interface DataSourceError {
  code: string
  message: string
  status?: number
  cause?: unknown
  retriable?: boolean
}

/** 数据源运行时状态 */
export interface DataSourceState<T = any> {
  status: DataSourceStatus
  /** 主数据：list 场景为数组，data 场景为对象 */
  data: T | T[] | null
  /** 分页 / 元信息 */
  meta: DataSourceMeta
  /** 错误信息 */
  error: DataSourceError | null
  /** 当前请求参数快照（分页 / 排序 / 筛选 / 搜索）*/
  params: DataSourceRuntimeParams
  /** 最近一次成功刷新时间戳 */
  updatedAt: number
}

/** 触发一次请求的 options */
export interface DataSourceFetchOptions {
  /** 强制跳过缓存 */
  force?: boolean
  /** 覆盖当前 runtime params（partial 合并）*/
  params?: Partial<DataSourceRuntimeParams>
  /** 是否作为刷新（保留旧数据），默认 auto 推断 */
  refresh?: boolean
}

/** Transport - 可插拔请求执行器 */
export type DataSourceTransport = (
  request: DataSourceRequest,
  runtimeParams: DataSourceRuntimeParams,
  signal?: AbortSignal
) => Promise<any>
