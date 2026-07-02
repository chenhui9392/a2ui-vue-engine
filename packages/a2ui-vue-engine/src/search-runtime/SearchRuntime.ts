/*
 * @Author: hui.chenn
 * @Description: SearchRuntime - 协议驱动的搜索表单运行时
 *   自动绑定 Form / DataSource / Table：
 *     - Form：通过 SearchFormBridge 读写宿主 form 数据（默认使用组件内响应式 state）
 *     - DataSource：通过 SearchDataSourceBridge 触发 filter/refresh
 *     - Table：通过 DataSource 间接联动（不直接依赖 Table）
 *   完全协议驱动：字段、默认值、折叠、按钮文案均来自 config
 * @Date: 2026-07-01 10:00:00
 */
import { reactive, computed, ComputedRef } from 'vue'
import type {
  SearchRuntimeConfig,
  SearchRuntimeState,
  SearchField,
  SearchSubmitPayload,
  SearchFormBridge,
  SearchDataSourceBridge,
} from './types'

export interface SearchRuntimeOptions {
  /** 唯一 id（用于日志与 scope）*/
  id?: string
  /** 声明配置 */
  config: SearchRuntimeConfig
  /** 表单读写桥（缺省：SearchRuntime 内部独立维护）*/
  form?: SearchFormBridge
  /** DataSource 桥（缺省：仅暴露事件回调，不联动）*/
  dataSource?: SearchDataSourceBridge
  /** 提交事件回调（会在 submit / reset 时同步调用）*/
  onSubmit?: (payload: SearchSubmitPayload) => void
  onReset?: (values: Record<string, any>) => void
}

/**
 * SearchRuntime - 独立运行时（不依赖任何具体组件）
 * 由 A2Search.vue 消费；宿主 / 单测也可以直接创建
 */
export class SearchRuntime {
  readonly id: string
  private config: SearchRuntimeConfig
  private form?: SearchFormBridge
  private dataSource?: SearchDataSourceBridge
  private onSubmitCb?: (payload: SearchSubmitPayload) => void
  private onResetCb?: (values: Record<string, any>) => void

  /** 响应式 state（组件模板可以直接用）*/
  public readonly state: SearchRuntimeState

  constructor(options: SearchRuntimeOptions) {
    this.id = options.id || 'search'
    this.config = options.config
    this.form = options.form
    this.dataSource = options.dataSource
    this.onSubmitCb = options.onSubmit
    this.onResetCb = options.onReset

    const defaults = buildDefaultValues(this.config)
    this.state = reactive<SearchRuntimeState>({
      values: { ...defaults },
      collapsed: this.config.defaultCollapsed !== false,
    })

    // 若外部提供 form bridge，将默认值写入表单
    if (this.form && Object.keys(defaults).length > 0) {
      this.form.write(defaults)
    }

    // Default search：首屏立即调用一次 submit
    if (this.config.defaultSearch) {
      this.submit()
    }
  }

  // --- Public API --------------------------------------------------------

  /** 显示字段（受折叠状态影响）*/
  get visibleFields(): ComputedRef<SearchField[]> {
    return computed(() => {
      const fields = this.config.fields || []
      if (!this.config.collapsible) return fields
      const threshold = this.config.collapseAfter ?? 3
      if (!this.state.collapsed) return fields
      // 折叠时：保留前 threshold 个 + 显式标记 collapsible=false 的字段
      const result: SearchField[] = []
      let visibleCount = 0
      for (const field of fields) {
        if (field.collapsible === false) {
          result.push(field)
        } else if (visibleCount < threshold) {
          result.push(field)
          visibleCount++
        }
      }
      return result
    })
  }

  /** 更新单个字段值 */
  setValue(id: string, value: any): void {
    this.state.values = { ...this.state.values, [id]: value }
    if (this.form) {
      this.form.write({ [id]: value })
    }
  }

  /** 覆盖式替换全部字段值 */
  setValues(values: Record<string, any>): void {
    this.state.values = { ...values }
    if (this.form) {
      if (this.form.replace) this.form.replace(values)
      else this.form.write(values)
    }
  }

  /** 触发搜索 */
  submit(): void {
    const values = this.getValues()
    const filter = this.mapValuesToFilter(values)
    if (this.dataSource) {
      this.dataSource.submit(filter)
    }
    this.onSubmitCb?.({ values, filter })
  }

  /** 重置：把值恢复为默认值 + 触发一次搜索 */
  reset(): void {
    const defaults = buildDefaultValues(this.config)
    this.state.values = { ...defaults }
    if (this.form) {
      if (this.form.replace) this.form.replace(defaults)
      else this.form.write(defaults)
    }
    if (this.dataSource) {
      // 空 filter 让 DataSource 复位
      this.dataSource.reset()
    }
    this.onResetCb?.(defaults)
  }

  /** 切换折叠 */
  toggleCollapse(): void {
    this.state.collapsed = !this.state.collapsed
  }

  /** 显式设置折叠状态 */
  setCollapsed(collapsed: boolean): void {
    this.state.collapsed = collapsed
  }

  /** 读取当前 values（若有 form bridge 优先从 form 读）*/
  getValues(): Record<string, any> {
    if (this.form) {
      const external = this.form.read()
      // 只挑属于当前 fields 的 key，避免混入无关字段
      const keys = this.config.fields.map(f => f.id)
      const result: Record<string, any> = {}
      for (const k of keys) {
        result[k] = external[k] ?? this.state.values[k]
      }
      return result
    }
    return { ...this.state.values }
  }

  /** 把 values 映射为 DataSource filter（考虑 filterKey）*/
  mapValuesToFilter(values: Record<string, any>): Record<string, any> {
    const filter: Record<string, any> = {}
    for (const field of this.config.fields) {
      const raw = values[field.id]
      if (raw === undefined || raw === null || raw === '') continue
      if (Array.isArray(raw) && raw.length === 0) continue
      const key = field.filterKey || field.id
      filter[key] = raw
    }
    return filter
  }
}

// --- Helpers ---------------------------------------------------------------

function buildDefaultValues(config: SearchRuntimeConfig): Record<string, any> {
  const defaults: Record<string, any> = {}
  for (const field of config.fields || []) {
    if (field.defaultValue !== undefined) {
      defaults[field.id] = field.defaultValue
    }
  }
  if (config.defaultValues) {
    Object.assign(defaults, config.defaultValues)
  }
  return defaults
}
