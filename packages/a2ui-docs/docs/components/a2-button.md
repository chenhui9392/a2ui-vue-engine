# A2Button

按钮组件，支持动作配置。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | - | 按钮文字 |
| `type` | `primary | success | warning | danger | info | default` | `default` | 按钮类型 |
| `size` | `large | default | small` | `default` | 按钮大小 |
| `disabled` | boolean | false | 禁用状态 |
| `icon` | string | - | 图标名称（提交/保存/确认/确定类按钮自动使用 `Promotion` 图标，无需配置） |

## 基础示例

<PlaygroundEmbed 
  title="基础按钮"
  :json-example='{
  "id": "btn1",
  "type": "a2-button",
  "props": {
    "text": "点击",
    "type": "primary"
  }
}'
/>

## 按钮类型

<PlaygroundEmbed 
  title="按钮类型"
  :json-example='{
  "id": "btnRow",
  "type": "a2-row",
  "props": { "gutter": 10 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "children": [
        { "id": "btn1", "type": "a2-button", "props": { "text": "主要", "type": "primary" } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "children": [
        { "id": "btn2", "type": "a2-button", "props": { "text": "成功", "type": "success" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "children": [
        { "id": "btn3", "type": "a2-button", "props": { "text": "警告", "type": "warning" } }
      ]
    },
    {
      "id": "col4",
      "type": "a2-column",
      "children": [
        { "id": "btn4", "type": "a2-button", "props": { "text": "危险", "type": "danger" } }
      ]
    }
  ]
}'
/>

## 按钮大小

<PlaygroundEmbed 
  title="按钮大小"
  :json-example='{
  "id": "sizeRow",
  "type": "a2-row",
  "props": { "gutter": 10 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "children": [
        { "id": "btnLarge", "type": "a2-button", "props": { "text": "大", "type": "primary", "size": "large" } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "children": [
        { "id": "btnDefault", "type": "a2-button", "props": { "text": "默认", "type": "primary" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "children": [
        { "id": "btnSmall", "type": "a2-button", "props": { "text": "小", "type": "primary", "size": "small" } }
      ]
    }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "buttonId",
  "type": "a2-button",
  "props": {
    "text": "提交",
    "type": "primary",
    "size": "default",
    "icon": "Check"
  }
}
```