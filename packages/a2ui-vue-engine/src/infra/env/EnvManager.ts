/*
 * @Author: hui.chenn
 * @Description: EnvManager 实现
 *   - createEnvManager(initial, baseURLs)
 *   - setEnv 触发订阅；getBaseURL 供 HttpClient.baseURL 动态切换
 * @Date: 2026-07-06 10:00:00
 */
import type { ApiEnv } from '../api/types'
import type { EnvManager } from './types'

export function createEnvManager(
  initial: ApiEnv,
  baseURLs: Record<ApiEnv, string>,
): EnvManager {
  let current: ApiEnv = initial
  const subs = new Set<(e: ApiEnv) => void>()

  return {
    get current() {
      return current
    },
    setEnv(env) {
      if (env === current) return
      current = env
      subs.forEach((fn) => fn(env))
    },
    get baseURLs() {
      return baseURLs
    },
    getBaseURL: (env) => baseURLs[env ?? current] ?? '',
    subscribe(fn) {
      subs.add(fn)
      return () => {
        subs.delete(fn)
      }
    },
  }
}
