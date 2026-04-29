# A2SelectField

下拉选择框组件。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | string | - | 字段标签 |
| `prop` | string | - | 表单数据键名 |
| `placeholder` | string | - | 选择提示 |
| `options` | array | [] | 下拉选项 |
| `clearable` | boolean | false | 清除按钮 |
| `disabled` | boolean | false | 禁用状态 |
| `value` | `{ path: string, default?: any }` | - | 数据绑定路径与默认值 |

## 选项结构

```typescript
interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}
```

## 扁平格式默认值

在扁平格式中，可以通过 `value.default` 设置初始选中项：

```json
{
  "id": "genderField",
  "component": "SelectField",
  "label": "性别",
  "options": [
    { "label": "男", "value": "male" },
    { "label": "女", "value": "female" }
  ],
  "value": { "path": "/form/gender", "default": "male" }
}
```

<PlaygroundEmbed 
  title="带默认值的下拉框"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "genderField",
    "width": "xs"
  },
  {
    "id": "genderField",
    "component": "SelectField",
    "label": "性别",
    "placeholder": "请选择性别",
    "options": [
      { "label": "男", "value": "male" },
      { "label": "女", "value": "female" }
    ],
    "value": { "path": "/form/gender", "default": "male" }
  }
]'
/>

## 基础示例

<PlaygroundEmbed 
  title="基础下拉框"
  :json-example='{
  "id": "select1",
  "type": "a2-select-field",
  "props": {
    "label": "国家",
    "prop": "country",
    "placeholder": "请选择国家",
    "options": [
      { "label": "中国", "value": "cn" },
      { "label": "美国", "value": "us" },
      { "label": "日本", "value": "jp" }
    ]
  }
}'
/>

## 可清除示例

<PlaygroundEmbed 
  title="可清除下拉框"
  :json-example='{
  "id": "select2",
  "type": "a2-select-field",
  "props": {
    "label": "状态",
    "prop": "status",
    "placeholder": "请选择状态",
    "clearable": true,
    "options": [
      { "label": "启用", "value": "active" },
      { "label": "禁用", "value": "inactive" },
      { "label": "待审核", "value": "pending" }
    ]
  }
}'
/>

## JSON Schema

```json
{
  "id": "selectId",
  "type": "a2-select-field",
  "props": {
    "label": "选择标签",
    "prop": "fieldName",
    "placeholder": "请选择",
    "options": [
      { "label": "选项 1", "value": "opt1" },
      { "label": "选项 2", "value": "opt2" }
    ],
    "clearable": false
  }
}
```