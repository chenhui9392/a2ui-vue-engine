# A2DatePicker

日期选择器组件。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prop` | string | - | 表单数据键名 |
| `placeholder` | string | - | 选择提示 |
| `format` | string | `YYYY-MM-DD` | 日期格式 |
| `disabled` | boolean | false | 禁用状态 |

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