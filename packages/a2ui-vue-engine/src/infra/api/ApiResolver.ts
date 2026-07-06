/*
 * @Author: hui.chenn
 * @Description: Runtime API Resolver 实现
 *   - createApiResolver: 默认 Hybrid 实现（scoped > entries > provider）
 *   - 热更新：updateApi / replaceApiMap / reloadResolver
 *   - 订阅：subscribe(version) —— 用于 PageRuntime 触发 cache invalidation
 *   - 完全替换：options.resolve 可整体替换默认查表逻辑（MCP / AI tool 用）
 * @Date: 2026-07-06 10:00:00
 */
import type {
  ApiResolver,
  ApiResolverFn,
  ApiContext,
  ApiEntry,
  ResolvedApi,
  ApiEntryMap,
  ApiResolverProvider,
} from './types'

export interface CreateApiResolverOptions {
  /** 初始静态 map（中优先级） */
  entries?: ApiEntryMap
  /** 动态 provider（异步远程拉取，低优先级） */
  provider?: ApiResolverProvider
  /** 自定义 resolve（完全替换默认 Hybrid 逻辑，最高优先级） */
  resolve?: ApiResolverFn
  /** 局部表（schema.apis，co-located，最高优先级） */
  scoped?: ApiEntryMap
  /** context 默认值（env/project 等） */
  defaultContext?: Partial<ApiContext>
}

/**
 * 创建 ApiResolver 实例。
 *
 * 解析优先级（高 → 低）：
 *   scoped（schema.apis / updateApi 写入） > entries（全局静态） > provider（远程动态）
 *
 * 自定义 resolve（options.resolve）会整体替换上面的查表逻辑，
 * 适用于 MCP / AI tool 场景（把解析委托给远端服务）。
 */
export function createApiResolver(options: CreateApiResolverOptions = {}): ApiResolver {
  let version = 0
  const subscribers = new Set<(v: number) => void>()

  // 三层 map：scoped（最高）> entries（静态）> provider（远程）
  let scopedMap: ApiEntryMap = { ...options.scoped }
  let staticMap: ApiEntryMap = { ...options.entries }
  let providerMap: ApiEntryMap = {}
  let providerLoaded = false
  let loadingPromise: Promise<void> | null = null

  const notify = (): void => {
    version++
    subscribers.forEach((fn) => fn(version))
  }

  const loadProvider = async (): Promise<void> => {
    if (!options.provider || providerLoaded) return
    if (loadingPromise) return loadingPromise
    loadingPromise = (async () => {
      try {
        providerMap = await options.provider!()
        providerLoaded = true
        notify()
      } finally {
        loadingPromise = null
      }
    })()
    return loadingPromise
  }

  // 异步触发首次加载（不阻塞构造）
  void loadProvider()

  const lookup = (apiKey: string): ApiEntry | undefined => {
    return scopedMap[apiKey] ?? staticMap[apiKey] ?? providerMap[apiKey]
  }

  const defaultResolve: ApiResolverFn = (apiKey, ctx) => {
    const entry = lookup(apiKey)
    if (!entry) {
      throw new Error(
        `[a2ui/api] apiKey "${apiKey}" 未在 scoped/entries/provider 中声明 (env=${ctx.env})`,
      )
    }
    if (!entry.override) return entry
    // 应用 override（动态计算）
    return { ...entry, ...entry.override(ctx), override: undefined }
  }

  const resolveFn: ApiResolverFn = options.resolve ?? defaultResolve

  const normalizeValue = (
    prev: ApiEntry | undefined,
    value: ApiEntry | ResolvedApi | ((prev: ApiEntry) => ApiEntry),
  ): ApiEntry => {
    if (typeof value === 'function') {
      return (value as (p: ApiEntry) => ApiEntry)(prev ?? { url: '' })
    }
    return typeof value === 'string' ? { url: value } : value
  }

  return {
    get version() {
      return version
    },
    resolve: (apiKey, ctx) =>
      resolveFn(apiKey, { ...options.defaultContext, ...ctx } as ApiContext),
    updateApi: (key, value) => {
      const prev = lookup(key)
      const next = normalizeValue(prev, value)
      // 写入最高优先级的 scoped 层，确保覆盖
      scopedMap[key] = next
      notify()
    },
    replaceApiMap: (map, mode = 'merge') => {
      if (mode === 'replace') {
        scopedMap = {}
        staticMap = { ...map }
      } else {
        staticMap = { ...staticMap, ...map }
      }
      notify()
    },
    reloadResolver: async () => {
      providerLoaded = false
      providerMap = {}
      await loadProvider()
    },
    subscribe: (fn) => {
      subscribers.add(fn)
      return () => {
        subscribers.delete(fn)
      }
    },
  }
}

/** 别名：强调默认 Hybrid 实现 */
export const createHybridApiResolver = createApiResolver
