/*
 * @Author: hui.chenn
 * @Description: DataSource 结构测试
 *   验证：类型导出、静态数据模式、分页参数、缓存 stableKey、Manager 生命周期
 *   （项目当前未接入 vitest；本文件为轻量断言脚本，
 *    保持与 A2Table.test.ts 同风格；后续接入 vitest 时可平滑改写。）
 * @Date: 2026-07-01 10:00:00
 */
import {
  DataSource,
  DataSourceManager,
  createDataSource,
  defineDataSource,
  DataSourceCacheStore,
  stableKey,
  buildRequestUrl,
  mergeRuntimeParams,
} from '../index'

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`[DataSource.test] Assertion failed: ${msg}`)
}

// 1. 静态数据模式：init() 立即置为 success
const staticDs = createDataSource({
  id: 'static-1',
  config: {
    kind: 'static',
    data: [{ id: 1 }, { id: 2 }],
    auto: true,
  },
})
staticDs.init()
assert(staticDs.state.status === 'success', 'static ds should be success')
assert(Array.isArray(staticDs.state.data), 'static ds data should be array')
assert(staticDs.state.meta.total === 2, 'static ds total should be 2')

// 2. auto=false 时 init 不改变状态
const idleDs = createDataSource({
  id: 'idle-1',
  config: {
    kind: 'http',
    request: { url: '/api/mock', method: 'GET' },
    auto: false,
  },
})
idleDs.init()
assert(idleDs.state.status === 'idle', 'auto=false ds should stay idle after init')

// 3. defineDataSource 便利函数
const definedDs = defineDataSource('define-1', {
  kind: 'static',
  data: { id: 99 },
  auto: false,
})
assert(definedDs instanceof DataSource, 'defineDataSource returns DataSource instance')

// 4. Manager 注册 / 查找 / 卸载
const manager = new DataSourceManager()
manager.register({
  ordersA: { kind: 'static', data: [{ id: 'a' }], auto: false },
  ordersB: { kind: 'static', data: [{ id: 'b' }], auto: false },
})
assert(manager.has('ordersA'), 'Manager should contain ordersA')
assert(manager.has('ordersB'), 'Manager should contain ordersB')
assert(manager.get('ordersA') instanceof DataSource, 'Manager.get returns DataSource')
manager.remove('ordersA')
assert(!manager.has('ordersA'), 'ordersA should be removed')
manager.destroy()
assert(!manager.has('ordersB'), 'ordersB should be gone after destroy')

// 5. LRU + TTL Cache
const cache = new DataSourceCacheStore({ ttl: 10_000, maxSize: 2 })
cache.set('k1', 1)
cache.set('k2', 2)
assert(cache.get('k1') === 1, 'k1 hit')
cache.set('k3', 3) // 淘汰最老 k2
assert(cache.get('k2') === undefined, 'k2 evicted by LRU')
assert(cache.get('k3') === 3, 'k3 hit')

// 6. stableKey 稳定序列化
const key1 = stableKey({ b: 2, a: 1 })
const key2 = stableKey({ a: 1, b: 2 })
assert(key1 === key2, 'stableKey should be order-independent')

// 7. buildRequestUrl
assert(
  buildRequestUrl('/api/list', { page: 1, size: 20 }) === '/api/list?page=1&size=20',
  'buildRequestUrl basic'
)
assert(
  buildRequestUrl('/api/list?keep=1', { page: 2 }) === '/api/list?keep=1&page=2',
  'buildRequestUrl preserves existing query'
)

// 8. mergeRuntimeParams
const { query, body } = mergeRuntimeParams(
  { url: '/api', method: 'POST', params: { fixed: 1 } },
  {
    page: 2,
    pageSize: 10,
    filter: { type: 'x' },
    search: 'kw',
    sort: { field: 'createdAt', order: 'desc' },
    extra: { include: 'a,b' },
  }
)
assert(query.page === 2 && query.pageSize === 10, 'runtime query merges pagination')
assert(query.search === 'kw', 'runtime query includes search')
assert(query.sortField === 'createdAt', 'runtime query maps sort field')
assert(query.type === 'x', 'runtime query merges filter')
assert(query.include === 'a,b', 'runtime query merges extra')
assert(body && body.page === 2 && body.search === 'kw', 'POST body inherits runtime params')

// eslint-disable-next-line no-console
console.log('[DataSource.test] All structural assertions passed.')

export {}
