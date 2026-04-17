# A2Text

Text display component with variants.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | string | - | Text content |
| `variant` | `h1 | h2 | h3 | h4 | p | shortText | longText` | `p` | Text style |

## Basic Example

<PlaygroundEmbed 
  title="Basic Text"
  :json-example='{
  "id": "text1",
  "type": "a2-text",
  "props": {
    "text": "This is a basic text paragraph."
  }
}'
/>

## Heading Variants

<PlaygroundEmbed 
  title="Heading Styles"
  :json-example='{
  "id": "headings",
  "type": "a2-column",
  "props": { "gap": 16 },
  "children": [
    { "id": "h1", "type": "a2-text", "props": { "text": "Heading 1", "variant": "h1" } },
    { "id": "h2", "type": "a2-text", "props": { "text": "Heading 2", "variant": "h2" } },
    { "id": "h3", "type": "a2-text", "props": { "text": "Heading 3", "variant": "h3" } },
    { "id": "p", "type": "a2-text", "props": { "text": "This is a paragraph text." } }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "textId",
  "type": "a2-text",
  "props": {
    "text": "Text content",
    "variant": "p"
  }
}
```