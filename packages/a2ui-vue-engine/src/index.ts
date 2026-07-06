/*
 * @Author: hui.chenn
 * @Description:
 * @Date: 2026-04-15 15:43:25
 * @LastEditTime: 2026-04-16 17:30:00
 * @LastEditors: hui.chenn
 */
// Styles - 统一样式标准
import './styles/index.css'

// Types
export * from './types'

// Core
export * from './core'

// Mapper
export * from './core/mapper'

// Renderer
export * from './renderer'

// Components
export * from './components'

// HTTP Client (Runtime 网络门面：Adapter Pattern，Runtime 不直接依赖 axios / fetch)
export * from './infra/http'

// API Resolver (apiKey + context → resolved API，支持热更新 / 多环境 / 多租户)
export * from './infra/api'

// Env Manager (dev/test/prod/mock 切换 + baseURL 映射)
export * from './infra/env'

// DataSource (V2 · additive, 不绑定 Table，可被 Tree / Chart / Description 等复用)
export * from './engine/data-source'

// Runtime (PageRuntime / SearchRuntime / DialogRuntime / createRuntime 工厂)
export * from './runtime'

// Root
export { A2UIRoot, installA2UIRoot } from './root'
export { default as A2UIRootComponent } from './root'

// Plugin
export { createA2UI, A2UIPlugin, A2UIPluginSymbol } from './plugin'
export type { A2UIPluginContext } from './plugin'

// Default export
import { A2UIPlugin } from './plugin'
export default A2UIPlugin
