# DataSource 使用指南

DataSource 是 A2UI V2 的一等公民能力，把 **HTTP 数据获取 / Loading / Refresh / Search / 分页 / Cache / Retry / 统一错误** 收敛为独立模块，与任何具体消费方（Table / Tree / Chart / Description ...）解耦。

> 设计文档：[DataSource 设计](/architecture/datasource) · [Page Runtime 设计](/architecture/page-runtime-design)

---

## 1. 快速开始

```ts
import { createDataSource } from 'a2ui-vue-engine'

const ds = createDataSource({
  id: 'orderList',
  config: {
    kind: 'http',
    request: {
      url: '/api/orders',
      method: 'GET',
      responseMap: { list: 'data.list', total: 'data.total' },
    },
    pagination: { enabled: true, pageSize: 20 },
    cache: { enabled: true, ttl: 60_000 },
    retry: { count: 2, delay: 500, backoff: 2 },
    auto: true,
  },
})

ds.init()

// 响应式消费
const rows = ds.list
const loading = ds.loading
const meta = ds.meta
const error = ds.error
```

---

## 2. 支持的能力

- **HTTP 方法**：`GET / POST / PUT / DELETE / PATCH`
- **分页**：`page` / `cursor` 双模式
- **Loading / Refreshing**：状态机 `idle → loading → success | error`；`refresh` 时保留旧数据
- **Refresh**：命令式 `refresh()` / `refreshOn` 声明式依赖
- **Search / Filter / Sort**：`setSearch / setFilter / setSort`（Search / Filter 默认 debounce 300ms）
- **Cache**：LRU + TTL；`force: true` 跳过缓存
- **Retry**：可重试错误按 `count / delay / backoff` 指数退避
- **统一错误**：`DataSourceError { code, message, status?, retriable? }`
- **静态数据**：`kind: 'static'`（无 HTTP，直接消费本地数据）

---

## 3. Schema

```ts
interface DataSourceConfig {
  kind?: 'http' | 'static'
  request?: {
    url?: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    params?: Record<string, any>
    body?: any
    headers?: Record<string, string>
    timeout?: number
    credentials?: RequestCredentials
    responseMap?: {
      list?: string     // 数组字段路径
      total?: string    // 总数字段路径
      data?: string     // 单条数据字段路径（Description 场景）
      cursor?: string
      nextCursor?: string
      hasMore?: string
    }
  }
  data?: any            // kind = 'static' 时使用
  pagination?: {
    enabled?: boolean
    mode?: 'page' | 'cursor'
    initialPage?: number
    pageSize?: number
    paramsMap?: { page?: string; pageSize?: string; cursor?: string }
  }
  cache?: {
    enabled?: boolean
    ttl?: number
    maxSize?: number
  }
  retry?: {
    count?: number
    delay?: number
    backoff?: number
    isRetryable?: (err: DataSourceError) => boolean
  }
  auto?: boolean        // 是否自动首屏加载，默认 true
  refreshOn?: string[]  // 依赖字段变更时自动 refresh
  debounce?: number     // search / filter debounce ms，默认 300
}
```

---

## 4. State（响应式）

```ts
interface DataSourceState<T = any> {
  status: 'idle' | 'loading' | 'refreshing' | 'success' | 'error'
  data: T | T[] | null
  meta: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
    cursor: any
    nextCursor: any
  }
  error: DataSourceError | null
  params: {
    page?: number
    pageSize?: number
    cursor?: any
    sort?: { field: string; order: 'asc' | 'desc' } | null
    filter?: Record<string, any>
    search?: string
    extra?: Record<string, any>
  }
  updatedAt: number
}
```

---

## 5. API

### `DataSource` 实例方法

| 方法 | 说明 |
|------|------|
| `init()` | 幂等首屏加载（若 `auto=false` 不触发） |
| `fetch(options?)` | 手动触发一次请求 |
| `refresh(options?)` | 刷新（保留旧数据） |
| `setPage(page)` | 设置页码（触发刷新） |
| `setPageSize(size)` | 设置每页大小（回到首页） |
| `setCursor(cursor)` | cursor 模式翻页 |
| `setSort(sort)` | 设置排序 |
| `setSearch(kw)` | 设置搜索（debounce） |
| `setFilter(filter)` | 设置筛选（debounce） |
| `setExtra(extra)` | 追加自定义参数 |
| `invalidateCache()` | 清空缓存 |
| `abort()` | 取消进行中的请求 |
| `destroy()` | 销毁：取消请求 + 清缓存 |
| `bindRefreshOn(resolve)` | 绑定 `refreshOn` 依赖字段监听 |

### `DataSourceManager`

统一管理一组 DataSource：

```ts
import { DataSourceManager } from 'a2ui-vue-engine'

const manager = new DataSourceManager()

manager.register({
  orderList:  { kind: 'http', request: { url: '/api/orders' } },
  userDetail: { kind: 'http', request: { url: '/api/users/1' } },
})

await manager.initAll()

manager.refresh('orderList')
manager.refreshAll()
manager.remove('userDetail')
manager.destroy()
```

---

## 6. 自定义 Transport

DataSource 的请求执行器可以完全替换（axios / MCP / GraphQL / 内部网关）：

```ts
import { createDataSource, DataSourceTransport } from 'a2ui-vue-engine'

const axiosTransport: DataSourceTransport = async (request, runtimeParams, signal) => {
  const res = await axios({
    url: request.url,
    method: request.method,
    params: runtimeParams,
    signal,
  })
  return res.data
}

const ds = createDataSource({
  id: 'orderList',
  config: { kind: 'http', request: { url: '/api/orders' } },
  transport: axiosTransport,
})
```

---

## 7. 与消费方的关系（不绑定 Table）

DataSource 只暴露标准 State，任何组件都可以消费：

- **Table**（V2）：`bindings.dataSource → orderList` → 消费 `list / meta / status`
- **Tree**（V2.4）：同上，`data` 是层级树形数组
- **Chart**（V3）：`data` 是 series 数据
- **Description**（V2）：`data` 是单条对象（`responseMap.data`）
- **Statistic / KPI**（V3）：消费 `data.count / value`

DataSource 内部 **不 import 任何组件**，因此：

- 未来新增消费方无需修改 DataSource；
- Tree / Chart / Description 可完全复用；
- Playground、单元测试可脱离组件独立验证。

---

## 8. 统一错误对象

```ts
interface DataSourceError {
  code: string          // HTTP_500 / NETWORK_ERROR / ABORTED / CONFIG_MISSING_URL / UNKNOWN / ...
  message: string
  status?: number
  cause?: unknown
  retriable?: boolean
}
```

Retry 默认判定规则：`5xx` 与 `NETWORK_ERROR` 可重试；`ABORTED` 与 `4xx` 不重试。可通过 `retry.isRetryable` 完全覆盖。

---

## 9. 与 Page Runtime 的关系

Page Runtime 会自动为每个 `a2-page` 节点建立作用域并注册其中声明的 `dataSources`；未来通过 `ActionConfig.type: 'datasource'` 让 Schema 声明式触发 `refresh / setPage / setSort / setFilter`。详见 [Page Runtime 设计](/architecture/page-runtime-design)。

在 Page Runtime 落地之前，DataSource 已可 **完全独立** 使用（宿主直接实例化 + 消费）。

---

## 10. 里程碑

| 阶段 | 能力 | 状态 |
|------|------|------|
| V2.0 MVP | GET/POST/PUT/DELETE、分页（page / cursor）、Loading、Refresh、Search / Filter、Cache、Retry、统一错误、Manager | ✅ 已交付 |
| V2.1 | Page Runtime `ActionConfig.type: 'datasource'` 分支落地 | 计划中 |
| V2.2 | `refreshOn` 与 A2UIRoot.data 桥接 | 计划中 |
| V3.x | 乐观更新、依赖图、WebSocket、MCP transport | 长期 |
