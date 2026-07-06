/*
 * @Author: hui.chenn
 * @Description: Detail Field Builder - 详情只读字段构造器
 *
 *   输出：A2Node[]，bindings.modelValue 读 business.detailData.<key>
 *   用于详情 Drawer 的只读展示
 * @Date: 2026-07-06 10:00:00
 */

const DETAIL_LABELS: Array<[string, string]> = [
  ['ruleNo', '规则编号'], ['ruleType', '规则类型'], ['applicableDepartments', '适用部门'],
  ['faultLevel', '故障等级'], ['status', '状态'], ['reportingPeriod', '上报时效'],
  ['productName', '产品名称'], ['productNameCode', '产品名称编码'],
  ['productModule', '产品模块'], ['productModuleCode', '产品模块编码'],
  ['ruleDescription', '规则描述'], ['validDate', '生效日期'],
  ['submitterName', '创建人'], ['submitterAccount', '创建人域账号'], ['version', '版本号'],
]

/** 构造详情只读字段（display.info + bindings 读 business.detailData.<key>） */
export const detailFields = DETAIL_LABELS.map(([key, label]) => ({
  id: `d-${key}`,
  type: 'display.info',
  props: { label, ...(key === 'ruleDescription' ? { variant: 'quote' } : {}) },
  bindings: { modelValue: { type: 'path' as const, value: `business.detailData.${key}` } },
}))
