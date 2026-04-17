# A2Button

Button component with action support.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | string | - | Button text |
| `type` | `primary | success | warning | danger | info | default` | `default` | Button type |
| `size` | `large | default | small` | `default` | Button size |
| `disabled` | boolean | false | Disabled state |
| `icon` | string | - | Icon name |

## Basic Example

<PlaygroundEmbed 
  title="Basic Button"
  :json-example='{
  "id": "btn1",
  "type": "a2-button",
  "props": {
    "text": "Click Me",
    "type": "primary"
  }
}'
/>

## Button Types

<PlaygroundEmbed 
  title="Button Variants"
  :json-example='{
  "id": "btnRow",
  "type": "a2-row",
  "props": { "gutter": 10 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "children": [
        { "id": "btn1", "type": "a2-button", "props": { "text": "Primary", "type": "primary" } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "children": [
        { "id": "btn2", "type": "a2-button", "props": { "text": "Success", "type": "success" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "children": [
        { "id": "btn3", "type": "a2-button", "props": { "text": "Warning", "type": "warning" } }
      ]
    },
    {
      "id": "col4",
      "type": "a2-column",
      "children": [
        { "id": "btn4", "type": "a2-button", "props": { "text": "Danger", "type": "danger" } }
      ]
    }
  ]
}'
/>

## Button Sizes

<PlaygroundEmbed 
  title="Button Sizes"
  :json-example='{
  "id": "sizeRow",
  "type": "a2-row",
  "props": { "gutter": 10 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "children": [
        { "id": "btnLarge", "type": "a2-button", "props": { "text": "Large", "type": "primary", "size": "large" } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "children": [
        { "id": "btnDefault", "type": "a2-button", "props": { "text": "Default", "type": "primary" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "children": [
        { "id": "btnSmall", "type": "a2-button", "props": { "text": "Small", "type": "primary", "size": "small" } }
      ]
    }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "buttonId",
  "type": "a2-button",
  "props": {
    "text": "Submit",
    "type": "primary",
    "size": "default",
    "icon": "Check"
  }
}
```