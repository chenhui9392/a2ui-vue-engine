/**
 * @Author: hui.chenn
 * @Description: Convert flat JSON node array to tree structure
 * @Date: 2026-04-16 15:30:00
 */
import type { FlatA2Node, A2Node, BindingConfig, ActionConfig } from '../types'

/**
 * Convert flat node array to tree structure
 * @param flatNodes Array of flat nodes with id references
 * @param rootId The id of the root node (default: first node with id 'root')
 * @returns Tree node structure for rendering
 */
export function convertFlatToTree(flatNodes: FlatA2Node[], rootId?: string): A2Node | null {
  // Create a map for quick lookup
  const nodeMap = new Map<string, FlatA2Node>()
  flatNodes.forEach(node => {
    nodeMap.set(node.id, node)
  })

  // Find root node
  const rootNodeId = rootId || 'root'
  const rootNode = nodeMap.get(rootNodeId)
  if (!rootNode) {
    console.error('Root node not found:', rootNodeId)
    return null
  }

  // Recursively build tree using a recursive helper
  function buildTreeRecursive(flatNode: FlatA2Node, visited: Set<string>): A2Node {
    // Prevent circular references
    if (visited.has(flatNode.id)) {
      console.warn('Circular reference detected:', flatNode.id)
      return {
        id: flatNode.id,
        type: normalizeComponentName(flatNode.component),
        props: {},
      }
    }
    visited.add(flatNode.id)

    // Convert component name to type (lowercase with a2- prefix)
    const type = normalizeComponentName(flatNode.component)

    // Build props from flat node properties
    const props: Record<string, any> = buildProps(flatNode)

    // Build bindings
    const bindings: Record<string, BindingConfig> | undefined = buildBindings(flatNode)

    // Build actions
    const actions: ActionConfig[] | undefined = buildActions(flatNode)

    // Build children - pass the recursive function and nodeMap
    const children = buildChildren(flatNode, nodeMap, visited, buildTreeRecursive)

    return {
      id: flatNode.id,
      type,
      props,
      children,
      bindings,
      actions,
    }
  }

  return buildTreeRecursive(rootNode, new Set())
}

/**
 * Normalize component name: Card -> a2-card
 */
function normalizeComponentName(component: string): string {
  // Convert PascalCase to kebab-case with a2- prefix
  // Card -> card, TextField -> text-field
  const kebabCase = component
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '') // Remove leading dash (Card -> -card -> card)
    .replace(/^a2-/, '') // Remove existing a2- prefix if any
  return `a2-${kebabCase}`
}

/**
 * Build props object from flat node
 */
function buildProps(flatNode: FlatA2Node): Record<string, any> {
  const props: Record<string, any> = {}

  // Text content - 区分不同组件的处理
  if (flatNode.text) {
    // Text 组件使用 content 属性
    if (flatNode.component === 'Text') {
      props.content = flatNode.text
    }
    // Button 组件使用 text 属性
    else if (flatNode.component === 'Button') {
      props.text = flatNode.text
    }
    // 其他组件使用 text 属性
    else {
      props.text = flatNode.text
    }
  }

  // Label
  if (flatNode.label) {
    props.label = flatNode.label
  }

  // Variant (for Text and TextField)
  if (flatNode.variant) {
    props.variant = flatNode.variant
    // Map variant to TextField type
    if (flatNode.variant === 'longText') {
      props.type = 'textarea'
      props.rows = 4
    } else if (flatNode.variant === 'shortText') {
      props.type = 'text'
    } else if (flatNode.variant === 'h3') {
      props.size = 'large'
      props.bold = true
    }
  }

  // Alignment for Row/Column - different handling
  if (flatNode.align) {
    if (flatNode.component === 'Row') {
      // For Row: align maps to justify (horizontal alignment in Element Plus)
      // Element Plus uses: start, end, center, space-around, space-between, space-evenly
      props.justify = flatNode.align
      // Set default vertical align
      props.align = 'middle'
    } else if (flatNode.component === 'Column') {
      // For Column: Element Plus Col doesn't have align, but we can use style
      props.align = flatNode.align
    } else {
      props.align = flatNode.align
    }
  }

  // Justify for Row (if explicitly set)
  if (flatNode.justify) {
    props.justify = flatNode.justify
  }

  // Gap for Column spacing
  if (flatNode.gap !== undefined) {
    props.gap = flatNode.gap
  }

  // Button type (primary, success, warning, danger, info, default)
  if (flatNode.type) {
    props.type = flatNode.type
  }

  // Icon name
  if (flatNode.name) {
    props.icon = flatNode.name
  }

  // DateTimeInput props
  if (flatNode.enableDate !== undefined) {
    props.enableDate = flatNode.enableDate
  }
  if (flatNode.enableTime !== undefined) {
    props.enableTime = flatNode.enableTime
  }

  // Card 宽度标准 - 仅适用于 Card 组件
  if (flatNode.width && flatNode.component === 'Card') {
    props.width = flatNode.width
  }

  // Textarea rows
  if (flatNode.rows !== undefined) {
    props.rows = flatNode.rows
  }

  // Placeholder
  if (flatNode.placeholder) {
    props.placeholder = flatNode.placeholder
  }

  // SelectField options - 下拉框选项
  if (flatNode.options && Array.isArray(flatNode.options)) {
    props.options = flatNode.options
  }

  // SelectField clearable - 是否可清空
  if (flatNode.clearable !== undefined) {
    props.clearable = flatNode.clearable
  }

  // ChoicePicker 多选选项
  if (flatNode.choiceOptions && Array.isArray(flatNode.choiceOptions)) {
    props.options = flatNode.choiceOptions
  }

  // ChoicePicker 列数
  if (flatNode.columns !== undefined) {
    props.columns = flatNode.columns
  }

  // ChoicePicker 显示样式
  if (flatNode.displayStyle) {
    props.displayStyle = flatNode.displayStyle
  }

  // 禁用/只读
  if (flatNode.disabled !== undefined) {
    props.disabled = flatNode.disabled
  }

  // 必填
  if (flatNode.required !== undefined) {
    props.required = flatNode.required
  }

  // OptionCard 组件属性
  if (flatNode.component === 'OptionCard') {
    // 标题使用 label，标题前的图标使用 name
    if (flatNode.label) {
      props.title = flatNode.label
    }
    // 内容文本
    if (flatNode.content) {
      props.content = flatNode.content
    }
    // 图标
    if (flatNode.name) {
      props.icon = flatNode.name
    }
    // 选中状态
    if (flatNode.selected !== undefined) {
      props.selected = flatNode.selected
    }
    // 尺寸
    if (flatNode.variant && ['small', 'default', 'large'].includes(flatNode.variant)) {
      props.size = flatNode.variant
    }
    // 卡片代表的值（用于单选互斥）
    if (flatNode.cardValue !== undefined) {
      props.value = flatNode.cardValue
    }
  }

  return props
}

/**
 * Build bindings from value.path
 */
function buildBindings(flatNode: FlatA2Node): Record<string, BindingConfig> | undefined {
  if (!flatNode.value?.path) return undefined

  // Convert /form/name to form.name for path resolution
  let bindingPath = flatNode.value.path
  if (bindingPath.startsWith('/')) {
    // Remove leading slash and convert slashes to dots
    bindingPath = bindingPath.substring(1).replace(/\//g, '.')
  }

  // Create modelValue binding
  const bindings: Record<string, BindingConfig> = {
    modelValue: {
      type: 'path',
      value: bindingPath,
    },
  }

  return bindings
}

/**
 * Build actions from action config
 */
function buildActions(flatNode: FlatA2Node): ActionConfig[] | undefined {
  if (!flatNode.action?.event?.name) return undefined

  return [
    {
      event: 'click',
      type: 'emit',
      payload: {
        eventName: flatNode.action.event.name,
      },
    },
  ]
}

/**
 * Build children array from child/children references
 */
function buildChildren(
  flatNode: FlatA2Node,
  nodeMap: Map<string, FlatA2Node>,
  visited: Set<string>,
  buildTreeRecursive: (node: FlatA2Node, visited: Set<string>) => A2Node
): A2Node[] | string | undefined {
  const childIds: string[] = []

  // Handle single child
  if (flatNode.child) {
    if (Array.isArray(flatNode.child)) {
      childIds.push(...flatNode.child)
    } else {
      childIds.push(flatNode.child)
    }
  }

  // Handle children array
  if (flatNode.children) {
    childIds.push(...flatNode.children)
  }

  // No children
  if (childIds.length === 0) {
    // For Text component, return text content as string
    if (flatNode.text && flatNode.component === 'Text') {
      return undefined // text is in props
    }
    return undefined
  }

  // Build child nodes
  const childNodes: A2Node[] = []
  for (const childId of childIds) {
    const childNode = nodeMap.get(childId)
    if (childNode) {
      childNodes.push(buildTreeRecursive(childNode, visited))
    } else {
      console.warn('Child node not found:', childId, 'in parent:', flatNode.id)
    }
  }

  return childNodes.length > 0 ? childNodes : undefined
}

/**
 * Get form data paths from flat nodes with default values
 */
export function extractFormDataPaths(flatNodes: FlatA2Node[]): Record<string, any> {
  const form: Record<string, any> = {}

  flatNodes.forEach(node => {
    if (node.value?.path) {
      // Extract path like /form/name -> name
      const pathMatch = node.value.path.match(/\/form\/(.+)/)
      if (pathMatch) {
        // Use default value if provided, otherwise empty string
        form[pathMatch[1]] = node.value.default ?? ''
      }
    }
  })

  return form
}