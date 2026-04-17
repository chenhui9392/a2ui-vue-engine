# A2DateTimeInput

Date and time picker component.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Placeholder text |
| `enableDate` | boolean | true | Enable date selection |
| `enableTime` | boolean | true | Enable time selection |
| `format` | string | `YYYY-MM-DD HH:mm:ss` | Format string |
| `disabled` | boolean | false | Disabled state |

## Basic Example

<PlaygroundEmbed 
  title="Date and Time"
  :json-example='{
  "id": "datetime1",
  "type": "a2-date-time-input",
  "props": {
    "prop": "scheduleTime",
    "placeholder": "Select date and time",
    "enableDate": true,
    "enableTime": true
  }
}'
/>

## Date Only Example

<PlaygroundEmbed 
  title="Date Only"
  :json-example='{
  "id": "datetime2",
  "type": "a2-date-time-input",
  "props": {
    "prop": "dateOnly",
    "placeholder": "Select date",
    "enableDate": true,
    "enableTime": false
  }
}'
/>

## JSON Schema

```json
{
  "id": "datetimeId",
  "type": "a2-date-time-input",
  "props": {
    "prop": "fieldName",
    "placeholder": "Select datetime",
    "enableDate": true,
    "enableTime": true,
    "format": "YYYY-MM-DD HH:mm:ss"
  }
}
```