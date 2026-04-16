import type { A2Message, A2Node, NodeMessage, DataMessage, ActionMessage, ErrorMessage, CompleteMessage } from '../types'

export interface MessageProcessorOptions {
  onNode?: (message: NodeMessage) => void
  onData?: (message: DataMessage) => void
  onAction?: (message: ActionMessage) => void
  onError?: (message: ErrorMessage) => void
  onComplete?: (message: CompleteMessage) => void
}

export class MessageProcessor {
  private options: MessageProcessorOptions
  private buffer: string = ''
  private data: Record<string, any> = {}
  private tree: A2Node | null = null
  private nodeMap: Map<string, A2Node> = new Map()

  constructor(options: MessageProcessorOptions = {}) {
    this.options = options
  }

  // Process JSONL stream
  processChunk(chunk: string): A2Message[] {
    this.buffer += chunk
    const messages: A2Message[] = []
    const lines = this.buffer.split('\n')
    
    // Keep the last incomplete line in buffer
    this.buffer = lines.pop() || ''
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      
      try {
        const message = JSON.parse(trimmed) as A2Message
        this.handleMessage(message)
        messages.push(message)
      } catch (e) {
        console.error('Failed to parse message:', trimmed, e)
      }
    }
    
    return messages
  }

  // Process single message
  private handleMessage(message: A2Message): void {
    switch (message.type) {
      case 'node':
      case 'node_update':
      case 'node_append':
      case 'node_remove':
        this.handleNodeMessage(message as NodeMessage)
        break
      case 'data':
      case 'data_update':
        this.handleDataMessage(message as DataMessage)
        break
      case 'action':
        this.handleActionMessage(message as ActionMessage)
        break
      case 'error':
        this.handleErrorMessage(message as ErrorMessage)
        break
      case 'complete':
        this.handleCompleteMessage(message as CompleteMessage)
        break
    }
  }

  private handleNodeMessage(message: NodeMessage): void {
    const { type, node, parentId, position } = message
    
    switch (type) {
      case 'node':
        this.tree = node
        this.nodeMap.set(node.id, node)
        break
      case 'node_update':
        if (this.nodeMap.has(node.id)) {
          this.nodeMap.set(node.id, node)
          if (this.tree?.id === node.id) {
            this.tree = node
          }
        }
        break
      case 'node_append':
        if (parentId && this.nodeMap.has(parentId)) {
          const parent = this.nodeMap.get(parentId)!
          if (!parent.children) {
            parent.children = []
          }
          if (Array.isArray(parent.children)) {
            if (position !== undefined) {
              parent.children.splice(position, 0, node)
            } else {
              parent.children.push(node)
            }
          }
          this.nodeMap.set(node.id, node)
        }
        break
      case 'node_remove':
        if (this.nodeMap.has(node.id)) {
          this.nodeMap.delete(node.id)
          // Remove from parent's children
          if (parentId && this.nodeMap.has(parentId)) {
            const parent = this.nodeMap.get(parentId)!
            if (Array.isArray(parent.children)) {
              const index = parent.children.findIndex(c => c.id === node.id)
              if (index > -1) {
                parent.children.splice(index, 1)
              }
            }
          }
        }
        break
    }
    
    this.options.onNode?.(message)
  }

  private handleDataMessage(message: DataMessage): void {
    const { path, value } = message
    this.setNestedValue(this.data, path, value)
    this.options.onData?.(message)
  }

  private handleActionMessage(message: ActionMessage): void {
    this.options.onAction?.(message)
  }

  private handleErrorMessage(message: ErrorMessage): void {
    console.error('A2UI Error:', message.code, message.message)
    this.options.onError?.(message)
  }

  private handleCompleteMessage(message: CompleteMessage): void {
    this.options.onComplete?.(message)
  }

  // Set nested value by path (e.g., "user.profile.name")
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current)) {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
  }

  // Get current data
  getData(): Record<string, any> {
    return this.data
  }

  // Get current tree
  getTree(): A2Node | null {
    return this.tree
  }

  // Get node by id
  getNode(id: string): A2Node | undefined {
    return this.nodeMap.get(id)
  }

  // Reset processor state
  reset(): void {
    this.buffer = ''
    this.data = {}
    this.tree = null
    this.nodeMap.clear()
  }

  // Process stream from fetch Response
  async processStream(response: Response): Promise<void> {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value, { stream: true })
      this.processChunk(chunk)
    }
    
    // Process any remaining buffer
    if (this.buffer.trim()) {
      try {
        const message = JSON.parse(this.buffer.trim()) as A2Message
        this.handleMessage(message)
      } catch (e) {
        console.error('Failed to parse final buffer:', this.buffer, e)
      }
      this.buffer = ''
    }
  }
}

// Singleton instance for global use
let globalProcessor: MessageProcessor | null = null

export function createMessageProcessor(options?: MessageProcessorOptions): MessageProcessor {
  return new MessageProcessor(options)
}

export function getGlobalProcessor(): MessageProcessor {
  if (!globalProcessor) {
    globalProcessor = new MessageProcessor()
  }
  return globalProcessor
}

export function resetGlobalProcessor(): void {
  globalProcessor?.reset()
  globalProcessor = null
}