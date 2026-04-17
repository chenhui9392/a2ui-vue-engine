# A2Icon

Icon display component.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | string | - | Icon name (Element Plus Icons) |
| `size` | number | 16 | Icon size (px) |
| `color` | string | - | Icon color |

## Basic Example

<PlaygroundEmbed 
  title="Basic Icon"
  :json-example='{
  "id": "icon1",
  "type": "a2-icon",
  "props": {
    "name": "Check",
    "size": 24,
    "color": "#67c23a"
  }
}'
/>

## Multiple Icons

<PlaygroundEmbed 
  title="Icon Collection"
  :json-example='{
  "id": "iconRow",
  "type": "a2-row",
  "props": { "gutter": 20 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "children": [
        { "id": "icon1", "type": "a2-icon", "props": { "name": "Edit", "size": 32 } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "children": [
        { "id": "icon2", "type": "a2-icon", "props": { "name": "Delete", "size": 32, "color": "#f56c6c" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "children": [
        { "id": "icon3", "type": "a2-icon", "props": { "name": "Plus", "size": 32, "color": "#409eff" } }
      ]
    }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "iconId",
  "type": "a2-icon",
  "props": {
    "name": "Check",
    "size": 24,
    "color": "#67c23a"
  }
}
```

## Available Icons

Uses Element Plus Icons. Common icons include:

- `Check`, `Close`, `Plus`, `Minus`
- `Edit`, `Delete`, `Search`, `Refresh`
- `User`, `Setting`, `Document`, `Folder`
- `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`