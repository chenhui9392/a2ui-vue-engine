/*
 * @Author: hui.chenn
 * @Description: 便利函数 - 独立创建单个 DataSource（无需 Manager）
 * @Date: 2026-07-01 10:00:00
 */
import { DataSource, DataSourceOptions } from './DataSource'
import type { DataSourceConfig, DataSourceTransport } from './types'

/**
 * 创建单个数据源（便利函数）。
 * @example
 * const ds = createDataSource({
 *   id: 'orderList',
 *   config: {
 *     kind: 'http',
 *     request: { url: '/api/orders', method: 'GET' },
 *     pagination: { enabled: true, pageSize: 20 },
 *     cache: { enabled: true, ttl: 60_000 },
 *     retry: { count: 2, delay: 500, backoff: 2 },
 *   },
 * })
 * ds.init()
 */
export function createDataSource<T = any>(options: DataSourceOptions): DataSource<T> {
  return new DataSource<T>(options)
}

/**
 * 通过声明快速创建（无 transport 覆盖时使用默认 fetch）。
 */
export function defineDataSource<T = any>(
  id: string,
  config: DataSourceConfig,
  transport?: DataSourceTransport
): DataSource<T> {
  return new DataSource<T>({ id, config, transport })
}
