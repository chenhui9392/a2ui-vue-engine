/*
 * @Author: hui.chenn
 * @Description: DialogRuntime - Dialog / Drawer 统一 Runtime
 *   支持：动态 Form / 动态 Table / 动态 Footer / Submit / Cancel / Action / API
 *   Dialog 与 Drawer 走同一 Runtime，仅由 config.mode 区分外观
 * @Date: 2026-07-01 10:00:00
 */
import { reactive, computed, ComputedRef } from 'vue'
import type {
  DialogRuntimeConfig,
  DialogRuntimeState,
  DialogRuntimeOptions,
  OverlayFooterButton,
  OverlaySubmitPayload,
  DialogFormBridge,
} from './types'
import { FOOTER_PRESET_MAP } from './types'

/**
 * DialogRuntime - 独立运行时（不依赖具体组件）
 * 由 A2Overlay.vue 消费；宿主 / 单测也可以直接实例化
 */
export class DialogRuntime {
  readonly id: string
  private config: DialogRuntimeConfig
  private form?: DialogFormBridge
  private onSubmitCb?: DialogRuntimeOptions['onSubmit']
  private onCancelCb?: DialogRuntimeOptions['onCancel']
  private onActionCb?: DialogRuntimeOptions['onAction']
  private onVisibleChangeCb?: DialogRuntimeOptions['onVisibleChange']

  public readonly state: DialogRuntimeState

  constructor(options: DialogRuntimeOptions) {
    this.id = options.id || 'dialog'
    this.config = options.config
    this.form = options.form
    this.onSubmitCb = options.onSubmit
    this.onCancelCb = options.onCancel
    this.onActionCb = options.onAction
    this.onVisibleChangeCb = options.onVisibleChange

    this.state = reactive<DialogRuntimeState>({
      visible: !!options.initialVisible,
      loading: false,
    })
  }

  // --- 显隐控制 -----------------------------------------------------------

  open(): void {
    if (this.state.visible) return
    this.state.visible = true
    this.onVisibleChangeCb?.(true)
  }

  close(): void {
    if (!this.state.visible) return
    this.state.visible = false
    this.onVisibleChangeCb?.(false)
  }

  toggle(): void {
    if (this.state.visible) this.close()
    else this.open()
  }

  setVisible(v: boolean): void {
    if (v) this.open()
    else this.close()
  }

  // --- 底部按钮 -----------------------------------------------------------

  /** 归一化 footer 按钮：填充预设文案、动作、type */
  get normalizedFooter(): ComputedRef<OverlayFooterButton[]> {
    return computed(() => {
      const footer = this.config.footer || []
      return footer
        .filter(b => b && b.visible !== false)
        .map(btn => this.normalizeFooterButton(btn))
    })
  }

  private normalizeFooterButton(btn: OverlayFooterButton): OverlayFooterButton {
    const merged: OverlayFooterButton = { ...btn }
    merged.type = merged.type || 'a2-button'
    merged.props = { ...(merged.props || {}) }

    if (merged.preset) {
      const meta = FOOTER_PRESET_MAP[merged.preset]
      if (meta) {
        if (!merged.props.text) merged.props.text = meta.text
        if (!merged.props.type) merged.props.type = meta.type

        // 若未声明 actions，则按 preset 生成一条 emit action
        if (!merged.actions || merged.actions.length === 0) {
          merged.actions = [
            {
              event: 'click',
              type: 'emit',
              payload: {
                action: meta.action,
                preset: merged.preset,
                role: meta.role,
              },
            },
          ]
        }
      }
    }

    return merged
  }

  // --- 语义分发（Submit / Cancel / Action / API）-------------------------

  /**
   * 处理任意 footer 按钮点击。
   * - preset=submit / confirm：走 onSubmit（可能调用 API），成功后 autoClose
   * - preset=cancel / close：走 onCancel + close
   * - 其它：走 onAction
   */
  async handleFooterAction(button: OverlayFooterButton, extra?: any): Promise<void> {
    const preset = button.preset
    const meta = preset ? FOOTER_PRESET_MAP[preset] : undefined
    const role = meta?.role || 'custom'

    // 通用回调（每次都触发）
    this.onActionCb?.(button, extra)

    if (role === 'submit') {
      await this.submit({
        action: meta?.action || 'submit',
        payload: extra,
      })
      if (button.autoClose !== false) this.close()
      return
    }

    if (role === 'cancel') {
      this.onCancelCb?.()
      this.close()
      return
    }

    // custom：由宿主监听 onAction 处理；DialogRuntime 不主动关闭
  }

  /**
   * 触发一次 submit。若配置了 submitApi 则调用宿主 api handler
   * （通过 onSubmit 回调把 apiPayload 传出去；DialogRuntime 不直接 fetch，符合协议：API 走 Action System）
   */
  async submit(extra?: Partial<OverlaySubmitPayload>): Promise<void> {
    const formData = this.form?.read?.() || {}
    const payload: OverlaySubmitPayload = {
      action: 'submit',
      formData,
      ...extra,
    }
    if (this.config.submitApi) {
      // 附上 api 描述，宿主的 onSubmit 可以据此发起请求
      ;(payload as any).api = this.buildApiPayload(formData)
    }

    if (!this.onSubmitCb) return
    this.state.loading = true
    try {
      await this.onSubmitCb(payload)
    } finally {
      this.state.loading = false
    }
  }

  private buildApiPayload(formData: Record<string, any>): any {
    const api = this.config.submitApi!
    let payload: any = {}
    switch (api.payloadFrom ?? 'formData') {
      case 'formData':
        payload = { ...formData }
        break
      case 'context':
        payload = {}
        break
      case 'none':
      default:
        payload = {}
    }
    if (api.extraPayload) Object.assign(payload, api.extraPayload)
    return {
      url: api.url,
      method: api.method || 'POST',
      payload,
    }
  }

  /** 更新 config（例如宿主动态切换 title / content）*/
  updateConfig(patch: Partial<DialogRuntimeConfig>): void {
    this.config = { ...this.config, ...patch }
  }

  /** 读取当前 config（响应式副本，供组件消费）*/
  getConfig(): DialogRuntimeConfig {
    return this.config
  }
}
