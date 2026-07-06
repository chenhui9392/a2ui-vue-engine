/*
 * @Author: hui.chenn
 * @Description: HttpClient 内部辅助工具
 *   - URL 拼接 / query 序列化
 *   - Header 归一化
 *   - Error 归一化
 * @Date: 2026-07-02 10:00:00
 */
import type { HttpError, HttpErrorCode, HttpRequest, HttpResponse } from './types'

/** 是否为完整 URL（含 protocol 或 //） */
export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z0-9+\-.]*:)?\/\//i.test(url)
}

/** 拼接 baseURL 与 path */
export function joinURL(baseURL: string | undefined, url: string): string {
  if (!url) return baseURL || ''
  if (isAbsoluteURL(url)) return url
  if (!baseURL) return url
  const b = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
  const p = url.startsWith('/') ? url : `/${url}`
  return `${b}${p}`
}

/** query 序列化：null/undefined 跳过；数组重复 append；对象 JSON */
export function serializeQuery(query: Record<string, any> | undefined): string {
  if (!query) return ''
  const usp = new URLSearchParams()
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined || val === null) continue
    if (Array.isArray(val)) {
      val.forEach(v => {
        if (v === undefined || v === null) return
        usp.append(key, String(v))
      })
    } else if (typeof val === 'object') {
      usp.append(key, JSON.stringify(val))
    } else {
      usp.append(key, String(val))
    }
  }
  return usp.toString()
}

/** 把 query 拼到 URL 上 */
export function appendQuery(url: string, query: Record<string, any> | undefined): string {
  const qs = serializeQuery(query)
  if (!qs) return url
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

/** header key 归一化为小写 */
export function normalizeHeaders(
  headers: Record<string, string> | Headers | undefined
): Record<string, string> {
  const out: Record<string, string> = {}
  if (!headers) return out
  if (typeof (headers as Headers).forEach === 'function') {
    ;(headers as Headers).forEach((value, key) => {
      out[key.toLowerCase()] = value
    })
    return out
  }
  for (const [key, val] of Object.entries(headers as Record<string, string>)) {
    if (val === undefined || val === null) continue
    out[key.toLowerCase()] = String(val)
  }
  return out
}

/** 合并多份 header（后者覆盖前者），保留原始大小写以便发送 */
export function mergeHeaders(
  ...sources: Array<Record<string, string> | undefined>
): Record<string, string> {
  const out: Record<string, string> = {}
  const seen: Record<string, string> = {} // lower → original key
  for (const src of sources) {
    if (!src) continue
    for (const [key, val] of Object.entries(src)) {
      if (val === undefined || val === null) continue
      const lower = key.toLowerCase()
      const originalKey = seen[lower] || key
      seen[lower] = originalKey
      out[originalKey] = String(val)
    }
  }
  return out
}

/** 归一化任意错误为 HttpError */
export function normalizeError(
  err: unknown,
  request?: HttpRequest,
  fallbackCode: HttpErrorCode = 'UNKNOWN'
): HttpError {
  if (err && typeof err === 'object' && 'code' in err && 'message' in err && 'retriable' in err) {
    return err as HttpError
  }
  const anyErr: any = err
  const name: string = anyErr?.name || ''
  const message: string = anyErr?.message || String(err)

  if (name === 'AbortError') {
    return {
      code: 'ABORTED',
      message: message || 'Request aborted',
      retriable: false,
      cause: err,
      request,
    }
  }
  return {
    code: fallbackCode,
    message,
    retriable: fallbackCode === 'NETWORK' || fallbackCode === 'TIMEOUT',
    cause: err,
    request,
  }
}

/** 从 HTTP 响应构造错误 */
export function createHttpError<T = any>(
  status: number,
  message: string,
  request: HttpRequest,
  response?: HttpResponse<T>
): HttpError<T> {
  return {
    code: `HTTP_${status}` as HttpErrorCode,
    message,
    status,
    retriable: status >= 500,
    request,
    response,
  }
}

/** 判断是否需要发送 body */
export function shouldSendBody(method: string | undefined): boolean {
  const m = (method || 'GET').toUpperCase()
  return m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS'
}
