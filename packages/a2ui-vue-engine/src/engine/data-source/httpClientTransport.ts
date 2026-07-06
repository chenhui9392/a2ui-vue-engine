/*
 * @Author: hui.chenn
 * @Description: HttpClient → DataSourceTransport 适配层
 *   对齐 http-client.md §6：DataSource 通过 HttpClient 发请求，不直接调 fetch/axios。
 *
 *   职责：把 DataSourceRequest + runtimeParams 组装为 HttpRequest，
 *         经 HttpClient.request 发送，把 HttpResponse.data 原样返回给 DataSource。
 *
 *   V2 升级（对齐 resolveApi.md）：
 *   - 注入 ApiResolver + contextProvider
 *   - 若 request.apiKey 存在，则动态解析为 ApiEntry（url / method / headers / ...）
 *   - 解析结果与 request 字段合并后组装为 HttpRequest
 *   - HttpRequest.meta 携带 apiKey / env / tenant，便于 audit 与 adapter 路由
 *
 *   响应体的 responseMap（list/total/error 等业务映射）由 DataSource 自身完成，
 *   HttpClient 层保持"零业务映射"。
 * @Date: 2026-07-02 10:00:00
 */
import type { HttpClient, HttpRequest, HttpError } from '../../infra/http'
import type { ApiResolver, ApiContext, ApiEntry, ResolvedApi } from '../../infra/api'
import type {
  DataSourceRequest,
  DataSourceRuntimeParams,
  DataSourceTransport,
} from './types'
import { mergeRuntimeParams } from './transport'
import { createTransportError } from './transport'

export interface CreateHttpClientTransportOptions {
  /** ApiResolver；注入后 request.apiKey 会被动态解析 */
  resolver?: ApiResolver
  /** 上下文提供者；每次请求时调用以拿当前 env/tenant/user */
  contextProvider?: () => ApiContext
}

/** 把 ResolvedApi 归一为 ApiEntry */
function toEntry(resolved: ResolvedApi): ApiEntry {
  return typeof resolved === 'string' ? { url: resolved } : resolved
}

/**
 * 把 HttpClient 包装为 DataSourceTransport。
 *
 * @param client  HttpClient 实例
 * @param options resolver + contextProvider（均可选，缺省时回退到 request.url）
 */
export function createHttpClientTransport(
  client: HttpClient,
  options: CreateHttpClientTransportOptions = {},
): DataSourceTransport {
  const { resolver, contextProvider } = options

  const transport: DataSourceTransport = async (request, runtimeParams, signal) => {
    // 1. 解析 apiKey → ApiEntry（若有 resolver）
    let resolvedEntry: ApiEntry | undefined
    let resolvedApiKey: string | undefined
    if (request.apiKey && resolver) {
      resolvedApiKey = request.apiKey
      const ctx = contextProvider?.() ?? ({ env: 'prod' } as ApiContext)
      const resolved = await resolver.resolve(request.apiKey, ctx)
      resolvedEntry = toEntry(resolved)
    }

    // 2. 合并 url / method（resolved 优先，request 次之）
    const url = resolvedEntry?.url ?? request.url
    if (!url) {
      throw createTransportError(
        'CONFIG_MISSING_URL',
        request.apiKey
          ? `DataSource apiKey "${request.apiKey}" resolved without url`
          : 'DataSource request.url is required',
      )
    }
    const method = (
      resolvedEntry?.method ||
      request.method ||
      'GET'
    ).toUpperCase() as HttpRequest['method']

    // 3. 合并 runtime 参数（分页 / 排序 / 筛选）
    //    resolvedEntry.query 不直接进 mergeRuntimeParams（避免污染分页参数逻辑），
    //    而是在最终 httpReq.query 上合并。
    const { query, body } = mergeRuntimeParams(request, runtimeParams)
    if (resolvedEntry?.query) {
      Object.assign(query, resolvedEntry.query)
    }

    const isGet =
      method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'DELETE'

    // 4. 当前 context 快照（用于 meta 审计 + mock 路由）
    const ctx = contextProvider?.()

    const httpReq: HttpRequest = {
      url,
      method,
      headers: { ...resolvedEntry?.headers, ...request.headers },
      query: isGet ? query : undefined,
      body: !isGet ? (body !== undefined ? body : resolvedEntry?.body) : undefined,
      timeout: resolvedEntry?.timeout ?? request.timeout,
      withCredentials: request.credentials === 'include',
      signal,
      meta: {
        source: 'datasource',
        op: 'fetch',
        apiKey: resolvedApiKey,
        env: ctx?.env,
        tenant: ctx?.tenant,
        mock: ctx?.env === 'mock' || resolvedEntry?.mock === true,
        ...resolvedEntry?.meta,
      },
    }
    if (resolvedEntry?.skipAuth) {
      httpReq.meta!.skipAuth = true
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
  _params: DataSourceRuntimeParams,
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
    },
  )
}
