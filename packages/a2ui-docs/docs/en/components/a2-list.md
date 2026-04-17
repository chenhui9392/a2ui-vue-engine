# A2List

List component for rendering repeating items.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `items` | array | [] | List items to render |

## Basic Example

<PlaygroundEmbed 
  title="Basic List"
  :json-example='{
  "id": "list1",
  "type": "a2-list",
  "props": {
    "items": [
      { "label": "Item 1", "value": "value1" },
      { "label": "Item 2", "value": "value2" },
      { "label": "Item 3", "value": "value3" }
    ]
  }
}'
/>

## JSON Schema

```json
{
  "id": "listId",
  "type": "a2-list",
  "props": {
    "items": [
      { "label": "Label", "value": "value" }
    ]
  }
}
```