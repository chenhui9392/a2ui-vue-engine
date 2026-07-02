/*
 * @Author: hui.chenn
 * @Description: DataSource fetch transport (默认基于 fetch)
 * @Date: 2026-07-01 10:00:00
 */
import type {
  DataSourceRequest,
  DataSourceRuntimeParams,
  DataSourceTransport,
  DataSourceError,
} from './types'

/** 构造请求 URL（合并 params）*/
export function buildRequestUrl(
  baseUrl: string,
  query: Record<string, any>
): string {
  if (!query || Object.keys(query).length === 0) return baseUrl

  const usp = new URLSearchParams()
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined || val === null) continue
    if (Array.isArray(val)) {
      val.forEach(v => usp.append(key, String(v)))
    } else if (typeof val === 'object') {
      usp.append(key, JSON.stringify(val))
    } else {
      usp.append(key, String(val))
    }
  }
  const qs = usp.toString()
  if (!qs) return baseUrl
  return baseUrl.includes('?') ? `${baseUrl}&${qs}` : `${baseUrl}?${qs}`
}

/** 合并 runtime 参数为 HTTP query / body */
export function mergeRuntimeParams(
  request: DataSourceRequest,
  runtimeParams: DataSourceRuntimeParams
): { query: Record<string, any>; body: any } {
  const query: Record<string, any> = { ...(request.params || {}) }
  const method = (request.method || 'GET').toUpperCase()

  // 分页 / 排序 / 搜索 / 筛选统一进入 query
  if (runtimeParams.page !== undefined) query.page = runtimeParams.page
  if (runtimeParams.pageSize !== undefined) query.pageSize = runtimeParams.pageSize
  if (runtimeParams.cursor !== undefined && runtimeParams.cursor !== null) {
    query.cursor = runtimeParams.cursor
  }
  if (runtimeParams.sort && runtimeParams.sort.field) {
    query.sortField = runtimeParams.sort.field
    query.sortOrder = runtimeParams.sort.order
  }
  if (runtimeParams.search !== undefined && runtimeParams.search !== '') {
    query.search = runtimeParams.search
  }
  if (runtimeParams.filter && Object.keys(runtimeParams.filter).length > 0) {
    Object.assign(query, runtimeParams.filter)
  }
  if (runtimeParams.extra) {
    Object.assign(query, runtimeParams.extra)
  }

  let body: any = request.body
  // POST / PUT / PATCH：如果请求未显式提供 body，则把 runtimeParams 也放进 body
  if (['POST', 'PUT', 'PATCH'].includes(method) && body === undefined) {
    body = {
      ...(request.params || {}),
      ...runtimeParams.filter,
      ...runtimeParams.extra,
    }
    if (runtimeParams.page !== undefined) body.page = runtimeParams.page
    if (runtimeParams.pageSize !== undefined) body.pageSize = runtimeParams.pageSize
    if (runtimeParams.sort) body.sort = runtimeParams.sort
    if (runtimeParams.search) body.search = runtimeParams.search
  }

  return { query, body }
}

/** 默认 fetch transport */
export const defaultTransport: DataSourceTransport = async (
  request,
  runtimeParams,
  signal
) => {
  if (!request.url) {
    throw createTransportError('CONFIG_MISSING_URL', 'DataSource request.url is required')
  }

  const method = (request.method || 'GET').toUpperCase()
  const { query, body } = mergeRuntimeParams(request, runtimeParams)

  const isGet = method === 'GET' || method === 'DELETE'
  const url = isGet ? buildRequestUrl(request.url, query) : request.url

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(request.headers || {}),
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: request.credentials,
    signal,
  }
  if (!isGet && body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  // Timeout 逻辑
  const timeout = request.timeout ?? 0
  let timer: any = null
  let localController: AbortController | null = null
  if (timeout > 0 && !signal) {
    localController = new AbortController()
    init.signal = localController.signal
    timer = setTimeout(() => localController?.abort(), timeout)
  }

  let response: Response
  try {
    response = await fetch(url, init)
  } catch (err: any) {
    if (timer) clearTimeout(timer)
    if (err?.name === 'AbortError') {
      throw createTransportError('ABORTED', 'Request aborted', {
        cause: err,
        retriable: false,
      })
    }
    throw createTransportError('NETWORK_ERROR', err?.message || 'Network error', {
      cause: err,
      retriable: true,
    })
  } finally {
    if (timer) clearTimeout(timer)
  }

  if (!response.ok) {
    const text = await safeReadText(response)
    throw createTransportError(
      `HTTP_${response.status}`,
      text || response.statusText || `HTTP ${response.status}`,
      {
        status: response.status,
        retriable: response.status >= 500,
      }
    )
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  return response.text()
}

/** 构造统一错误对象 */
export function createTransportError(
  code: string,
  message: string,
  extra?: Partial<DataSourceError>
): DataSourceError {
  return {
    code,
    message,
    ...extra,
  }
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text()
  } catch {
    return ''
  }
}
