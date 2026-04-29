# A2DateTimeInput

日期时间选择器组件。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prop` | string | - | 表单数据键名 |
| `placeholder` | string | - | 选择提示 |
| `enableDate` | boolean | true | 启用日期选择 |
| `enableTime` | boolean | true | 启用时间选择 |
| `format` | string | `YYYY-MM-DD HH:mm:ss` | 格式字符串 |
| `disabled` | boolean | false | 禁用状态 |
| `value` | `{ path: string, default?: any }` | - | 数据绑定路径与默认值 |

## 扁平格式默认值

在扁平格式中，可以通过 `value.default` 设置初始日期时间值：

```json
{
  "id": "datetimeField",
  "component": "DateTimeInput",
  "placeholder": "请选择日期和时间",
  "value": { "path": "/form/datetime", "default": "2026-04-29 10:30:00" }
}
```

<PlaygroundEmbed 
  title="带默认值的日期时间选择"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "datetimeField",
    "width": "xs"
  },
  {
    "id": "datetimeField",
    "component": "DateTimeInput",
    "placeholder": "请选择日期和时间",
    "enableDate": true,
    "enableTime": true,
    "value": { "path": "/form/datetime", "default": "2026-04-29 10:30:00" }
  }
]'
/>

## 基础示例

<PlaygroundEmbed 
  title="日期时间选择"
  :json-example='{
  "id": "datetime1",
  "type": "a2-date-time-input",
  "props": {
    "prop": "scheduleTime",
    "placeholder": "请选择日期和时间",
    "enableDate": true,
    "enableTime": true
  }
}'
/>

## 仅日期示例

<PlaygroundEmbed 
  title="仅选择日期"
  :json-example='{
  "id": "datetime2",
  "type": "a2-date-time-input",
  "props": {
    "prop": "dateOnly",
    "placeholder": "请选择日期",
    "enableDate": true,
    "enableTime": false
  }
}'
/>

## JSON Schema

```json
{
  "id": "datetimeId",
  "type": "a2-date-time-input",
  "props": {
    "prop": "fieldName",
    "placeholder": "请选择日期时间",
    "enableDate": true,
    "enableTime": true,
    "format": "YYYY-MM-DD HH:mm:ss"
  }
}
```