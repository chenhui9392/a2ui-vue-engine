/*
 * @Author: hui.chenn
 * @Description: HttpClient → DataSourceTransport 适配层
 *   对齐 http-client.md §6：DataSource 通过 HttpClient 发请求，不直接调 fetch/axios。
 *
 *   职责：把 DataSourceRequest + runtimeParams 组装为 HttpRequest，
 *         经 HttpClient.request 发送，把 HttpResponse.data 原样返回给 DataSource。
 *
 *   响应体的 responseMap（list/total/error 等业务映射）由 DataSource 自身完成，
 *   HttpClient 层保持"零业务映射"。
 * @Date: 2026-07-02 10:00:00
 */
import type { HttpClient, HttpRequest, HttpError } from '../http'
import type {
  DataSourceRequest,
  DataSourceRuntimeParams,
  DataSourceTransport,
} from './types'
import { mergeRuntimeParams } from './transport'
import { createTransportError } from './transport'

/** 把 HttpClient 包装为 DataSourceTransport */
export function createHttpClientTransport(client: HttpClient): DataSourceTransport {
  const transport: DataSourceTransport = async (request, runtimeParams, signal) => {
    if (!request.url) {
      throw createTransportError(
        'CONFIG_MISSING_URL',
        'DataSource request.url is required'
      )
    }
    const method = (request.method || 'GET').toUpperCase() as HttpRequest['method']
    const { query, body } = mergeRuntimeParams(request, runtimeParams)

    const isGet = method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'DELETE'
    const httpReq: HttpRequest = {
      url: request.url,
      method,
      headers: request.headers,
      query: isGet ? query : undefined,
      body: !isGet ? body : undefined,
      timeout: request.timeout,
      withCredentials: request.credentials === 'include',
      signal,
      meta: { source: 'datasource', op: 'fetch' },
    }

    try {
      const response = await client.request(httpReq)
      // 把原始 body 交给 DataSource 走 responseMap 映射
      return response.data
    } catch (err) {
      // 归一化为 DataSourceError（保留 HttpError 的 code / status / retriable）
      throw toDataSourceError(err, request, runtimeParams)
    }
  }
  ;(transport as any).__fromHttpClient = true
  return transport
}

/** 把 HttpError 归一为 DataSourceError */
function toDataSourceError(
  err: unknown,
  _request: DataSourceRequest,
  _params: DataSourceRuntimeParams
) {
  const httpErr = err as HttpError
  if (httpErr && typeof httpErr === 'object' && 'code' in httpErr && 'message' in httpErr) {
    return createTransportError(String(httpErr.code), httpErr.message, {
      status: httpErr.status,
      cause: httpErr.cause,
      retriable: httpErr.retriable,
    })
  }
  const anyErr: any = err
  return createTransportError(
    'UNKNOWN',
    typeof anyErr?.message === 'string' ? anyErr.message : String(err),
    {
      cause: err,
      retriable: false,
    }
  )
}
