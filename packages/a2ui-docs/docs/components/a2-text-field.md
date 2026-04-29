# A2TextField

带标签的表单字段组件。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | string | - | 字段标签 |
| `prop` | string | - | 表单数据键名 |
| `placeholder` | string | - | 输入提示 |
| `variant` | `shortText | longText` | `shortText` | 输入类型 |
| `rows` | number | 4 | longText 时显示行数 |
| `disabled` | boolean | false | 禁用状态 |
| `required` | boolean | false | 必填字段 |
| `value` | `{ path: string, default?: any }` | - | 数据绑定路径与默认值 |

## 扁平格式默认值

在扁平格式中，可以通过 `value.default` 设置初始默认值：

```json
{
  "id": "nameField",
  "component": "TextField",
  "label": "姓名",
  "value": { "path": "/form/name", "default": "张三" }
}
```

<PlaygroundEmbed 
  title="带默认值的文本字段"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "nameField",
    "width": "xs"
  },
  {
    "id": "nameField",
    "component": "TextField",
    "label": "姓名",
    "placeholder": "请输入姓名",
    "value": { "path": "/form/name", "default": "张三" }
  }
]'
/>

## 基础示例

<PlaygroundEmbed 
  title="基础文本字段"
  :json-example='{
  "id": "textField1",
  "type": "a2-text-field",
  "props": {
    "label": "用户名",
    "prop": "username",
    "placeholder": "请输入用户名"
  }
}'
/>

## 多行文本示例

<PlaygroundEmbed 
  title="多行文本字段"
  :json-example='{
  "id": "descField",
  "type": "a2-text-field",
  "props": {
    "label": "描述",
    "prop": "description",
    "variant": "longText",
    "rows": 5,
    "placeholder": "请输入描述..."
  }
}'
/>

## 必填字段示例

<PlaygroundEmbed 
  title="必填字段"
  :json-example='{
  "id": "emailField",
  "type": "a2-text-field",
  "props": {
    "label": "邮箱",
    "prop": "email",
    "placeholder": "请输入邮箱",
    "required": true
  }
}'
/>

## 表单示例

<PlaygroundEmbed 
  title="完整表单"
  :json-example='{
  "id": "formCard",
  "type": "a2-card",
  "props": {
    "width": "xs",
    "title": "注册表单"
  },
  "children": [
    {
      "id": "formCol",
      "type": "a2-column",
      "props": { "gap": 20 },
      "children": [
        {
          "id": "nameField",
          "type": "a2-text-field",
          "props": { "label": "姓名", "prop": "name", "required": true }
        },
        {
          "id": "emailField",
          "type": "a2-text-field",
          "props": { "label": "邮箱", "prop": "email", "required": true }
        },
        {
          "id": "messageField",
          "type": "a2-text-field",
          "props": {
            "label": "留言",
            "prop": "message",
            "variant": "longText",
            "rows": 4
          }
        }
      ]
    }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "textFieldId",
  "type": "a2-text-field",
  "props": {
    "label": "字段标签",
    "prop": "fieldName",
    "placeholder": "请输入...",
    "variant": "shortText",
    "required": false
  }
}
```
