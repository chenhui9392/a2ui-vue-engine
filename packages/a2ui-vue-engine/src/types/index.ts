import type { Component, Ref } from 'vue'
import type { HttpClient } from '../infra/http'
import type {
  ApiResolver,
  ApiResolverProvider,
  ApiContext,
  ApiEntryMap,
  ApiEnv,
} from '../infra/api'
import type { EnvManager } from '../infra/env'

// Form Data Result - for extracting form fields from schema
export interface FormDataResult {
  form: Record<string, string>
}

// 扁平化节点格式（新格式）- 节点通过 child/children 引用其他节点ID
export interface FlatA2Node {
  id: string
  component: string // 组件名称：Card, Row, Column, Text, TextField, DateTimeInput, Button, Icon, SelectField, ChoicePicker, OptionCard
  child?: string | string[] // 单个子节点ID或ID数组
  children?: string[] // 子节点ID数组
  text?: string // Text组件的文本内容，或Button的按钮文字
  label?: string // TextField/DateTimeInput/SelectField/ChoicePicker的标签；OptionCard的标题
  variant?: string // Text/TextField的变体：shortText, longText, h3等；ChoicePicker: mutuallyExclusive
  value?: { path: string; default?: string | number | boolean } // 数据绑定路径及默认值
  align?: string // Row/Column的对齐方式：center, stretch, start, end
  justify?: string // Row的水平分布：start, end, center, space-between
  name?: string // Icon的图标名称；OptionCard标题前的图标名称
  icon?: string // 通用图标名称或图片URL（Button/InfoField等）
  type?: string // Button的类型：primary, success, warning, danger, info, default
  gap?: number // Column/Row的间距（px）
  action?: { event?: { name: string } } // Button的事件配置
  enableDate?: boolean // DateTimeInput是否启用日期
  enableTime?: boolean // DateTimeInput是否启用时间
  // Card 宽度标准：xs=300px, sm=400px, md=560px, lg=720px, xl=960px, full=100%
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  // Card 头部标题
  header?: string
  // Card 头部背景色
  headerBgColor?: string
  // Card 头部图标
  headerIcon?: string
  // Textarea 相关属性
  rows?: number
  placeholder?: string
  // SelectField 下拉选项
  options?: Array<{ label: string; value: string | number; disabled?: boolean }>
  // Select 是否可清空
  clearable?: boolean
  // ChoicePicker 多选选项
  choiceOptions?: Array<{ label: string; value: string | number; description?: string; disabled?: boolean }>
  // ChoicePicker 列数
  columns?: number
  // ChoicePicker 显示样式: chips
  displayStyle?: 'default' | 'chips'
  // 禁用/只读
  disabled?: boolean
  // 必填
  required?: boolean
  // OptionCard 内容文本（第二行显示）
  content?: string
  // OptionCard 是否选中
  selected?: boolean
  // OptionCard 卡片代表的值（用于单选互斥）
  cardValue?: string | number | boolean
  // Button/InfoField 自定义背景色
  bgColor?: string
  // InfoField/OptionCard 等的尺寸
  size?: 'large' | 'default'
  // ---- Additive 直通字段（扁平格式承载复杂组件的通用能力）----
  // props: 直接透传给渲染节点的 props（V2.x 起：Table/Search/Toolbar/Overlay 等 Page 级组件依赖）
  props?: Record<string, any>
  // bindings: 直接透传绑定（如 { visible: { type: 'path', value: 'drawer.visible' } }）
  bindings?: Record<string, BindingConfig>
  // actions: 直接透传事件动作
  actions?: ActionConfig[]
}

// A2UI Node Schema (树形格式 - 用于渲染)
export interface A2Node {
  id: string
  type: string // 组件类型（与component对应）
  props?: Record<string, any>
  children?: A2Node[] | string
  bindings?: Record<string, BindingConfig>
  actions?: ActionConfig[]
  slots?: Record<string, A2Node[]>
}

// Data Binding Configuration
export interface BindingConfig {
  type: 'path' | 'literal' | 'expression'
  value: string
  transform?: string
}

// Action Configuration
export interface ActionConfig {
  event: string
  type: 'emit' | 'callback' | 'navigate' | 'api'
  payload?: Record<string, any>
  handler?: string
}

// Component Context
export interface ComponentContext {
  node: A2Node
  data: Record<string, any>
  path: string[]
  parent?: ComponentContext
  emit: (event: string, payload?: any) => void
  resolveBinding: (binding: BindingConfig) => any
  executeAction: (action: ActionConfig, event?: Event) => void
}

// Component Mapper
export interface ComponentMapper {
  [key: string]: Component | (() => Promise<{ default: Component }>)
}

// Message Types (JSONL Stream)
export interface BaseMessage {
  type: string
  id: string
  timestamp?: number
}

export interface NodeMessage extends BaseMessage {
  type: 'node' | 'node_update' | 'node_append' | 'node_remove'
  node: A2Node
  parentId?: string
  position?: number
}

export interface DataMessage extends BaseMessage {
  type: 'data' | 'data_update'
  path: string
  value: any
}

export interface ActionMessage extends BaseMessage {
  type: 'action'
  action: string
  payload?: any
}

export interface ErrorMessage extends BaseMessage {
  type: 'error'
  code: string
  message: string
}

export interface CompleteMessage extends BaseMessage {
  type: 'complete'
  success: boolean
}

export type A2Message = NodeMessage | DataMessage | ActionMessage | ErrorMessage | CompleteMessage

// Message Handler
export type MessageHandler = (message: A2Message) => void

// Plugin Options
export interface A2UIPluginOptions {
  components?: ComponentMapper
  theme?: Record<string, any>
  onError?: (error: Error) => void
  // --- API / HTTP / Env（V2 新增，全部可选，向后兼容） ---
  /** HttpClient 实例；提供后由 plugin 注入到 provide 链供组件树 inject */
  httpClient?: HttpClient
  /** ApiResolver 实例；未提供时按 apiEntries / apiProvider 自动构造 */
  apiResolver?: ApiResolver
  /** 静态 API 表（构造默认 resolver 的 entries） */
  apiEntries?: ApiEntryMap
  /** 远程 API manifest provider（异步拉取） */
  apiProvider?: ApiResolverProvider
  /** 默认 context（env / project / tenant 等） */
  defaultContext?: Partial<ApiContext>
  /** 环境管理；可传 EnvManager 实例或直接传 ApiEnv 字符串 */
  env?: EnvManager | ApiEnv
}

// Render Context
export interface RenderContext {
  data: Record<string, any>
  componentMap: ComponentMapper
  globalProps?: Record<string, any>
  onEvent?: (event: string, payload: any, context: ComponentContext) => void
}

// Runtime Handle - A2UIRoot 消费 runtime 时所需的最小契约
// （完整 A2UIRuntime 见 runtime/createRuntime.ts，结构化兼容本接口）
export interface A2UIRuntimeHandle {
  /** 合并后的组件表（含 Search/Table 绑定版） */
  componentMap: ComponentMapper
  /** 响应式 state（schema.state 的运行时副本） */
  state: Ref<Record<string, any>>
  /** 归一化后的扁平节点（由 schema.components 生成） */
  initialNodes: FlatA2Node[]
  /** 首屏初始化（DataSource auto fetch 等） */
  init(): Promise<void>
  /** 处理 A2UIRoot 上抛的 message（内部路由到 action dispatcher） */
  handleMessage(message: A2Message): void
  /** 销毁 */
  destroy(): void
}

// Root Component Props
export interface A2UIRootProps {
  initialData?: Record<string, any>
  initialTree?: A2Node
  streamUrl?: string
  componentMap?: ComponentMapper
  /** 注入 Runtime：提供后 A2UIRoot 自动使用 runtime.componentMap / state / initialNodes，并把 message 路由到 runtime.handleMessage */
  runtime?: A2UIRuntimeHandle
  onMessage?: MessageHandler
  onError?: (error: Error) => void
}

// Root Component Emits
export interface A2UIRootEmits {
  (e: 'message', message: A2Message): void
  (e: 'error', error: Error): void
  (e: 'ready'): void
  (e: 'complete'): void
}