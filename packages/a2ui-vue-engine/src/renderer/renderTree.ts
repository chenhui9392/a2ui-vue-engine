/*
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:38:06
 * @LastEditTime: 2026-04-15 15:38:38
 * @LastEditors: hui.chenn
 */
import { VNode, Fragment, h } from 'vue'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from './renderNode'

// Render a tree of A2Nodes to VNode array
export function renderTree(
  tree: A2Node | A2Node[],
  context: RenderContext
): VNode[] {
  if (Array.isArray(tree)) {
    return tree
      .map(node => renderNode(node, context))
      .filter((vnode): vnode is VNode => vnode !== null)
  }
  
  const vnode = renderNode(tree, context)
  return vnode ? [vnode] : []
}

// Render tree with fragment wrapper
export function renderTreeFragment(
  tree: A2Node | A2Node[],
  context: RenderContext
): VNode {
  const vnodes = renderTree(tree, context)
  return h(Fragment, vnodes)
}

// Render tree with root wrapper
export function renderTreeWithRoot(
  tree: A2Node,
  context: RenderContext,
  rootTag: string = 'div'
): VNode {
  const vnodes = renderTree(tree, context)
  return h(rootTag, { class: 'a2-root' }, vnodes)
}

// Create render context
export function createRenderContext(
  data: Record<string, any>,
  componentMap: RenderContext['componentMap'],
  options: Partial<Omit<RenderContext, 'data' | 'componentMap'>> = {}
): RenderContext {
  return {
    data,
    componentMap,
    globalProps: options.globalProps,
    onEvent: options.onEvent,
  }
}

// Update render context data
export function updateRenderContextData(
  context: RenderContext,
  newData: Record<string, any>
): RenderContext {
  return {
    ...context,
    data: { ...context.data, ...newData },
  }
}

// Merge render contexts
export function mergeRenderContext(
  base: RenderContext,
  overrides: Partial<RenderContext>
): RenderContext {
  return {
    ...base,
    ...overrides,
    data: { ...base.data, ...overrides.data },
    globalProps: { ...base.globalProps, ...overrides.globalProps },
  }
}