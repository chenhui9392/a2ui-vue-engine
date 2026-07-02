/*
 * @Author: hui.chenn
 * @Description: DataSourceManager - 管理一组 DataSource 实例（可选高层聚合）
 *   与具体消费方（Table / Tree / Chart / Description）无关；由宿主 / Page Runtime 使用。
 * @Date: 2026-07-01 10:00:00
 */
import { DataSource, DataSourceOptions } from './DataSource'
import type { DataSourceConfig, DataSourceTransport } from './types'

export interface DataSourceManagerOptions {
  transport?: DataSourceTransport
}

export class DataSourceManager {
  private map = new Map<string, DataSource<any>>()
  private transport?: DataSourceTransport

  constructor(options?: DataSourceManagerOptions) {
    this.transport = options?.transport
  }

  /** 注册一个 DataSource；若同 id 已存在则先销毁旧实例 */
  create<T = any>(options: DataSourceOptions): DataSource<T> {
    if (this.map.has(options.id)) {
      this.map.get(options.id)?.destroy()
    }
    const ds = new DataSource<T>({
      ...options,
      transport: options.transport || this.transport,
    })
    this.map.set(options.id, ds)
    return ds
  }

  /** 声明式批量注册 */
  register(sources: Record<string, DataSourceConfig>): void {
    for (const [id, config] of Object.entries(sources || {})) {
      this.create({ id, config })
    }
  }

  get<T = any>(id: string): DataSource<T> | undefined {
    return this.map.get(id) as DataSource<T> | undefined
  }

  has(id: string): boolean {
    return this.map.has(id)
  }

  /** 触发单个 DataSource 刷新 */
  refresh(id: string): Promise<void> {
    const ds = this.map.get(id)
    if (!ds) return Promise.resolve()
    return ds.refresh()
  }

  /** 触发全部 DataSource 刷新 */
  refreshAll(): Promise<void[]> {
    return Promise.all(Array.from(this.map.values()).map(ds => ds.refresh()))
  }

  /** 首屏批量初始化 */
  initAll(): Promise<void[]> {
    return Promise.all(Array.from(this.map.values()).map(ds => ds.init()))
  }

  /** 卸载单个数据源 */
  remove(id: string): void {
    const ds = this.map.get(id)
    if (ds) {
      ds.destroy()
      this.map.delete(id)
    }
  }

  /** 销毁全部 */
  destroy(): void {
    this.map.forEach(ds => ds.destroy())
    this.map.clear()
  }

  /** 遍历 */
  forEach(fn: (ds: DataSource<any>, id: string) => void): void {
    this.map.forEach((v, k) => fn(v, k))
  }
}
