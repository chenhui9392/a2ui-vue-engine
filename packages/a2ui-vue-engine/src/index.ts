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

// Root
export { A2UIRoot, installA2UIRoot } from './root'
export { default as A2UIRootComponent } from './root'

// Plugin
export { createA2UI, A2UIPlugin, A2UIPluginSymbol } from './plugin'

// Default export
import { A2UIPlugin } from './plugin'
export default A2UIPlugin
