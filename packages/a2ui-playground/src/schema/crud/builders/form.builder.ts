/*
 * @Author: hui.chenn
 * @Description: Form Field Builder - 表单字段构造器
 *
 *   Builder 属于"页面装配工具"，不属于 Schema
 *   Schema 仅引用 Builder 输出结果（静态字段数组）
 *   输出：A2Node[]，bindings.modelValue 统一写入 forms.default.<fieldId>
 * @Date: 2026-07-06 10:00:00
 */

/** 单个表单字段构造（namespace + props + bindings） */
function field(
  id: string,
  type: string,
  label: string,
  extra: Record<string, any> = {},
) {
  return {
    id,
    type,
    props: { label, ...extra },
    bindings: { modelValue: { type: 'path' as const, value: `forms.default.${id}` } },
  }
}

/**
 * 构造编辑/新建表单字段（前缀区分 id 命名空间，避免同页多 form 冲突）
 * @param prefix id 前缀（如 'e' 编辑 / 'c' 新建）
 */
export function makeFormFields(prefix: string) {
  const f = (id: string, type: string, label: string, extra: Record<string, any> = {}) => ({
    ...field(id, type, label, extra),
    id: `${prefix}-${id}`,
  })
  return [
    f('ruleNo', 'input.text', '规则编号', { placeholder: '请输入' }),
    f('ruleType', 'input.text', '规则类型', { placeholder: '请输入' }),
    f('applicableDepartments', 'input.text', '适用部门', { placeholder: '请输入' }),
    f('faultLevel', 'input.select', '故障等级', { options: [{ label: 'P1', value: 'P1' }, { label: 'P2', value: 'P2' }, { label: 'P3', value: 'P3' }] }),
    f('status', 'input.select', '状态', { options: [{ label: '有效', value: 'active' }, { label: '失效', value: 'inactive' }] }),
    f('reportingPeriod', 'input.text', '上报时效', { placeholder: '如：24小时' }),
    f('productName', 'input.text', '产品名称', { placeholder: '请输入' }),
    f('productNameCode', 'input.text', '产品名称编码', { placeholder: '请输入' }),
    f('productModule', 'input.text', '产品模块', { placeholder: '请输入' }),
    f('productModuleCode', 'input.text', '产品模块编码', { placeholder: '请输入' }),
    f('ruleDescription', 'input.text', '规则描述', { variant: 'longText', rows: 3, placeholder: '请输入' }),
    f('validDate', 'input.datetime', '生效日期', { placeholder: '选择生效日期', enableDate: true, enableTime: true }),
    f('submitterName', 'input.text', '创建人名称', { placeholder: '请输入' }),
    f('submitterAccount', 'input.text', '创建人域账号', { placeholder: '请输入' }),
  ]
}
