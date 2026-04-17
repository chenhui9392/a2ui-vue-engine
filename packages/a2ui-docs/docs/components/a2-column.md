# A2Column

垂直列布局组件，用于纵向排列子元素。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `span` | number | 24 | 宽度占比（1-24） |
| `gap` | number | 0 | 子元素间距（px） |
| `align` | `start | center | end | stretch` | `stretch` | 水平对齐 |

## 基础示例

<PlaygroundEmbed 
  title="基础列布局"
  :json-example='{
  "id": "colMain",
  "type": "a2-column",
  "props": { "gap": 16 },
  "children": [
    {
      "id": "field1",
      "type": "a2-text-field",
      "props": { "label": "邮箱", "prop": "email" }
    },
    {
      "id": "field2",
      "type": "a2-text-field",
      "props": { "label": "密码", "prop": "password" }
    },
    {
      "id": "btn",
      "type": "a2-button",
      "props": { "text": "登录", "type": "primary" }
    }
  ]
}'
/>

## 居中列示例

<PlaygroundEmbed 
  title="居中列布局"
  :json-example='{
  "id": "colCenter",
  "type": "a2-column",
  "props": {
    "gap": 12,
    "align": "center"
  },
  "children": [
    {
      "id": "icon",
      "type": "a2-icon",
      "props": { "name": "User", "size": 48 }
    },
    {
      "id": "title",
      "type": "a2-text",
      "props": { "text": "欢迎", "variant": "h3" }
    },
    {
      "id": "desc",
      "type": "a2-text",
      "props": { "text": "请登录以继续" }
    }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "columnId",
  "type": "a2-column",
  "props": {
    "span": 12,
    "gap": 16,
    "align": "stretch"
  },
  "children": []
}
```