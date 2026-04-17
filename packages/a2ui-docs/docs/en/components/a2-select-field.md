# A2SelectField

Select dropdown field with options.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | - | Field label |
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Placeholder text |
| `options` | array | [] | Select options |
| `clearable` | boolean | false | Clear button |
| `disabled` | boolean | false | Disabled state |

## Option Structure

```typescript
interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}
```

## Basic Example

<PlaygroundEmbed 
  title="Basic Select"
  :json-example='{
  "id": "select1",
  "type": "a2-select-field",
  "props": {
    "label": "Country",
    "prop": "country",
    "placeholder": "Select country",
    "options": [
      { "label": "China", "value": "cn" },
      { "label": "USA", "value": "us" },
      { "label": "Japan", "value": "jp" }
    ]
  }
}'
/>

## Clearable Example

<PlaygroundEmbed 
  title="Clearable Select"
  :json-example='{
  "id": "select2",
  "type": "a2-select-field",
  "props": {
    "label": "Status",
    "prop": "status",
    "placeholder": "Select status",
    "clearable": true,
    "options": [
      { "label": "Active", "value": "active" },
      { "label": "Inactive", "value": "inactive" },
      { "label": "Pending", "value": "pending" }
    ]
  }
}'
/>

## JSON Schema

```json
{
  "id": "selectId",
  "type": "a2-select-field",
  "props": {
    "label": "Select Label",
    "prop": "fieldName",
    "placeholder": "Select option",
    "options": [
      { "label": "Option 1", "value": "opt1" },
      { "label": "Option 2", "value": "opt2" }
    ],
    "clearable": false
  }
}
```