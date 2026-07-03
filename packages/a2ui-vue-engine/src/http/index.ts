/*
 * @Author: hui.chenn
 * @Description: HttpClient 模块统一出口
 *   Runtime 通过此入口访问 HTTP 能力，不直接依赖 axios / fetch
 * @Date: 2026-07-02 10:00:00
 */
export * from './types'
export * from './utils'
export {
  HttpClient,
  createHttpClient,
  getDefaultHttpClient,
  setDefaultHttpClient,
} from './HttpClient'
export { FetchAdapter, defaultFetchAdapter } from './adapters/FetchAdapter'
export { MockAdapter } from './adapters/MockAdapter'
export type { MockHandler, MockRule } from './adapters/MockAdapter'
