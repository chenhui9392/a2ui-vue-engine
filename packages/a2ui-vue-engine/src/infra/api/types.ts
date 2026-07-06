/*
 * @Author: hui.chenn
 * @Description: Runtime API Resolver 类型定义
 *   - 把 apiKey + context 动态解析为 ResolvedApi（string | ApiEntry）
 *   - 支持 env / project / tenant / user / runtime state / extra 扩展
 *   - 与 HttpClient 契约对齐：ApiEntry 字段是 HttpRequest 的超集
 * @Date: 2026-07-06 10:00:00
 */
import type { HttpMethod, HttpRequestMeta } from '../../infra/http/types'

/** 环境标识；扩展开放，允许业务自定义（如 'pre' / 'gray'） */
export type ApiEnv = 'dev' | 'test' | 'prod' | 'mock' | (string & {})

/** API 解析上下文 —— Resolver 的唯一动态输入 */
export interface ApiContext {
  /** 当前环境 */
  env: ApiEnv
  /** 业务域 / appId */
  project?: string
  /** 租户标识 */
  tenant?: string
  /** 当前用户信息（用于权限路由 / header 注入） */
  user?: {
    id?: string
    roles?: string[]
    permissions?: string[]
    token?: string
  }
  /** 运行时动态状态：当前 pageId / route / 选中行等 */
  runtime?: Record<string, any>
  /** 透传给 resolver 的自定义扩展点（MCP / AI tool 用） */
  extra?: Record<string, any>
}

/** 单个 API 的描述（静态 map 的 value 升级版） */
export interface ApiEntry {
  /** 完整 url，或相对于 env baseURL 的 path */
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
  /** 是否跳过 auth 注入 */
  skipAuth?: boolean
  /** 标记为 mock，命中后走 MockAdapter */
  mock?: boolean
  /** 透传给 HttpRequest.meta（audit / adapter 路由） */
  meta?: HttpRequestMeta
  /** 按 context 动态计算覆盖项（高级用法：env/tenant 切换时改 url/headers） */
  override?: (ctx: ApiContext) => Partial<Omit<ApiEntry, 'override'>>
}

/** Resolver 的输出：string 视为 { url: string } */
export type ResolvedApi = string | ApiEntry

/** Resolver 函数签名（核心抽象） */
export type ApiResolverFn = (
  apiKey: string,
  ctx: ApiContext,
) => ResolvedApi | Promise<ResolvedApi>

/** Resolver 实例 = 函数 + 热更新接口 + 版本号 */
export interface ApiResolver {
  /** 当前版本号；每次 updateApi / replaceApiMap / reloadResolver 自增 */
  readonly version: number
  /** 解析 apiKey → ResolvedApi */
  resolve: ApiResolverFn
  /** 热更新单个 key（写入 scoped 层，优先级最高） */
  updateApi: (
    key: string,
    value: ApiEntry | ResolvedApi | ((prev: ApiEntry) => ApiEntry),
  ) => void
  /** 批量替换 / 合并 */
  replaceApiMap: (map: ApiEntryMap, mode?: 'merge' | 'replace') => void
  /** 重新加载（重新执行 provider，异步拉取远程 manifest） */
  reloadResolver: () => Promise<void> | void
  /** 订阅版本变更（用于 cache invalidation / audit） */
  subscribe: (fn: (version: number) => void) => () => void
}

/** ApiEntry Map —— 默认 HybridResolver 的输入 */
export type ApiEntryMap = Record<string, ApiEntry>

/** Resolver Provider：可异步加载 / 远程拉取 manifest */
export type ApiResolverProvider = () => ApiEntryMap | Promise<ApiEntryMap>
