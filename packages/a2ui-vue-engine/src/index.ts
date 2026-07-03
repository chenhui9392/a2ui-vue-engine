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
export * from './mapper'

// Renderer
export * from './renderer'

// Components
export * from './components'

// HTTP Client (Runtime 网络门面：Adapter Pattern，Runtime 不直接依赖 axios / fetch)
export * from './http'

// DataSource (V2 · additive, 不绑定 Table，可被 Tree / Chart / Description 等复用)
export * from './data-source'

// Page Runtime (Coordinator + PageState + Dispatch，唯一司机)
export * from './page-runtime'

// Search Runtime (V2 · additive, 协议驱动，Form + DataSource 桥接)
export * from './search-runtime'

// Dialog Runtime (V2 · additive, Dialog / Drawer 共享的统一 Runtime)
export * from './dialog-runtime'

// Root
export { A2UIRoot, installA2UIRoot } from './root'
export { default as A2UIRootComponent } from './root'

// Plugin
export { createA2UI, A2UIPlugin, A2UIPluginSymbol } from './plugin'

// Default export
import { A2UIPlugin } from './plugin'
export default A2UIPlugin
