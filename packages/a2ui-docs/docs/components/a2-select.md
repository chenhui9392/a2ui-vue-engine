# A2Select

基础选择框组件，不带标签包装。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | string | `请选择` | 选择提示 |
| `options` | array | [] | 下拉选项 |
| `disabled` | boolean | false | 禁用状态 |
| `clearable` | boolean | false | 清除按钮 |
| `multiple` | boolean | false | 多选模式 |
| `filterable` | boolean | false | 可搜索 |
| `multipleLimit` | number | 0 | 多选限制数量 |
| `size` | `large \| default \| small` | `default` | 尺寸 |

## 选项结构

```typescript
interface SelectOption {
  label: string       // 显示文本
  value: string | number  // 选项值
  disabled?: boolean     // 是否禁用（可选）
}
```

## 基础示例

<PlaygroundEmbed
  title="基础选择框"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "sm"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-demo"],
    "align": "stretch"
  },
  {
    "id": "select-demo",
    "component": "Select",
    "placeholder": "请选择选项",
    "options": [
      { "label": "选项一", "value": "opt1" },
      { "label": "选项二", "value": "opt2" },
      { "label": "选项三", "value": "opt3" }
    ],
    "value": { "path": "/form/select" }
  }
]'
/>

## 可清除示例

<PlaygroundEmbed
  title="可清除选择框"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "sm"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-clearable"],
    "align": "stretch"
  },
  {
    "id": "select-clearable",
    "component": "Select",
    "placeholder": "带清除按钮",
    "clearable": true,
    "options": [
      { "label": "启用", "value": "active" },
      { "label": "禁用", "value": "inactive" },
      { "label": "待审核", "value": "pending" }
    ],
    "value": { "path": "/form/status" }
  }
]'
/>

## 多选模式

<PlaygroundEmbed
  title="多选模式"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "md"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-multiple"],
    "align": "stretch"
  },
  {
    "id": "select-multiple",
    "component": "Select",
    "placeholder": "请选择多个选项",
    "multiple": true,
    "clearable": true,
    "options": [
      { "label": "用户管理", "value": "user" },
      { "label": "订单管理", "value": "order" },
      { "label": "库存管理", "value": "inventory" },
      { "label": "财务管理", "value": "finance" }
    ],
    "value": { "path": "/form/modules" }
  }
]'
/>

## 可搜索示例

<PlaygroundEmbed
  title="可搜索选择框"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "md"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-filterable"],
    "align": "stretch"
  },
  {
    "id": "select-filterable",
    "component": "Select",
    "placeholder": "输入关键字搜索",
    "filterable": true,
    "clearable": true,
    "options": [
      { "label": "北京市", "value": "bj" },
      { "label": "上海市", "value": "sh" },
      { "label": "广州市", "value": "gz" },
      { "label": "深圳市", "value": "sz" },
      { "label": "杭州市", "value": "hz" },
      { "label": "南京市", "value": "nj" },
      { "label": "成都市", "value": "cd" },
      { "label": "武汉市", "value": "wh" }
    ],
    "value": { "path": "/form/city" }
  }
]'
/>

## 禁用状态

<PlaygroundEmbed
  title="禁用选项"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "sm"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-disabled"],
    "align": "stretch"
  },
  {
    "id": "select-disabled",
    "component": "Select",
    "placeholder": "部分选项禁用",
    "options": [
      { "label": "可用选项一", "value": "opt1" },
      { "label": "可用选项二", "value": "opt2" },
      { "label": "禁用选项三", "value": "opt3", "disabled": true },
      { "label": "禁用选项四", "value": "opt4", "disabled": true }
    ],
    "value": { "path": "/form/disabledSelect" }
  }
]'
/>

## 与 A2SelectField 的区别

- **A2Select**: 基础选择框组件，不带标签包装，适用于需要自定义布局的场景
- **A2SelectField**: 带标签的表单字段组件，包含 el-form-item 包装，适用于标准表单场景

## JSON Schema

```json
{
  "id": "selectId",
  "component": "Select",
  "placeholder": "请选择",
  "multiple": false,
  "filterable": false,
  "clearable": true,
  "options": [
    { "label": "选项一", "value": "opt1" },
    { "label": "选项二", "value": "opt2" },
    { "label": "禁用选项", "value": "opt3", "disabled": true }
  ],
  "value": { "path": "/form/selectField" }
}
```