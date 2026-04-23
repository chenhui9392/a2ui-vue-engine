# A2ChoicePicker

Multi/single selection card component with chips style support.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | - | Label text |
| `options` | array | [] | Options list |
| `variant` | `default` \| `mutuallyExclusive` | `default` | Selection mode |
| `displayStyle` | `default` \| `chips` | `default` | Display style |
| `required` | boolean | false | Required field |
| `disabled` | boolean | false | Disabled state |
| `defaultValue` | array \| string \| number | [] | Default value |

## Option Configuration

```typescript
interface ChoiceOption {
  label: string       // Display text
  value: string | number  // Option value
  description?: string    // Description text (optional)
  disabled?: boolean     // Disabled (optional)
}
```

## Selection Modes

### Multi-select Mode (default)

Users can select multiple options.

### Single-select Mode (mutuallyExclusive)

Users can only select one option. Clicking a new option automatically deselects the previous one.

## Basic Example

<PlaygroundEmbed 
  title="Basic Multi-select"
  :json-example='[
  { "id": "root", "component": "Card", "child": "picker-demo", "width": "md" },
  { "id": "picker-demo", "component": "Column", "children": ["picker-label", "multi-picker"], "align": "stretch" },
  { "id": "picker-label", "component": "Text", "text": "Select modules:", "variant": "shortText" },
  { "id": "multi-picker", "component": "ChoicePicker", "options": [
      { "label": "User Management", "value": "user" },
      { "label": "Order Management", "value": "order" },
      { "label": "Inventory", "value": "inventory" },
      { "label": "Finance", "value": "finance" }
    ], "value": { "path": "/form/modules" } }
]'
/>

## Single-select Example

<PlaygroundEmbed 
  title="Mutually Exclusive Single-select"
  :json-example='[
  { "id": "root", "component": "Card", "child": "single-demo", "width": "md" },
  { "id": "single-demo", "component": "Column", "children": ["single-label", "single-picker"], "align": "stretch" },
  { "id": "single-label", "component": "Text", "text": "Select approval plan:", "variant": "shortText" },
  { "id": "single-picker", "component": "ChoicePicker", "label": "", "variant": "mutuallyExclusive", "displayStyle": "chips", "required": true, "options": [
      { "label": "Plan A - Quick", "value": "plan_a" },
      { "label": "Plan B - Standard", "value": "plan_b" },
      { "label": "Plan C - Detailed", "value": "plan_c" }
    ], "value": { "path": "/form/plan" } }
]'
/>

## Options with Description

<PlaygroundEmbed 
  title="Options with Description"
  :json-example='[
  { "id": "root", "component": "Card", "child": "desc-demo", "width": "lg" },
  { "id": "desc-demo", "component": "Column", "children": ["desc-label", "desc-picker"], "align": "stretch" },
  { "id": "desc-label", "component": "Text", "text": "Select permission type:", "variant": "shortText" },
  { "id": "desc-picker", "component": "ChoicePicker", "variant": "mutuallyExclusive", "displayStyle": "chips", "options": [
      { "label": "Internet Access", "value": "internet", "description": "Access external websites" },
      { "label": "Email", "value": "email", "description": "Send and receive emails" },
      { "label": "File Transfer", "value": "ftp", "description": "Upload download files" },
      { "label": "VPN Access", "value": "vpn", "description": "Remote company network" }
    ], "value": { "path": "/form/permission" } }
]'
/>

## Required and Disabled States

<PlaygroundEmbed 
  title="Required and Disabled"
  :json-example='[
  { "id": "root", "component": "Card", "child": "state-demo", "width": "md" },
  { "id": "state-demo", "component": "Column", "children": ["required-picker", "disabled-picker"], "align": "stretch", "gap": 16 },
  { "id": "required-picker", "component": "ChoicePicker", "label": "Required field (with red asterisk)", "variant": "mutuallyExclusive", "displayStyle": "chips", "required": true, "options": [
      { "label": "Option 1", "value": "opt1" },
      { "label": "Option 2", "value": "opt2" }
    ], "value": { "path": "/form/required" } },
  { "id": "disabled-picker", "component": "ChoicePicker", "label": "Disabled state", "variant": "mutuallyExclusive", "displayStyle": "chips", "disabled": true, "defaultValue": "opt1", "options": [
      { "label": "Selected option", "value": "opt1" },
      { "label": "Disabled option", "value": "opt2", "disabled": true }
    ], "value": { "path": "/form/disabled" } }
]'
/>

## JSON Schema

```json
{
  "id": "pickerId",
  "component": "ChoicePicker",
  "label": "Select option",
  "variant": "mutuallyExclusive",
  "displayStyle": "chips",
  "required": true,
  "options": [
    { "label": "Option 1", "value": "opt1", "description": "Description 1" },
    { "label": "Option 2", "value": "opt2" },
    { "label": "Disabled option", "value": "opt3", "disabled": true }
  ],
  "value": { "path": "/form/choice" }
}
```