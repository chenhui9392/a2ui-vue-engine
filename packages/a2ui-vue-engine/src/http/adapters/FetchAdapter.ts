/*
 * @Author: hui.chenn
 * @Description: FetchAdapter - 基于原生 fetch 的 HTTP Adapter 实现
 *   契约：接收 HttpRequest → 返回 HttpResponse；失败抛出 HttpError
 *   零依赖，浏览器 / Node18+ / Edge / Worker 通用
 * @Date: 2026-07-02 10:00:00
 */
import type {
  HttpAdapter,
  HttpError,
  HttpRequest,
  HttpResponse,
} from '../types'
import {
  appendQuery,
  createHttpError,
  normalizeError,
  normalizeHeaders,
  shouldSendBody,
} from '../utils'

/** 从 Response 中按 responseType 读取 data */
async function parseResponseBody(
  response: Response,
  responseType: HttpRequest['responseType']
): Promise<any> {
  const contentType = response.headers.get('content-type') || ''
  const rt = responseType || (contentType.includes('application/json') ? 'json' : 'text')
  switch (rt) {
    case 'json':
      // 空 body 兼容
      try {
        const text = await response.text()
        return text ? JSON.parse(text) : null
      } catch (err) {
        throw {
          code: 'PARSE_ERROR' as const,
          message: 'Failed to parse JSON response',
          retriable: false,
          cause: err,
        } as HttpError
      }
    case 'text':
      return response.text()
    case 'blob':
      return response.blob()
    case 'arraybuffer':
      return response.arrayBuffer()
    case 'stream':
      return response.body
    default:
      return response.text()
  }
}

/** FetchAdapter 实现 */
export class FetchAdapter implements HttpAdapter {
  readonly name = 'fetch'

  async send<T = any>(request: HttpRequest): Promise<HttpResponse<T>> {
    const method = (request.method || 'GET').toUpperCase()
    const url = appendQuery(request.url, request.query)

    const init: RequestInit = {
      method,
      headers: request.headers,
    }
    if (request.withCredentials) {
      init.credentials = 'include'
    }

    // Body 处理
    if (shouldSendBody(method) && request.body !== undefined) {
      init.body = this.serializeBody(request.body, request.headers)
    }

    // Signal + Timeout 处理
    const { signal, cleanupTimer } = this.buildSignal(request)
    if (signal) init.signal = signal

    let response: Response
    try {
      response = await fetch(url, init)
    } catch (err: any) {
      cleanupTimer()
      // AbortError 也走这里
      if (err?.name === 'AbortError') {
        const timedOut = (request as any).__timedOut === true
        throw {
          code: timedOut ? ('TIMEOUT' as const) : ('ABORTED' as const),
          message: timedOut ? 'Request timeout' : 'Request aborted',
          retriable: timedOut,
          cause: err,
          request,
        } as HttpError
      }
      // 归类为网络错误
      throw {
        code: 'NETWORK' as const,
        message: err?.message || 'Network error',
        retriable: true,
        cause: err,
        request,
      } as HttpError
    }
    cleanupTimer()

    // 解析响应体（无论成功失败都尝试读，用于错误信息）
    let data: any = undefined
    try {
      data = await parseResponseBody(response, request.responseType)
    } catch (err) {
      // 若 body 读取失败但是 HTTP 成功，作为 PARSE_ERROR
      if (response.ok) {
        throw normalizeError(err, request, 'PARSE_ERROR')
      }
      // HTTP 已失败，data 保持 undefined，走下面的 HTTP_xxx
    }

    const httpResponse: HttpResponse<T> = {
      status: response.status,
      ok: response.ok,
      headers: normalizeHeaders(response.headers),
      data,
      raw: response,
      request,
    }

    if (!response.ok) {
      throw createHttpError<T>(
        response.status,
        response.statusText || `HTTP ${response.status}`,
        request,
        httpResponse
      )
    }

    return httpResponse
  }

  /** Body 序列化：object → JSON；FormData / Blob / string 原样 */
  private serializeBody(body: any, headers?: Record<string, string>): BodyInit {
    if (body === null || body === undefined) return ''
    if (
      typeof body === 'string' ||
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      body instanceof URLSearchParams ||
      (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream)
    ) {
      return body as BodyInit
    }
    // 对象 → JSON；若未指定 Content-Type 则由 caller 或 HttpClient 补充
    // FetchAdapter 不主动写 headers（保持 Adapter 无状态）
    void headers
    return JSON.stringify(body)
  }

  /** 组装 signal + 超时；返回信号与清理函数 */
  private buildSignal(request: HttpRequest): {
    signal: AbortSignal | undefined
    cleanupTimer: () => void
  } {
    const timeout = request.timeout ?? 0
    const external = request.signal

    // 无超时也无外部 signal
    if (timeout <= 0 && !external) {
      return { signal: undefined, cleanupTimer: () => void 0 }
    }
    // 只有外部 signal
    if (timeout <= 0 && external) {
      return { signal: external, cleanupTimer: () => void 0 }
    }
    // 有超时：需要一个本地 controller，联动外部 signal
    const controller = new AbortController()
    const timer = setTimeout(() => {
      ;(request as any).__timedOut = true
      controller.abort()
    }, timeout)

    if (external) {
      if (external.aborted) {
        controller.abort()
      } else {
        external.addEventListener(
          'abort',
          () => {
            controller.abort()
          },
          { once: true }
        )
      }
    }

    return {
      signal: controller.signal,
      cleanupTimer: () => clearTimeout(timer),
    }
  }
}

/** 默认单例 */
export const defaultFetchAdapter = new FetchAdapter()
