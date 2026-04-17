# A2Select

Basic select component without label wrapper.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `placeholder` | string | `请选择` | Placeholder text |
| `options` | array | [] | Select options |
| `disabled` | boolean | false | Disabled state |
| `clearable` | boolean | false | Clearable button |
| `multiple` | boolean | false | Multiple selection mode |
| `filterable` | boolean | false | Searchable |
| `multipleLimit` | number | 0 | Multiple selection limit |
| `size` | `large \| default \| small` | `default` | Size |

## Option Structure

```typescript
interface SelectOption {
  label: string       // Display text
  value: string | number  // Option value
  disabled?: boolean     // Disabled (optional)
}
```

## Basic Example

<PlaygroundEmbed
  title="Basic Select"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "sm"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-demo"],
    "align": "stretch"
  },
  {
    "id": "select-demo",
    "component": "Select",
    "placeholder": "Select option",
    "options": [
      { "label": "Option 1", "value": "opt1" },
      { "label": "Option 2", "value": "opt2" },
      { "label": "Option 3", "value": "opt3" }
    ],
    "value": { "path": "/form/select" }
  }
]'
/>

## Clearable Example

<PlaygroundEmbed
  title="Clearable Select"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "sm"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-clearable"],
    "align": "stretch"
  },
  {
    "id": "select-clearable",
    "component": "Select",
    "placeholder": "With clear button",
    "clearable": true,
    "options": [
      { "label": "Active", "value": "active" },
      { "label": "Inactive", "value": "inactive" },
      { "label": "Pending", "value": "pending" }
    ],
    "value": { "path": "/form/status" }
  }
]'
/>

## Multiple Selection

<PlaygroundEmbed
  title="Multiple Selection Mode"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "md"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-multiple"],
    "align": "stretch"
  },
  {
    "id": "select-multiple",
    "component": "Select",
    "placeholder": "Select multiple options",
    "multiple": true,
    "clearable": true,
    "options": [
      { "label": "User Management", "value": "user" },
      { "label": "Order Management", "value": "order" },
      { "label": "Inventory", "value": "inventory" },
      { "label": "Finance", "value": "finance" }
    ],
    "value": { "path": "/form/modules" }
  }
]'
/>

## Searchable Example

<PlaygroundEmbed
  title="Searchable Select"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "md"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-filterable"],
    "align": "stretch"
  },
  {
    "id": "select-filterable",
    "component": "Select",
    "placeholder": "Type to search",
    "filterable": true,
    "clearable": true,
    "options": [
      { "label": "Beijing", "value": "bj" },
      { "label": "Shanghai", "value": "sh" },
      { "label": "Guangzhou", "value": "gz" },
      { "label": "Shenzhen", "value": "sz" },
      { "label": "Hangzhou", "value": "hz" },
      { "label": "Nanjing", "value": "nj" },
      { "label": "Chengdu", "value": "cd" },
      { "label": "Wuhan", "value": "wh" }
    ],
    "value": { "path": "/form/city" }
  }
]'
/>

## Disabled State

<PlaygroundEmbed
  title="Disabled Options"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "demo-column",
    "width": "sm"
  },
  {
    "id": "demo-column",
    "component": "Column",
    "children": ["select-disabled"],
    "align": "stretch"
  },
  {
    "id": "select-disabled",
    "component": "Select",
    "placeholder": "Some options disabled",
    "options": [
      { "label": "Available Option 1", "value": "opt1" },
      { "label": "Available Option 2", "value": "opt2" },
      { "label": "Disabled Option 3", "value": "opt3", "disabled": true },
      { "label": "Disabled Option 4", "value": "opt4", "disabled": true }
    ],
    "value": { "path": "/form/disabledSelect" }
  }
]'
/>

## Difference from A2SelectField

- **A2Select**: Basic select component without label wrapper, for custom layout scenarios
- **A2SelectField**: Form field component with label, wrapped in el-form-item, for standard form scenarios

## JSON Schema

```json
{
  "id": "selectId",
  "component": "Select",
  "placeholder": "Select option",
  "multiple": false,
  "filterable": false,
  "clearable": true,
  "options": [
    { "label": "Option 1", "value": "opt1" },
    { "label": "Option 2", "value": "opt2" },
    { "label": "Disabled Option", "value": "opt3", "disabled": true }
  ],
  "value": { "path": "/form/selectField" }
}
```