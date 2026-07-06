/*
 * @Author: hui.chenn
 * @Description: HttpClient 契约定义
 *   参考 packages/a2ui-docs/docs/architecture/http-client.md
 *   - HttpClient 只做传输治理（BaseURL / Header / Token / Timeout / Cancel / Interceptor / Error 归一化）
 *   - Adapter 只做具体协议原语（fetch / axios / electron / tauri / mock）
 *   - Runtime / DataSource 不直接依赖 axios / fetch
 * @Date: 2026-07-02 10:00:00
 */

/** HTTP 方法 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'

/** 响应体类型 */
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream'

/** 请求元信息（供 audit / adapter 路由使用） */
export interface HttpRequestMeta {
  /** 请求来源标识，如 "datasource:orderList" */
  source?: string
  /** 请求操作，如 "fetch" / "refresh" */
  op?: string
  /** adapter 路由 tag（供 HttpClient 选择 Adapter） */
  adapter?: string
  /** 是否跳过认证注入 */
  skipAuth?: boolean
  /** 其他自定义元信息 */
  [key: string]: any
}

/** 统一的请求描述（HttpClient 层） */
export interface HttpRequest {
  /** 完整 URL 或相对路径（相对 baseURL） */
  url: string
  /** HTTP 方法 */
  method?: HttpMethod
  /** 请求头 */
  headers?: Record<string, string>
  /** query 参数 */
  query?: Record<string, any>
  /** 请求体 */
  body?: any
  /** 超时 ms */
  timeout?: number
  /** 中断信号 */
  signal?: AbortSignal
  /** 响应类型 */
  responseType?: HttpResponseType
  /** 是否携带凭证（Cookie / SameSite） */
  withCredentials?: boolean
  /** 上传进度 */
  onUploadProgress?: (evt: HttpProgressEvent) => void
  /** 下载进度 */
  onDownloadProgress?: (evt: HttpProgressEvent) => void
  /** 请求元信息 */
  meta?: HttpRequestMeta
}

/** 进度事件 */
export interface HttpProgressEvent {
  loaded: number
  total?: number
  progress?: number
}

/** 统一的响应描述（HttpClient 层） */
export interface HttpResponse<T = any> {
  /** HTTP status */
  status: number
  /** 是否 2xx */
  ok: boolean
  /** 响应头（key 小写） */
  headers: Record<string, string>
  /** 已反序列化的响应体 */
  data: T
  /** 原始响应（可选，供调试） */
  raw?: unknown
  /** 回填请求（供日志 / trace） */
  request: HttpRequest
  /** 元信息（如 traceId / duration） */
  meta?: Record<string, any>
}

/** 统一的错误对象（HttpClient 层） */
export interface HttpError<T = any> {
  /** 归一化错误码 */
  code: HttpErrorCode
  /** 错误消息 */
  message: string
  /** HTTP status（若适用） */
  status?: number
  /** 是否可重试（默认根据 code 判定） */
  retriable: boolean
  /** 原始错误 */
  cause?: unknown
  /** 关联请求 */
  request?: HttpRequest
  /** 若有响应体（如 4xx/5xx） */
  response?: HttpResponse<T>
}

/** 归一化错误码 */
export type HttpErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'PARSE_ERROR'
  | 'CONFIG'
  | `HTTP_${number}`
  | 'UNKNOWN'

/** Adapter 契约：把 HttpRequest 送出去，把 HttpResponse 拿回来 */
export interface HttpAdapter {
  /** Adapter 名称 */
  readonly name: string
  /** 发送请求 */
  send<T = any>(request: HttpRequest): Promise<HttpResponse<T>>
}

/** Request 拦截器 */
export type HttpRequestInterceptor = (
  request: HttpRequest
) => HttpRequest | Promise<HttpRequest>

/** Response 拦截器 */
export type HttpResponseInterceptor = <T = any>(
  response: HttpResponse<T>
) => HttpResponse<T> | Promise<HttpResponse<T>>

/** Error 拦截器；返回 HttpResponse 视为成功恢复 */
export type HttpErrorInterceptor = (
  error: HttpError
) => HttpError | HttpResponse | Promise<HttpError | HttpResponse>

/** AuthProvider - 由宿主注入的认证提供者 */
export interface AuthProvider {
  /** 获取当前 Token；null 表示未登录 */
  getToken(): string | null | Promise<string | null>
  /** 401 时尝试刷新；返回新 Token 或 null */
  refreshToken?(): string | null | Promise<string | null>
  /** 401 且刷新失败时的钩子 */
  onUnauthorized?(): void
  /** 附加 Token 的 header 名称，默认 Authorization */
  headerName?: string
  /** Token scheme，默认 "Bearer" */
  scheme?: string
}

/** HttpClient 构造配置 */
export interface HttpClientOptions {
  /** 默认 BaseURL */
  baseURL?: string
  /** 默认请求头 */
  headers?: Record<string, string>
  /** 默认超时 ms */
  timeout?: number
  /** 默认 withCredentials */
  withCredentials?: boolean
  /** Adapter；缺省使用 FetchAdapter */
  adapter?: HttpAdapter
  /** 认证提供者 */
  auth?: AuthProvider
  /** Request 拦截器 */
  requestInterceptors?: HttpRequestInterceptor[]
  /** Response 拦截器 */
  responseInterceptors?: HttpResponseInterceptor[]
  /** Error 拦截器 */
  errorInterceptors?: HttpErrorInterceptor[]
}

/** HttpClient 对外接口 */
export interface IHttpClient {
  request<T = any>(config: HttpRequest): Promise<HttpResponse<T>>
  get<T = any>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>): Promise<HttpResponse<T>>
  post<T = any>(url: string, body?: any, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>>
  put<T = any>(url: string, body?: any, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>>
  patch<T = any>(url: string, body?: any, config?: Omit<HttpRequest, 'url' | 'method' | 'body'>): Promise<HttpResponse<T>>
  delete<T = any>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>): Promise<HttpResponse<T>>

  /** 切换 Adapter */
  setAdapter(adapter: HttpAdapter): void
  /** 设置 / 更换认证提供者 */
  setAuth(auth: AuthProvider | undefined): void
  /** 添加请求拦截器；返回 remove 函数 */
  useRequestInterceptor(fn: HttpRequestInterceptor): () => void
  /** 添加响应拦截器；返回 remove 函数 */
  useResponseInterceptor(fn: HttpResponseInterceptor): () => void
  /** 添加错误拦截器；返回 remove 函数 */
  useErrorInterceptor(fn: HttpErrorInterceptor): () => void
}
