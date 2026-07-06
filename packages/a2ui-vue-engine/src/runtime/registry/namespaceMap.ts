/*
 * @Author: hui.chenn
 * @Description: Component Namespace Registry - Runtime 内置的 namespace → 引擎组件名 映射
 *
 *   迁移原因（对齐 examples/md/收敛边界.md 目标六）：
 *   - Registry 属于 Runtime 能力，不属于 Schema
 *   - Schema 只描述页面（用 namespace 声明组件），不关心 namespace 如何解析
 *   - 集中在 runtime/registry/ 便于：
 *       1. 统一维护 namespace 约定
 *       2. createRuntime 消费默认表
 *       3. 宿主可通过 schema.componentRegistry 覆盖/扩展
 *
 *   映射规则：namespace（如 'container.list'）→ 引擎组件名（如 'List'）
 *   引擎组件名再由 flatToTree.normalizeComponentName 转为 componentMap key（如 'a2-list'）
 * @Date: 2026-07-06 10:00:00
 */

/**
 * 默认 namespace → 引擎组件名 映射表
 *
 * namespace 约定：
 *   container.*  - 容器类（List / Drawer / Dialog）
 *   display.*    - 展示类（Table / InfoField）
 *   input.*      - 输入类（Search / TextField / SelectField / DateTimeInput）
 *   action.*     - 操作类（Toolbar / Button）
 *   layout.*     - 布局类（Column / Row）
 */
export const DEFAULT_NAMESPACE_MAP: Record<string, string> = {
  'container.list': 'List',
  'container.drawer': 'Drawer',
  'container.dialog': 'Dialog',
  'display.table': 'Table',
  'display.info': 'a2-info-field',
  'input.search': 'Search',
  'input.text': 'a2-text-field',
  'input.select': 'a2-select-field',
  'input.datetime': 'a2-date-time-input',
  'action.toolbar': 'Toolbar',
  'action.button': 'a2-button',
  'layout.column': 'a2-column',
  'layout.row': 'a2-row',
}
