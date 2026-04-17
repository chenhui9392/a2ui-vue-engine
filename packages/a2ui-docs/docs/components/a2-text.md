# A2Text

文本展示组件，支持多种样式。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | - | 文本内容 |
| `variant` | `h1 | h2 | h3 | h4 | p | shortText | longText` | `p` | 文本样式 |

## 基础示例

<PlaygroundEmbed 
  title="基础文本"
  :json-example='{
  "id": "text1",
  "type": "a2-text",
  "props": {
    "text": "这是一段基础文本。"
  }
}'
/>

## 标题样式示例

<PlaygroundEmbed 
  title="标题样式"
  :json-example='{
  "id": "headings",
  "type": "a2-column",
  "props": { "gap": 16 },
  "children": [
    { "id": "h1", "type": "a2-text", "props": { "text": "标题 1", "variant": "h1" } },
    { "id": "h2", "type": "a2-text", "props": { "text": "标题 2", "variant": "h2" } },
    { "id": "h3", "type": "a2-text", "props": { "text": "标题 3", "variant": "h3" } },
    { "id": "p", "type": "a2-text", "props": { "text": "这是一段正文。" } }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "textId",
  "type": "a2-text",
  "props": {
    "text": "文本内容",
    "variant": "p"
  }
}
```