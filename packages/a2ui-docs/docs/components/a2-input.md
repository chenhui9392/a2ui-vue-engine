# A2Input

基础输入框组件。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prop` | string | - | 表单数据键名 |
| `placeholder` | string | - | 输入提示 |
| `type` | `text | password | number` | `text` | 输入类型 |
| `disabled` | boolean | false | 禁用状态 |
| `clearable` | boolean | false | 清除按钮 |

## 基础示例

<PlaygroundEmbed 
  title="基础输入框"
  :json-example='{
  "id": "input1",
  "type": "a2-input",
  "props": {
    "prop": "search",
    "placeholder": "搜索...",
    "clearable": true
  }
}'
/>

## 密码输入示例

<PlaygroundEmbed 
  title="密码输入框"
  :json-example='{
  "id": "pwdInput",
  "type": "a2-input",
  "props": {
    "prop": "password",
    "placeholder": "请输入密码",
    "type": "password"
  }
}'
/>

## JSON Schema

```json
{
  "id": "inputId",
  "type": "a2-input",
  "props": {
    "prop": "fieldName",
    "placeholder": "请输入",
    "type": "text",
    "clearable": true
  }
}
```