# A2TextField

Form field component with label and input.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | - | Field label |
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Input placeholder |
| `variant` | `shortText | longText` | `shortText` | Input variant |
| `rows` | number | 4 | Rows for longText variant |
| `disabled` | boolean | false | Disabled state |
| `required` | boolean | false | Required field |

## Default Value (Flat Format)

In flat format, you can set an initial default value using `value.default`:

```json
{
  "id": "nameField",
  "component": "TextField",
  "label": "Name",
  "value": { "path": "/form/name", "default": "John Doe" }
}
```

<PlaygroundEmbed 
  title="TextField with Default Value"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "nameField",
    "width": "xs"
  },
  {
    "id": "nameField",
    "component": "TextField",
    "label": "Name",
    "placeholder": "Enter your name",
    "value": { "path": "/form/name", "default": "John Doe" }
  }
]'
/>

## Basic Example

<PlaygroundEmbed 
  title="Basic TextField"
  :json-example='{
  "id": "textField1",
  "type": "a2-text-field",
  "props": {
    "label": "Username",
    "prop": "username",
    "placeholder": "Enter username"
  }
}'
/>

## Long Text Example

<PlaygroundEmbed 
  title="Textarea Field"
  :json-example='{
  "id": "descField",
  "type": "a2-text-field",
  "props": {
    "label": "Description",
    "prop": "description",
    "variant": "longText",
    "rows": 5,
    "placeholder": "Enter description..."
  }
}'
/>

## Required Field Example

<PlaygroundEmbed 
  title="Required Field"
  :json-example='{
  "id": "emailField",
  "type": "a2-text-field",
  "props": {
    "label": "Email",
    "prop": "email",
    "placeholder": "Enter email",
    "required": true
  }
}'
/>

## Form Example

<PlaygroundEmbed 
  title="Form with TextField"
  :json-example='{
  "id": "formCard",
  "type": "a2-card",
  "props": {
    "width": "md",
    "title": "Registration Form"
  },
  "children": [
    {
      "id": "formCol",
      "type": "a2-column",
      "props": { "gap": 20 },
      "children": [
        {
          "id": "nameField",
          "type": "a2-text-field",
          "props": { "label": "Name", "prop": "name", "required": true }
        },
        {
          "id": "emailField",
          "type": "a2-text-field",
          "props": { "label": "Email", "prop": "email", "required": true }
        },
        {
          "id": "messageField",
          "type": "a2-text-field",
          "props": {
            "label": "Message",
            "prop": "message",
            "variant": "longText",
            "rows": 4
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
  "id": "textFieldId",
  "type": "a2-text-field",
  "props": {
    "label": "Field Label",
    "prop": "fieldName",
    "placeholder": "Enter value...",
    "variant": "shortText",
    "required": false
  }
}
```