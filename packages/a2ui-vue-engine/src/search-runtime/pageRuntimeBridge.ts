/*
 * @Author: hui.chenn
 * @Description: SearchDataSourceBridge Factory
 *   把 SearchRuntime 与 PageRuntime 桥接：
 *
 *   Search 内部 submit / reset → 通过 dispatch 走 PageRuntime → DataSource → HttpClient
 *
 *   严格遵守 architecture/table-design.md、action-system.md、datasource-execution.md：
 *   - Search 不 fetch、不知道 URL
 *   - Search 只 emit / dispatch
 *   - PageRuntime 是唯一司机
 * @Date: 2026-07-02 10:00:00
 */
import type { PageRuntime } from '../page-runtime'
import type { SearchDataSourceBridge } from './types'

/**
 * 把 SearchRuntime 桥接到 PageRuntime + DataSourceManager
 *
 * @param runtime PageRuntime 实例
 * @param dataSourceId 关联的 DataSource id（可选，缺省用 PageRuntime 默认）
 */
export function createPageRuntimeSearchBridge(
  runtime: PageRuntime,
  dataSourceId?: string
): SearchDataSourceBridge {
  return {
    submit(filter) {
      // Search → Action('request'/setFilter) → PageRuntime.dispatch → DataSource
      void runtime.dispatch('search.submit', {
        target: dataSourceId,
        values: filter,
        filter,
      })
    },
    reset() {
      void runtime.dispatch('search.reset', { target: dataSourceId })
    },
  }
}
