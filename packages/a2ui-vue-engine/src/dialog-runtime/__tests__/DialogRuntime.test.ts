/*
 * @Author: hui.chenn
 * @Description: DialogRuntime 结构测试 - Dialog / Drawer 共享
 * @Date: 2026-07-01 10:00:00
 */
import { DialogRuntime } from '../DialogRuntime'
import { FOOTER_PRESET_MAP } from '../types'
import type { OverlayFooterButton, OverlaySubmitPayload } from '../types'

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`[DialogRuntime.test] Assertion failed: ${msg}`)
}

async function run(): Promise<void> {
  // 1. 开关 / 切换
  {
    const rt = new DialogRuntime({ id: 't1', config: {}, initialVisible: false })
    assert(rt.state.visible === false, 'initial invisible')
    rt.open()
    assert(rt.state.visible === true, 'open sets visible=true')
    rt.close()
    assert(rt.state.visible === false, 'close sets visible=false')
    rt.toggle()
    assert(rt.state.visible === true, 'toggle')
    rt.setVisible(false)
    assert(rt.state.visible === false, 'setVisible false')
  }

  // 2. onVisibleChange 触发
  {
    const seq: boolean[] = []
    const rt = new DialogRuntime({
      id: 't2',
      config: {},
      initialVisible: false,
      onVisibleChange: (v) => seq.push(v),
    })
    rt.open()
    rt.close()
    assert(seq[0] === true && seq[1] === false, 'onVisibleChange fires open/close')
  }

  // 3. footer preset 归一化
  {
    const rt = new DialogRuntime({
      id: 't3',
      config: {
        footer: [
          { id: 'ok', preset: 'submit' },
          { id: 'no', preset: 'cancel' },
        ],
      },
    })
    const normalized = rt.normalizedFooter.value
    assert(normalized.length === 2, 'footer length')
    const ok = normalized[0]
    assert(ok.props?.text === '提交', 'submit preset text')
    assert(ok.props?.type === 'primary', 'submit preset type=primary')
    assert(Array.isArray(ok.actions) && ok.actions!.length === 1, 'submit preset auto action')
    assert(ok.actions![0].event === 'click', 'action event=click')
    assert((ok.actions![0].payload as any).action === 'submit', 'action.name=submit')
  }

  // 4. visible=false 的按钮被过滤
  {
    const rt = new DialogRuntime({
      id: 't4',
      config: {
        footer: [
          { id: 'ok', preset: 'submit' },
          { id: 'hidden', preset: 'cancel', visible: false },
        ],
      },
    })
    assert(rt.normalizedFooter.value.length === 1, 'hidden footer button filtered')
  }

  // 5. handleFooterAction: submit 走 onSubmit + autoClose
  {
    let submitted: OverlaySubmitPayload | null = null
    const rt = new DialogRuntime({
      id: 't5',
      config: { footer: [{ id: 'ok', preset: 'submit' }] },
      initialVisible: true,
      form: { read: () => ({ name: 'zhangsan' }) },
      onSubmit: (p) => {
        submitted = p
      },
    })
    const btn = rt.normalizedFooter.value[0]
    await rt.handleFooterAction(btn)
    assert(!!submitted, 'onSubmit called')
    assert(submitted!.formData?.name === 'zhangsan', 'formData carried in payload')
    assert(rt.state.visible === false, 'submit auto-closes')
  }

  // 6. handleFooterAction: cancel 走 onCancel + close
  {
    let cancelled = false
    const rt = new DialogRuntime({
      id: 't6',
      config: { footer: [{ id: 'no', preset: 'cancel' }] },
      initialVisible: true,
      onCancel: () => (cancelled = true),
    })
    const btn = rt.normalizedFooter.value[0]
    await rt.handleFooterAction(btn)
    assert(cancelled, 'onCancel called')
    assert(rt.state.visible === false, 'cancel closes')
  }

  // 7. custom 按钮 走 onAction，不自动关闭
  {
    let actionFired = false
    const custom: OverlayFooterButton = {
      id: 'copy',
      type: 'a2-button',
      preset: 'custom',
      props: { text: '复制' },
    }
    const rt = new DialogRuntime({
      id: 't7',
      config: { footer: [custom] },
      initialVisible: true,
      onAction: () => (actionFired = true),
    })
    const btn = rt.normalizedFooter.value[0]
    await rt.handleFooterAction(btn)
    assert(actionFired, 'onAction fired for custom preset')
    assert(rt.state.visible === true, 'custom does not auto-close')
  }

  // 8. submitApi payload
  {
    const rt = new DialogRuntime({
      id: 't8',
      config: {
        footer: [{ id: 'ok', preset: 'submit' }],
        submitApi: {
          url: '/api/orders',
          method: 'POST',
          extraPayload: { source: 'ui' },
        },
      },
      initialVisible: true,
      form: { read: () => ({ title: 'AC repair' }) },
      onSubmit: (p) => {
        const api = (p as any).api
        assert(!!api, 'submitApi payload attached')
        assert(api.url === '/api/orders', 'api.url')
        assert(api.method === 'POST', 'api.method')
        assert(api.payload.title === 'AC repair', 'api.payload has formData')
        assert(api.payload.source === 'ui', 'api.payload has extra')
      },
    })
    const b = rt.normalizedFooter.value[0]
    await rt.handleFooterAction(b)
  }

  // 9. FOOTER_PRESET_MAP 完整性
  assert(Object.keys(FOOTER_PRESET_MAP).length >= 6, 'FOOTER_PRESET_MAP has 6+ presets')

  // eslint-disable-next-line no-console
  console.log('[DialogRuntime.test] All structural assertions passed.')
}

// 触发（外层 await 由消费方处理）
void run()

export {}
