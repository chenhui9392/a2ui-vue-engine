# A2Input

Basic input field component.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Input placeholder |
| `type` | `text | password | number` | `text` | Input type |
| `disabled` | boolean | false | Disabled state |
| `clearable` | boolean | false | Clear button |

## Basic Example

<PlaygroundEmbed 
  title="Basic Input"
  :json-example='{
  "id": "input1",
  "type": "a2-input",
  "props": {
    "prop": "search",
    "placeholder": "Search...",
    "clearable": true
  }
}'
/>

## Password Input Example

<PlaygroundEmbed 
  title="Password Input"
  :json-example='{
  "id": "pwdInput",
  "type": "a2-input",
  "props": {
    "prop": "password",
    "placeholder": "Enter password",
    "type": "password"
  }
}'
/>

## JSON Schema

```json
{
  "id": "inputId",
  "type": "a2-input",
  "props": {
    "prop": "fieldName",
    "placeholder": "Enter value",
    "type": "text",
    "clearable": true
  }
}
```