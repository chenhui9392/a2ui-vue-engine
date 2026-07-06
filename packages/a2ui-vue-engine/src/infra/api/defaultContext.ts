/*
 * @Author: hui.chenn
 * @Description: 默认 ApiContext 推导
 *   - 优先读 VITE_API_ENV（Vite 项目）
 *   - 否则按 hostname 推断：localhost → dev，含 test/staging → test，其余 → prod
 *   - Node / 非 Vite 环境安全降级
 * @Date: 2026-07-06 10:00:00
 */
import type { ApiContext, ApiEnv } from './types'

/** 从 import.meta.env / location 推导默认 ApiContext */
export function defaultContextFromEnv(): ApiContext {
  let envExplicit: ApiEnv | undefined
  try {
    // Vite 注入；非 Vite 环境为 undefined
    envExplicit = ((import.meta as any)?.env?.VITE_API_ENV) as ApiEnv | undefined
  } catch {
    // import.meta 不可访问（部分 Node / 旧打包器）
  }

  const hostname =
    (typeof window !== 'undefined' && window.location?.hostname) || ''

  let env: ApiEnv = envExplicit || 'prod'
  if (!envExplicit && hostname) {
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      env = 'dev'
    } else if (hostname.includes('test') || hostname.includes('staging')) {
      env = 'test'
    }
  }

  return { env }
}
