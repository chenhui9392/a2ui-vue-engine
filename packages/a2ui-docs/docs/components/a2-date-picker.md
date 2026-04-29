# A2DatePicker

日期选择器组件。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prop` | string | - | 表单数据键名 |
| `placeholder` | string | - | 选择提示 |
| `format` | string | `YYYY-MM-DD` | 日期格式 |
| `disabled` | boolean | false | 禁用状态 |
| `value` | `{ path: string, default?: any }` | - | 数据绑定路径与默认值 |

## 扁平格式默认值

在扁平格式中，可以通过 `value.default` 设置初始日期值：

```json
{
  "id": "dateField",
  "component": "DatePicker",
  "placeholder": "请选择日期",
  "value": { "path": "/form/date", "default": "2026-04-29" }
}
```

<PlaygroundEmbed 
  title="带默认值的日期选择"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "dateField",
    "width": "xs"
  },
  {
    "id": "dateField",
    "component": "DatePicker",
    "placeholder": "请选择日期",
    "value": { "path": "/form/date", "default": "2026-04-29" }
  }
]'
/>

## 基础示例

<PlaygroundEmbed 
  title="基础日期选择"
  :json-example='{
  "id": "date1",
  "type": "a2-date-picker",
  "props": {
    "prop": "birthday",
    "placeholder": "请选择日期"
  }
}'
/>

## JSON Schema

```json
{
  "id": "datePickerId",
  "type": "a2-date-picker",
  "props": {
    "prop": "fieldName",
    "placeholder": "请选择日期",
    "format": "YYYY-MM-DD"
  }
}
```