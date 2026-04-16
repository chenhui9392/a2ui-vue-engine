/*
 * @Author: hui.chenn
 * @Description: Component utilities
 * @Date: 2026-04-15 16:29:00
 * @LastEditTime: 2026-04-15 16:29:51
 * @LastEditors: hui.chenn
 */
import { inject, type VNode } from 'vue'
import type { A2Node, RenderContext, BindingConfig } from '../types'
import { renderNode } from '../renderer/renderNode'

// Inject render context
export function useRenderContext(): RenderContext | undefined {
  return inject('a2uiRenderContext')
}

// Inject data
export function useA2UIData(): Record<string, any> | undefined {
  return inject('a2uiData')
}

// Render children nodes
export function renderChildren(
  children: A2Node[] | string | undefined,
  context: RenderContext
): VNode[] | string | null {
  if (!children) return null
  if (typeof children === 'string') return children
  return children
    .map(child => renderNode(child, context))
    .filter((vnode): vnode is VNode => vnode !== null)
}

// Create action handler
export function createActionHandler(
  actions: Array<{ event: string; handler?: string; payload?: any }>,
  emit: (event: string, payload?: any) => void
): Record<string, (e: Event) => void> {
  const handlers: Record<string, (e: Event) => void> = {}
  
  for (const action of actions) {
    const eventName = `on${capitalize(action.event)}`
    handlers[eventName] = (e: Event) => {
      emit(action.event, { originalEvent: e, payload: action.payload })
    }
  }
  
  return handlers
}

// Capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}