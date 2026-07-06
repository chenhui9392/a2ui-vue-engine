/*
 * @Author: hui.chenn
 * @Description: EnvManager 类型定义
 *   - 多环境（dev/test/prod/mock）切换
 *   - env → baseURL 映射，供 HttpClient 与 ApiResolver 共用
 * @Date: 2026-07-06 10:00:00
 */
import type { ApiEnv } from '../api/types'

export interface EnvManager {
  /** 当前环境 */
  readonly current: ApiEnv
  /** 切换环境（通知订阅者） */
  setEnv: (env: ApiEnv) => void
  /** env → baseURL 映射表 */
  readonly baseURLs: Record<ApiEnv, string>
  /** 读取指定环境的 baseURL（缺省取 current） */
  getBaseURL: (env?: ApiEnv) => string
  /** 订阅环境变更 */
  subscribe: (fn: (env: ApiEnv) => void) => () => void
}
