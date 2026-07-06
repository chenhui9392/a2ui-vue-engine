/*
 * @Author: hui.chenn
 * @Description: MockAdapter - 用于单测 / Playground / Storybook
 *   规则：register(key, response|handler)；key 支持 "METHOD url" 或 "url" 或 RegExp
 *   HttpClient 层无感知，与其他 Adapter 契约一致
 * @Date: 2026-07-02 10:00:00
 */
import type {
  HttpAdapter,
  HttpError,
  HttpRequest,
  HttpResponse,
} from '../types'
import { appendQuery, createHttpError } from '../utils'

export type MockHandler<T = any> = (
  request: HttpRequest
) => Partial<HttpResponse<T>> | Promise<Partial<HttpResponse<T>>>

export type MockRule<T = any> =
  | Partial<HttpResponse<T>>
  | MockHandler<T>

interface MockEntry {
  match: (request: HttpRequest, fullUrl: string) => boolean
  rule: MockRule
}

/** MockAdapter 实现：不发真实请求，按规则返回 mock 响应 */
export class MockAdapter implements HttpAdapter {
  readonly name = 'mock'
  private entries: MockEntry[] = []
  private fallback?: MockRule

  /**
   * 注册规则
   * @param pattern "GET /api/xx" | "/api/xx" | RegExp
   * @param rule    partial response（会补齐默认字段）或 handler
   */
  register<T = any>(pattern: string | RegExp, rule: MockRule<T>): this {
    const match =
      pattern instanceof RegExp
        ? (_: HttpRequest, fullUrl: string) => pattern.test(fullUrl)
        : this.buildStringMatcher(pattern)
    this.entries.push({ match, rule: rule as MockRule })
    return this
  }

  /** 兜底规则 */
  setFallback<T = any>(rule: MockRule<T>): this {
    this.fallback = rule as MockRule
    return this
  }

  /** 清空规则 */
  reset(): this {
    this.entries = []
    this.fallback = undefined
    return this
  }

  async send<T = any>(request: HttpRequest): Promise<HttpResponse<T>> {
    const fullUrl = appendQuery(request.url, request.query)
    const matched = this.entries.find(e => e.match(request, fullUrl))
    const rule = matched?.rule ?? this.fallback

    if (!rule) {
      throw createHttpError<T>(
        404,
        `MockAdapter no rule matches ${request.method || 'GET'} ${fullUrl}`,
        request
      )
    }

    const partial =
      typeof rule === 'function'
        ? await (rule as MockHandler<T>)(request)
        : (rule as Partial<HttpResponse<T>>)

    const response: HttpResponse<T> = {
      status: partial.status ?? 200,
      ok: (partial.status ?? 200) >= 200 && (partial.status ?? 200) < 300,
      headers: partial.headers ?? {},
      data: (partial.data as T) ?? (null as unknown as T),
      raw: partial.raw,
      request,
      meta: { mock: true, ...(partial.meta || {}) },
    }

    if (!response.ok) {
      throw createHttpError<T>(
        response.status,
        `Mock HTTP ${response.status}`,
        request,
        response
      ) as HttpError<T>
    }

    return response
  }

  private buildStringMatcher(pattern: string): MockEntry['match'] {
    const [maybeMethod, maybePath] = pattern.split(/\s+/)
    let expectedMethod: string | undefined
    let path: string
    if (maybePath) {
      expectedMethod = maybeMethod.toUpperCase()
      path = maybePath
    } else {
      path = maybeMethod
    }
    return (request, fullUrl) => {
      if (expectedMethod) {
        const method = (request.method || 'GET').toUpperCase()
        if (method !== expectedMethod) return false
      }
      // 精确匹配 URL 或以该 path 开头（去掉 query）
      const urlWithoutQuery = fullUrl.split('?')[0]
      return urlWithoutQuery === path || request.url === path
    }
  }
}
