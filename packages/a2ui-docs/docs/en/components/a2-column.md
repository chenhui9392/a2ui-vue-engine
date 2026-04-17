# A2Column

Vertical column layout component for arranging children vertically.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `span` | number | 24 | Width span (1-24) |
| `gap` | number | 0 | Gap between children (px) |
| `align` | `start | center | end | stretch` | `stretch` | Horizontal alignment |

## Basic Example

<PlaygroundEmbed 
  title="Basic Column"
  :json-example='{
  "id": "colMain",
  "type": "a2-column",
  "props": {
    "gap": 16
  },
  "children": [
    {
      "id": "field1",
      "type": "a2-text-field",
      "props": { "label": "Email", "prop": "email" }
    },
    {
      "id": "field2",
      "type": "a2-text-field",
      "props": { "label": "Password", "prop": "password" }
    },
    {
      "id": "btn",
      "type": "a2-button",
      "props": { "text": "Login", "type": "primary" }
    }
  ]
}'
/>

## Aligned Column Example

<PlaygroundEmbed 
  title="Centered Column"
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
      "props": { "text": "Welcome", "variant": "h3" }
    },
    {
      "id": "desc",
      "type": "a2-text",
      "props": { "text": "Please login to continue" }
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