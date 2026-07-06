/*
 * @Author: hui.chenn
 * @Description: Schema · State - 初始状态
 *
 *   三层分离：ui（显隐）/ business（业务）/ forms（多 form scope）
 *   不含 baseURL / token / http（属于 HttpClient 基础设施）
 * @Date: 2026-07-06 10:00:00
 */
export const state = {
  ui: { detailVisible: false, editorVisible: false, creatorVisible: false },
  business: { detailData: {}, editingId: null },
  forms: { default: {} },
} as const
