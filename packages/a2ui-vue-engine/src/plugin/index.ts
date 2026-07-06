/*
 * @Author: hui.chenn
 * @Description: A2UI Plugin - Vue app 注册入口
 *   V2 升级：install 时按 options 构造 ApiResolver / EnvManager，
 *   通过 provide 链暴露给组件树（inject A2UIPluginSymbol）。
 * @Date: 2026-04-15 15:42:38
 * @LastEditTime: 2026-07-06 10:00:00
 * @LastEditors: hui.chenn
 */
import type { App, Plugin } from 'vue'
import type { A2UIPluginOptions, ComponentMapper } from '../types'
import type { ApiResolver, ApiContext } from '../infra/api'
import type { EnvManager } from '../infra/env'
import { createApiResolver, defaultContextFromEnv } from '../infra/api'
import { createEnvManager } from '../infra/env'
import { installA2UIRoot } from '../root'
import { registerComponents, createComponentMap } from '../components'

// Plugin symbol for injection
export const A2UIPluginSymbol = Symbol('A2UI')

/** 通过 provide 注入的内容（组件树可 inject 消费） */
export interface A2UIPluginContext {
  options: A2UIPluginOptions
  componentMap: ReturnType<typeof createComponentMap>
  apiResolver?: ApiResolver
  envManager?: EnvManager
  httpClient?: A2UIPluginOptions['httpClient']
  defaultContext?: Partial<ApiContext>
}

/** 把 options.env 归一为 EnvManager（字符串 → 实例） */
function ensureEnvManager(
  env: A2UIPluginOptions['env'],
): EnvManager | undefined {
  if (!env) return undefined
  if (typeof env === 'string') {
    // 字符串 → 单环境 EnvManager（baseURLs 仅含该 env）
    return createEnvManager(env, { [env]: '' } as Record<string, string>)
  }
  return env
}

/** 按 options 构造 ApiResolver（已提供则原样返回） */
function ensureApiResolver(options: A2UIPluginOptions): ApiResolver | undefined {
  if (options.apiResolver) return options.apiResolver
  if (!options.apiEntries && !options.apiProvider) return undefined
  return createApiResolver({
    entries: options.apiEntries,
    provider: options.apiProvider,
    defaultContext: options.defaultContext,
  })
}

// Create A2UI plugin
export function createA2UI(options: A2UIPluginOptions = {}): Plugin {
  // 在 install 外预构造，保证一个 plugin 实例只构造一次
  const apiResolver = ensureApiResolver(options)
  const envManager = ensureEnvManager(options.env)
  const defaultContext = options.defaultContext ?? defaultContextFromEnv()

  const plugin: Plugin = {
    install(app: App) {
      // Register root component
      installA2UIRoot(app)

      // Register custom components
      if (options.components) {
        registerComponents(options.components)
      }

      // Provide plugin context（含 ApiResolver / EnvManager / HttpClient）
      const ctx: A2UIPluginContext = {
        options,
        componentMap: createComponentMap(options.components),
        apiResolver,
        envManager,
        httpClient: options.httpClient,
        defaultContext,
      }
      app.provide(A2UIPluginSymbol, ctx)

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
        apiResolver,
        envManager,
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
