import { h, VNode, defineComponent, Component } from 'vue'
import type { A2Node, RenderContext, ComponentContext, ActionConfig, BindingConfig } from '../types'
import { resolveProps } from '../mapper'

// 组件列表：这些组件需要自己渲染 children，不应该通过 slots 传递
const SELF_RENDER_CHILDREN_TYPES = [
  'a2-text-field',
  'a2-card',
  'a2-row',
  'a2-column',
  'a2-list',
  'a2-button',
]

// Render a single A2Node to VNode
export function renderNode(
  node: A2Node,
  context: RenderContext
): VNode | null {
  const { componentMap, data, globalProps, onEvent } = context

  // Get component from map
  const component = componentMap[node.type]
  if (!component) {
    console.warn(`Component not found: ${node.type}`)
    return renderFallback(node)
  }

  // Resolve props with bindings
  const resolvedProps = resolveProps(
    { ...globalProps, ...node.props },
    node.bindings,
    data
  )

  // Create component context
  const componentContext: ComponentContext = {
    node,
    data,
    path: [node.id],
    emit: (event: string, payload?: any) => {
      onEvent?.(event, payload, componentContext)
    },
    resolveBinding: (binding: BindingConfig) => {
      return resolveProps({}, { _: binding }, data)._
    },
    executeAction: (action: ActionConfig, event?: Event) => {
      executeAction(action, event, componentContext)
    },
  }

  // Setup event handlers from actions
  const eventHandlers = createEventHandlers(node.actions || [], componentContext)

  // Pass children and context as props for components that render them internally
  const childrenProps: Record<string, any> = {}
  const shouldPassChildrenAsProps = SELF_RENDER_CHILDREN_TYPES.includes(node.type)

  if (node.children && Array.isArray(node.children)) {
    childrenProps.children = node.children
    childrenProps.context = context
  }
  if (node.slots) {
    childrenProps.slots = node.slots
    if (!childrenProps.context) {
      childrenProps.context = context
    }
  }

  // Render slots - 只有不需要自己渲染 children 的组件才通过 slots 传递
  const slots = shouldPassChildrenAsProps ? undefined : renderSlots(node, context)

  // Create VNode
  return h(component, {
    ...resolvedProps,
    ...childrenProps,
    ...eventHandlers,
    'data-a2-id': node.id,
    'data-a2-type': node.type,
  }, slots)
}

// Render fallback for unknown component
function renderFallback(node: A2Node): VNode {
  return h(
    'div',
    {
      class: 'a2-fallback',
      'data-a2-id': node.id,
      'data-a2-type': node.type,
    },
    `Unknown component: ${node.type}`
  )
}

// Render slots
function renderSlots(
  node: A2Node,
  context: RenderContext
): Record<string, () => VNode | VNode[]> | undefined {
  const slots: Record<string, () => VNode | VNode[]> = {}
  
  // Handle children as default slot
  if (node.children) {
    if (typeof node.children === 'string') {
      slots.default = () => node.children as unknown as VNode
    } else if (Array.isArray(node.children)) {
      slots.default = () => renderChildren(node.children as A2Node[], context)
    }
  }
  
  // Handle named slots
  if (node.slots) {
    for (const [slotName, slotNodes] of Object.entries(node.slots)) {
      slots[slotName] = () => renderChildren(slotNodes, context)
    }
  }
  
  return Object.keys(slots).length > 0 ? slots : undefined
}

// Render children array
function renderChildren(
  children: A2Node[],
  context: RenderContext
): VNode[] {
  return children
    .map(child => renderNode(child, context))
    .filter((vnode): vnode is VNode => vnode !== null)
}

// Create event handlers from actions
function createEventHandlers(
  actions: ActionConfig[],
  context: ComponentContext
): Record<string, (event: Event) => void> {
  const handlers: Record<string, (event: Event) => void> = {}
  
  for (const action of actions) {
    const eventName = `on${capitalize(action.event)}`
    handlers[eventName] = (event: Event) => {
      executeAction(action, event, context)
    }
  }
  
  return handlers
}

// Execute action
function executeAction(
  action: ActionConfig,
  event: Event | undefined,
  context: ComponentContext
): void {
  switch (action.type) {
    case 'emit':
      context.emit(action.event, action.payload)
      break
    
    case 'callback':
      if (action.handler) {
        const handlerFn = new Function('return ' + action.handler)() as (payload: any, event: Event | undefined, context: ComponentContext) => void
        if (typeof handlerFn === 'function') {
          handlerFn(action.payload, event, context)
        }
      }
      break
    
    case 'navigate':
      if (action.payload?.url) {
        if (action.payload.replace) {
          window.location.replace(action.payload.url)
        } else {
          window.location.href = action.payload.url
        }
      }
      break
    
    case 'api':
      // API calls would be handled by the root component
      context.emit('api', {
        action: action.handler,
        payload: action.payload,
        event,
      })
      break
  }
}

// Capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Create render function for dynamic component
export function createRenderFunction(
  node: A2Node,
  context: RenderContext
): Component {
  return defineComponent({
    name: `A2${capitalize(node.type)}`,
    setup() {
      return () => renderNode(node, context)
    },
  })
}