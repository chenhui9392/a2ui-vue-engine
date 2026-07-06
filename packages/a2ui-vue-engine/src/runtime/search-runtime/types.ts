/*
 * @Author: hui.chenn
 * @Description: SearchRuntime 类型 - 协议驱动的搜索表单运行时
 *   与 Table 完全解耦，通过 DataSource 桥接；Form 通过 A2UIRoot.data 共享
 * @Date: 2026-07-01 10:00:00
 */
import type { DataSource } from '../../engine/data-source'

/** 搜索字段类型 */
export type SearchFieldType =
  | 'text'
  | 'select'
  | 'date'
  | 'daterange'
  | 'number'
  | 'switch'

/** 搜索字段选项（select 类型使用）*/
export interface SearchFieldOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

/** 搜索字段声明 */
export interface SearchField {
  /** 字段 id（唯一 & 表单内部 key） */
  id: string
  /** 表单 label */
  label?: string
  /** 字段类型 */
  type: SearchFieldType
  /** placeholder */
  placeholder?: string
  /** 默认值 */
  defaultValue?: any
  /** select 选项 */
  options?: SearchFieldOption[]
  /** 是否可清空（默认 true）*/
  clearable?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 提交时映射到 DataSource filter 的 key（默认与 id 一致）*/
  filterKey?: string
  /** 列宽（栅格 span，默认 6，24 栅格）*/
  span?: number
  /** 折叠时是否隐藏（默认 true）*/
  collapsible?: boolean
}

/** SearchRuntime 声明 */
export interface SearchRuntimeConfig {
  /** 字段声明 */
  fields: SearchField[]
  /** 关联的 DataSource id（可选：不传时仅暴露事件，不做联动）*/
  dataSource?: string
  /** 默认值（会与 fields[].defaultValue 合并；此处优先级更高）*/
  defaultValues?: Record<string, any>
  /** 是否自动执行首次搜索（有 dataSource 时默认 false，DataSource 自身 auto 已负责首屏）*/
  defaultSearch?: boolean
  /** 是否可折叠（超过 collapseAfter 数量的字段被折叠）*/
  collapsible?: boolean
  /** 折叠阈值：可见字段数量，默认 3 */
  collapseAfter?: number
  /** 初始折叠状态，默认 true */
  defaultCollapsed?: boolean
  /** 提交按钮文案 */
  submitText?: string
  /** 重置按钮文案 */
  resetText?: string
  /** 是否显示重置按钮 */
  showReset?: boolean
  /** 是否显示折叠切换 */
  showCollapse?: boolean
}

/** SearchRuntime 事件负载 */
export interface SearchSubmitPayload {
  values: Record<string, any>
  filter: Record<string, any>
}

/** SearchRuntime 状态 */
export interface SearchRuntimeState {
  values: Record<string, any>
  collapsed: boolean
}

/** 表单读写桥（对接 A2UIRoot.data 或纯本地）*/
export interface SearchFormBridge {
  /** 读取整个表单值 */
  read: () => Record<string, any>
  /** 写入部分表单值 */
  write: (patch: Record<string, any>) => void
  /** 覆盖式写入全部值 */
  replace?: (values: Record<string, any>) => void
}

/** DataSource 桥（可选）*/
export interface SearchDataSourceBridge {
  /** 提交搜索：把 values 映射为 filter 并触发 DataSource.setFilter */
  submit: (filter: Record<string, any>) => void
  /** 重置搜索：清空 filter */
  reset: () => void
  /** 直接暴露 DataSource 实例（可选，SearchRuntime 内部只用不改）*/
  instance?: DataSource<any>
}
