# A2Row

水平行布局组件，用于横向排列子元素。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gutter` | number | 0 | 列间距（px） |
| `justify` | `start | end | center | space-around | space-between` | `start` | 水平对齐 |
| `align` | `top | middle | bottom` | `top` | 垂直对齐 |

## 基础示例

<PlaygroundEmbed 
  title="基础行布局"
  :json-example='{
  "id": "row1",
  "type": "a2-row",
  "props": { "gutter": 20 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "props": { "span": 6 },
      "children": [
        { "id": "text1", "type": "a2-text", "props": { "text": "列 1" } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "props": { "span": 6 },
      "children": [
        { "id": "text2", "type": "a2-text", "props": { "text": "列 2" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "props": { "span": 6 },
      "children": [
        { "id": "text3", "type": "a2-text", "props": { "text": "列 3" } }
      ]
    },
    {
      "id": "col4",
      "type": "a2-column",
      "props": { "span": 6 },
      "children": [
        { "id": "text4", "type": "a2-text", "props": { "text": "列 4" } }
      ]
    }
  ]
}'
/>

## 居中行示例

<PlaygroundEmbed 
  title="居中行布局"
  :json-example='{
  "id": "rowCenter",
  "type": "a2-row",
  "props": {
    "justify": "center",
    "align": "middle"
  },
  "children": [
    {
      "id": "btnCol",
      "type": "a2-column",
      "children": [
        {
          "id": "btn1",
          "type": "a2-button",
          "props": { "text": "提交", "type": "primary" }
        }
      ]
    }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "rowId",
  "type": "a2-row",
  "props": {
    "gutter": 20,
    "justify": "start",
    "align": "top"
  },
  "children": []
}
```