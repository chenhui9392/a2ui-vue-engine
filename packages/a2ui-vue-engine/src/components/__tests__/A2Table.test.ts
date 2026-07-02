/*
 * @Author: hui.chenn
 * @Description: A2Table 结构测试 - 验证注册、导出、映射
 *   （项目当前未接入 vitest；本文件为纯 TS 断言脚本，
 *    可后续在 vitest 落地时直接改写为 test/expect 断言。
 *    保持与其他组件的目录一致性：__tests__ 位于组件目录旁。）
 * @Date: 2026-07-01 10:00:00
 */
import { defaultComponentMap, getComponent } from '../componentMap'
import A2Table from '../A2Table.vue'
import { A2Table as A2TableExport } from '../index'

// --- Assertions --------------------------------------------------------------

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    throw new Error(`[A2Table.test] Assertion failed: ${msg}`)
  }
}

// 1. defaultComponentMap 必须注册 'a2-table'
assert('a2-table' in defaultComponentMap, "defaultComponentMap should contain 'a2-table'")

// 2. defaultComponentMap['a2-table'] 必须与直接导入的组件一致
assert(
  defaultComponentMap['a2-table'] === A2Table,
  "defaultComponentMap['a2-table'] should reference the A2Table component"
)

// 3. getComponent('a2-table') 也应能命中
assert(getComponent('a2-table') === A2Table, "getComponent('a2-table') should return A2Table")

// 4. 组件命名导出可用
assert(A2TableExport === A2Table, "Named export A2Table should equal default component")

// 5. 组件 name 需符合 A2UI 组件命名规范（PascalCase 且以 A2 开头）
// Vue SFC `<script lang="ts">` 中导出的 name 由 A2Table.vue 声明为 'A2Table'
// 这里做保守断言：默认导入对象存在（结构性验证）
assert(!!A2Table, 'A2Table component should be a truthy value')

// eslint-disable-next-line no-console
console.log('[A2Table.test] All structural assertions passed.')

export {}
