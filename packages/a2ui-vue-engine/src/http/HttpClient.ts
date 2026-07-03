/*
 * @Author: hui.chenn
 * @Description: HttpClient - Runtime 网络门面
 *   参考 packages/a2ui-docs/docs/architecture/http-client.md
 *
 *   职责：
 *   - BaseURL / Header / Timeout / Cancel / Interceptor / Auth
 *   - 归一化 HttpRequest → HttpResponse / HttpError
 *   - 委派给 Adapter 发送
 *   - 语义糖：get / post / put / patch / delete
 *
 *   非职责：
 *   - 不解析业务字段（code / list / total）
 *   - 不做缓存 / 重试（属于 DataSource）
 *   - 不管 pageState / loading（属于 Runtime）
 * @Date: 2026-07-02 10:00:00
 */
import type {
  AuthProvider,
  HttpAdapter,
  HttpClientOptions,
  HttpError,
  HttpErrorInterceptor,
  HttpRequest,
  HttpRequestInterceptor,
  HttpResponse,
  HttpResponseInterceptor,
  IHttpClient,
} from './types'
import {
  joinURL,
  mergeHeaders,
  normalizeError,
  shouldSendBody,
} from './utils'
import { defaultFetchAdapter } from './adapters/FetchAdapter'

/** 是否是 HttpResponse 结构（拦截器返回值判定） */
function isHttpResponse(v: any): v is HttpResponse {
  return (
    v &&
    typeof v === 'object' &&
    'status' in v &&
    'ok' in v &&
    'headers' in v &&
    'data' in v &&
    'request' in v
  )
}

/** 默认请求头（object body 会补上 Content-Type） */
const DEFAULT_JSON_HEADERS: Record<string, string> = {
  Accept: 'application/json, text/plain, */*',
}

/**
 * HttpClient 实现
 *
 * 使用示例：
 * ```
 * const http = new HttpClient({
 *   baseURL: '/api',
 *   headers: { 'X-Client': 'a2ui' },
 *   timeout: 15000,
 *   auth: { getToken: () => localStorage.getItem('token') },
 * })
 * const res = await http.get<UserVO>('/users/1')
 * ```
 */
export class HttpClient implements IHttpClient {
  private baseURL?: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout?: number
  private defaultWithCredentials?: boolean
  private adapter: HttpAdapter
  private auth?: AuthProvider

  private requestInterceptors: HttpRequestInterceptor[] = []
  private responseInterceptors: HttpResponseInterceptor[] = []
  private errorInterceptors: HttpErrorInterceptor[] = []

  constructor(options: HttpClientOptions = {}) {
    this.baseURL = options.baseURL
    this.defaultHeaders = { ...DEFAULT_JSON_HEADERS, ...(options.headers || {}) }
    this.defaultTimeout = options.timeout
    this.defaultWithCredentials = options.withCredentials
    this.adapter = options.adapter || defaultFetchAdapter
    this.auth = options.auth

    if (options.requestInterceptors) {
      this.requestInterceptors.push(...options.requestInterceptors)
    }
    if (options.responseInterceptors) {
      this.responseInterceptors.push(...options.responseInterceptors)
    }
    if (options.errorInterceptors) {
      this.errorInterceptors.push(...options.errorInterceptors)
    }
  }

  // --- 核心入口 -----------------------------------------------------------

  async request<T = any>(config: HttpRequest): Promise<HttpResponse<T>> {
    let prepared: HttpRequest
    try {
      prepared = await this.prepareRequest(config)
    } catch (err) {
      const normalized = normalizeError(err, config, 'CONFIG')
      return this.handleError<T>(normalized)
    }

    try {
      let response = await this.adapter.send<T>(prepared)
      response = await this.runResponseInterceptors(response)
      return response
    } catch (err) {
      const normalized = normalizeError(err, prepared, 'UNKNOWN')
      // 401 自动 refresh + 重试一次
      if (
        normalized.status === 401 &&
        this.auth?.refreshToken &&
        !prepared.meta?.skipAuth &&
        !(prepared.meta as any)?.__retriedAfter401
      ) {
        const retried = await this.tryRefreshAndRetry<T>(prepared)
        if (retried) return retried
      }
      return this.handleError<T>(normalized)
    }
  }

  get<T = any>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>) {
    return this.request<T>({ ...(config || {}), url, method: 'GET' })
  }

  post<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequest, 'url' | 'method' | 'body'>
  ) {
    return this.request<T>({ ...(config || {}), url, method: 'POST', body })
  }

  put<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequest, 'url' | 'method' | 'body'>
  ) {
    return this.request<T>({ ...(config || {}), url, method: 'PUT', body })
  }

  patch<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequest, 'url' | 'method' | 'body'>
  ) {
    return this.request<T>({ ...(config || {}), url, method: 'PATCH', body })
  }

  delete<T = any>(url: string, config?: Omit<HttpRequest, 'url' | 'method'>) {
    return this.request<T>({ ...(config || {}), url, method: 'DELETE' })
  }

  // --- 配置 / 拦截 --------------------------------------------------------

  setAdapter(adapter: HttpAdapter): void {
    this.adapter = adapter
  }

  setAuth(auth: AuthProvider | undefined): void {
    this.auth = auth
  }

  useRequestInterceptor(fn: HttpRequestInterceptor): () => void {
    this.requestInterceptors.push(fn)
    return () => {
      const idx = this.requestInterceptors.indexOf(fn)
      if (idx >= 0) this.requestInterceptors.splice(idx, 1)
    }
  }

  useResponseInterceptor(fn: HttpResponseInterceptor): () => void {
    this.responseInterceptors.push(fn)
    return () => {
      const idx = this.responseInterceptors.indexOf(fn)
      if (idx >= 0) this.responseInterceptors.splice(idx, 1)
    }
  }

  useErrorInterceptor(fn: HttpErrorInterceptor): () => void {
    this.errorInterceptors.push(fn)
    return () => {
      const idx = this.errorInterceptors.indexOf(fn)
      if (idx >= 0) this.errorInterceptors.splice(idx, 1)
    }
  }

  // --- 内部实现 -----------------------------------------------------------

  /** 组装最终 request：URL / Header / Body / Auth / Interceptors */
  private async prepareRequest(config: HttpRequest): Promise<HttpRequest> {
    const method = (config.method || 'GET').toUpperCase() as HttpRequest['method']
    const url = joinURL(this.baseURL, config.url)

    // Header 合并顺序：默认 → 用户传入
    let headers = mergeHeaders(this.defaultHeaders, config.headers)

    // Body：object → JSON + 补 Content-Type
    let body = config.body
    if (shouldSendBody(method) && body !== undefined && body !== null) {
      if (!this.isRawBody(body)) {
        if (!this.hasHeader(headers, 'Content-Type')) {
          headers = { ...headers, 'Content-Type': 'application/json' }
        }
      }
    }

    // Auth 注入
    if (this.auth && !config.meta?.skipAuth) {
      const token = await Promise.resolve(this.auth.getToken())
      if (token) {
        const headerName = this.auth.headerName || 'Authorization'
        const scheme = this.auth.scheme ?? 'Bearer'
        const value = scheme ? `${scheme} ${token}` : token
        if (!this.hasHeader(headers, headerName)) {
          headers = { ...headers, [headerName]: value }
        }
      }
    }

    let prepared: HttpRequest = {
      ...config,
      url,
      method,
      headers,
      body,
      timeout: config.timeout ?? this.defaultTimeout,
      withCredentials:
        config.withCredentials !== undefined
          ? config.withCredentials
          : this.defaultWithCredentials,
    }

    // Request 拦截器（有序）
    for (const fn of this.requestInterceptors) {
      prepared = (await fn(prepared)) || prepared
    }

    return prepared
  }

  /** Response 拦截器链 */
  private async runResponseInterceptors<T>(
    response: HttpResponse<T>
  ): Promise<HttpResponse<T>> {
    let current = response
    for (const fn of this.responseInterceptors) {
      current = ((await fn(current)) as HttpResponse<T>) || current
    }
    return current
  }

  /** Error 拦截器：允许恢复为 HttpResponse */
  private async handleError<T>(error: HttpError): Promise<HttpResponse<T>> {
    let current: HttpError | HttpResponse = error
    for (const fn of this.errorInterceptors) {
      const result = await fn(current as HttpError)
      if (isHttpResponse(result)) {
        current = result
        break
      }
      current = result as HttpError
    }
    if (isHttpResponse(current)) {
      return current as HttpResponse<T>
    }
    throw current
  }

  /** 401 后尝试 refreshToken 并重试一次 */
  private async tryRefreshAndRetry<T>(
    prepared: HttpRequest
  ): Promise<HttpResponse<T> | null> {
    if (!this.auth?.refreshToken) return null
    let newToken: string | null = null
    try {
      newToken = (await Promise.resolve(this.auth.refreshToken())) || null
    } catch {
      newToken = null
    }
    if (!newToken) {
      this.auth.onUnauthorized?.()
      return null
    }
    const headerName = this.auth.headerName || 'Authorization'
    const scheme = this.auth.scheme ?? 'Bearer'
    const value = scheme ? `${scheme} ${newToken}` : newToken
    const retryReq: HttpRequest = {
      ...prepared,
      headers: { ...(prepared.headers || {}), [headerName]: value },
      meta: { ...(prepared.meta || {}), __retriedAfter401: true } as any,
    }
    try {
      const res = await this.adapter.send<T>(retryReq)
      return await this.runResponseInterceptors(res)
    } catch {
      return null
    }
  }

  private isRawBody(body: any): boolean {
    return (
      typeof body === 'string' ||
      (typeof FormData !== 'undefined' && body instanceof FormData) ||
      (typeof Blob !== 'undefined' && body instanceof Blob) ||
      (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) ||
      (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) ||
      (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream)
    )
  }

  private hasHeader(headers: Record<string, string>, name: string): boolean {
    const lower = name.toLowerCase()
    for (const k of Object.keys(headers)) {
      if (k.toLowerCase() === lower) return true
    }
    return false
  }
}

/** 默认全局 HttpClient 实例（可被宿主替换） */
let defaultHttpClient: HttpClient | null = null

/** 获取默认 HttpClient；懒创建 */
export function getDefaultHttpClient(): HttpClient {
  if (!defaultHttpClient) {
    defaultHttpClient = new HttpClient()
  }
  return defaultHttpClient
}

/** 设置全局默认 HttpClient */
export function setDefaultHttpClient(client: HttpClient): void {
  defaultHttpClient = client
}

/** 便捷工厂 */
export function createHttpClient(options?: HttpClientOptions): HttpClient {
  return new HttpClient(options)
}
