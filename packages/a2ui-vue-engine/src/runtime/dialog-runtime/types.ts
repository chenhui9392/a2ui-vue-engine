/*
 * @Author: hui.chenn
 * @Description: DialogRuntime 类型 - Dialog / Drawer 统一 Runtime
 *   通过 mode 区分外观（dialog | drawer），共享 Schema / lifecycle / footer / actions
 * @Date: 2026-07-01 10:00:00
 */
import type { A2Node, ActionConfig } from '../../types'

/** 展示模式：dialog（居中弹窗） | drawer（侧边抽屉）*/
export type OverlayMode = 'dialog' | 'drawer'

/** Drawer 位置 */
export type OverlayPlacement = 'left' | 'right' | 'top' | 'bottom'

/** 尺寸预设 */
export type OverlaySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | string | number

/** 底部按钮预设 */
export type OverlayFooterPreset = 'submit' | 'cancel' | 'reset' | 'confirm' | 'close' | 'custom'

/** Footer 按钮（协议驱动，兼容 A2Node）*/
export interface OverlayFooterButton extends A2Node {
  /** 预设：submit/cancel/reset/confirm/close/custom */
  preset?: OverlayFooterPreset
  /** 是否显示 */
  visible?: boolean
  /**
   * 语义：提交后是否自动关闭
   * - true（默认）：submit / confirm 类点击后自动关闭
   * - false：宿主异步处理后自行调用 close
   */
  autoClose?: boolean
}

/** DialogRuntime 声明（协议对象）*/
export interface DialogRuntimeConfig {
  /** 展示模式，默认 dialog */
  mode?: OverlayMode
  /** 标题 */
  title?: string
  /** 尺寸预设 或 具体宽度 */
  size?: OverlaySize
  /** Drawer 位置（mode=drawer 时生效）*/
  placement?: OverlayPlacement
  /** 是否显示遮罩 */
  modal?: boolean
  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean
  /** ESC 关闭 */
  closeOnPressEscape?: boolean
  /** 是否显示右上角关闭按钮 */
  showClose?: boolean
  /** 关闭时是否销毁内部 DOM（用于表单复位）*/
  destroyOnClose?: boolean

  /** 主体 Schema：Form、Table、任意 A2Node 组合 */
  content?: A2Node | A2Node[]

  /**
   * 表单一行几列（默认 2）
   * 仅在 content 为 a2-column 时生效：自动注入 columns prop，切换为 CSS Grid 布局
   * 设为 1 则单列纵排
   */
  columns?: number

  /** 底部按钮 */
  footer?: OverlayFooterButton[]
  /** 是否隐藏 footer 分隔线 */
  hideFooterDivider?: boolean

  /** 提交 API（可选：走既有 Action System 的 api 类型）*/
  submitApi?: {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    /** payload 来源：'formData' | 'context' | 静态对象 */
    payloadFrom?: 'formData' | 'context' | 'none'
    /** 覆盖 payload 的静态字段 */
    extraPayload?: Record<string, any>
  }
}

/** DialogRuntime 事件负载 */
export interface OverlaySubmitPayload {
  /** 触发按钮的 preset / action name */
  action?: string
  /** 关闭前的表单数据快照（宿主传入 form 桥时会填充）*/
  formData?: Record<string, any>
  /** 原始 payload（若 footer 按钮有 payload）*/
  payload?: any
}

/** DialogRuntime 状态 */
export interface DialogRuntimeState {
  visible: boolean
  loading: boolean
}

/** 表单数据桥（读取当前 form 快照）*/
export interface DialogFormBridge {
  read: () => Record<string, any>
}

/** DialogRuntime 选项 */
export interface DialogRuntimeOptions {
  id?: string
  config: DialogRuntimeConfig
  /** 是否初始可见 */
  initialVisible?: boolean
  /** 表单快照桥（用于 onSubmit 携带 formData）*/
  form?: DialogFormBridge
  /** 提交回调（会在 submit / confirm 类按钮触发时同步调用）*/
  onSubmit?: (payload: OverlaySubmitPayload) => void | Promise<void>
  /** 取消回调 */
  onCancel?: () => void
  /** 通用按钮回调（每个 footer 按钮都会触发）*/
  onAction?: (button: OverlayFooterButton, event?: any) => void
  /** 可见性变化 */
  onVisibleChange?: (visible: boolean) => void
}

/** footer 按钮预设默认表（协议糖，宿主可完全覆盖）*/
export interface FooterPresetMeta {
  text: string
  type?: string
  action: string
  role: 'submit' | 'cancel' | 'custom'
}

export const FOOTER_PRESET_MAP: Record<OverlayFooterPreset, FooterPresetMeta> = {
  submit:  { text: '提交', type: 'primary', action: 'submit',  role: 'submit' },
  confirm: { text: '确认', type: 'primary', action: 'confirm', role: 'submit' },
  cancel:  { text: '取消', type: 'default', action: 'cancel',  role: 'cancel' },
  close:   { text: '关闭', type: 'default', action: 'close',   role: 'cancel' },
  reset:   { text: '重置', type: 'warning', action: 'reset',   role: 'custom' },
  custom:  { text: '按钮', type: 'default', action: 'custom',  role: 'custom' },
}

/** ActionConfig 快捷类型再导出（避免消费方多导入一次）*/
export type { ActionConfig }
