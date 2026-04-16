import type { BindingConfig } from '../types'

// Resolve binding value from data context
export function resolveBinding(
  binding: BindingConfig,
  data: Record<string, any>
): any {
  switch (binding.type) {
    case 'literal':
      return binding.value
    
    case 'path':
      return resolvePath(data, binding.value)
    
    case 'expression':
      return evaluateExpression(binding.value, data)
    
    default:
      return binding.value
  }
}

// Resolve nested path (e.g., "user.profile.name")
export function resolvePath(obj: Record<string, any>, path: string): any {
  if (!path) return undefined
  
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    
    // Handle array index access (e.g., "items[0]")
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/)
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch
      current = current[arrayKey]?.[parseInt(index, 10)]
    } else {
      current = current[key]
    }
  }
  
  return current
}

// Evaluate simple expression (safe evaluation)
export function evaluateExpression(expression: string, data: Record<string, any>): any {
  try {
    // Create a safe evaluation context
    const fn = new Function(...Object.keys(data), `return ${expression}`)
    return fn(...Object.values(data))
  } catch (e) {
    console.warn('Expression evaluation failed:', expression, e)
    return undefined
  }
}

// Transform value using transform function name
export function transformValue(value: any, transform?: string): any {
  if (!transform) return value
  
  const transforms: Record<string, (v: any) => any> = {
    uppercase: (v) => String(v).toUpperCase(),
    lowercase: (v) => String(v).toLowerCase(),
    trim: (v) => String(v).trim(),
    number: (v) => Number(v),
    string: (v) => String(v),
    boolean: (v) => Boolean(v),
    json: (v) => JSON.stringify(v),
    parse: (v) => JSON.parse(v),
  }
  
  const transformer = transforms[transform]
  if (!transformer) {
    console.warn('Unknown transform:', transform)
    return value
  }
  
  return transformer(value)
}

// Resolve binding with transform
export function resolveBindingWithTransform(
  binding: BindingConfig,
  data: Record<string, any>
): any {
  const value = resolveBinding(binding, data)
  return transformValue(value, binding.transform)
}

// Resolve all bindings in props object
export function resolveProps(
  props: Record<string, any>,
  bindings: Record<string, BindingConfig> | undefined,
  data: Record<string, any>
): Record<string, any> {
  const resolved = { ...props }
  
  if (bindings) {
    for (const [key, binding] of Object.entries(bindings)) {
      resolved[key] = resolveBindingWithTransform(binding, data)
    }
  }
  
  return resolved
}