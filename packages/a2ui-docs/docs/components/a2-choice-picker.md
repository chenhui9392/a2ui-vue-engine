# A2ChoicePicker

多选/单选卡片选择组件，支持 chips 样式和多种配置。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | string | - | 标签文本 |
| `options` | array | [] | 选项列表 |
| `variant` | `default` \| `mutuallyExclusive` | `default` | 选择模式 |
| `displayStyle` | `default` \| `chips` | `default` | 显示样式 |
| `required` | boolean | false | 是否必填 |
| `disabled` | boolean | false | 是否禁用 |
| `defaultValue` | array \| string \| number | [] | 默认值 |

## 选项配置

```typescript
interface ChoiceOption {
  label: string       // 显示文本
  value: string | number  // 选项值
  description?: string    // 描述文本（可选）
  disabled?: boolean     // 是否禁用（可选）
}
```

## 选择模式

### 多选模式 (default)

用户可以选择多个选项。

### 单选模式 (mutuallyExclusive)

用户只能选择一个选项，点击新选项会自动取消之前的选中。

## 基础示例

<PlaygroundEmbed 
  title="基础多选"
  :json-example='{
  "id": "root",
  "component": "Card",
  "child": "picker-demo",
  "width": "md"
}
---
{
  "id": "picker-demo",
  "component": "Column",
  "children": ["picker-label", "multi-picker"],
  "align": "stretch"
}
---
{
  "id": "picker-label",
  "component": "Text",
  "text": "请选择功能模块:",
  "variant": "shortText"
}
---
{
  "id": "multi-picker",
  "component": "ChoicePicker",
  "options": [
    { "label": "用户管理", "value": "user" },
    { "label": "订单管理", "value": "order" },
    { "label": "库存管理", "value": "inventory" },
    { "label": "财务管理", "value": "finance" }
  ],
  "value": { "path": "/form/modules" }
}'
/>

## 单选模式示例

<PlaygroundEmbed 
  title="互斥单选"
  :json-example='{
  "id": "root",
  "component": "Card",
  "child": "single-demo",
  "width": "md"
}
---
{
  "id": "single-demo",
  "component": "Column",
  "children": ["single-label", "single-picker"],
  "align": "stretch"
}
---
{
  "id": "single-label",
  "component": "Text",
  "text": "选择审批方案:",
  "variant": "shortText"
}
---
{
  "id": "single-picker",
  "component": "ChoicePicker",
  "label": "",
  "variant": "mutuallyExclusive",
  "displayStyle": "chips",
  "required": true,
  "options": [
    { "label": "方案A - 快速审批", "value": "plan_a" },
    { "label": "方案B - 标准审批", "value": "plan_b" },
    { "label": "方案C - 详细审批", "value": "plan_c" }
  ],
  "value": { "path": "/form/plan" }
}'
/>

## 带描述的选项

<PlaygroundEmbed 
  title="带描述的选项"
  :json-example='{
  "id": "root",
  "component": "Card",
  "child": "desc-demo",
  "width": "lg"
}
---
{
  "id": "desc-demo",
  "component": "Column",
  "children": ["desc-label", "desc-picker"],
  "align": "stretch"
}
---
{
  "id": "desc-label",
  "component": "Text",
  "text": "选择权限类型:",
  "variant": "shortText"
}
---
{
  "id": "desc-picker",
  "component": "ChoicePicker",
  "variant": "mutuallyExclusive",
  "displayStyle": "chips",
  "options": [
    { "label": "外网访问", "value": "internet", "description": "访问外部网站和资源" },
    { "label": "邮件收发", "value": "email", "description": "发送和接收外部邮件" },
    { "label": "文件传输", "value": "ftp", "description": "上传下载外部文件" },
    { "label": "VPN接入", "value": "vpn", "description": "远程接入公司内网" }
  ],
  "value": { "path": "/form/permission" }
}'
/>

## 必填与禁用状态

<PlaygroundEmbed 
  title="必填与禁用"
  :json-example='{
  "id": "root",
  "component": "Card",
  "child": "state-demo",
  "width": "md"
}
---
{
  "id": "state-demo",
  "component": "Column",
  "children": ["required-picker", "disabled-picker"],
  "align": "stretch",
  "gap": 16
}
---
{
  "id": "required-picker",
  "component": "ChoicePicker",
  "label": "必填项（带红色星号）",
  "variant": "mutuallyExclusive",
  "displayStyle": "chips",
  "required": true,
  "options": [
    { "label": "选项1", "value": "opt1" },
    { "label": "选项2", "value": "opt2" }
  ],
  "value": { "path": "/form/required" }
}
---
{
  "id": "disabled-picker",
  "component": "ChoicePicker",
  "label": "禁用状态",
  "variant": "mutuallyExclusive",
  "displayStyle": "chips",
  "disabled": true,
  "defaultValue": "opt1",
  "options": [
    { "label": "已选中选项", "value": "opt1" },
    { "label": "禁用选项", "value": "opt2", "disabled": true }
  ],
  "value": { "path": "/form/disabled" }
}'
/>

## JSON Schema

```json
{
  "id": "pickerId",
  "component": "ChoicePicker",
  "label": "选择选项",
  "variant": "mutuallyExclusive",
  "displayStyle": "chips",
  "required": true,
  "options": [
    { "label": "选项一", "value": "opt1", "description": "描述一" },
    { "label": "选项二", "value": "opt2" },
    { "label": "禁用选项", "value": "opt3", "disabled": true }
  ],
  "value": { "path": "/form/choice" }
}
```