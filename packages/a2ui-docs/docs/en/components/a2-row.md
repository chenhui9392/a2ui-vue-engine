# A2Row

Horizontal row layout component for arranging children horizontally.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `gutter` | number | 0 | Gap between columns (px) |
| `justify` | `start | end | center | space-around | space-between` | `start` | Horizontal alignment |
| `align` | `top | middle | bottom` | `top` | Vertical alignment |

## Basic Example

<PlaygroundEmbed 
  title="Basic Row"
  :json-example='{
  "id": "row1",
  "type": "a2-row",
  "props": {
    "gutter": 20
  },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "props": { "span": 6 },
      "children": [
        { "id": "text1", "type": "a2-text", "props": { "text": "Column 1" } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "props": { "span": 6 },
      "children": [
        { "id": "text2", "type": "a2-text", "props": { "text": "Column 2" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "props": { "span": 6 },
      "children": [
        { "id": "text3", "type": "a2-text", "props": { "text": "Column 3" } }
      ]
    },
    {
      "id": "col4",
      "type": "a2-column",
      "props": { "span": 6 },
      "children": [
        { "id": "text4", "type": "a2-text", "props": { "text": "Column 4" } }
      ]
    }
  ]
}'
/>

## Centered Row Example

<PlaygroundEmbed 
  title="Centered Row"
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
          "props": { "text": "Submit", "type": "primary" }
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