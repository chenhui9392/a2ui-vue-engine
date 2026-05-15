# A2Card

卡片容器组件，支持多种宽度规格。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `xs \| sm \| md \| lg \| xl \| full \| string` | `md` | 卡片宽度，支持预设值或自定义值（如 `500px`、`80%`） |
| `header` | string | - | 头部标题（设置后自动显示 Document 图标） |
| `headerBgColor` | string | `#F8F8FB` | 头部背景色 |
| `shadow` | `always \| hover \| never` | `hover` | 阴影效果 |

## 宽度规格

| 值 | 像素 |
|----|------|
| `xs` | 300px |
| `sm` | 400px |
| `md` | 560px |
| `lg` | 720px |
| `xl` | 960px |
| `full` | 100% |

## 基础示例

<PlaygroundEmbed 
  title="基础卡片"
  :json-example='{
  "id": "card1",
  "type": "a2-card",
  "props": {
    "width": "xs",
    "header": "用户信息"
  },
  "children": [
    {
      "id": "text1",
      "type": "a2-text",
      "props": {
        "text": "这是一个基础卡片。"
      }
    }
  ]
}'
/>

## 自定义宽度示例

除预设值外，`width` 还支持任意 CSS 宽度值。

<PlaygroundEmbed 
  title="自定义宽度卡片"
  :json-example='{
  "id": "cardCustom",
  "type": "a2-card",
  "props": {
    "width": "480px",
    "header": "自定义宽度"
  },
  "children": [
    {
      "id": "text1",
      "type": "a2-text",
      "props": {
        "text": "卡片宽度为 480px"
      }
    }
  ]
}'
/>

## 嵌套布局示例

<PlaygroundEmbed 
  title="卡片内嵌列布局"
  :json-example='{
  "id": "card2",
  "type": "a2-card",
  "props": {
    "width": "xs",
    "header": "联系表单"
  },
  "children": [
    {
      "id": "colMain",
      "type": "a2-column",
      "props": {
        "gap": 16
      },
      "children": [
        {
          "id": "nameField",
          "type": "a2-text-field",
          "props": { "label": "姓名", "prop": "name" }
        },
        {
          "id": "emailField",
          "type": "a2-text-field",
          "props": { "label": "邮箱", "prop": "email" }
        }
      ]
    }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "cardId",
  "type": "a2-card",
  "props": {
    "width": "xs",
    "header": "卡片标题",
    "shadow": "hover"
  },
  "children": []
}
```