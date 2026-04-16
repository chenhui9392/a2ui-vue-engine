/*
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:42:38
 * @LastEditTime: 2026-04-15 16:21:19
 * @LastEditors: hui.chenn
 */
import type { App, Plugin } from 'vue'
import type { A2UIPluginOptions, ComponentMapper } from '../types'
import { installA2UIRoot } from '../root'
import { registerComponents, createComponentMap } from '../components'

// Plugin symbol for injection
export const A2UIPluginSymbol = Symbol('A2UI')

// Create A2UI plugin
export function createA2UI(options: A2UIPluginOptions = {}): Plugin {
  const plugin: Plugin = {
    install(app: App) {
      // Register root component
      installA2UIRoot(app)
      
      // Register custom components
      if (options.components) {
        registerComponents(options.components)
      }
      
      // Provide plugin options
      app.provide(A2UIPluginSymbol, {
        options,
        componentMap: createComponentMap(options.components),
      })
      
      // Global error handler
      if (options.onError) {
        app.config.errorHandler = (err, instance, info) => {
          options.onError?.(err as Error)
          console.error('A2UI Error:', err, info)
        }
      }
      
      // Register global properties
      app.config.globalProperties.$a2ui = {
        componentMap: createComponentMap(options.components),
        theme: options.theme,
      }
    },
  }
  
  return plugin
}

// Default plugin instance
export const A2UIPlugin: Plugin = {
  install(app: App) {
    installA2UIRoot(app)
  },
}

// Export types
export type { A2UIPluginOptions, ComponentMapper }