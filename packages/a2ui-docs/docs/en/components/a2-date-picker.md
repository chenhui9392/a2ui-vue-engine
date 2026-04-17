# A2DatePicker

Date picker component.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Placeholder text |
| `format` | string | `YYYY-MM-DD` | Date format |
| `disabled` | boolean | false | Disabled state |

## Basic Example

<PlaygroundEmbed 
  title="Basic DatePicker"
  :json-example='{
  "id": "date1",
  "type": "a2-date-picker",
  "props": {
    "prop": "birthday",
    "placeholder": "Select date"
  }
}'
/>

## JSON Schema

```json
{
  "id": "datePickerId",
  "type": "a2-date-picker",
  "props": {
    "prop": "fieldName",
    "placeholder": "Select date",
    "format": "YYYY-MM-DD"
  }
}
```