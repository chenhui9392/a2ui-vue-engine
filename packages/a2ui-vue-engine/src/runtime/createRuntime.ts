/*
 * @Author: hui.chenn
 * @Description: createRuntime - A2UI 页面运行时工厂
 *
 *   把原先散落在 Example(App.vue) 中的 Runtime 能力收敛为单一工厂：
 *     schema + infra options → runtime
 *
 *   内部完成：
 *     1. HttpClient（auth / baseURL，由 options 注入，不读 schema）
 *     2. ApiResolver（scoped = schema.apis）
 *     3. DataSourceManager + 按 schema.datasources 声明式注册
 *     4. PageRuntime（Coordinator + PageState）
 *     5. componentMap（默认 + Search/Table 运行时绑定版 + 用户覆盖）
 *     6. schema.components 归一化（namespace → 引擎名 + events → actions）
 *     7. Action Dispatcher（ui.open / ui.close / ui.toggle / request / emit / updateState）
 *     8. Message 路由（A2UIRoot @message → action 查表 → executeAction）
 *
 *   职责边界（对齐 examples/md/收敛边界.md）：
 *   - Schema 只描述页面（page / apis / datasources / state / actions / components）
 *   - 基础设施（baseURL / auth / env）由宿主通过 options 注入，不属于 Schema
 *   - Component Registry 属于 Runtime（runtime/registry/），Schema 不承载
 *
 *   最终 A2UIRoot 只需：
 *     <A2UIRoot :runtime="runtime" />
 *
 * @Date: 2026-07-06 10:00:00
 */
import { defineComponent, h, ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { HttpClient, createHttpClient } from '../infra/http'
import type { AuthProvider, HttpMethod } from '../infra/http'
import { createApiResolver } from '../infra/api'
import type { ApiContext, ApiEntryMap } from '../infra/api'
import { DataSourceManager } from '../engine/data-source'
import type { DataSourceTransport } from '../engine/data-source'
import { PageRuntime } from './page-runtime'
import { DEFAULT_NAMESPACE_MAP } from './registry'
import { createComponentMap } from '../components'
import A2Search from '../components/A2Search.vue'
import A2Table from '../components/A2Table.vue'
import type { ComponentMapper, A2Message, FlatA2Node } from '../types'

// ===========================================================================
// 类型定义
// ===========================================================================

/** Page Schema 协议（createRuntime 消费的结构）—— 只描述页面，不含基础设施 */
export interface PageSchema {
  /** 页面元信息：id / title / project / version */
  page: { id: string; title?: string; project?: string; version?: string }
  /** 局部 API 表（优先级最高） */
  apis?: ApiEntryMap
  /** 数据源声明：id → { apiKey, responseMap, pagination, ... } */
  datasources?: Record<string, any>
  /** 初始 state（ui / business / forms 三层分离） */
  state?: Record<string, any>
  /** 动作表：name → { type, target, datasource, ... }（声明式，禁止 handler/callback） */
  actions?: Record<string, any>
  /** 组件树（id → node，namespace + events） */
  components?: Record<string, any>
  /** namespace → 引擎组件名 映射（覆盖 runtime/registry 默认表，可选） */
  componentRegistry?: Record<string, string>
}

/** 鉴权便捷配置：从 localStorage 读取 token */
export interface RuntimeAuthConfig {
  cacheKey: string
  tokenPath?: string
  headerName?: string
  scheme?: string
}

export interface RuntimeOptions {
  /** Page Schema（只描述页面，不含 baseURL/auth 等基础设施） */
  schema: PageSchema
  /** 用户自定义组件（与默认 + 绑定版合并，优先级最高） */
  componentMap?: ComponentMapper
  /** 显式 HttpClient（覆盖 baseURL/auth 自动构造） */
  httpClient?: HttpClient
  /** baseURL（自动构造 HttpClient 时使用） */
  baseURL?: string
  /** AuthProvider 实例；或传入 RuntimeAuthConfig 便捷构造 localStorage 读取器 */
  auth?: AuthProvider | RuntimeAuthConfig
  /** ApiContext（env / project / tenant 等） */
  apiContext?: Partial<ApiContext>
  /** 默认 DataSource id（未指定时取 schema.datasources 第一个 pagination 启用项） */
  defaultDataSourceId?: string
}

/** 运行时句柄 */
export interface A2UIRuntime {
  /** 原始 schema */
  schema: PageSchema
  /** 合并后的 componentMap（含 Search/Table 绑定版） */
  componentMap: ComponentMapper
  /** 响应式 state（A2UIRoot 直接消费） */
  state: Ref<Record<string, any>>
  /** 归一化后的扁平节点（A2UIRoot 直接消费） */
  initialNodes: FlatA2Node[]
  /** 底层引擎实例（高级用法 / 测试） */
  pageRuntime: PageRuntime
  dataSourceManager: DataSourceManager
  apiResolver: ReturnType<typeof createApiResolver>
  httpClient: HttpClient
  /** 初始化（首屏 DataSource auto fetch） */
  init(): Promise<void>
  /** 处理 A2UIRoot 上抛的 message（内部路由到 action dispatcher） */
  handleMessage(message: A2Message): void
  /** 销毁 */
  destroy(): void
}

// ===========================================================================
// State / Context 工具
// ===========================================================================

function getPathValue(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

interface ActionCtx {
  row?: any
  form: any
  state: any
  datasource?: any
}

function resolveValue(spec: any, ctx: ActionCtx): any {
  if (spec == null || typeof spec !== 'string') return spec
  if (spec.startsWith('$')) return getPathValue(ctx.state, spec.slice(1))
  if (spec.startsWith('row.')) return getPathValue(ctx.row, spec.slice(4))
  return spec
}

function resolveBody(bodySpec: any, ctx: ActionCtx): any {
  if (!bodySpec) return undefined
  const result: Record<string, any> = {}
  if (bodySpec.from) Object.assign(result, getPathValue(ctx.state, bodySpec.from) || {})
  if (bodySpec.merge) {
    for (const [k, v] of Object.entries(bodySpec.merge)) result[k] = resolveValue(v, ctx)
  }
  return result
}

// ===========================================================================
// schema.components 归一化：namespace → 引擎名 + events → actions
// ===========================================================================

function createNormalizer(namespaceMap: Record<string, string>) {
  function normalizeNode(obj: any): any {
    if (Array.isArray(obj)) return obj.map(normalizeNode)
    if (obj && typeof obj === 'object') {
      const result: Record<string, any> = {}
      let eventActions: any[] | null = null
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'events' && v && typeof v === 'object') {
          // events: { click: 'actionName' } → actions: [{event, type:'emit', payload:{action}}]
          eventActions = Object.entries(v).map(([event, actionName]) => ({
            event,
            type: 'emit',
            payload: { action: actionName },
          }))
        } else if (
          (k === 'type' || k === 'component') &&
          typeof v === 'string' &&
          namespaceMap[v]
        ) {
          result[k] = namespaceMap[v]
        } else {
          result[k] = normalizeNode(v)
        }
      }
      if (eventActions) result.actions = [...(result.actions || []), ...eventActions]
      return result
    }
    return obj
  }

  return function buildFlatArray(components: Record<string, any>): FlatA2Node[] {
    return Object.entries(components || {}).map(([id, n]) => ({
      id,
      ...normalizeNode(n),
    })) as FlatA2Node[]
  }
}

// ===========================================================================
// 鉴权便捷构造：从 localStorage 读取 token
// ===========================================================================

function createLocalStorageAuth(cfg: RuntimeAuthConfig): AuthProvider {
  let warned = false
  const tokenPath = cfg.tokenPath || 'loginInfo.accessToken'
  return {
    getToken: () => {
      try {
        const raw = localStorage.getItem(cfg.cacheKey)
        if (!raw) {
          if (!warned) {
            warned = true
            console.warn(
              `[auth] 未在 localStorage 找到 key="${cfg.cacheKey}"，authorization 头将被省略。\n` +
                `本地联调可在控制台执行：localStorage.setItem('${cfg.cacheKey}', JSON.stringify({loginInfo:{accessToken:'YOUR_TOKEN'}}))`,
            )
          }
          return ''
        }
        const parsed = JSON.parse(raw)
        const token = getPathValue(parsed, tokenPath)
        if (!token && !warned) {
          warned = true
          console.warn(`[auth] localStorage["${cfg.cacheKey}"] 未找到 ${tokenPath}`)
        }
        return token || ''
      } catch (e) {
        if (!warned) {
          warned = true
          console.warn(`[auth] 解析失败：`, e)
        }
        return ''
      }
    },
    headerName: cfg.headerName || 'authorization',
    scheme: cfg.scheme ?? 'Bearer',
  }
}

// ===========================================================================
// createRuntime
// ===========================================================================

export function createRuntime(options: RuntimeOptions): A2UIRuntime {
  const { schema, componentMap: userComponentMap } = options

  // --- 1. 基础设施配置（全部来自 options，不读 schema） ---
  const baseURL = options.baseURL
  const env = (options.apiContext?.env as string) || 'dev'
  const project = (options.apiContext?.project as string) || schema.page.project
  const apiContext: ApiContext = {
    ...(options.apiContext || {}),
    env: env as any,
    ...(project ? { project } : {}),
  } as ApiContext

  // auth 支持两种形式：AuthProvider 实例 或 RuntimeAuthConfig（localStorage 读取）
  const authProvider: AuthProvider | undefined = options.auth
    ? ('getToken' in options.auth
        ? (options.auth as AuthProvider)
        : createLocalStorageAuth(options.auth as RuntimeAuthConfig))
    : undefined

  // --- 2. HttpClient ---
  const httpClient =
    options.httpClient ||
    createHttpClient({
      ...(baseURL ? { baseURL } : {}),
      ...(authProvider ? { auth: authProvider } : {}),
    })

  // --- 3. ApiResolver（scoped = schema.apis） ---
  const apiResolver = createApiResolver({
    scoped: schema.apis,
    defaultContext: apiContext,
  })

  /** 解析 apiKey → { url, method }（供 action handlers 使用） */
  async function resolveApi(apiKey: string): Promise<{ url: string; method?: HttpMethod }> {
    const resolved = await apiResolver.resolve(apiKey, apiContext)
    if (typeof resolved === 'string') return { url: resolved }
    return { url: resolved.url, method: resolved.method }
  }

  // --- 4. DataSourceManager + 声明式注册 ---
  const dataSourceManager = new DataSourceManager({
    httpClient,
    apiResolver,
    context: () => apiContext,
  })

  // list 类型 DataSource：transport 内把 runtimeParams 映射为 pageNo/pageSize + filter
  const listTransport: DataSourceTransport = async (request, runtimeParams, signal) => {
    const resolved = request.apiKey
      ? await apiResolver.resolve(request.apiKey, apiContext)
      : null
    const url = (typeof resolved === 'string' ? resolved : resolved?.url) ?? request.url
    const method = (
      (resolved != null && typeof resolved === 'object' ? resolved.method : undefined) ??
      request.method ??
      'POST'
    ) as HttpMethod
    const body = {
      pageNo: runtimeParams.page ?? 1,
      pageSize: runtimeParams.pageSize ?? 10,
      ...(runtimeParams.filter || {}),
    }
    const res = await httpClient.request({ url: url as string, method, body, signal })
    return res.data
  }

  // 按 schema.datasources 注册：list 类型（pagination 启用）走 DSM + listTransport；
  // 其余（detail / save 等）不注册 DSM，由 action handler 直接 httpClient.request 调用
  const dsEntries = Object.entries(schema.datasources || {})
  const listDsEntries = dsEntries.filter(([, c]) => c?.pagination?.enabled)
  for (const [id, dsCfg] of listDsEntries) {
    dataSourceManager.create({
      id,
      config: {
        kind: 'http',
        request: {
          apiKey: dsCfg.apiKey,
          ...(dsCfg.responseMap ? { responseMap: dsCfg.responseMap } : {}),
        },
        ...(dsCfg.pagination ? { pagination: dsCfg.pagination } : {}),
        ...(dsCfg.debounce != null ? { debounce: dsCfg.debounce } : {}),
        ...(dsCfg.auto != null ? { auto: dsCfg.auto } : {}),
      },
      // list 类型使用专用 transport（把 runtimeParams 映射为 pageNo/pageSize + filter）
      transport: listTransport,
    })
  }

  const defaultDataSourceId =
    options.defaultDataSourceId ||
    dsEntries.find(([, c]) => c?.auto !== false && c?.pagination?.enabled)?.[0] ||
    dsEntries[0]?.[0]

  // --- 5. PageRuntime ---
  const pageRuntime = new PageRuntime(dataSourceManager, {
    pageId: schema.page.id,
    defaultDataSourceId,
    context: apiContext,
    apiResolver,
  })

  // --- 6. State（runtime 持有，A2UIRoot 直接消费） ---
  const state = ref<Record<string, any>>(
    JSON.parse(JSON.stringify(schema.state || {})),
  )

  function patchState(path: string, value: any) {
    const data = state.value
    const keys = path.split('.')
    const top = keys[0]
    let topVal: any
    if (keys.length === 1) {
      topVal = value
    } else {
      topVal = Array.isArray(data[top]) ? [...data[top]] : { ...(data[top] || {}) }
      let cur = topVal
      for (let i = 1; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] || {}) }
        cur = cur[keys[i]]
      }
      cur[keys[keys.length - 1]] = value
    }
    state.value = { ...data, [top]: topVal }
  }

  function getVisiblePath(target: string): string | undefined {
    const comp = (schema as any).components?.[target]
    return comp?.bindings?.visible?.value
  }
  function setVisible(target: string, visible: boolean) {
    const path = getVisiblePath(target)
    if (path) patchState(path, visible)
  }
  function toggleVisible(target: string) {
    const path = getVisiblePath(target)
    if (path) patchState(path, !getPathValue(state.value, path))
  }

  // --- 7. Action Dispatcher ---
  const saving = ref(false)

  async function executeAction(action: any, ctx: ActionCtx) {
    const handler = actionHandlers[action.type]
    if (handler) await handler(action, ctx)
    else console.warn(`[action] 未注册的 type: "${action.type}"`)
  }

  const actionHandlers: Record<string, (action: any, ctx: ActionCtx) => Promise<void> | void> = {
    async 'ui.open'(action, ctx) {
      const { target, datasource, param, bind, defaults, set } = action
      if (set) {
        for (const [path, spec] of Object.entries(set)) patchState(path, resolveValue(spec, ctx))
      }
      if (defaults) patchState('forms.default', { ...defaults })
      if (datasource) {
        const ds = (schema as any).datasources?.[datasource]
        const api = await resolveApi(ds.apiKey)
        let url: string = api.url
        const paramVal = param ? resolveValue(param, ctx) : undefined
        if (paramVal != null) url += `/${paramVal}`
        try {
          const res = await httpClient.request({ url, method: api.method })
          const rbody = res.data as any
          if (rbody?.code === 200) {
            if (bind) patchState(bind, rbody.data)
          } else {
            ElMessage.error(rbody?.message || '请求失败')
            return
          }
        } catch (e: any) {
          ElMessage.error(e?.message || '请求失败')
          return
        }
      }
      if (target) setVisible(target, true)
    },

    async 'ui.close'(action) {
      if (action.target) setVisible(action.target, false)
    },

    async 'ui.toggle'(action) {
      if (action.target) toggleVisible(action.target)
    },

    async request(action, ctx) {
      const { datasource, param, bind, body, onSuccess, refresh, toast } = action
      // list 类型 datasource（defaultDataSourceId）走 PageRuntime 刷新（经 DSM + DataSource）
      if (datasource === defaultDataSourceId) {
        await pageRuntime.dispatch('page.refresh', { target: defaultDataSourceId })
        if (toast) ElMessage.success(toast)
        if (onSuccess) await executeAction(onSuccess, ctx)
        return
      }
      if (saving.value) return
      saving.value = true
      const ds = (schema as any).datasources?.[datasource]
      const api = await resolveApi(ds.apiKey)
      let url: string = api.url
      const paramVal = param ? resolveValue(param, ctx) : undefined
      if (paramVal != null) url += `/${paramVal}`
      const reqBody = resolveBody(body, ctx)
      try {
        const res = await httpClient.request({ url, method: api.method, body: reqBody })
        const rbody = res.data as any
        if (rbody?.code === 200) {
          if (bind) patchState(bind, rbody.data)
          if (onSuccess) await executeAction(onSuccess, ctx)
          if (refresh) await pageRuntime.dispatch('page.refresh', { target: refresh })
          if (toast) ElMessage.success(toast)
        } else {
          ElMessage.error(rbody?.message || '操作失败')
        }
      } catch (e: any) {
        ElMessage.error(e?.message || '操作失败')
      } finally {
        saving.value = false
      }
    },

    async emit(action) {
      console.log('[action.emit]', action.event, action.payload)
    },

    async updateState(action, ctx) {
      if (action.set) {
        for (const [path, spec] of Object.entries(action.set)) {
          patchState(path, resolveValue(spec, ctx))
        }
      }
    },
  }

  // --- 8. Message 路由（A2UIRoot @message → action 查表） ---
  const IGNORED_INNER_TYPES = new Set([
    'pageChange',
    'pageSizeChange',
    'sortChange',
    'rowClick',
    'rowDblClick',
    'selectionChange',
    'submit',
    'reset',
  ])

  function handleMessage(msg: A2Message) {
    const inner = (msg as any)?.payload
    if (inner && typeof inner === 'object' && inner.type) {
      if (IGNORED_INNER_TYPES.has(inner.type)) return
    }
    const actionName = inner?.action || (msg as any)?.action
    const action = (schema as any).actions?.[actionName]
    if (!action) return
    const ctx: ActionCtx = {
      row: inner?.row,
      form: getPathValue(state.value, 'forms.default'),
      state: state.value,
      datasource: (schema as any).datasources?.[action.datasource],
    }
    void executeAction(action, ctx)
  }

  // --- 9. componentMap：默认 + Search/Table 绑定版 + 用户覆盖 ---
  const defaultDsId = defaultDataSourceId
  const boundSearch = defineComponent({
    name: 'A2SearchRuntime',
    setup(_props, { attrs, slots }) {
      return () => {
        const dsId = (attrs as any).dataSourceId || defaultDsId
        const ds = dsId ? dataSourceManager.get(dsId) : undefined
        return h(A2Search, { ...attrs, dataSource: ds } as any, slots as any)
      }
    },
  })
  const boundTable = defineComponent({
    name: 'A2TableRuntime',
    setup(_props, { attrs, slots }) {
      return () =>
        h(
          A2Table,
          {
            ...attrs,
            pageRuntime,
            dataSourceId: (attrs as any).dataSourceId || defaultDsId,
          } as any,
          slots as any,
        )
    },
  })

  const componentMap = createComponentMap({
    'a2-search': boundSearch,
    'a2-table': boundTable,
    ...(userComponentMap || {}),
  })

  // --- 10. schema.components 归一化 ---
  const namespaceMap = { ...DEFAULT_NAMESPACE_MAP, ...(schema.componentRegistry || {}) }
  const buildFlatArray = createNormalizer(namespaceMap)
  const initialNodes = buildFlatArray((schema as any).components || {})

  // --- 11. init / destroy ---
  const init = async () => {
    await dataSourceManager.initAll()
  }

  const destroy = () => {
    pageRuntime.destroy()
    dataSourceManager.destroy()
  }

  return {
    schema,
    componentMap,
    state,
    initialNodes,
    pageRuntime,
    dataSourceManager,
    apiResolver,
    httpClient,
    init,
    handleMessage,
    destroy,
  }
}
