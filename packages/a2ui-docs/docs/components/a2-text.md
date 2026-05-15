# A2Text

文本展示组件，支持多种样式。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | - | 文本内容 |
| `variant` | `h1 \| h2 \| h3 \| h4 \| p \| shortText \| longText` | `p` | 文本样式，`h3` 会映射为 `size: large` + `bold: true` |
| `size` | `large \| default \| small` | `default` | 字体大小 |
| `bold` | boolean | false | 是否加粗 |
| `color` | string | - | 自定义文字颜色（如 `#303133`） |
| `type` | `primary \| success \| warning \| danger \| info` | - | 文本类型色 |
| `italic` | boolean | false | 是否斜体 |
| `underline` | boolean | false | 是否下划线 |

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

## 样式组合示例

通过组合 `size`、`bold`、`color` 等属性，可以灵活控制文本样式。

<PlaygroundEmbed 
  title="文本样式组合"
  :json-example='{
  "id": "textCombo",
  "type": "a2-column",
  "props": { "gap": 12 },
  "children": [
    { "id": "t1", "type": "a2-text", "props": { "text": "大号加粗标题", "size": "large", "bold": true } },
    { "id": "t2", "type": "a2-text", "props": { "text": "小号提示文字", "size": "small", "type": "info" } },
    { "id": "t3", "type": "a2-text", "props": { "text": "自定义颜色文字", "color": "#018f75", "bold": true } }
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
    "variant": "p",
    "size": "default",
    "bold": false,
    "color": "#303133"
  }
}
```