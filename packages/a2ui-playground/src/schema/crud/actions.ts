/*
 * @Author: hui.chenn
 * @Description: Schema · Actions - 声明式动作表
 *
 *   统一 type = ui.open | ui.close | ui.toggle | request | emit | updateState
 *   完全声明式：禁止 handler / callback / ctx.emit / JS 字符串
 *   request.onSuccess 支持声明式链式动作
 *
 *   行内按钮（查看/编辑）通过 events: { click: 'view' } 声明，
 *   Runtime 自动携带 row（renderNode.withRowContext），无需 rowAction builder
 * @Date: 2026-07-06 10:00:00
 */
export const actions = {
  // UI 控制（schema 驱动显隐）
  view:         { type: 'ui.open', target: 'detailDrawer', datasource: 'detail', param: 'row.id', bind: 'business.detailData' },
  edit:         { type: 'ui.open', target: 'editDrawer',   datasource: 'detail', param: 'row.id', bind: 'forms.default', set: { 'business.editingId': 'row.id' } },
  create:       { type: 'ui.open', target: 'createDialog', bind: 'forms.default', defaults: { status: 'active', faultLevel: 'P2' } },
  closeDetail:  { type: 'ui.close', target: 'detailDrawer' },
  closeEditor:  { type: 'ui.close', target: 'editDrawer' },
  closeCreator: { type: 'ui.close', target: 'createDialog' },

  // 请求
  search:  { type: 'request', datasource: 'list' },
  refresh: { type: 'request', datasource: 'list', toast: '已刷新' },
  submitEdit: {
    type: 'request', datasource: 'save',
    body: { from: 'forms.default', merge: { id: '$business.editingId' } },
    onSuccess: { type: 'ui.close', target: 'editDrawer' },
    refresh: 'list', toast: '保存成功',
  },
  submitCreate: {
    type: 'request', datasource: 'save',
    body: { from: 'forms.default', merge: { id: null } },
    onSuccess: { type: 'ui.close', target: 'createDialog' },
    refresh: 'list', toast: '新建成功',
  },
} as const
