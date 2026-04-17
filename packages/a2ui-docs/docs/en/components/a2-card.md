# A2Card

Card container component with configurable width variants.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | `xs | sm | md | lg | xl | full` | `md` | Card width |
| `title` | string | - | Optional header title |
| `shadow` | `always | hover | never` | `hover` | Shadow behavior |

## Width Standards

| Value | Pixels |
|-------|--------|
| `xs` | 300px |
| `sm` | 400px |
| `md` | 560px |
| `lg` | 720px |
| `xl` | 960px |
| `full` | 100% |

## Basic Example

<PlaygroundEmbed 
  title="Basic Card"
  :json-example='{
  "id": "card1",
  "type": "a2-card",
  "props": {
    "width": "xs",
    "title": "User Info"
  },
  "children": [
    {
      "id": "text1",
      "type": "a2-text",
      "props": {
        "text": "This is a basic card."
      }
    }
  ]
}'
/>

## Nested Layout Example

<PlaygroundEmbed 
  title="Card with Row/Column"
  :json-example='{
  "id": "card2",
  "type": "a2-card",
  "props": {
    "width": "xs",
    "title": "Contact Form"
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
          "props": {
            "label": "Name",
            "prop": "name"
          }
        },
        {
          "id": "emailField",
          "type": "a2-text-field",
          "props": {
            "label": "Email",
            "prop": "email"
          }
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
    "title": "Card Title",
    "shadow": "hover"
  },
  "children": []
}
```