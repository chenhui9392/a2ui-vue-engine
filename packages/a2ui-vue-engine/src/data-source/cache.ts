/*
 * @Author: hui.chenn
 * @Description: LRU + TTL Cache（DataSource 专用）
 * @Date: 2026-07-01 10:00:00
 */
import type { DataSourceCache } from './types'

interface CacheEntry<T> {
  value: T
  expireAt: number
}

/** 简单 LRU + TTL 缓存 */
export class DataSourceCacheStore<T = any> {
  private map = new Map<string, CacheEntry<T>>()
  private ttl: number
  private maxSize: number

  constructor(options?: DataSourceCache) {
    this.ttl = options?.ttl ?? 60_000
    this.maxSize = options?.maxSize ?? 32
  }

  get(key: string): T | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expireAt) {
      this.map.delete(key)
      return undefined
    }
    // touch: LRU
    this.map.delete(key)
    this.map.set(key, entry)
    return entry.value
  }

  set(key: string, value: T): void {
    if (this.map.has(key)) {
      this.map.delete(key)
    } else if (this.map.size >= this.maxSize) {
      // 淘汰最老一条
      const oldestKey = this.map.keys().next().value
      if (oldestKey !== undefined) this.map.delete(oldestKey)
    }
    this.map.set(key, {
      value,
      expireAt: Date.now() + this.ttl,
    })
  }

  invalidate(key?: string): void {
    if (key === undefined) {
      this.map.clear()
    } else {
      this.map.delete(key)
    }
  }

  size(): number {
    return this.map.size
  }
}

/** 稳定序列化对象为 cache key */
export function stableKey(obj: any): string {
  if (obj === undefined || obj === null) return String(obj)
  if (typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableKey).join(',') + ']'
  }
  const keys = Object.keys(obj).sort()
  return '{' + keys.map(k => `${JSON.stringify(k)}:${stableKey(obj[k])}`).join(',') + '}'
}
